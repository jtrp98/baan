// knowledge แบบ layout "project" (0.24.0): project > module + ช่อง shared/design/build,
// ตาราง module สร้างจากหัวไฟล์, run ราย module, commit ตาม project/module, แผนมีช่อง module, install ทีมออกแบบ
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { applyModuleTable, brokenLinks, lintKnowledge, parseModuleSpec, readFrontMatter, scanProjects, updateIndexes } from "../src/knowledge-index.mjs";
import { LEGACY_ROLE_ALIASES, layoutOf, resolveModules } from "../src/config.mjs";
import { planCommits } from "../src/knowledge-commit.mjs";
import { lintPlanModules } from "../src/plan.mjs";
import { moduleContext } from "../bin/baan.mjs";
import { performInit } from "../src/init.mjs";

const TEAM_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function write(root, rel, text) {
  const f = path.join(root, rel);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, text, "utf8");
}

// school-bot (quiz พึ่ง app-shell) + schoolbright-web (หน้าครูที่ school-bot ขอ และพึ่ง school-bot/quiz)
function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "baan-kb-"));
  write(root, "school-bot/INDEX.md", "---\ntarget: school-bot\n---\n# school-bot\n\nแอปนักเรียน\n");
  write(root, "school-bot/shared/context.md", "# บริบท\n");
  write(root, "school-bot/modules/app-shell/INDEX.md", "---\nstatus: draft\nupdated: 2026-10-30\nsummary: โครงแอป\n---\n# app-shell\n");
  write(root, "school-bot/modules/quiz/INDEX.md", "---\nstatus: approved\nupdated: 2026-11-01\ndepends_on: [app-shell]\n---\n# Quiz Game\n\n[บริบท](../../shared/context.md)\n");
  write(root, "schoolbright-web/modules/school-bot/INDEX.md", "---\nstatus: draft\nupdated: 2026-11-02\nrequested_by: school-bot\ndepends_on: [school-bot/quiz]\ntarget: web-system\nsummary: หน้าครู\n---\n# หน้าครู\n");
  return root;
}

test("readFrontMatter: key: value และ [a, b] เป็นรายการ · ไม่มีหัวไฟล์ = {}", () => {
  assert.deepEqual(readFrontMatter("---\nstatus: draft\ndepends_on: [a, b/c]\nempty: []\n---\n# x"), { status: "draft", depends_on: ["a", "b/c"], empty: [] });
  assert.deepEqual(readFrontMatter("# ไม่มีหัวไฟล์"), {});
  assert.deepEqual(readFrontMatter("---\r\nstatus: built\r\n---\r\n"), { status: "built" });
});

test("parseModuleSpec: ชิ้นที่ไม่มี project ใช้ project ของชิ้นก่อน · ข้าม project ได้ · รูปผิด = error", () => {
  assert.deepEqual(parseModuleSpec("school-bot/quiz+app-shell+schoolbright-web/school-bot"), [
    { project: "school-bot", module: "quiz" },
    { project: "school-bot", module: "app-shell" },
    { project: "schoolbright-web", module: "school-bot" },
  ]);
  assert.throws(() => parseModuleSpec("quiz"), /project/);
  assert.throws(() => parseModuleSpec(""), /ต้องระบุ/);
});

test("scanProjects: project = โฟลเดอร์ที่มี modules/ · อ่านหัวไฟล์ module ครบ · _shared ไม่ใช่ project", () => {
  const root = fixture();
  try {
    write(root, "_shared/README.md", "# ของกลาง\n");
    const ps = scanProjects(root);
    assert.deepEqual(ps.map((p) => p.name), ["school-bot", "schoolbright-web"]);
    const quiz = ps[0].modules.find((m) => m.module === "quiz");
    assert.equal(quiz.status, "approved");
    assert.deepEqual(quiz.dependsOn, ["app-shell"]);
    assert.equal(quiz.summary, "Quiz Game", "ไม่มี summary ใช้หัวข้อแรก");
    assert.equal(ps[0].header.target, "school-bot");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("updateIndexes: ตาราง module มาจากหัวไฟล์ + แถว module ของ project อื่นที่ขอ/พึ่ง project นี้ · รันซ้ำไม่เปลี่ยน", () => {
  const root = fixture();
  try {
    const changed = updateIndexes(root);
    assert.equal(changed.length, 2, "school-bot แก้ไฟล์เดิม · schoolbright-web สร้าง INDEX ใหม่");
    const sb = readFileSync(path.join(root, "school-bot/INDEX.md"), "utf8");
    assert.match(sb, /^---\ntarget: school-bot\n---\n# school-bot/, "เนื้อหาเดิมของผู้ใช้ไม่หาย");
    assert.match(sb, /\| quiz \| Quiz Game \| approved \| 2026-11-01 \| app-shell \| \[modules\/quiz\]\(modules\/quiz\/INDEX\.md\) \|/);
    assert.match(sb, /module ที่อยู่ project อื่นแต่เกี่ยวกับ project นี้/);
    assert.match(sb, /\| school-bot \| หน้าครู \| draft \| 2026-11-02 \| ขอโดย school-bot · พึ่ง school-bot\/quiz \| \[schoolbright-web\/modules\/school-bot\]\(\.\.\/schoolbright-web\/modules\/school-bot\/INDEX\.md\) \|/);
    const web = readFileSync(path.join(root, "schoolbright-web/INDEX.md"), "utf8");
    assert.match(web, /\| school-bot \| หน้าครู · ขอโดย school-bot \| draft \|/);
    assert.deepEqual(updateIndexes(root), [], "ตรงแล้ว ไม่เขียนซ้ำ");
    // สถานะเปลี่ยนที่หัวไฟล์ของ module → ตารางทั้งสองฝั่งตามทันในรอบถัดไป
    write(root, "schoolbright-web/modules/school-bot/INDEX.md", "---\nstatus: approved\nupdated: 2026-11-03\nrequested_by: school-bot\nsummary: หน้าครู\n---\n");
    assert.equal(updateIndexes(root).length, 2);
    assert.match(readFileSync(path.join(root, "school-bot/INDEX.md"), "utf8"), /\| หน้าครู \| approved \| 2026-11-03 \| ขอโดย school-bot \|/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("applyModuleTable: แทนเฉพาะช่วง marker · คง CRLF ของไฟล์เดิม", () => {
  const t = "<!-- baan:modules:start -->\nใหม่\n<!-- baan:modules:end -->";
  const before = "# p\r\n\r\n<!-- baan:modules:start -->\r\nเก่า\r\n<!-- baan:modules:end -->\r\nท้าย\r\n";
  assert.equal(applyModuleTable(before, t, "p"), "# p\r\n\r\n<!-- baan:modules:start -->\r\nใหม่\r\n<!-- baan:modules:end -->\r\nท้าย\r\n");
});

test("lintKnowledge: depends_on/requested_by ที่ไม่มีจริง · ตารางไม่ตรง · ลิงก์เสีย = error · ไฟล์นอกช่องทีม = เตือน", () => {
  const root = fixture();
  try {
    updateIndexes(root);
    assert.deepEqual(lintKnowledge(root).errors, []);
    write(root, "school-bot/modules/quiz/INDEX.md", "---\nstatus: approved\ndepends_on: [no-such]\nrequested_by: nobody\n---\n# Quiz\n[เสีย](../missing.md) [เว็บ](https://x.test) `[โค้ด](ไม่ใช่ลิงก์.md)`\n");
    write(root, "school-bot/requirement/req-001.md", "# เดิม\n");
    const r = lintKnowledge(root);
    assert.ok(r.errors.some((e) => /depends_on "no-such"/.test(e)));
    assert.ok(r.errors.some((e) => /requested_by "nobody"/.test(e)));
    assert.ok(r.errors.some((e) => /ตาราง module ไม่ตรง/.test(e)));
    assert.ok(r.errors.some((e) => /ลิงก์เสีย \.\.\/missing\.md/.test(e)));
    assert.equal(r.errors.filter((e) => /ลิงก์เสีย/.test(e)).length, 1, "URL และโค้ดในบรรทัดไม่นับ");
    assert.ok(r.warnings.some((w) => /school-bot\/requirement: อยู่นอกช่อง/.test(w)));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("brokenLinks: ข้าม anchor ล้วนและ mailto · ตัด #anchor ออกก่อนตรวจไฟล์", () => {
  const root = mkdtempSync(path.join(tmpdir(), "baan-link-"));
  try {
    write(root, "a.md", "");
    const f = path.join(root, "b.md");
    assert.deepEqual(brokenLinks(f, "[x](#top) [m](mailto:a@b.c) [a](a.md#sec) [z](z.md)"), ["z.md"]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("resolveModules + moduleContext: target จากหัวไฟล์ module ก่อน project · บอกขอบเขตเขียน/อ่าน · ไม่มี module = error ที่บอกของที่มี", () => {
  const root = fixture();
  try {
    const ws = { knowledge_roots: [{ name: "kb", path: root, layout: "project", memory_root: path.join(root, "..", "mem"), targets: [{ name: "school-bot", path: "/t/sb" }, { name: "web-system", path: "/t/web" }] }] };
    const mods = resolveModules(ws, "school-bot/quiz+schoolbright-web/school-bot");
    assert.equal(mods[0].target.name, "school-bot", "quiz ไม่มี target เอง ใช้ของ project");
    assert.equal(mods[1].target.name, "web-system");
    const ctx = moduleContext(mods);
    assert.match(ctx, /school-bot\/quiz \+ schoolbright-web\/school-bot \(ข้าม module\)/);
    assert.match(ctx, /module ที่พึ่ง \(อ่านอย่างเดียว\): school-bot\/app-shell/, "school-bot/quiz อยู่ในงานแล้ว ไม่ซ้ำในรายการพึ่ง");
    assert.match(ctx, /_cross/);
    assert.throws(() => resolveModules(ws, "school-bot/nope"), /ไม่พบ module: school-bot\/nope[\s\S]*school-bot\/quiz/);
    assert.throws(() => resolveModules({ knowledge_roots: [{ name: "old", path: root }] }, "school-bot/quiz"), /layout/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("layoutOf: ไม่ตั้ง = module แบบเดิม (backward-compat)", () => {
  assert.equal(layoutOf({}), "module");
  assert.equal(layoutOf({ layout: "project" }), "project");
});

test("planCommits layout project: แยก commit ต่อ <project>/<module> · ไฟล์ระดับ project อีกกลุ่ม · layout เดิมไม่เปลี่ยน", () => {
  const entries = [
    { code: "M ", file: "school-bot/modules/quiz/shared/requirements.md" },
    { code: "M ", file: "school-bot/modules/quiz/INDEX.md" },
    { code: "??", file: "school-bot/modules/app-shell/design/D1-shell.md" },
    { code: "M ", file: "school-bot/INDEX.md" },
  ];
  const plans = planCommits(entries, "kb", "project");
  assert.deepEqual(plans.map((p) => [p.module, p.scope, p.verb]), [
    ["school-bot/quiz", "school-bot/modules/quiz", "update"],
    ["school-bot/app-shell", "school-bot/modules/app-shell", "add"],
    ["school-bot", "school-bot", "update"],
  ]);
  assert.equal(plans[0].message, "school-bot/quiz: update INDEX.md, requirements.md");
  assert.deepEqual(planCommits(entries, "kb").map((p) => p.module), ["school-bot"], "layout เดิมรวมเป็น module เดียว");
});

test("lintPlanModules: แผนใต้ <project>/build/plan ตรวจช่อง module (ข้าม project ได้) · ไม่ระบุ = เตือน · แผนนอก project ไม่ตรวจ", () => {
  const root = fixture();
  try {
    const file = path.join(root, "school-bot/build/plan/tasks-001.json");
    const r = lintPlanModules([
      { id: "T1", module: "quiz" },
      { id: "T2", module: ["quiz", "schoolbright-web/school-bot"] },
      { id: "T3", module: "nope" },
      { id: "T4" },
    ], file, (p) => existsSync(p));
    assert.equal(r.project, "school-bot");
    assert.deepEqual(r.errors, ['T3: module "nope" ไม่มีจริง (school-bot/modules/nope)']);
    assert.match(r.warnings[0], /ยังไม่ระบุ module 1 งาน.*T4/);
    const old = lintPlanModules([{ id: "T1" }], path.join(root, "..", "plan.json"), () => false);
    assert.deepEqual([old.errors, old.warnings], [[], []]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("alias ชื่อเดิมของทีมออกแบบ: ruler/crayon/highlighter/pencil", () => {
  assert.equal(LEGACY_ROLE_ALIASES.ruler, "survey");
  assert.equal(LEGACY_ROLE_ALIASES.crayon, "ui");
  assert.equal(LEGACY_ROLE_ALIASES.highlighter, "review");
  assert.equal(LEGACY_ROLE_ALIASES.pencil, "spec");
});

test("init: วาง agent survey/ui/review + /pencil + skill ของทีมออกแบบ · รันซ้ำทับเฉพาะของ baan · ของผู้ใช้ไม่แตะ", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "baan-init-design-"));
  try {
    const res = performInit(dir, TEAM_DIR, () => {});
    for (const id of ["survey", "ui", "review"]) {
      const f = path.join(dir, ".claude", "agents", `${id}.md`);
      assert.match(readFileSync(f, "utf8"), new RegExp(`^---\\nname: ${id}\\n`));
      assert.ok(readFileSync(f, "utf8").includes(path.join(TEAM_DIR, "roles", `${id}.md`)), "ชี้ role ตัวจริงใน package");
    }
    assert.ok(existsSync(path.join(dir, ".claude", "commands", "pencil.md")));
    assert.ok(existsSync(path.join(dir, ".claude", "skills", "web-design-guidelines", "references", "rules.md")));
    assert.ok(existsSync(path.join(dir, ".claude", "skills", "web-design-guidelines", ".baan-managed")));
    assert.ok(res.design.length >= 6);
    // ของผู้ใช้เอง (ไม่มี marker) ห้ามทับ · ของ baan ทับได้
    writeFileSync(path.join(dir, ".claude", "agents", "ui.md"), "ของผู้ใช้\n", "utf8");
    rmSync(path.join(dir, ".claude", "skills", "hallmark", ".baan-managed"));
    const again = performInit(dir, TEAM_DIR, () => {});
    assert.equal(readFileSync(path.join(dir, ".claude", "agents", "ui.md"), "utf8"), "ของผู้ใช้\n");
    assert.ok(again.skipped.some((f) => f.endsWith(`agents${path.sep}ui.md`)));
    assert.ok(again.skipped.some((f) => f.endsWith(`skills${path.sep}hallmark`)));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("init --knowledge-git: clone knowledge แล้วเขียน config ที่ path จริง + layout project · มีโฟลเดอร์อยู่แล้วไม่ clone ทับ", () => {
  const base = mkdtempSync(path.join(tmpdir(), "baan-init-clone-"));
  try {
    const src = path.join(base, "knowledge-sb");
    mkdirSync(src);
    const git = (...a) => spawnSync("git", ["-C", src, ...a], { encoding: "utf8" });
    git("init", "-q");
    writeFileSync(path.join(src, "README.md"), "# kb\n");
    git("add", ".");
    git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "init");
    const ws = path.join(base, "ws");
    const res = performInit(ws, TEAM_DIR, () => {}, { knowledgeGit: src });
    assert.equal(res.config, "generated");
    assert.ok(existsSync(path.join(ws, "knowledge", "README.md")));
    const cfg = JSON.parse(readFileSync(path.join(ws, "baan.config.json"), "utf8"));
    assert.equal(cfg.knowledge_roots[0].name, "knowledge-sb");
    assert.equal(cfg.knowledge_roots[0].layout, "project");
    assert.equal(cfg.knowledge_roots[0].path, path.join(ws, "knowledge").split(path.sep).join("/"));
    assert.equal("memory_root" in cfg.knowledge_roots[0], false, "ไม่ส่ง memory = ไม่ตั้ง");
    const again = performInit(ws, TEAM_DIR, () => {}, { knowledgeGit: src });
    assert.deepEqual([again.cloned, again.config], [[], "kept"]);
  } finally { rmSync(base, { recursive: true, force: true }); }
});
