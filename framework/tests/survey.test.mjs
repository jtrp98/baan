import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { scanTargetCodebase, detectKnowledgeDrift, scaffoldKnowledgeModule, scaffoldKnowledgeProject, surveyProject } from "../src/survey.mjs";
import { parse } from "../src/cli.mjs";
import { utility } from "../src/utilities.mjs";

test("survey: scanTargetCodebase ตรวจจับ stack และ components ได้ถูกต้อง", (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), "survey-target-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  // สร้างไฟล์จำลองโปรเจค Full-stack (Next.js + .NET)
  mkdirSync(path.join(dir, "frontend", "features", "auth"), { recursive: true });
  mkdirSync(path.join(dir, "frontend", "features", "admin"), { recursive: true });
  mkdirSync(path.join(dir, "backend", "src", "OrderService.API"), { recursive: true });
  mkdirSync(path.join(dir, "engines", "simulator"), { recursive: true });

  writeFileSync(path.join(dir, "frontend", "package.json"), JSON.stringify({
    name: "my-frontend",
    dependencies: { next: "14.0.0", react: "18.0.0", tailwindcss: "3.0.0" },
    devDependencies: { typescript: "5.0.0", vitest: "1.0.0" },
  }), "utf8");

  writeFileSync(path.join(dir, "backend", "src", "OrderService.API", "OrderService.API.csproj"), "<Project />", "utf8");
  writeFileSync(path.join(dir, "MySolution.slnx"), "", "utf8");
  writeFileSync(path.join(dir, "Dockerfile"), "", "utf8");

  const result = scanTargetCodebase(dir);
  assert.equal(result.path, path.resolve(dir));

  // ตรวจสอบ Stacks
  const nodeStack = result.stacks.find((s) => s.category.includes("Node"));
  assert.ok(nodeStack);
  assert.ok(nodeStack.frameworks.includes("Next.js"));
  assert.ok(nodeStack.frameworks.includes("Tailwind CSS"));
  assert.ok(nodeStack.frameworks.includes("Vitest"));

  const dotNetStack = result.stacks.find((s) => s.category.includes(".NET"));
  assert.ok(dotNetStack);

  const dockerStack = result.stacks.find((s) => s.category.includes("Container"));
  assert.ok(dockerStack);

  // ตรวจสอบ Components
  const compNames = result.components.map((c) => c.name);
  assert.ok(compNames.includes("auth"));
  assert.ok(compNames.includes("admin"));
  assert.ok(compNames.includes("OrderService.API"));
  assert.ok(compNames.includes("simulator"));
});

test("survey: detectKnowledgeDrift แยกแยะ mapped, unmappedCode, และ unmappedModules ได้แม่นยำ", () => {
  const surveyData = {
    components: [
      { name: "quiz", type: "frontend-feature", path: "frontend/features/quiz" },
      { name: "admin", type: "frontend-feature", path: "frontend/features/admin" },
      { name: "auth", type: "frontend-feature", path: "frontend/features/auth" },
    ],
  };

  const project = {
    name: "my-app",
    modules: [
      { module: "quiz", status: "released", summary: "ระบบ Quiz" },
      { module: "legacy-export", status: "draft", summary: "โมดูลเก่าที่ลบโค้ดไปแล้ว" },
    ],
  };

  const drift = detectKnowledgeDrift(surveyData, project);
  assert.equal(drift.driftLevel, "minor_drift");

  // quiz ต้องถูก match
  assert.equal(drift.mapped.length, 1);
  assert.equal(drift.mapped[0].module, "quiz");

  // admin และ auth ต้องเป็น unmappedCode (Code ahead of knowledge)
  const unmappedCodeNames = drift.unmappedCode.map((u) => u.name);
  assert.deepEqual(unmappedCodeNames.sort(), ["admin", "auth"]);

  // legacy-export ต้องเป็น unmappedModule
  assert.equal(drift.unmappedModules.length, 1);
  assert.equal(drift.unmappedModules[0].module, "legacy-export");
});

test("survey: scaffoldKnowledgeModule สร้างไฟล์มาตรฐานครบและอัปเดต INDEX.md", (t) => {
  const kDir = mkdtempSync(path.join(tmpdir(), "survey-kr-"));
  t.after(() => rmSync(kDir, { recursive: true, force: true }));

  const projDir = path.join(kDir, "my-proj");
  mkdirSync(path.join(projDir, "modules"), { recursive: true });
  writeFileSync(path.join(projDir, "INDEX.md"), "---\nproject: my-proj\ntarget: my-proj\nstatus: draft\n---\n# my-proj\n", "utf8");

  const kr = { path: kDir, layout: "project" };
  const res = scaffoldKnowledgeModule(kr, "my-proj", "admin-feature", {
    targetName: "my-proj",
    platform: "web",
    title: "ระบบจัดการ Admin",
  });

  assert.equal(res.ok, true);
  assert.equal(res.module, "admin-feature");

  const modDir = path.join(projDir, "modules", "admin-feature");
  assert.ok(readFileSync(path.join(modDir, "INDEX.md"), "utf8").includes("module: admin-feature"));
  assert.ok(readFileSync(path.join(modDir, "shared", "requirements.md"), "utf8").includes("F1: ระบบจัดการ Admin"));
  assert.ok(readFileSync(path.join(modDir, "design", "feasibility.md"), "utf8").includes("ผลสำรวจความเป็นไปได้ UX/UI"));
  assert.ok(readFileSync(path.join(modDir, "build", "contract.md"), "utf8").includes("สัญญาทางเทคนิค"));

  // ตรวจสอบว่าตารางใน project INDEX.md ถูกอัปเดตอัตโนมัติ
  const projectIndex = readFileSync(path.join(projDir, "INDEX.md"), "utf8");
  assert.ok(projectIndex.includes("admin-feature"), "ต้องมีชื่อโมดูลใหม่ในสารบัญของโปรเจค");

  // ทดสอบชื่อโมดูลผิดรูป
  assert.throws(() => scaffoldKnowledgeModule(kr, "my-proj", "../bad-path"), /ไม่ถูกต้อง/);
});

test("survey: scaffoldKnowledgeProject สร้างโครงสร้างโปรเจคเริ่มต้น", (t) => {
  const kDir = mkdtempSync(path.join(tmpdir(), "survey-kr-proj-"));
  t.after(() => rmSync(kDir, { recursive: true, force: true }));

  const kr = { path: kDir, layout: "project" };
  const res = scaffoldKnowledgeProject(kr, "new-system", "target-system");
  assert.equal(res.ok, true);

  const projIndex = readFileSync(path.join(kDir, "new-system", "INDEX.md"), "utf8");
  assert.ok(projIndex.includes("project: new-system"));
  assert.ok(projIndex.includes("target: target-system"));
});

test("survey: CLI parse รองรับคำสั่ง survey และ scan พร้อม options", () => {
  const parsed1 = parse(["survey", "--target", "school-bot", "--json"]);
  assert.equal(parsed1.survey, true);
  assert.equal(parsed1.target, "school-bot");
  assert.equal(parsed1.json, true);

  const parsed2 = parse(["survey", "school-bot"]);
  assert.equal(parsed2.survey, true);
  assert.equal(parsed2.target, "school-bot");

  const parsed3 = parse(["scan", "--cwd", "./some/dir", "--scaffold-module", "auth"]);
  assert.equal(parsed3.survey, true);
  assert.equal(parsed3.cwd, "./some/dir");
  assert.equal(parsed3["scaffold-module"], "auth");
});

test("survey: utility ส่งออก JSON ครบถ้วนตามโครงสร้าง", (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), "survey-util-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  mkdirSync(path.join(dir, "features", "dashboard"), { recursive: true });
  writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "demo", dependencies: { express: "4.0.0" } }), "utf8");

  const ws = { knowledge_roots: [{ name: "demo-kr", path: dir, layout: "project", targets: [{ name: "demo", path: dir }] }] };
  const out = utility({ survey: true, target: "demo", json: true }, ws, {}, dir);

  assert.equal(typeof out, "object");
  assert.equal(out.target.name, "demo");
  assert.ok(out.stacks.some((s) => s.frameworks.includes("Express")));
  assert.ok(out.components.some((c) => c.name === "dashboard"));
});
