// Regression ของ preflight: ทุกเคสมาจากใบงานจริงที่ role รันไปแล้วจบ BLOCKED เพราะ sandbox (school-bot 2026-11-02..03)
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expandTaskText, extractWinPaths, preflightTask } from "../src/preflight.mjs";
import { parseRoleArgs } from "../src/role-session.mjs";

const BIN = fileURLToPath(new URL("../bin/baan-role.mjs", import.meta.url));
const CWD = "C:\\ws\\target\\school-bot";
const codes = (problems) => problems.map((p) => p.code);
const none = { exists: () => false, gitRoot: () => "" };

test("extractWinPaths: ตัดเลขบรรทัด/anchor/วรรคตอน และหยุดที่อักษรไทยที่เขียนติดกัน", () => {
  assert.deepEqual(extractWinPaths("ดู [x](/C:/ws/a/b.cs:199) และ C:\\ws\\c.md#L3-L9, แล้ว C:\\ws\\dที่นี่"), ["C:\\ws\\a\\b.cs", "C:\\ws\\c.md", "C:\\ws\\d"]);
  assert.deepEqual(extractWinPaths("route /v2/admin/licenses ไม่ใช่ path"), []);
});

test("read-build: สั่งรัน test ในโหมดอ่าน = ติด (ทั้งคำสั่งตรงและร้อยแก้ว)", () => {
  assert.deepEqual(codes(preflightTask({ task: "รัน `dotnet test web\\SchoolBot.slnx`", cwd: CWD, write: false }, none)), ["read-build"]);
  assert.deepEqual(codes(preflightTask({ task: "3. regression — รัน xUnit runner เดิมครบทุก test", cwd: CWD, write: false }, none)), ["read-build"]);
  assert.deepEqual(preflightTask({ task: "รัน `dotnet test`", cwd: CWD, write: true }, none), [], "โหมดเขียน build ได้");
  assert.deepEqual(preflightTask({ task: "อ่านโค้ดแล้วสรุป", cwd: CWD, write: false }, none), []);
});

test("write-outside: path นอก cwd ที่ยังไม่มี = role ต้องสร้างแต่ sandbox ไม่ให้ · ที่มีอยู่แล้ว/อยู่ใน cwd ผ่าน", () => {
  const exists = (p) => p === "C:\\ws\\knowledge\\req.md";
  const task = "อ่าน C:\\ws\\knowledge\\req.md แก้ C:\\ws\\target\\school-bot\\web\\new.cs แล้วเขียนหลักฐานที่ C:\\ws\\reports\\r2b-evidence";
  const p = preflightTask({ task, cwd: CWD, write: true }, { ...none, exists });
  assert.deepEqual(codes(p), ["write-outside"]);
  assert.match(p[0].message, /r2b-evidence/);
  assert.doesNotMatch(p[0].message, /new\.cs|req\.md/);
  assert.deepEqual(preflightTask({ task, cwd: CWD, write: false }, { ...none, exists }), [], "โหมดอ่านไม่เขียนอะไร");
  assert.deepEqual(preflightTask({ task: "เขียนที่ c:\\WS\\Target\\School-Bot\\x.md", cwd: CWD, write: true }, none), [], "Windows ไม่สนตัวพิมพ์");
});

test("write-outside: ข้ามบรรทัด memory ของ module จาก --module-context (นายช่างบันทึกเอง)", () => {
  const task = "- memory ของ module: C:\\ws\\memory\\school-bot\\quiz\nแก้ไฟล์ใน cwd";
  assert.deepEqual(preflightTask({ task, cwd: CWD, write: true }, none), []);
});

test("git-parent: อ่านประวัติ git ขณะ cwd อยู่ใต้ repo = ติด · แค่พูดถึง git หรือ cwd เป็นราก repo ผ่าน", () => {
  const cwd = "C:\\ws\\knowledge\\school-bot";
  const gitRoot = () => "C:\\ws\\knowledge";
  const task = "ก่อนจบเทียบกับฉบับเดิม (`git -C .. show HEAD:school-bot/<ไฟล์>`)";
  assert.deepEqual(codes(preflightTask({ task, cwd, write: true }, { ...none, gitRoot })), ["git-parent"]);
  assert.deepEqual(preflightTask({ task: "ห้าม git stage/commit/push · ประวัติอยู่ใน git", cwd, write: true }, { ...none, gitRoot }), []);
  assert.deepEqual(preflightTask({ task, cwd: "C:\\ws\\knowledge", write: true }, { ...none, gitRoot }), []);
  assert.deepEqual(preflightTask({ task, cwd, write: false }, { ...none, gitRoot }), [], "โหมดอ่านอ่าน .git ได้");
});

test("expandTaskText: ตามอ่านไฟล์ใบงาน .txt ที่อ้างชั้นเดียว ไม่อ่าน .md", () => {
  const files = { "C:\\ws\\r\\check-task.txt": "รัน dotnet test", "C:\\ws\\k\\des.md": "รัน dotnet test" };
  const io = { exists: (p) => p in files, read: (p) => files[p], size: () => 10 };
  assert.match(expandTaskText("อ่าน C:\\ws\\r\\check-task.txt ให้ครบแล้วทำตามนั้น", io), /dotnet test/);
  assert.doesNotMatch(expandTaskText("อ่าน C:\\ws\\k\\des.md", io), /dotnet test/);
});

test("baan-role: preflight ติด = exit 2 ไม่เปิด session · --no-preflight ข้ามได้", () => {
  assert.equal(parseRoleArgs(["--no-preflight"]).preflight, false);
  assert.equal(parseRoleArgs([]).preflight, true);
  const r = spawnSync(process.execPath, [BIN, "--agent", "codex", "--task", "รัน dotnet test ทั้ง suite"], { encoding: "utf8" });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /\[read-build\]/);
});
