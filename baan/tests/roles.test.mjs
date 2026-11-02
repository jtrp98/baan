// Regression: ID role สั้น + alias ชื่อเดิม และ tier/คำอธิบายต้องตรงกันทุกแหล่ง
// (เคยเพี้ยนกันสามชุด: หัวไฟล์ role, ตารางใน README และ FIXED_ROLE_TIER ในโค้ด)
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { LEGACY_ROLE_ALIASES, listRoles, resolveRoleName } from "../src/config.mjs";
import { FIXED_ROLE_TIER, IMPLEMENT_TIER_RANGE } from "../src/plan.mjs";
import { roleDirective } from "../src/prompts.mjs";
import { parseRoleArgs } from "../src/role-session.mjs";

const pkgDir = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const IMPLEMENT_ROLES = ["front", "sys"];
const roles = listRoles();
const byName = new Map(roles.map((r) => [r.name, r]));

test("ทีมมีครบ 11 role ตาม ID สั้น — ทุก role ที่มี tier คงที่ต้องมีไฟล์จริง", () => {
  assert.deepEqual([...byName.keys()].sort(), [...Object.keys(FIXED_ROLE_TIER), ...IMPLEMENT_ROLES].sort());
});

test("หัวไฟล์ role ทุกไฟล์มีชื่อแสดง / หน้าที่ / tier และ tier ตรงกับ FIXED_ROLE_TIER", () => {
  for (const r of roles) {
    assert.ok(r.title && r.title !== r.name, `${r.name}: ไม่มี "# บทบาท:"`);
    assert.ok(r.summary, `${r.name}: ไม่มี "> หน้าที่:"`);
    const expected = FIXED_ROLE_TIER[r.name] ?? IMPLEMENT_TIER_RANGE;
    assert.equal(r.tier, expected, `${r.name}: บรรทัด "> tier:" ต้องเป็น ${expected}`);
  }
});

test("ชื่อเดิมแบบยาวทุกตัวชี้ไป role ที่มีจริง และ ID สั้นผ่านได้ตรงตัว", () => {
  for (const [legacy, id] of Object.entries(LEGACY_ROLE_ALIASES)) {
    assert.ok(byName.has(id), `${legacy} → ${id} ไม่มีไฟล์ role`);
    assert.equal(resolveRoleName(legacy), id);
  }
  for (const id of byName.keys()) assert.equal(resolveRoleName(id), id);
  assert.equal(resolveRoleName("toString"), "toString", "ไม่หลุดไปเจอ property ของ Object");
  assert.equal(roleDirective("business-analyst", "x", null, "", "2026-10-17"), roleDirective("spec", "x", null, "", "2026-10-17"));
});

test("baan-role --role รับชื่อเดิมแล้วแปลงเป็น ID สั้น", () => {
  const opts = parseRoleArgs(["--role", "system-analyst"]);
  assert.equal(opts.role, "arch");
  assert.equal(opts.roleAlias, "system-analyst");
  assert.equal(parseRoleArgs(["--role", "arch"]).roleAlias, "");
});

// แถวตารางรูปแบบ | `id` | ชื่อ | หน้าที่ | tier | ... — ตรวจว่าทุก role อยู่ในตารางและ tier ตรงกับโค้ด
function roleTable(file) {
  const rows = new Map();
  for (const line of readFileSync(path.join(pkgDir, file), "utf8").split("\n")) {
    const m = /^\| `([a-z]+)` \| ([^|]+) \| ([^|]+) \| ([^|]+) \|/.exec(line.trim());
    if (m) rows.set(m[1], { title: m[2].trim(), summary: m[3].trim(), tier: m[4].trim() });
  }
  return rows;
}

for (const file of ["BAAN.md", "README.md"]) {
  test(`ตาราง role ใน ${file} ตรงกับหัวไฟล์ role และ FIXED_ROLE_TIER`, () => {
    const rows = roleTable(file);
    assert.deepEqual([...rows.keys()].sort(), [...byName.keys()].sort(), "ต้องมีครบทุก role");
    for (const [id, row] of rows) {
      const r = byName.get(id);
      assert.equal(row.title, r.title, `${file} ${id}: ชื่อไม่ตรงหัวไฟล์`);
      assert.equal(row.summary, r.summary, `${file} ${id}: หน้าที่ไม่ตรงหัวไฟล์`);
      if (FIXED_ROLE_TIER[id]) assert.equal(row.tier, FIXED_ROLE_TIER[id], `${file} ${id}: tier`);
      else assert.ok(row.tier.includes(IMPLEMENT_TIER_RANGE), `${file} ${id}: tier ต้องบอกช่วง ${IMPLEMENT_TIER_RANGE}`);
    }
  });
}

// front/sys/check เขียนโค้ดลง target จริง — กติกาสไตล์/comment ต้องมีและเหมือนกันทุกไฟล์ (แก้ที่เดียวแล้วลืมที่อื่น = role ได้กติกาไม่เท่ากัน)
const CODE_WRITING_ROLES = ["front", "sys", "check"];
test("front/sys/check share one identical code-style & comment section: follow target style · comments only why · no task ids in code", () => {
  const section = (id) => {
    const text = readFileSync(path.join(pkgDir, "roles", `${id}.md`), "utf8");
    const start = text.indexOf("## Code style and comments");
    assert.ok(start !== -1, `${id}: missing the code-style & comment section`);
    const end = text.indexOf("\n## ", start + 1);
    return text.slice(start, end === -1 ? undefined : end).trim();
  };
  const front = section("front");
  for (const id of CODE_WRITING_ROLES) assert.equal(section(id), front, `${id}'s section must match front's character-for-character`);
  for (const must of ["Match the surrounding code in the target", 'Comments only explain "why"', "never write comments that describe what the code does", "Never put task ids"]) {
    assert.ok(front.includes(must), `missing: ${must}`);
  }
});

// Regression: งานต้องจบได้ — school-bot (2026-10-28) check สร้างเคสเองถึง 2222 เคสจากประโยค "you haven't looked hard enough"
// แล้วตกที่ header ซ้ำของ test server หลังแก้ 2 รอบ และเรื่องติดเพดานถูกพักไว้ "ท้ายวง" ที่ไม่เคยมาถึง
const read = (f) => readFileSync(path.join(pkgDir, f), "utf8");

test("check มีขอบเขต: ไม่บังคับให้หาจนเจอ · oracle ตรึงต่อ task · เคสเพิ่มมีเพดาน · FAIL เฉพาะ scoped/reachable · re-check ตามรอบเดิม · verdict ราย slice", () => {
  const check = read("roles/check.md");
  assert.doesNotMatch(check, /haven't looked hard enough/);
  for (const must of [
    "Finding nothing beyond the scope is a valid result",
    "## Bounded scope — the oracle is frozen per task",
    "does not move this task's finish line",
    "at most 20 per task",
    "reachable on a realistic path",
    "never resets its rework count",
    "**Slice verdicts**",
  ]) assert.ok(check.includes(must), `roles/check.md ขาด: ${must}`);
});

test("jpo re-audit ไม่เลื่อนเส้นชัย: finding ใหม่นอกการแก้เป็น finding แยก ไม่นับเป็น re-audit ตก", () => {
  assert.match(read("roles/jpo.md"), /A re-audit is scoped to the findings it re-checks.*never resets that task's rework count/);
});

test("charter + CONVENTIONS: ติดเพดาน rework = ถามทันทีไม่พักท้ายวง · oracle ตรึง · สถานะราย slice", () => {
  const charter = read("BAAN.md");
  assert.match(charter, /^12\. \*\*งานต้องจบได้/m);
  assert.match(charter, /หยุดเปิดงานใหม่แล้วถามผู้ใช้ทันที.*ห้ามพักไว้ "ท้ายวง"/);
  assert.match(charter, /\*\*ตรึง oracle ต่อ task\*\*/);
  assert.match(charter, /\*\*verdict ราย slice\*\*/);
  const conv = read("CONVENTIONS.md");
  assert.match(conv, /then a human decides immediately.*never parks it until "the end of the round"/);
  assert.match(conv, /\*\*The finish line is frozen per task\*\*/);
  assert.match(conv, /records `slices` \(id \+ exact `ac_ids` \+ status\)/);
});

// Regression: knowledge ของ school-bot (2026-11-02) อ่านไม่รู้เรื่อง — กติกา "แก้เฉพาะจุด + Change Log ทุกครั้ง"
// ทำให้เอกสารซ้อนเป็นชั้น "Override RevN" และ ID ไม่มีความหมาย · Change Log ในไฟล์ที่แนบ prompt เปลือง context ทุก role
test("ไฟล์ที่แนบเข้า prompt (CONVENTIONS, charter, roles) ไม่มี Change Log — ประวัติอยู่ที่ RELEASE-NOTES/git", () => {
  for (const f of ["CONVENTIONS.md", "BAAN.md", ...roles.map((r) => `roles/${r.name}.md`)]) {
    assert.doesNotMatch(read(f), /^## Change Log/m, `${f} ยังมี ## Change Log`);
  }
});

test("CONVENTIONS §3: knowledge เขียนให้ dev อ่าน · แก้ทับไม่ต่อ Override · changelog แยกไฟล์รายเดือน · สรุปมติที่ใช้อยู่", () => {
  const conv = read("CONVENTIONS.md");
  for (const must of [
    "a developer on the team who never ran BAAN",
    "Every ID carries its meaning the first time it appears",
    'Never append "Override RevN"',
    "`changelog\\YYYY-MM.md`",
    "Knowledge files get **no `## Change Log` section**",
    "`requirement\\decisions.md` lists the decisions in force today",
    "closing `## หลักฐาน` section",
  ]) assert.ok(conv.includes(must), `CONVENTIONS.md ขาด: ${must}`);
  for (const f of ["roles/arch.md", "roles/spec.md", "roles/gm.md"]) {
    assert.match(read(f), /module changelog \(CONVENTIONS §3\)|module changelog —/, `${f} ต้องชี้ไป changelog ตาม §3`);
  }
});
