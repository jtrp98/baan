// Regression: DAG lint — แผนต้องมีทางเริ่มโค้ดได้โดยไม่รอประตูมนุษย์ (ผลตรวจอิสระ 2026-10-26: school-bot
// ผูกงาน implement 61/63 ไว้หลังประตูทางอ้อมแต่ validation เดิมผ่านหมด)
import test from "node:test";
import assert from "node:assert/strict";
import { deriveTaskStatus, lintPlanDag, lintPlanFile, lintPlanProgress, normalizeDagTasks, validateAndFixPlan } from "../src/plan.mjs";
import { plannerPrompt } from "../src/prompts.mjs";

const cfg = {
  roleNames: ["check", "spec", "front", "sys"],
  agents: { codex: {} },
  tiers: { t2: { codex: { model: "m" } }, t3: { codex: { model: "m" } } },
};
const task = (over = {}) => ({ id: "T1", role: "spec", tier: "t2", task: "ทำงาน", dependsOn: [], ...over });
const lint = (tasks, o) => lintPlanDag(normalizeDagTasks(tasks), o);

test("แผนไม่มีงาน implement = error เว้นแต่ใส่ docsOnly พร้อมเหตุผล", () => {
  assert.match(lint([task()]).errors.join(), /ไม่มีงาน implement/);
  assert.deepEqual(lint([task()], { docsOnly: "ผู้ใช้ขอเอกสารล้วน" }).errors, []);
  assert.match(lint([task()], { docsOnly: "  " }).errors.join(), /ไม่มีงาน implement/, "docsOnly ว่างไม่นับเป็นเหตุผล");
});

test("งาน implement ทุกงานติดประตู (ตรงหรือผ่าน dependency) = ไม่มี walking skeleton", () => {
  const tasks = [
    { id: "DBA-003", owner: "dba", depends_on: [], gate_ids: ["G-DB"] },
    { id: "BE-1", owner: "be", depends_on: ["DBA-003"] },
    { id: "FE-1", owner: "fe", depends_on: ["BE-1"] },
  ];
  const r = lint(tasks);
  assert.match(r.errors.join(), /ไม่มี walking skeleton/);
  assert.deepEqual(r.blocked, ["BE-1", "FE-1"], "ติดประตูทางอ้อมผ่านสาย dependency");
});

test("ติดประตูครึ่งพอดี = ผ่าน · เกินครึ่ง = error แม้มีงานเริ่มได้ (เคส school-bot: 62/63)", () => {
  const ok = lint([task({ id: "S", role: "sys" }), task({ id: "F", role: "front", dependsOn: ["S"], humanGate: "UX sign-off" })]);
  assert.deepEqual(ok.errors, []);
  const many = lint([
    task({ id: "S", role: "sys" }),
    task({ id: "G", role: "spec", gateIds: ["G-1"] }),
    task({ id: "A", role: "sys", dependsOn: ["G"] }),
    task({ id: "B", role: "front", dependsOn: ["A"] }),
  ]);
  assert.match(many.errors.join(), /2\/3 งาน \(เกินครึ่ง\).*เริ่มได้ทันทีตอนนี้: S/);
});

test("normalize อ่านฟิลด์ของแผนโปรเจกต์และชื่อ role เดิม", () => {
  const [t] = normalizeDagTasks([{ id: "FE-006", owner: "fe", depends_on: ["BE-1"], gate_ids: ["G-UX"], status: "Pending", ac_ids: ["AC-1"] }]);
  assert.deepEqual(t, { id: "FE-006", role: "front", dependsOn: ["BE-1"], gated: true, status: "pending", acIds: ["AC-1"], slices: [] });
  assert.equal(normalizeDagTasks([{ id: "X", role: "sys", gate_ids: [] }])[0].gated, false, "gate_ids ว่าง = ไม่ติดประตู");
});

test("แผนสดจาก planner (lintStrict) ถูกปฏิเสธ · แผนจาก --plan-file/--resume แค่เตือน (run เก่ายัง resume ได้)", () => {
  assert.throws(() => validateAndFixPlan({ tasks: [task()] }, cfg, { agent: "codex", lintStrict: true }), /DAG lint/);
  assert.doesNotThrow(() => validateAndFixPlan({ tasks: [task()] }, cfg, { agent: "codex" }));
  assert.doesNotThrow(() => validateAndFixPlan({ tasks: [task()], docsOnly: "รีวิวเอกสาร" }, cfg, { agent: "codex", lintStrict: true }));
  assert.throws(() => validateAndFixPlan({ tasks: [task()], docsOnly: true }, cfg, { agent: "codex" }), /docsOnly ต้องเป็น string/);
});

test("lintPlanFile คืน exit code และจับ dependency วนลูปของแผนโปรเจกต์", () => {
  const run = (json) => {
    const out = [];
    return { code: lintPlanFile("plan.json", () => JSON.stringify(json), (m) => out.push(m)), out: out.join("\n") };
  };
  assert.equal(run({ tasks: [{ id: "A", owner: "be", depends_on: [] }] }).code, 0);
  const blocked = run({ tasks: [{ id: "A", owner: "be", gate_ids: ["G"] }] });
  assert.equal(blocked.code, 1);
  assert.match(blocked.out, /implement 1 · ติดประตูมนุษย์ 1 · เริ่มได้ทันที 0/);
  assert.equal(run([{ id: "A", owner: "be", depends_on: ["B"] }, { id: "B", owner: "be", depends_on: ["A"] }]).code, 1);
  assert.throws(() => run({ nope: 1 }), /ไม่พบ tasks/);
});

test("planner prompt ไม่บังคับ read-only ทั้งแผนแล้ว และบอกโหมดรันตาม --write", () => {
  const ro = plannerPrompt("คำมอบหมาย", "goal", cfg, "", "2026-10-26");
  assert.doesNotMatch(ro, /Every task works read-only/);
  assert.match(ro, /\*\*read-only\*\*.*diff\/patch/);
  assert.match(ro, /Walking skeleton first/);
  assert.match(ro, /"docsOnly"/);
  assert.match(plannerPrompt("คำมอบหมาย", "goal", cfg, "", "2026-10-26", true), /\*\*write\*\* — front\/sys tasks edit code/);
});

// Regression: ความคืบหน้าราย slice — school-bot (2026-10-28) คิวบอก 21 งาน local ready แต่ JSON ไม่มี done-local
// สักงาน และ verified ต้องครอบทั้ง task จึงไม่มีงานโค้ดไหนเสร็จในสายตาแผนเลย
const be = (over = {}) => ({ id: "BE-003", owner: "be", depends_on: [], ac_ids: ["AC-1", "AC-2"], status: "pending", ...over });
const progress = (tasks) => lintPlanProgress(normalizeDagTasks(tasks));

test("task เป็น verified เมื่อ slice ที่ verified ครอบ ac_ids ครบ · ครอบบางส่วน = done-local", () => {
  const [part] = normalizeDagTasks([be({ slices: [{ id: "s1", ac_ids: ["AC-1"], status: "verified" }] })]);
  assert.equal(deriveTaskStatus(part), "done-local");
  const [full] = normalizeDagTasks([be({ slices: [{ id: "s1", ac_ids: ["AC-1"], status: "verified" }, { id: "s2", ac_ids: ["AC-2"], status: "verified" }] })]);
  assert.equal(deriveTaskStatus(full), "verified");
  const [none] = normalizeDagTasks([be({ slices: [{ id: "s1", ac_ids: [], status: "pending" }] })]);
  assert.equal(deriveTaskStatus(none), "pending");
  const [legacy] = normalizeDagTasks([be({ status: "verified" })]);
  assert.equal(deriveTaskStatus(legacy), "verified", "แผนเก่าไม่มี slices ใช้สถานะเดิม");
});

test("status verified ที่ slice ยังไม่ครอบครบ = error · slice อ้าง AC นอก task หรือไม่ระบุ AC = error", () => {
  const over = progress([be({ status: "verified", slices: [{ id: "s1", ac_ids: ["AC-1"], status: "verified" }] })]);
  assert.match(over.errors.join(), /BE-003: status verified แต่ slice ที่ verified ยังไม่ครอบ AC AC-2/);
  const outside = progress([be({ slices: [{ id: "s1", ac_ids: ["AC-9"], status: "verified" }] })]);
  assert.match(outside.errors.join(), /BE-003\/s1: ac_ids นอก task \(AC-9\)/);
  const noAc = progress([be({ slices: [{ id: "s1", status: "done-local" }] })]);
  assert.match(noAc.errors.join(), /slice ที่ done-local ต้องระบุ ac_ids/);
  assert.match(progress([be({ slices: [{ id: "s1", ac_ids: ["AC-1"], status: "local-ready" }] })]).errors.join(), /status ของ slice ต้องเป็น/);
});

test("ความคืบหน้าที่มีจริงแต่ไม่ถูกลงในแผน = warning ไม่ใช่ error", () => {
  const r = progress([be({ slices: [{ id: "s1", ac_ids: ["AC-1"], status: "done-local" }] })]);
  assert.deepEqual(r.errors, []);
  assert.match(r.warnings.join(), /BE-003: status "pending" แต่ slices บอกว่าเป็น done-local แล้ว/);
  assert.deepEqual(progress([be({ status: "done-local", slices: [{ id: "s1", ac_ids: ["AC-1"], status: "done-local" }] })]).warnings, []);
  assert.deepEqual(progress([be({ status: "blocked", slices: [{ id: "s1", ac_ids: ["AC-1"], status: "done-local" }] })]).warnings, [], "blocked มาจาก verdict ไม่ทับ");
  assert.match(progress([be({ status: "local-ready" })]).warnings.join(), /status "local-ready" ไม่อยู่ใน/);
});

test("เอกสาร verified ≥ 5 งานแต่งาน implement ไม่มี done-local/verified เลย = warning (เคส school-bot 15/0)", () => {
  const docs = Array.from({ length: 5 }, (_, i) => ({ id: `BA-${i}`, owner: "ba", status: "verified" }));
  const stalled = progress([...docs, be()]);
  assert.match(stalled.warnings.join(), /งานเอกสาร verified แล้ว 5 งาน แต่งาน implement 1 งานยังไม่มี done-local\/verified/);
  assert.deepEqual(stalled.implProgress, { verified: 0, doneLocal: 0, total: 1 });
  assert.deepEqual(progress([...docs, be({ status: "done-local" })]).warnings, []);
  assert.deepEqual(progress([...docs.slice(1), be()]).warnings, [], "4 งานยังไม่ถึง time-box");
});

test("lintPlanFile แสดงความคืบหน้างาน implement + warning และ exit 1 เมื่อสถานะอ้างเกินหลักฐาน", () => {
  const run = (json) => {
    const out = [];
    return { code: lintPlanFile("plan.json", () => JSON.stringify(json), (m) => out.push(m)), out: out.join("\n") };
  };
  const ok = run({ tasks: [be({ slices: [{ id: "s1", ac_ids: ["AC-1"], status: "verified" }, { id: "s2", ac_ids: ["AC-2"], status: "pending" }] })] });
  assert.equal(ok.code, 0, "warning ไม่กระทบ exit code");
  assert.match(ok.out, /ความคืบหน้างาน implement: verified 0 · done-local 1 \/ 1 · slice verified 1\/2/);
  assert.match(ok.out, /⚠ BE-003: status "pending" แต่ slices บอกว่าเป็น done-local/);
  const bad = run({ tasks: [be({ status: "verified", slices: [{ id: "s1", ac_ids: ["AC-1"], status: "verified" }] })] });
  assert.equal(bad.code, 1);
  assert.match(bad.out, /✗ BE-003: status verified แต่/);
});
