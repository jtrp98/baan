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

| ไฟล์ | อ่านเมื่อ |
|---|---|
| [shared/requirements.md](shared/requirements.md) | ข้อกำหนดและเกณฑ์ตรวจรับ (F#/R#/AC) |
| [design/feasibility.md](design/feasibility.md) | ผลสำรวจความเป็นไปได้ UX/UI |
| [build/contract.md](build/contract.md) | สัญญาทางเทคนิค API/DB |
`;

  const reqContent = `# ข้อกำหนดของ module: ${moduleName}

## F1: ${options.title || moduleName} Core
- **R1.1**: โครงสร้างเริ่มต้นจากการสำรวจโค้ดจริง
  - **AC-01**: ตรวจสอบการทำงานของโมดูล ${moduleName} ให้ตรงกับโค้ดจริงใน target \`${targetName}\`
`;

  const feasContent = `# ผลสำรวจความเป็นไปได้ UX/UI: ${moduleName}

> สถานะ: ร่างเริ่มต้นจากการสำรวจโค้ดจริง (\`${today}\`)
`;

  const contractContent = `# สัญญาทางเทคนิค: ${moduleName}

> สถานะ: ร่างเริ่มต้นจากการสำรวจโค้ดจริง (\`${today}\`)
`;

  writeFileSync(path.join(moduleDir, "INDEX.md"), indexContent, "utf8");
  writeFileSync(path.join(moduleDir, "shared", "requirements.md"), reqContent, "utf8");
  writeFileSync(path.join(moduleDir, "design", "feasibility.md"), feasContent, "utf8");
  writeFileSync(path.join(moduleDir, "build", "contract.md"), contractContent, "utf8");

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
  mkdirSync(path.join(projectDir, "shared"), { recursive: true });
  mkdirSync(path.join(projectDir, "design"), { recursive: true });
  mkdirSync(path.join(projectDir, "build"), { recursive: true });

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
# ${projectName}

## ภาพรวม
โครงการ ${projectName} สร้างเริ่มต้นจากการสำรวจโค้ดจริงใน target \`${target}\`

## Modules
`;

  writeFileSync(path.join(projectDir, "INDEX.md"), indexContent, "utf8");

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
