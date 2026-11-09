import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { gitIn } from "./knowledge-commit.mjs";
import { scanProjects, updateIndexes, readFrontMatter } from "./knowledge-index.mjs";
import { layoutOf, resolveTarget } from "./config.mjs";

const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };
const readJson = (p) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } };

export function scanTargetCodebase(targetDir) {
  const resolved = path.resolve(targetDir);
  if (!isDir(resolved)) throw new Error(`target directory ไม่ถูกต้อง: ${resolved}`);

  const stacks = [];
  const components = [];
  const metadata = { path: resolved, git: null, stacks: [], components: [] };

  // 1. ตรวจสอบ Git commit ล่าสุด
  const gitCheck = gitIn(resolved, ["rev-parse", "--is-inside-work-tree"]);
  if (gitCheck.ok) {
    const log = gitIn(resolved, ["log", "-n", "5", "--oneline"]);
    const branch = gitIn(resolved, ["rev-parse", "--abbrev-ref", "HEAD"]);
    metadata.git = {
      branch: branch.ok ? branch.out.trim() : "unknown",
      recentCommits: log.ok ? log.out.trim().split("\n").filter(Boolean) : [],
    };
  }

  // 2. ตรวจสอบ Tech Stacks จากไฟล์คอนฟิกต่างๆ ใน root และความลึก 1 ระดับ
  const rootEntries = readdirSync(resolved);

  // 2.1 Node / JS / TS ecosystem
  const pkgFiles = [];
  if (isFile(path.join(resolved, "package.json"))) pkgFiles.push(path.join(resolved, "package.json"));
  for (const sub of ["frontend", "app", "web", "client", "ui", "server", "backend"]) {
    const subPkg = path.join(resolved, sub, "package.json");
    if (isFile(subPkg)) pkgFiles.push(subPkg);
  }

  for (const pkgFile of pkgFiles) {
    const pkg = readJson(pkgFile);
    if (!pkg) continue;
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    const rel = path.relative(resolved, pkgFile).split(path.sep).join("/");
    const detected = [];
    if (allDeps.next) detected.push("Next.js");
    if (allDeps.react && !allDeps.next) detected.push("React");
    if (allDeps.vue || allDeps.nuxt) detected.push("Vue/Nuxt");
    if (allDeps["@nestjs/core"]) detected.push("NestJS");
    if (allDeps.express) detected.push("Express");
    if (allDeps.fastify) detected.push("Fastify");
    if (allDeps.tailwindcss) detected.push("Tailwind CSS");
    if (allDeps.typescript || isFile(path.join(path.dirname(pkgFile), "tsconfig.json"))) detected.push("TypeScript");
    if (allDeps.vitest) detected.push("Vitest");
    if (allDeps["@playwright/test"]) detected.push("Playwright");
    if (allDeps.jest) detected.push("Jest");

    stacks.push({
      category: "Node / JavaScript",
      name: pkg.name || path.basename(path.dirname(pkgFile)),
      location: rel,
      frameworks: detected.length ? detected : ["Node.js"],
    });
  }

  // 2.2 .NET / C# ecosystem
  const dotNetFiles = rootEntries.filter((f) => f.endsWith(".sln") || f.endsWith(".slnx"));
  const backendDir = path.join(resolved, "backend");
  if (isDir(backendDir)) {
    for (const f of readdirSync(backendDir)) {
      if (f.endsWith(".sln") || f.endsWith(".slnx")) dotNetFiles.push(path.join("backend", f));
    }
  }

  if (dotNetFiles.length) {
    const csprojs = [];
    const searchDirs = [resolved, backendDir].filter(isDir);
    for (const d of searchDirs) {
      const srcSub = path.join(d, "src");
      if (isDir(srcSub)) {
        for (const proj of readdirSync(srcSub)) {
          const projDir = path.join(srcSub, proj);
          if (isDir(projDir)) {
            const cs = readdirSync(projDir).find((x) => x.endsWith(".csproj"));
            if (cs) csprojs.push(path.join(path.relative(resolved, projDir), cs).split(path.sep).join("/"));
          }
        }
      }
    }
    stacks.push({
      category: ".NET / C#",
      name: dotNetFiles[0],
      location: dotNetFiles[0],
      frameworks: [".NET Solution", ...(csprojs.length ? [`Projects: ${csprojs.length}`] : [])],
      projects: csprojs,
    });
  }

  // 2.3 Go ecosystem
  if (rootEntries.includes("go.work") || rootEntries.includes("go.mod") || isDir(path.join(resolved, "engines"))) {
    stacks.push({
      category: "Go / Native Engine",
      name: rootEntries.includes("go.work") ? "Go Workspace" : "Go Module",
      location: rootEntries.includes("go.work") ? "go.work" : "go.mod",
      frameworks: ["Go"],
    });
  }

  // 2.4 Python ecosystem
  if (rootEntries.includes("pyproject.toml") || rootEntries.includes("requirements.txt") || rootEntries.includes("Pipfile")) {
    stacks.push({
      category: "Python",
      name: rootEntries.includes("pyproject.toml") ? "pyproject.toml" : "requirements.txt",
      location: rootEntries.includes("pyproject.toml") ? "pyproject.toml" : "requirements.txt",
      frameworks: ["Python"],
    });
  }

  // 2.5 Containers
  if (rootEntries.includes("Dockerfile") || rootEntries.includes("docker-compose.yml") || isFile(path.join(resolved, "deploy", "Dockerfile"))) {
    stacks.push({
      category: "DevOps / Container",
      name: "Docker",
      location: rootEntries.includes("Dockerfile") ? "Dockerfile" : "deploy",
      frameworks: ["Docker"],
    });
  }

  // 3. สำรวจ Architecture Components / Features ในโค้ด
  // 3.1 frontend/features หรือ features หรือ src/features
  const featureDirs = [
    path.join(resolved, "frontend", "features"),
    path.join(resolved, "features"),
    path.join(resolved, "src", "features"),
  ].filter(isDir);

  for (const fDir of featureDirs) {
    const rel = path.relative(resolved, fDir).split(path.sep).join("/");
    for (const item of readdirSync(fDir)) {
      if (item.startsWith(".") || !isDir(path.join(fDir, item))) continue;
      components.push({
        name: item,
        type: "frontend-feature",
        path: `${rel}/${item}`,
        description: `Frontend Feature (${item})`,
      });
    }
  }

  // 3.2 backend services หรือ backend/src
  const backendSrc = path.join(resolved, "backend", "src");
  if (isDir(backendSrc)) {
    for (const item of readdirSync(backendSrc)) {
      if (item.startsWith(".") || !isDir(path.join(backendSrc, item))) continue;
      components.push({
        name: item,
        type: "backend-service",
        path: `backend/src/${item}`,
        description: `Backend Component (${item})`,
      });
    }
  }

  // 3.3 engines
  const enginesDir = path.join(resolved, "engines");
  if (isDir(enginesDir)) {
    for (const item of readdirSync(enginesDir)) {
      if (item.startsWith(".") || !isDir(path.join(enginesDir, item))) continue;
      components.push({
        name: item,
        type: "engine",
        path: `engines/${item}`,
        description: `Native Engine (${item})`,
      });
    }
  }

  // 3.4 apps / packages (monorepos)
  for (const mono of ["apps", "packages", "modules"]) {
    const monoDir = path.join(resolved, mono);
    if (isDir(monoDir)) {
      for (const item of readdirSync(monoDir)) {
        if (item.startsWith(".") || !isDir(path.join(monoDir, item))) continue;
        components.push({
          name: item,
          type: mono === "apps" ? "app" : "package",
          path: `${mono}/${item}`,
          description: `Monorepo ${mono} (${item})`,
        });
      }
    }
  }

  metadata.stacks = stacks;
  metadata.components = components;
  return metadata;
}

export function detectKnowledgeDrift(surveyData, project) {
  if (!project || !project.modules) {
    return {
      status: "no_knowledge",
      driftLevel: "no_knowledge",
      summary: "ยังไม่มี knowledge project หรือ modules สำหรับ target นี้",
      mapped: [],
      unmappedCode: surveyData.components,
      unmappedModules: [],
    };
  }

  const knownModules = project.modules || [];
  const knownModuleNames = new Set(knownModules.map((m) => m.module.toLowerCase()));

  const mapped = [];
  const unmappedCode = [];

  for (const comp of surveyData.components) {
    const cName = comp.name.toLowerCase();
    // ตรวจสอบชื่อตรงกันเป๊ะ หรือเป็นส่วนประกอบย่อย
    const matched = knownModules.find((m) => {
      const mName = m.module.toLowerCase();
      return mName === cName || mName.endsWith(`-${cName}`) || cName.endsWith(`-${mName}`);
    });

    if (matched) {
      mapped.push({
        codeComponent: comp,
        module: matched.module,
        status: matched.status || "draft",
        summary: matched.summary || "",
      });
    } else {
      unmappedCode.push(comp);
    }
  }

  // ตรวจสอบโมดูลใน knowledge ที่ไม่พบใน components ของโค้ดจริง
  const mappedModuleNames = new Set(mapped.map((m) => m.module.toLowerCase()));
  const unmappedModules = knownModules.filter((m) => !mappedModuleNames.has(m.module.toLowerCase()));

  let driftLevel = "clean";
  if (unmappedCode.length > 0 || unmappedModules.length > 0) {
    driftLevel = unmappedCode.length > 3 ? "significant_drift" : "minor_drift";
  }

  return {
    status: "analyzed",
    driftLevel,
    summary: driftLevel === "clean"
      ? "Knowledge และโค้ดจริงตรงกันสมบูรณ์"
      : `ตรวจพบความคลาดเคลื่อน (โค้ดที่ยังไม่มีโมดูล: ${unmappedCode.length}, โมดูลที่ไม่มีโค้ด: ${unmappedModules.length})`,
    mapped,
    unmappedCode,
    unmappedModules: unmappedModules.map((m) => ({ module: m.module, summary: m.summary, status: m.status })),
  };
}

export function scaffoldKnowledgeModule(kr, projectName, moduleName, options = {}) {
  if (!kr || !kr.path) throw new Error("ต้องระบุ knowledge root");
  if (!projectName) throw new Error("ต้องระบุ projectName สำหรับ module");
  if (!moduleName || typeof moduleName !== "string" || !/^[a-zA-Z0-9_-]+$/.test(moduleName)) {
    throw new Error(`ชื่อ module "${moduleName}" ไม่ถูกต้อง (ใช้ a-z, 0-9, dash, underscore)`);
  }

  const projectDir = path.join(kr.path, projectName);
  if (!isDir(projectDir)) {
    throw new Error(`ไม่พบโฟลเดอร์ project "${projectName}" ที่ ${projectDir}`);
  }

  const moduleDir = path.join(projectDir, "modules", moduleName);
  if (existsSync(moduleDir) && !options.overwrite) {
    return { ok: false, reason: "already_exists", dir: moduleDir };
  }

  for (const slot of ["shared", "design", "build"]) {
    mkdirSync(path.join(moduleDir, slot), { recursive: true });
  }

  // สร้างโฟลเดอร์ย่อยตามพิมพ์เขียว Folder-First เพื่อป้องกัน Context Bloat
  mkdirSync(path.join(moduleDir, "shared", "requirements"), { recursive: true });
  mkdirSync(path.join(moduleDir, "shared", "oq"), { recursive: true });
  mkdirSync(path.join(moduleDir, "design", "feasibility"), { recursive: true });
  mkdirSync(path.join(moduleDir, "design", "screens"), { recursive: true });
  mkdirSync(path.join(moduleDir, "design", "reviews"), { recursive: true });
  mkdirSync(path.join(moduleDir, "design", "handoff"), { recursive: true });
  mkdirSync(path.join(moduleDir, "build", "contracts"), { recursive: true });
  mkdirSync(path.join(moduleDir, "build", "test-plan"), { recursive: true });

  const today = new Date().toISOString().slice(0, 10);
  const targetName = options.targetName || projectName;
  const platform = options.platform || "web";
  const os = options.os && options.os.length ? `[${options.os.join(", ")}]` : "[]";

  const indexContent = `---
module: ${moduleName}
updated: ${today}
status: draft
target: ${targetName}
platform: ${platform}
os: ${os}
---
# ${options.title || moduleName} (สารบัญ module)

## ภาพรวม
${options.summary || `โมดูล ${moduleName} สำรวจพบจากโค้ดจริงใน target \`${targetName}\``}

## ไฟล์ (อ่านเฉพาะที่งานต้องใช้)

| ช่อง | สารบัญประจำช่อง | หน้าที่และเนื้อหา |
|---|---|---|
| 📋 **shared/** | [shared/requirements/INDEX.md](shared/requirements/INDEX.md) · [shared/oq/INDEX.md](shared/oq/INDEX.md) | ข้อกำหนด (F#/R#/AC) และคำถามค้าง |
| 🎨 **design/** | [design/INDEX.md](design/INDEX.md) | ผลสำรวจความเป็นไปได้, แบบหน้าจอ, และผลตรวจ UX |
| 🏛️ **build/** | [build/INDEX.md](build/INDEX.md) | สัญญาทางเทคนิค API/DB, State Machine, และกรณีทดสอบ |
`;

  const reqIndexContent = `# ข้อกำหนดโมดูล: ${moduleName}

ดัชนีข้อกำหนดประจำโมดูล แยกไฟล์ตามฟีเจอร์เพื่อไม่ให้ AI อ่านเกินความจำเป็น

| รหัส | ชื่อฟีเจอร์ / ข้อกำหนด | สถานะ | จำนวน AC | ไฟล์ข้อกำหนด |
|---|---|---|---:|---|
| F1 | ${options.title || moduleName} Core | draft | 1 | [F1-core.md](F1-core.md) |
`;

  const reqContent = `# ข้อกำหนดของ module: ${moduleName}

## F1: ${options.title || moduleName} Core
- **R1.1**: โครงสร้างเริ่มต้นจากการสำรวจโค้ดจริง
  - **AC-01**: ตรวจสอบการทำงานของโมดูล ${moduleName} ให้ตรงกับโค้ดจริงใน target \`${targetName}\`
`;

  const feasContent = `# ผลสำรวจความเป็นไปได้ UX/UI: ${moduleName}

> สถานะ: ร่างเริ่มต้นจากการสำรวจโค้ดจริง (\`${today}\`)

## สารบัญงานสำรวจ
- [feasibility/INDEX.md](feasibility/INDEX.md) — ผลสำรวจความพร้อมของ Requirement และ UI States
`;

  const designIndexContent = `# งานออกแบบ UX/UI: ${moduleName}

สารบัญงานออกแบบหน้าจอ ประสบการณ์ผู้ใช้ และการส่งมอบของโมดูลนี้

## สารบัญในช่อง design
- [feasibility/INDEX.md](feasibility/INDEX.md) — ผลสำรวจความเป็นไปได้หน้าจอ (โดย survey)
- [screens/INDEX.md](screens/INDEX.md) — แบบหน้าจอ Wireframe, Canvas, Flow (โดย ui)
- [reviews/INDEX.md](reviews/INDEX.md) — ผลตรวจ Usability & Accessibility (โดย review)
- [handoff/INDEX.md](handoff/INDEX.md) — ข้อตกลงส่งมอบหน้าจอให้ทีมพัฒนา
`;

  const contractContent = `# สัญญาทางเทคนิค: ${moduleName}

> สถานะ: ร่างเริ่มต้นจากการสำรวจโค้ดจริง (\`${today}\`)

## สารบัญสัญญาทางเทคนิค
- [contracts/INDEX.md](contracts/INDEX.md) — สัญญา API, RPC, IPC, และ Data Transfer Objects
`;

  const buildIndexContent = `# สัญญาทางเทคนิคและผลทดสอบ: ${moduleName}

สารบัญงานสถาปัตยกรรมระดับโค้ด สัญญา API/DB และแผนการทดสอบของโมดูลนี้

## สารบัญในช่อง build
- [contracts/INDEX.md](contracts/INDEX.md) — สัญญาทางเทคนิค API, RPC, IPC, State Machine
- [test-plan/INDEX.md](test-plan/INDEX.md) — กรณีทดสอบ (Test Cases) และ Traceability Matrix
`;

  writeFileSync(path.join(moduleDir, "INDEX.md"), indexContent, "utf8");
  writeFileSync(path.join(moduleDir, "shared", "requirements.md"), reqContent, "utf8");
  writeFileSync(path.join(moduleDir, "shared", "requirements", "INDEX.md"), reqIndexContent, "utf8");
  writeFileSync(path.join(moduleDir, "shared", "requirements", "F1-core.md"), reqContent, "utf8");
  writeFileSync(path.join(moduleDir, "shared", "oq", "INDEX.md"), `# Open Questions: ${moduleName}\n\n| รหัส | คำถาม | ที่มา | ผู้ตัดสิน | สถานะ |\n|---|---|---|---|---|\n`, "utf8");
  writeFileSync(path.join(moduleDir, "design", "INDEX.md"), designIndexContent, "utf8");
  writeFileSync(path.join(moduleDir, "design", "feasibility.md"), feasContent, "utf8");
  writeFileSync(path.join(moduleDir, "design", "feasibility", "INDEX.md"), `# ผลสำรวจความเป็นไปได้ UX/UI: ${moduleName}\n`, "utf8");
  writeFileSync(path.join(moduleDir, "design", "screens", "INDEX.md"), `# แบบหน้าจอ: ${moduleName}\n`, "utf8");
  writeFileSync(path.join(moduleDir, "design", "reviews", "INDEX.md"), `# ผลตรวจรับงานออกแบบ: ${moduleName}\n`, "utf8");
  writeFileSync(path.join(moduleDir, "design", "handoff", "INDEX.md"), `# สัญญาส่งมอบ UX/UI: ${moduleName}\n`, "utf8");
  writeFileSync(path.join(moduleDir, "build", "INDEX.md"), buildIndexContent, "utf8");
  writeFileSync(path.join(moduleDir, "build", "contract.md"), contractContent, "utf8");
  writeFileSync(path.join(moduleDir, "build", "contracts", "INDEX.md"), `# สัญญาทางเทคนิค: ${moduleName}\n\n- [contract.md](../contract.md)\n`, "utf8");
  writeFileSync(path.join(moduleDir, "build", "test-plan", "INDEX.md"), `# แผนการทดสอบ: ${moduleName}\n\n| รหัส | ข้อกำหนด | ประเภท | สถานะ |\n|---|---|---|---|\n| TP001 | F1 / AC-01 | Automated Unit Test | draft |\n`, "utf8");

  // อัปเดตตารางโมดูลใน project INDEX.md อัตโนมัติ
  if (layoutOf(kr) === "project") {
    updateIndexes(kr.path);
  }

  return {
    ok: true,
    module: moduleName,
    dir: moduleDir,
    files: [
      path.join(moduleDir, "INDEX.md"),
      path.join(moduleDir, "shared", "requirements.md"),
      path.join(moduleDir, "design", "feasibility.md"),
      path.join(moduleDir, "build", "contract.md"),
    ],
  };
}

export function scaffoldKnowledgeProject(kr, projectName, targetName, options = {}) {
  if (!kr || !kr.path) throw new Error("ต้องระบุ knowledge root");
  if (!projectName || !/^[a-zA-Z0-9_-]+$/.test(projectName)) {
    throw new Error(`ชื่อ project "${projectName}" ไม่ถูกต้อง`);
  }

  const projectDir = path.join(kr.path, projectName);
  if (existsSync(projectDir) && !options.overwrite) {
    return { ok: false, reason: "already_exists", dir: projectDir };
  }

  mkdirSync(path.join(projectDir, "modules"), { recursive: true });
  mkdirSync(path.join(projectDir, "shared", "adr"), { recursive: true });
  mkdirSync(path.join(projectDir, "shared", "oq"), { recursive: true });
  mkdirSync(path.join(projectDir, "design", "system"), { recursive: true });
  mkdirSync(path.join(projectDir, "design", "assets"), { recursive: true });
  mkdirSync(path.join(projectDir, "build", "architecture"), { recursive: true });
  mkdirSync(path.join(projectDir, "build", "db"), { recursive: true });
  mkdirSync(path.join(projectDir, "build", "security"), { recursive: true });
  mkdirSync(path.join(projectDir, "build", "plan"), { recursive: true });

  const target = targetName || projectName;
  const platform = options.platform || "web";
  const os = options.os && options.os.length ? `[${options.os.join(", ")}]` : "[]";

  const indexContent = `---
project: ${projectName}
platform: ${platform}
os: ${os}
target: ${target}
status: draft
---
# ${projectName} — Master Knowledge Portal

## แผนที่นำทางหลัก (Project Navigation Map)

| หมวดหมู่ | รายละเอียด | ลิงก์เข้าสู่เอกสาร |
|---|---|---|
| 📋 **ข้อกำหนดระบบ (Requirements)** | ภาพรวมข้อกำหนด ทะเบียนฟีเจอร์ และเกณฑ์ตรวจรับรวม | [shared/requirements.md](shared/requirements.md) |
| 🎨 **ออกแบบหน้าจอ (Design for UX/UI)** | Design System กลาง, Tokens, Assets, และแนวทาง Brand | [design/INDEX.md](design/INDEX.md) |
| 🏛️ **สถาปัตยกรรมโค้ด (Design for Code)** | ผังเชื่อมระบบรวม, Shared Database, Security, และแผนส่งมอบ | [build/INDEX.md](build/INDEX.md) |
| ⚖️ **มติสถาปัตยกรรม (ADR / Decisions)** | บันทึกการตัดสินใจทางสถาปัตยกรรมตาม Learning Protocol | [shared/adr/INDEX.md](shared/adr/INDEX.md) |
| ❓ **คำถามค้าง (Open Questions)** | ประเด็นที่ยังรอคำตอบหรือการตัดสินใจระดับระบบ | [shared/oq/INDEX.md](shared/oq/INDEX.md) |

## Modules
`;

  writeFileSync(path.join(projectDir, "INDEX.md"), indexContent, "utf8");
  writeFileSync(path.join(projectDir, "shared", "INDEX.md"), `# shared: ${projectName}\n\n- [context.md](context.md)\n- [requirements.md](requirements.md)\n- [knowledge-gaps.md](knowledge-gaps.md)\n`, "utf8");
  writeFileSync(path.join(projectDir, "shared", "context.md"), `# บริบทของระบบ: ${projectName}\n\n## 1. ภาพรวมระบบ\n\n## 2. พจนานุกรมคำศัพท์ (Glossary)\n`, "utf8");
  writeFileSync(path.join(projectDir, "shared", "requirements.md"), `# สารบัญข้อกำหนดทั้งระบบ: ${projectName}\n\n| โมดูล | ฟีเจอร์หลัก | สถานะ | เอกสารข้อกำหนดประจำโมดูล |\n|---|---|---|---|\n`, "utf8");
  writeFileSync(path.join(projectDir, "shared", "knowledge-gaps.md"), `# บันทึกช่องว่างความรู้: ${projectName}\n`, "utf8");
  writeFileSync(path.join(projectDir, "shared", "adr", "INDEX.md"), `# มติการตัดสินใจสถาปัตยกรรม: ${projectName}\n`, "utf8");
  writeFileSync(path.join(projectDir, "shared", "oq", "INDEX.md"), `# คำถามค้างระดับระบบ: ${projectName}\n`, "utf8");
  writeFileSync(path.join(projectDir, "design", "INDEX.md"), `# Design System กลาง: ${projectName}\n\n> สำหรับสเปกหน้าจอรายโมดูล ดูที่ modules/<module>/design/ และสำหรับสถาปัตยกรรมโค้ด ดูที่ ../build/INDEX.md\n`, "utf8");
  writeFileSync(path.join(projectDir, "design", "system", "README.md"), `# Design System Tokens: ${projectName}\n`, "utf8");
  writeFileSync(path.join(projectDir, "design", "assets", "README.md"), `# Brand Assets: ${projectName}\n`, "utf8");
  writeFileSync(path.join(projectDir, "build", "INDEX.md"), `# build: ${projectName}\n\n> สำหรับงานออกแบบหน้าจอ UX/UI ดูที่ ../design/INDEX.md\n`, "utf8");
  writeFileSync(path.join(projectDir, "build", "architecture", "INDEX.md"), `# สถาปัตยกรรมระบบรวม: ${projectName}\n`, "utf8");
  writeFileSync(path.join(projectDir, "build", "db", "INDEX.md"), `# ฐานข้อมูลกลาง: ${projectName}\n`, "utf8");
  writeFileSync(path.join(projectDir, "build", "security", "INDEX.md"), `# ความปลอดภัยระบบ: ${projectName}\n`, "utf8");
  writeFileSync(path.join(projectDir, "build", "plan", "INDEX.md"), `# แผนงานวิศวกรรมรวม: ${projectName}\n`, "utf8");

  if (layoutOf(kr) === "project") {
    updateIndexes(kr.path);
  }

  return {
    ok: true,
    project: projectName,
    dir: projectDir,
  };
}

export function surveyProject(o, ws, root, log = () => {}) {
  let targetPath = null;
  let targetName = o.target || null;
  let kr = null;
  let project = null;

  // 1. ระบุ Target และ Knowledge Root
  if (o.target) {
    const hit = resolveTarget(ws, o.target);
    if (hit) {
      targetPath = hit.target.path;
      targetName = hit.target.name;
      kr = hit.knowledgeRoot;
    }
  }

  if (!targetPath && o.cwd) {
    targetPath = path.resolve(o.cwd);
  } else if (!targetPath) {
    targetPath = process.cwd();
  }

  // หากยังไม่พบ kr ให้ค้นหาจาก knowledge_roots ทั้งหมด
  if (!kr && ws && ws.knowledge_roots && ws.knowledge_roots.length) {
    kr = ws.knowledge_roots.find((r) => layoutOf(r) === "project") || ws.knowledge_roots[0];
  }

  // หาก targetName ยังไม่มี ให้ใช้ชื่อโฟลเดอร์
  if (!targetName) {
    targetName = path.basename(targetPath);
  }

  // ค้นหา Knowledge Project ที่ตรงกับ target
  let projectName = o.project || null;
  if (kr && layoutOf(kr) === "project") {
    const projects = scanProjects(kr.path);
    if (projectName) {
      project = projects.find((p) => p.name === projectName) || null;
    } else {
      project = projects.find((p) => p.header?.target === targetName || p.name === targetName) || null;
      if (project) projectName = project.name;
    }
  }

  // 2. ถ้ามีคำสั่ง Scaffold ให้ทำทันที
  if (o["scaffold-module"]) {
    if (!kr) throw new Error("ไม่พบ knowledge root สำหรับสร้างโมดูล");
    const proj = projectName || o.project;
    if (!proj) throw new Error("ไม่สามารถระบุ project สำหรับเพิ่ม module ได้ (ระบุ --project <name>)");
    const res = scaffoldKnowledgeModule(kr, proj, o["scaffold-module"], {
      targetName,
      platform: project?.header?.platform || "web",
      os: project?.header?.os || [],
    });
    return o.json ? res : `✅ สร้างโมดูล ${o["scaffold-module"]} ใน ${res.dir} เรียบร้อยแล้ว (อัปเดตตาราง INDEX.md แล้ว)`;
  }

  if (o["scaffold-project"]) {
    if (!kr) throw new Error("ไม่พบ knowledge root สำหรับสร้างโปรเจค");
    const res = scaffoldKnowledgeProject(kr, o["scaffold-project"], targetName);
    return o.json ? res : `✅ สร้างโปรเจค ${o["scaffold-project"]} ใน ${res.dir} เรียบร้อยแล้ว`;
  }

  // 2.1 ถ้ามีคำสั่ง Evaluate / Eval ให้ประเมินสังกัดโมดูลของไฟล์
  if (o.eval || o.evaluate) {
    const targetFile = o.eval || o.evaluate;
    const res = evaluateModulePlacement(targetFile, {
      targetPath,
      ws,
      project,
      kr,
    });
    return o.json ? res : formatModuleEvaluation(res);
  }

  // 3. สแกน Target Codebase
  const surveyData = scanTargetCodebase(targetPath);

  // 4. วิเคราะห์ Drift กับ Knowledge
  const drift = detectKnowledgeDrift(surveyData, project);

  const result = {
    target: { name: targetName, path: targetPath },
    knowledge: {
      root: kr?.path || null,
      project: projectName,
      status: project ? "found" : "not_found",
    },
    stacks: surveyData.stacks,
    components: surveyData.components,
    git: surveyData.git,
    drift,
  };

  if (o.json) return result;
  return formatSurveyReport(result);
}

export function formatSurveyReport(res) {
  const lines = [
    `# 🔍 รายงานการสำรวจโปรเจค (Project Survey & Drift Report)`,
    `**Target:** \`${res.target.name}\` (${res.target.path})`,
    `**Knowledge:** ${res.knowledge.project ? `\`${res.knowledge.project}\`` : "⚠️ ยังไม่มี project ใน knowledge"} (Root: ${res.knowledge.root || "-"})`,
    `**Drift Status:** ${res.drift.driftLevel.toUpperCase()} — ${res.drift.summary}`,
    "",
    `## 1. Tech Stacks & Frameworks ที่ตรวจพบ`,
  ];

  if (res.stacks.length === 0) {
    lines.push(`- ไม่พบการระบุ stack ชัดเจนในไฟล์ root`);
  } else {
    for (const s of res.stacks) {
      lines.push(`- **${s.category}:** \`${s.name}\` (${s.frameworks.join(", ")}) [ที่: \`${s.location}\`]`);
    }
  }

  lines.push("", `## 2. โครงสร้างฟีเจอร์และคอมโพเนนต์ในโค้ดจริง (${res.components.length} ส่วน)`);
  if (res.components.length === 0) {
    lines.push(`- ไม่พบโฟลเดอร์แบ่งฟีเจอร์ย่อย (features/services/engines)`);
  } else {
    for (const c of res.components) {
      lines.push(`- **${c.name}** (\`${c.type}\`): \`${c.path}\``);
    }
  }

  lines.push("", `## 3. การวิเคราะห์ความคลาดเคลื่อน (Drift Analysis)`);

  if (res.drift.mapped.length > 0) {
    lines.push(`### ✅ โมดูลที่ตรงกับโค้ดจริง (${res.drift.mapped.length} โมดูล)`);
    for (const m of res.drift.mapped) {
      lines.push(`- **${m.module}** [${m.status}]: ตรงกับคอมโพเนนต์ \`${m.codeComponent.name}\` (${m.codeComponent.path})`);
    }
    lines.push("");
  }

  if (res.drift.unmappedCode.length > 0) {
    lines.push(`### ⚠️ โค้ดที่ยังไม่มีโมดูลรองรับ (Code Ahead of Knowledge / Drift: ${res.drift.unmappedCode.length} ส่วน)`);
    lines.push(`> โค้ดส่วนนี้มีอยู่จริงใน Target แต่ยังไม่ถูกบันทึกเป็นโมดูลใน Knowledge:`);
    for (const u of res.drift.unmappedCode) {
      lines.push(`- **${u.name}** (\`${u.type}\`): อยู่ที่ \`${u.path}\``);
    }
    lines.push("");
  }

  if (res.drift.unmappedModules.length > 0) {
    lines.push(`### ❓ โมดูลใน Knowledge ที่หาโค้ดไม่พบ (${res.drift.unmappedModules.length} โมดูล)`);
    for (const um of res.drift.unmappedModules) {
      lines.push(`- **${um.module}**: ${um.summary || "ไม่มีรายละเอียด"}`);
    }
    lines.push("");
  }

  lines.push(`## 4. คำแนะนำสำหรับการซิงค์ Knowledge`);
  if (!res.knowledge.project) {
    lines.push(`- โปรเจคนี้ยังไม่มี knowledge แนะนำให้สร้างโปรเจคเริ่มต้น:`);
    lines.push(`  \`baan survey --target ${res.target.name} --scaffold-project ${res.target.name}\``);
  } else if (res.drift.unmappedCode.length > 0) {
    lines.push(`- เพื่อให้ Knowledge ทันกับโค้ดจริง สามารถให้ AI หรือสั่งสร้างโมดูลที่ขาดไป:`);
    for (const u of res.drift.unmappedCode.slice(0, 5)) {
      lines.push(`  - \`baan survey --target ${res.target.name} --scaffold-module ${u.name}\``);
    }
    if (res.drift.unmappedCode.length > 5) {
      lines.push(`  - (และอีก ${res.drift.unmappedCode.length - 5} คอมโพเนนต์)`);
    }
  } else {
    lines.push(`- โค้ดจริงและ Knowledge อยู่ในสถานะตรงกันเรียบร้อย ไม่ต้องดำเนินการเพิ่มเติม`);
  }

  return lines.join("\n");
}

export function evaluateModulePlacement(fileOrPaths, { targetPath, ws, project, kr } = {}) {
  const rawList = Array.isArray(fileOrPaths) ? fileOrPaths : [fileOrPaths];
  const list = rawList.filter((f) => typeof f === "string" && f.trim() !== "");
  if (!list.length) throw new Error("ต้องระบุไฟล์หรือเส้นทางอย่างน้อย 1 รายการ");

  const resolvedTarget = path.resolve(targetPath || (ws ? ws.root : null) || process.cwd());
  const surveyData = scanTargetCodebase(resolvedTarget);

  let proj = project;
  if (!proj && kr && layoutOf(kr) === "project") {
    const projects = scanProjects(kr.path);
    const targetName = path.basename(resolvedTarget);
    proj = projects.find((p) => p.header?.target === targetName || p.name === targetName) || null;
  }
  const drift = detectKnowledgeDrift(surveyData, proj);
  const knownModules = proj?.modules || [];

  const toRel = (p) => {
    const abs = path.isAbsolute(p) ? p : path.resolve(resolvedTarget, p);
    return path.relative(resolvedTarget, abs).split(path.sep).join("/");
  };

  const results = [];
  for (const rawPath of list) {
    const rel = toRel(rawPath);

    // ตรวจสอบว่าไฟล์อยู่ใต้ Code Component ใดที่สแกนพบ
    let matchedComp = null;
    for (const comp of surveyData.components) {
      const cPath = (comp.path.endsWith("/") ? comp.path.slice(0, -1) : comp.path).split(path.sep).join("/");
      if (rel === cPath || rel.startsWith(`${cPath}/`)) {
        matchedComp = comp;
        break;
      }
    }

    let matchedModule = null;
    if (matchedComp) {
      const m = drift.mapped.find((x) => x.codeComponent.path === matchedComp.path || x.codeComponent.name === matchedComp.name);
      if (m) matchedModule = m.module;
    }

    // หากไม่พบจาก component ให้ตรวจจับจาก path segments เทียบกับชื่อโมดูลใน Knowledge
    if (!matchedModule) {
      const parts = rel.toLowerCase().split("/");
      const found = knownModules.find((m) => parts.includes(m.module.toLowerCase()));
      if (found) matchedModule = found.module;
    }

    if (matchedModule) {
      results.push({
        path: rel,
        classification: "in-module",
        module: matchedModule,
        matchedComponent: matchedComp?.path || null,
        reason: `สังกัดโมดูล '${matchedModule}' ใน Knowledge (ตรงกับโครงสร้างโมดูล)`,
        isInsideModule: true,
      });
    } else if (matchedComp) {
      results.push({
        path: rel,
        classification: "unmapped-code",
        module: matchedComp.name,
        matchedComponent: matchedComp.path,
        reason: `อยู่ในโค้ดคอมโพเนนต์ '${matchedComp.name}' ที่ยังไม่ได้สร้างเป็นโมดูลใน Knowledge (Code Ahead of Knowledge)`,
        isInsideModule: false,
        scaffoldAvailable: true,
      });
    } else {
      results.push({
        path: rel,
        classification: "cross-cutting",
        module: "_cross",
        matchedComponent: null,
        reason: "อยู่ในส่วนโครงสร้างพื้นฐาน/ส่วนกลาง (Shared Infrastructure / Cross-Cutting) ไม่อยู่ในโมดูลใดเฉพาะเจาะจง",
        isInsideModule: false,
      });
    }
  }

  const distinctModules = [...new Set(results.filter((r) => r.classification === "in-module").map((r) => r.module))];
  const hasUnmapped = results.some((r) => r.classification === "unmapped-code");
  const hasCross = results.some((r) => r.classification === "cross-cutting");

  let overallClassification = "cross-cutting";
  let recommendedModule = "_cross";
  let overallReason = "";

  if (distinctModules.length === 1 && !hasUnmapped && !hasCross) {
    overallClassification = "in-module";
    recommendedModule = distinctModules[0];
    overallReason = `ไฟล์ทั้งหมดอยู่ในขอบเขตของโมดูล '${recommendedModule}'`;
  } else if (distinctModules.length === 1 && hasCross) {
    overallClassification = "in-module";
    recommendedModule = distinctModules[0];
    overallReason = `ไฟล์หลักสังกัดโมดูล '${recommendedModule}' โดยมีไฟล์ส่วนกลางร่วมด้วย (แนะนำผูกกับโมดูล ${recommendedModule})`;
  } else if (distinctModules.length > 1) {
    overallClassification = "cross-cutting";
    recommendedModule = "_cross";
    overallReason = `ขอบเขตไฟล์ครอบคลุมหลายโมดูล (${distinctModules.join(", ")}) จัดเป็นงานระดับข้ามระบบ (Cross-Module)`;
  } else if (hasUnmapped) {
    const unmappedNames = [...new Set(results.filter((r) => r.classification === "unmapped-code").map((r) => r.module))];
    overallClassification = "unmapped-code";
    recommendedModule = unmappedNames[0];
    overallReason = `ไฟล์อยู่ในโค้ดส่วนที่ยังไม่มีโมดูลรองรับ (${unmappedNames.join(", ")}) สามารถพิจารณาสร้างโมดูลใหม่ หรือทำเป็นงาน _cross ชั่วคราว`;
  } else {
    overallClassification = "cross-cutting";
    recommendedModule = "_cross";
    overallReason = "ไฟล์ทั้งหมดอยู่ในส่วนกลางหรือโครงสร้างพื้นฐานนอกโมดูล (Cross-Cutting)";
  }

  return {
    target: { path: resolvedTarget, name: path.basename(resolvedTarget) },
    classification: overallClassification,
    recommendedModule,
    reason: overallReason,
    isInsideModule: overallClassification === "in-module",
    files: results,
  };
}

export function formatModuleEvaluation(evalResult) {
  const icon = evalResult.classification === "in-module" ? "📦" : evalResult.classification === "unmapped-code" ? "⚠️" : "🌐";
  const typeText = evalResult.classification === "in-module" ? "อยู่ในโมดูล (In-Module)"
    : evalResult.classification === "unmapped-code" ? "โค้ดยังไม่มีโมดูล (Unmapped Code)"
    : "งานนอกโมดูล / ส่วนกลาง (Cross-Cutting)";

  const lines = [
    `# 🎯 ผลการประเมินสังกัดโมดูล (Module Placement Evaluation)`,
    `**Target:** \`${evalResult.target.name}\` (${evalResult.target.path})`,
    `**การจำแนก:** ${icon} **${typeText}**`,
    `**โมดูลที่แนะนำ:** \`${evalResult.recommendedModule}\``,
    `**เหตุผล:** ${evalResult.reason}`,
    "",
    `## รายการไฟล์ที่ตรวจสอบ (${evalResult.files.length} รายการ)`,
  ];

  for (const f of evalResult.files) {
    const fIcon = f.classification === "in-module" ? "📦" : f.classification === "unmapped-code" ? "⚠️" : "🌐";
    lines.push(`- ${fIcon} \`${f.path}\` → **${f.module}** (${f.reason})`);
  }

  if (evalResult.classification === "unmapped-code") {
    lines.push("", `> 💡 แนะนำ: หากต้องการตั้งต้นโมดูลใหม่ สามารถสั่ง \`baan survey --scaffold-module ${evalResult.recommendedModule}\` ได้`);
  } else if (evalResult.classification === "cross-cutting") {
    lines.push("", `> 💡 แนะนำ: ในใบงานหรือแผนงาน สามารถใส่ \`"module": "_cross"\` หรือ \`"cross_cutting": true\` ได้โดยตรง`);
  }

  return lines.join("\n");
}
