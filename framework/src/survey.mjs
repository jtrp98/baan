import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { gitIn } from "./knowledge-commit.mjs";
import { scanProjects } from "./knowledge-index.mjs";
import { scaffoldKnowledgeModule, scaffoldKnowledgeProject } from "./knowledge-scaffold.mjs";

export { scaffoldKnowledgeModule, scaffoldKnowledgeProject };
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

export function surveyProject(o, ws, root, log = () => {}) {
  let targetPath = null;
  let targetName = o.target || null;
  let kr = null;
  let project = null;

  // 1. ระบุ Target และ Knowledge Root
  if (o.target) {
    const hit = resolveTarget(ws, o.target);
    // A typo used to fall through to the cwd and report drift for the wrong codebase as if it were the target.
    if (!hit) {
      const known = (ws?.knowledge_roots ?? []).flatMap((kr) => (kr.targets ?? []).map((t) => t.name));
      throw new Error(`ไม่พบ target "${o.target}" ใน baan.config.json — ที่มี: ${known.join(", ") || "(ไม่มี)"}`);
    }
    targetPath = hit.target.path;
    targetName = hit.target.name;
    kr = hit.knowledgeRoot;
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
    if (o.json) return res;
    return res.ok ? `✅ สร้างโมดูล ${o["scaffold-module"]} ใน ${res.dir} เรียบร้อยแล้ว (อัปเดตตาราง INDEX.md แล้ว)`
      : `⚠ มีโมดูล ${o["scaffold-module"]} อยู่แล้วที่ ${res.dir} — ไม่ได้สร้างทับ`;
  }

  if (o["scaffold-project"]) {
    if (!kr) throw new Error("ไม่พบ knowledge root สำหรับสร้างโปรเจค");
    const res = scaffoldKnowledgeProject(kr, o["scaffold-project"], targetName);
    if (o.json) return res;
    return res.ok ? `✅ สร้างโปรเจค ${o["scaffold-project"]} ใน ${res.dir} เรียบร้อยแล้ว`
      : `⚠ มีโปรเจค ${o["scaffold-project"]} อยู่แล้วที่ ${res.dir} — ไม่ได้สร้างทับ`;
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

  const resolvedTarget = path.resolve(targetPath || process.cwd());
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
  // Windows paths are case-insensitive: "Backend/Src/Auth" is the same folder as "backend/src/auth".
  const fold = (p) => (process.platform === "win32" ? p.toLowerCase() : p);

  const results = [];
  for (const rawPath of list) {
    const rel = toRel(rawPath);

    // A file outside the target is not part of this codebase at all; calling it _cross sent bug fixes to the wrong repo.
    if (rel.startsWith("../") || rel === ".." || path.isAbsolute(rel)) {
      results.push({ path: rel, classification: "outside-target", module: null, matchedComponent: null,
        reason: `อยู่นอก target ${resolvedTarget} — ตรวจว่าเลือก target ถูกตัว`, isInsideModule: false });
      continue;
    }

    // ตรวจสอบว่าไฟล์อยู่ใต้ Code Component ใดที่สแกนพบ
    let matchedComp = null;
    for (const comp of surveyData.components) {
      const cPath = (comp.path.endsWith("/") ? comp.path.slice(0, -1) : comp.path).split(path.sep).join("/");
      if (fold(rel) === fold(cPath) || fold(rel).startsWith(`${fold(cPath)}/`)) {
        matchedComp = comp;
        break;
      }
    }

    let matchedModule = null;
    if (matchedComp) {
      const m = drift.mapped.find((x) => x.codeComponent.path === matchedComp.path || x.codeComponent.name === matchedComp.name);
      if (m) matchedModule = m.module;
    }

    // Name matching on path segments only when no code component owns the file: otherwise
    // backend/src/payments/auth/token.cs (component "payments") was filed under module "auth".
    if (!matchedModule && !matchedComp) {
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
  const outside = results.filter((r) => r.classification === "outside-target");

  if (outside.length) {
    overallClassification = "outside-target";
    recommendedModule = null;
    overallReason = `มีไฟล์อยู่นอก target ${outside.length} รายการ (${outside.map((r) => r.path).join(", ")}) — เลือก target ให้ถูกก่อนประเมินสังกัดโมดูล`;
  } else if (distinctModules.length === 1 && !hasUnmapped && !hasCross) {
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
  const icon = evalResult.classification === "in-module" ? "📦" : evalResult.classification === "unmapped-code" ? "⚠️" : evalResult.classification === "outside-target" ? "⛔" : "🌐";
  const typeText = evalResult.classification === "in-module" ? "อยู่ในโมดูล (In-Module)"
    : evalResult.classification === "unmapped-code" ? "โค้ดยังไม่มีโมดูล (Unmapped Code)"
    : evalResult.classification === "outside-target" ? "อยู่นอก target (Outside Target)"
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
    const fIcon = f.classification === "in-module" ? "📦" : f.classification === "unmapped-code" ? "⚠️" : f.classification === "outside-target" ? "⛔" : "🌐";
    lines.push(`- ${fIcon} \`${f.path}\` → **${f.module ?? "-"}** (${f.reason})`);
  }

  if (evalResult.classification === "unmapped-code") {
    lines.push("", `> 💡 แนะนำ: หากต้องการตั้งต้นโมดูลใหม่ สามารถสั่ง \`baan survey --scaffold-module ${evalResult.recommendedModule}\` ได้`);
  } else if (evalResult.classification === "cross-cutting") {
    lines.push("", `> 💡 แนะนำ: ในใบงานหรือแผนงาน สามารถใส่ \`"module": "_cross"\` หรือ \`"cross_cutting": true\` ได้โดยตรง`);
  }

  return lines.join("\n");
}
