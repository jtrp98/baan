import test from "node:test";
import assert from "node:assert/strict";
import { deriveTaskStatus, lintPlanDag, lintPlanFile, lintPlanModules, lintPlanProgress, lintPlanVerification, normalizeDagTasks, transitiveFanOut } from "../src/plan.mjs";

const cfg = {
  roleNames: ["check", "spec", "front", "sys"],
  agents: { codex: {} },
  tiers: { t2: { codex: { model: "m" } }, t3: { codex: { model: "m" } } },
};
const task = (over = {}) => ({ id: "T1", role: "spec", tier: "t2", task: "ทำงาน", dependsOn: [], ...over });
const lint = (tasks, o) => lintPlanDag(normalizeDagTasks(tasks), o);
const be = (over = {}) => ({ id: "BE-003", owner: "be", status: "pending", ac_ids: ["AC-1", "AC-2"], ...over });
const progress = (tasks) => lintPlanProgress(normalizeDagTasks(tasks));

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

test("งานที่ verified แล้วไม่ส่งต่อ gate ให้งานที่พึ่ง · ยังไม่ verified = ขวางเหมือนเดิม (เคส school-bot SA-002)", () => {
  const tasks = (status) => [
    { id: "SA-002", owner: "sa", depends_on: [], gate_ids: ["G-GUEST"], status },
    { id: "BE-1", owner: "be", depends_on: ["SA-002"] },
  ];
  assert.deepEqual(lint(tasks("verified")).blocked, []);
  assert.deepEqual(lint(tasks("done-local")).blocked, ["BE-1"]);
  const sliced = [{ id: "G", owner: "sa", gate_ids: ["G-1"], ac_ids: ["AC-1"], slices: [{ id: "s1", ac_ids: ["AC-1"], status: "verified" }] }, { id: "BE-1", owner: "be", depends_on: ["G"] }];
  assert.deepEqual(lint(sliced).blocked, [], "verified ตาม slices นับด้วย");
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
  assert.deepEqual(t, { id: "FE-006", role: "front", dependsOn: ["BE-1"], gated: true, status: "pending", acIds: ["AC-1"], risk: null, wave: null, tier: null, workerTier: null, kind: "code", contracts: [], oracle: false, ref: false, level: null, slices: [] });
  assert.equal(normalizeDagTasks([{ id: "X", role: "sys", gate_ids: [] }])[0].gated, false, "gate_ids ว่าง = ไม่ติดประตู");
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

const verify = (tasks) => lintPlanVerification(normalizeDagTasks(tasks));
test("QA ที่ค้างเตือนให้แยกงานพัฒนาจากงานเชื่อมจริง โดยไม่ข้าม dependency", () => {
  const tasks = [
    { id: "QA", owner: "qa", status: "pending", ac_ids: ["AC-1"] },
    { id: "SEC", owner: "jpo", status: "blocked", ac_ids: ["AC-1"] },
    { id: "UI", owner: "fe", depends_on: ["QA", "SEC"], ac_ids: ["AC-1"] },
  ];
  const result = verify(tasks);
  assert.deepEqual(result.errors, []);
  assert.match(result.warnings.join(), /งานพัฒนาที่รอ QA 1 งาน.*สัญญาตรึง \+ fake.*UI/);
  assert.deepEqual(tasks[2].depends_on, ["QA", "SEC"]);
  assert.doesNotMatch(verify(tasks.map((t) => t.id === "UI" ? { ...t, depends_on: [] } : t)).warnings.join(), /งานพัฒนาที่รอ QA/);
  assert.doesNotMatch(verify(tasks.map((t) => t.id !== "UI" ? { ...t, status: "verified" } : t)).warnings.join(), /งานพัฒนาที่รอ QA/);
});
test("ledger test_level: เตือน verified ที่ยังเป็น normal · ไม่มีฟิลด์ = full · ค่าผิด = error", () => {
  const tasks = [
    { id: "BE-1", owner: "be", status: "verified", ac_ids: ["AC-1"], oracle: "DES-1 Rev1", ref: "abc", test_level: "normal" },
    { id: "BE-2", owner: "be", ac_ids: ["AC-2", "AC-3"], slices: [
      { id: "S1", status: "verified", ac_ids: ["AC-2"], oracle: "DES-1 Rev1", ref: "abc", test_level: "Normal" },
      { id: "S2", status: "verified", ac_ids: ["AC-3"], oracle: "DES-1 Rev1", ref: "abc" },
    ] },
  ];
  const r = verify(tasks);
  assert.deepEqual(r.errors, []);
  assert.match(r.warnings.join("\n"), /verified ระดับ normal \(happy flow\) 2 จุด.*BE-1, BE-2\/S1$/m);
  const bad = verify([{ ...tasks[0], test_level: "quick" }]);
  assert.match(bad.errors.join(), /BE-1: test_level ต้องเป็น normal\/full/);
});

const chain = (over = {}) => [
  { id: "SA", owner: "sa", depends_on: [], ...over.SA },
  { id: "BE-1", owner: "be", depends_on: ["SA"], ac_ids: ["AC-1"], ...over["BE-1"] },
  { id: "BE-2", owner: "be", depends_on: ["BE-1"], ac_ids: ["AC-2"], ...over["BE-2"] },
  { id: "FE-1", owner: "fe", depends_on: ["BE-2"], ac_ids: ["AC-3"], ...over["FE-1"] },
];

test("fan-out นับงานที่พึ่งทั้งทางตรงและทางอ้อม ไม่นับซ้ำ", () => {
  const f = transitiveFanOut(normalizeDagTasks([...chain(), { id: "QA", owner: "qa", depends_on: ["BE-1", "FE-1"] }]));
  assert.deepEqual(Object.fromEntries(f), { SA: 4, "BE-1": 3, "BE-2": 2, "FE-1": 1, QA: 0 });
});

test("task ที่ยังไม่ verified และไม่มี ac_ids = warning บรรทัดเดียว เรียงตาม fan-out · verified แล้วไม่เตือน", () => {
  const r = verify([...chain({ "FE-1": { ac_ids: [] } })]);
  assert.deepEqual(r.errors, []);
  assert.match(r.warnings.join("\n"), /ไม่มี ac_ids 2 งาน .*: SA\(3\), FE-1\(0\)/);
  assert.doesNotMatch(verify(chain({ SA: { status: "verified", oracle: "DES-1 Rev2" } })).warnings.join(), /ไม่มี ac_ids/);
});

test("ฐานรากที่ยังไม่ระบุ risk = warning · ใส่ risk แล้วเงียบ · แผนเล็กกว่าเกณฑ์ไม่เตือน", () => {
  const base = { SA: { ac_ids: ["AC-0"] } };
  assert.match(verify(chain(base)).warnings.join(), /ฐานราก \(งานพึ่ง ≥ 3\) ยังไม่ระบุ risk 1 งาน .*SA\(3\)/);
  assert.deepEqual(verify(chain({ SA: { ac_ids: ["AC-0"], risk: "High" } })).warnings, []);
  assert.deepEqual(verify(chain(base).slice(0, 3)).warnings, [], "fan-out สูงสุด 2 < เกณฑ์ขั้นต่ำ 3");
});

test("risk/wave ค่าผิด หรือ wave ย้อน dependency = error · แผนเก่าไม่มีฟิลด์ = ไม่มี error ใหม่", () => {
  assert.match(verify(chain({ SA: { risk: "medium" } })).errors.join(), /SA: risk ต้องเป็น high\/low/);
  assert.match(verify(chain({ SA: { wave: 0 } })).errors.join(), /SA: wave ต้องเป็นจำนวนเต็มบวก/);
  const back = verify(chain({ SA: { wave: 2 }, "BE-1": { wave: 1 } }));
  assert.match(back.errors.join(), /BE-1: อยู่ wave 1 แต่พึ่งงานที่อยู่ wave หลังกว่า \(SA@2\)/);
  assert.deepEqual(verify(chain({ SA: { wave: 1 }, "BE-1": { wave: 1 }, "BE-2": { wave: 2 } })).errors, []);
  const legacy = verify(chain());
  assert.deepEqual(legacy.errors, []);
  assert.equal(legacy.used, false);
});

test("verified ที่ไม่มี oracle = warning รวมบรรทัดเดียว ทั้งระดับ slice และ task", () => {
  const r = verify(chain({
    "BE-1": { status: "verified" },
    "BE-2": { slices: [{ id: "s1", ac_ids: ["AC-2"], status: "verified" }, { id: "s2", ac_ids: ["AC-2"], status: "verified", oracle: "DES-1 Rev2" }] },
  }));
  assert.match(r.warnings.join("\n"), /ไม่มี oracle .* 2 จุด .*: BE-1, BE-2\/s1$/m);
});

test("lintPlanFile พิมพ์สรุป risk/wave เมื่อแผนใช้ฟิลด์ และ warning ไม่กระทบ exit code", () => {
  const run = (json) => {
    const out = [];
    return { code: lintPlanFile("plan.json", () => JSON.stringify(json), (m) => out.push(m)), out: out.join("\n") };
  };
  const used = run({ tasks: chain({ SA: { risk: "high", wave: 1 }, "BE-1": { risk: "low", wave: 2 }, "FE-1": { ac_ids: [] } }) });
  assert.equal(used.code, 0);
  assert.match(used.out, /ตรวจตามความเสี่ยง: high 1 \(ตรวจทันที\) · low 1 \(รอ wave gate\) · ยังไม่จัด 2 · wave 2/);
  assert.match(used.out, /⚠ task ที่ยังไม่ verified และไม่มี ac_ids/);
  assert.doesNotMatch(run({ tasks: chain() }).out, /ตรวจตามความเสี่ยง/);
  assert.equal(run({ tasks: chain({ SA: { risk: "medium" } }) }).code, 1);
});

test("verified ที่มี oracle แต่ไม่มี ref = warning · มีครบ = เงียบ · ไม่มีทั้งคู่เตือนแค่ oracle", () => {
  const r = verify(chain({
    "BE-1": { status: "verified", oracle: "DES-1 Rev2" },
    "BE-2": { slices: [{ id: "s1", ac_ids: ["AC-2"], status: "verified", oracle: "DES-1 Rev2" }] },
    "FE-1": { status: "verified" },
  }));
  assert.match(r.warnings.join("\n"), /มี oracle แต่ไม่มี ref .* 2 จุด .*: BE-1, BE-2\/s1$/m);
  assert.doesNotMatch(r.warnings.join("\n"), /ไม่มี ref .*FE-1/, "FE-1 ไม่มี oracle — เตือนบรรทัด oracle บรรทัดเดียวพอ");
  assert.doesNotMatch(verify(chain({ "BE-1": { status: "verified", oracle: "DES-1 Rev2", ref: "abc1234" } })).warnings.join(), /ไม่มี ref/);
});

test("งานที่ done-local แล้วแต่พึ่ง task high ที่ยังไม่ verified = warning (pipelining) · high ผ่านแล้ว = เงียบ", () => {
  const early = verify(chain({ SA: { ac_ids: ["AC-0"], risk: "high" }, "BE-1": { status: "done-local" } }));
  assert.match(early.warnings.join("\n"), /ต่อยอดจาก task high ที่ยังไม่ผ่านการตรวจ 1 งาน .*BE-1←SA/);
  assert.deepEqual(early.errors, []);
  const ok = verify(chain({ SA: { ac_ids: ["AC-0"], risk: "high", status: "verified", oracle: "R1", ref: "c1" }, "BE-1": { status: "done-local" } }));
  assert.doesNotMatch(ok.warnings.join(), /ต่อยอดจาก task high/);
  assert.doesNotMatch(verify(chain({ SA: { ac_ids: ["AC-0"], risk: "low" }, "BE-1": { status: "done-local" } })).warnings.join(), /ต่อยอดจาก task high/);
});

test("wave เกิน 6 task = warning ไม่ใช่ error · ไม่เกินเงียบ", () => {
  const many = (n) => Array.from({ length: n }, (_, i) => ({ id: `T${i}`, owner: "be", depends_on: [], ac_ids: [`AC-${i}`], wave: 1 }));
  const r = verify(many(7));
  assert.match(r.warnings.join(), /wave ที่มีเกิน 6 task: wave 1 \(7\)/);
  assert.deepEqual(r.errors, []);
  assert.doesNotMatch(verify(many(6)).warnings.join(), /เกิน 6 task/);
});

test("task high ของ sys/front ที่ตั้ง tier ต่ำกว่า t2 = warning · t2/t1, low, role อื่น หรือ verified แล้ว = เงียบ", () => {
  const r = verify(chain({ SA: { ac_ids: ["AC-0"], risk: "high", tier: "t1" }, "BE-1": { risk: "high", tier: "t3" }, "BE-2": { risk: "low", tier: "t4" }, "FE-1": { risk: "high", tier: "T4" } }));
  assert.match(r.warnings.join("\n"), /tier ต่ำกว่า t2 2 งาน .*: BE-1@t3, FE-1@t4$/m);
  assert.deepEqual(r.errors, []);
  assert.doesNotMatch(verify(chain({ "BE-1": { risk: "high", tier: "t2" } })).warnings.join(), /tier ต่ำกว่า t2/);
  assert.doesNotMatch(verify(chain({ "BE-1": { risk: "high", tier: "t3", status: "verified", oracle: "R1", ref: "c1" } })).warnings.join(), /tier ต่ำกว่า t2/);
});

test("งาน docs สามารถใช้ worker_tier t4/t5 ได้อย่างอิสระโดยไม่เตือน weakHigh", () => {
  const r = verify(chain({
    DOC1: { role: "spec", kind: "docs", risk: "high", tier: "t1", worker_tier: "t4", ac_ids: ["AC-1"] },
    DOC2: { role: "arch", kind: "docs", risk: "low", tier: "t2", worker_tier: "t5", ac_ids: ["AC-2"] },
  }));
  assert.doesNotMatch(r.warnings.join("\n"), /tier ต่ำกว่า t2/);
});

test("งาน code ที่ step-down worker_tier ต่ำกว่า plan tier ต้องมี contract หรือ oracle กำกับ", () => {
  const noContract = verify(chain({
    "BE-1": { role: "build", kind: "code", risk: "low", tier: "t2", worker_tier: "t3", ac_ids: ["AC-1"] }
  }));
  assert.match(noContract.warnings.join("\n"), /ลด worker_tier ต่ำกว่า tier โดยไม่มี contract/);

  const withContract = verify(chain({
    "BE-1": { role: "build", kind: "code", risk: "low", tier: "t2", worker_tier: "t3", ac_ids: ["AC-1"], contracts: [{ ref: "api.md" }] }
  }));
  assert.doesNotMatch(withContract.warnings.join("\n"), /ลด worker_tier ต่ำกว่า tier/);
});

test("lintPlanModules: รองรับงานข้ามระบบ (_cross, cross-cutting, cross_cutting: true) และ kind: bugfix โดยไม่ error หรือเตือน", () => {
  const rawTasks = [
    { id: "T1", module: "_cross" },
    { id: "T2", module: "cross-cutting" },
    { id: "T3", cross_cutting: true },
    { id: "T4", kind: "bugfix" },
    { id: "T5", module: "auth" },
  ];
  const isDir = (p) => p.includes("auth") || p.includes("modules");
  const r = lintPlanModules(rawTasks, "C:/project/build/plan/tasks.json", isDir);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings, []);
});

test("lintPlanModules: โมดูลที่ไม่มีจริงยังคงเป็น error และ task ทั่วไปที่ไม่ระบุโมดูลยังคงเตือน warning", () => {
  const rawTasks = [
    { id: "T1", module: "non-existent" },
    { id: "T2" },
  ];
  const isDir = (p) => p.includes("modules") && !p.includes("non-existent");
  const r = lintPlanModules(rawTasks, "C:/project/build/plan/tasks.json", isDir);
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /module "non-existent" ไม่มีจริง/);
  assert.equal(r.warnings.length, 1);
  assert.match(r.warnings[0], /task ที่ยังไม่ระบุ module 1 งาน/);
});
