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
test("front/sys/check มีหมวดสไตล์โค้ดและ comment ชุดเดียวกัน: ยึดสไตล์ target · comment เฉพาะ why · ห้าม task id ในโค้ด", () => {
  const section = (id) => {
    const text = readFileSync(path.join(pkgDir, "roles", `${id}.md`), "utf8");
    const start = text.indexOf("## สไตล์โค้ดและ comment");
    assert.ok(start !== -1, `${id}: ไม่มีหมวดสไตล์โค้ดและ comment`);
    const end = text.indexOf("\n## ", start + 1);
    return text.slice(start, end === -1 ? undefined : end).trim();
  };
  const front = section("front");
  for (const id of CODE_WRITING_ROLES) assert.equal(section(id), front, `หมวดนี้ของ ${id} ต้องเหมือนของ front ทุกตัวอักษร`);
  for (const must of ["เหมือนโค้ดรอบข้างใน target", "comment เฉพาะ \"why\"", "ห้าม comment ที่เล่าว่าโค้ดทำอะไร", "ห้ามใส่ task id"]) {
    assert.ok(front.includes(must), `ขาด: ${must}`);
  }
});
