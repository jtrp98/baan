// Regression: plan validation ต้องกัน path traversal / cycle / self-dep / type ผิด (AUDIT ข้อ 5)
import test from "node:test";
import assert from "node:assert/strict";
import { validateAndFixPlan, findDependencyCycle } from "../src/plan.mjs";

const cfg = {
  roleNames: ["check", "spec", "front"],
  agents: { codex: {}, claude: {}, agy: {} },
  tiers: {
    t2: { codex: { model: "m" }, claude: { model: "m" }, agy: null },
    t3: { codex: { model: "m" }, claude: { model: "m" }, agy: { model: "m" } },
    t5: { codex: null, claude: { model: "m" }, agy: { model: "m" } },
  },
};
const opts = { agent: "codex" };
const task = (over = {}) => ({ id: "T1", role: "check", tier: "t2", title: "งานทดสอบ", task: "ทำงาน", dependsOn: [], ...over });

test("แผนปกติผ่าน validation และ dependsOn ที่ไม่ระบุกลายเป็น []", () => {
  const plan = validateAndFixPlan({ tasks: [task({ dependsOn: undefined })] }, cfg, opts);
  assert.deepEqual(plan.tasks[0].dependsOn, []);
  assert.equal(plan.tasks[0].agent, "codex");
});

test("tier คงที่ของ role ถูก force เสมอ (spec → t2)", () => {
  const plan = validateAndFixPlan({ tasks: [task({ role: "spec", tier: "t3" })] }, cfg, opts);
  assert.equal(plan.tasks[0].tier, "t2");
});

test("แผนเก่าที่ใช้ชื่อ role แบบยาว (ก่อนย่อ ID) ยังผ่าน และถูกแปลงเป็น ID สั้น — resume run เดิมได้", () => {
  const plan = validateAndFixPlan({ tasks: [task({ role: "business-analyst", tier: "t3" }), task({ id: "T2", role: "frontend-engineer", tier: "t3" })] }, cfg, opts);
  assert.deepEqual(plan.tasks.map((t) => t.role), ["spec", "front"]);
  assert.equal(plan.tasks[0].tier, "t2", "tier คงที่ยังถูก force หลังแปลงชื่อ");
  assert.equal(plan.tasks[1].tier, "t3", "front เลือก tier เองได้");
});

test("agent ที่ null ใน tier ถูก fallback ไปตัวที่ใช้ได้", () => {
  const plan = validateAndFixPlan({ tasks: [task({ role: "front", tier: "t5" })] }, cfg, opts);
  assert.equal(plan.tasks[0].agent, "agy"); // codex เป็น null ที่ t5
});

test("task id ที่หนีออกนอก reports directory ต้องถูกปฏิเสธ", () => {
  for (const bad of ["../../outside", "a/b", "a\\b", "T 1", "..", ".", "x".repeat(65)]) {
    assert.throws(() => validateAndFixPlan({ tasks: [task({ id: bad })] }, cfg, opts), /id ไม่ถูกต้อง/, `id "${bad}" ต้องถูกปฏิเสธ`);
  }
});

test("id ซ้ำ / dependsOn ไม่มีจริง / ชี้ตัวเอง ต้องถูกปฏิเสธ", () => {
  assert.throws(() => validateAndFixPlan({ tasks: [task(), task({ id: "T1", title: "ซ้ำ" })] }, cfg, opts), /id ซ้ำ/);
  assert.throws(() => validateAndFixPlan({ tasks: [task({ id: "B", dependsOn: ["ไม่มีตัวนี้"] })] }, cfg, opts), /dependsOn ไม่มีจริง/);
  assert.throws(() => validateAndFixPlan({ tasks: [task({ dependsOn: ["T1"] })] }, cfg, opts), /ตัวเองไม่ได้/);
});

test("dependsOn ที่ไม่ใช่ array ของ string ต้องถูกปฏิเสธ", () => {
  assert.throws(() => validateAndFixPlan({ tasks: [task({ dependsOn: "T9" })] }, cfg, opts), /dependsOn ต้องเป็น array ของ string/);
  assert.throws(() => validateAndFixPlan({ tasks: [task({ dependsOn: [42] })] }, cfg, opts), /dependsOn ต้องเป็น array ของ string/);
});

test("humanGates ที่ไม่ใช่ array ของ string ต้องถูกปฏิเสธ", () => {
  assert.throws(() => validateAndFixPlan({ tasks: [task()], humanGates: "ประตูเดียว" }, cfg, opts), /humanGates ต้องเป็น array ของ string/);
  assert.throws(() => validateAndFixPlan({ tasks: [task()], humanGates: [1] }, cfg, opts), /humanGates ต้องเป็น array ของ string/);
});

test("แผนว่างหรือหน้าตาไม่ใช่ plan ต้องถูกปฏิเสธ", () => {
  assert.throws(() => validateAndFixPlan({ tasks: [] }, cfg, opts), /plan.tasks/);
  assert.throws(() => validateAndFixPlan(null, cfg, opts), /object/);
  assert.throws(() => validateAndFixPlan(["task"], cfg, opts), /object/);
});

test("dependency วนลูปต้องถูกจับก่อน spawn ใดๆ", () => {
  assert.throws(
    () => validateAndFixPlan({ tasks: [task({ id: "A", dependsOn: ["B"] }), task({ id: "B", dependsOn: ["A"] })] }, cfg, opts),
    /วนลูป/,
  );
  // เกิดวนแบบมีงานอื่นปนอยู่ด้วยก็ต้องจับก่อน ไม่ใช่มาเจอตอน execute ทีหลัง
  assert.throws(
    () => validateAndFixPlan({ tasks: [task(), task({ id: "A", dependsOn: ["B"] }), task({ id: "B", dependsOn: ["A"] })] }, cfg, opts),
    /วนลูป/,
  );
});

test("findDependencyCycle: วนได้รายการ id ครบวง, ลูกโซ่ปกติคืน null", () => {
  const cyc = findDependencyCycle([
    { id: "A", dependsOn: ["B"] },
    { id: "B", dependsOn: ["C"] },
    { id: "C", dependsOn: ["A"] },
  ]);
  assert.equal(cyc[0], cyc[cyc.length - 1]); // จุดเริ่ม = จุดจบ
  assert.equal(cyc.length, 4);
  assert.equal(findDependencyCycle([{ id: "A", dependsOn: [] }, { id: "B", dependsOn: ["A"] }]), null);
});

// full pass ในโหมดอัตโนมัติอยู่ในแผนเดียวกับงาน dev — ระดับต้องตั้งราย task ได้ (charter ข้อ 14)
test("testLevel ราย task: full/normal ผ่าน · ค่าอื่น = error · ไม่ใส่ = ใช้ระดับของ run", () => {
  assert.equal(validateAndFixPlan({ tasks: [task({ testLevel: "full" })] }, cfg, opts).tasks[0].testLevel, "full");
  assert.equal(validateAndFixPlan({ tasks: [task()] }, cfg, opts).tasks[0].testLevel, undefined);
  assert.throws(() => validateAndFixPlan({ tasks: [task({ testLevel: "deep" })] }, cfg, opts), /T1: testLevel ต้องเป็น normal\/full/);
});
