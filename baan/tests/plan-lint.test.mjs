// Regression: DAG lint — แผนต้องมีทางเริ่มโค้ดได้โดยไม่รอประตูมนุษย์ (ผลตรวจอิสระ 2026-10-26: school-bot
// ผูกงาน implement 61/63 ไว้หลังประตูทางอ้อมแต่ validation เดิมผ่านหมด)
import test from "node:test";
import assert from "node:assert/strict";
import { lintPlanDag, lintPlanFile, normalizeDagTasks, validateAndFixPlan } from "../src/plan.mjs";
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
  const [t] = normalizeDagTasks([{ id: "FE-006", owner: "fe", depends_on: ["BE-1"], gate_ids: ["G-UX"] }]);
  assert.deepEqual(t, { id: "FE-006", role: "front", dependsOn: ["BE-1"], gated: true });
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
