import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { updateIndexes } from "./knowledge-index.mjs";
import { layoutOf } from "./config.mjs";

// Writes the 3-slot knowledge skeleton (shared / design / build) for a project or a module.
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
// Front matter may hold "os: ios" (scalar) or "os: [ios, android]"; .join on a scalar crashed --scaffold-module.
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const osLine = (v) => `[${asList(v).join(", ")}]`;

export function scaffoldKnowledgeModule(kr, projectName, moduleName, options = {}) {
  if (!kr || !kr.path) throw new Error("ต้องระบุ knowledge root");
  if (!projectName) throw new Error("ต้องระบุ projectName สำหรับ module");
  if (!moduleName || typeof moduleName !== "string" || !/^[a-zA-Z0-9_-]+$/.test(moduleName)) {
    throw new Error(`ชื่อ module "${moduleName}" ไม่ถูกต้อง (ใช้ a-z, 0-9, dash, underscore)`);
  }

  // --project comes from the command line; "..\x" would scaffold outside the knowledge root.
  if (typeof projectName !== "string" || /[\\/]|^\.\.?$/.test(projectName)) throw new Error(`ชื่อ project "${projectName}" ไม่ถูกต้อง`);
  const projectDir = path.join(kr.path, projectName);
  if (!isDir(projectDir)) {
    throw new Error(`ไม่พบโฟลเดอร์ project "${projectName}" ที่ ${projectDir}`);
  }

  const moduleDir = path.join(projectDir, "modules", moduleName);
  if (existsSync(moduleDir)) {
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
  mkdirSync(path.join(moduleDir, "build", "db"), { recursive: true });
  mkdirSync(path.join(moduleDir, "build", "waves"), { recursive: true });
  mkdirSync(path.join(moduleDir, "build", "test-plan"), { recursive: true });

  const today = new Date().toISOString().slice(0, 10);
  const targetName = options.targetName || projectName;
  const platform = options.platform || "web";
  const os = osLine(options.os);

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

สารบัญงานสถาปัตยกรรมระดับโค้ด สัญญา API/DB แผน Wave และแผนการทดสอบของโมดูลนี้

## สารบัญในช่อง build
- [contracts/INDEX.md](contracts/INDEX.md) — สัญญาทางเทคนิค API, RPC, IPC, State Machine
- [db/INDEX.md](db/INDEX.md) — DBML, SQL และ Migration Scripts (โดย dba)
- [waves/INDEX.md](waves/INDEX.md) — แผนงานพัฒนาแบบ Wave (โดย pm, ห้ามแก้ไข wave ที่ done แล้ว)
- [test-plan/INDEX.md](test-plan/INDEX.md) — กรณีทดสอบ (Test Cases) และ Traceability Matrix (โดย testplan)
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
  writeFileSync(path.join(moduleDir, "build", "db", "INDEX.md"), `# สารบัญฐานข้อมูล: ${moduleName}\n\n| ไฟล์ | ประเภท | คำอธิบาย | สถานะ |\n|---|---|---|---|\n`, "utf8");
  writeFileSync(path.join(moduleDir, "build", "waves", "INDEX.md"), `# สารบัญ Waves: ${moduleName}\n\n> ห้ามแก้ไข wave ที่สถานะ \`done\` หรือ \`superseded\`\n\n| รหัส | รายการ | สถานะ | รอบ | หมายเหตุ |\n|---|---|---|---:|---|\n| - | ยังไม่มี wave | - | - | - |\n`, "utf8");
  writeFileSync(path.join(moduleDir, "build", "test-plan", "INDEX.md"), `# สารบัญแผนทดสอบ (Test Plan): ${moduleName}\n\n> ห้ามแก้ไข Test Plan ที่สถานะ \`done\` หรือ \`superseded\`\n\n| รหัส | รายการ | สถานะ | รอบ | หมายเหตุ |\n|---|---|---|---:|---|\n| - | ยังไม่มี Test Plan | - | - | - |\n`, "utf8");

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
  if (existsSync(projectDir)) {
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
  const os = osLine(options.os);

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

<!-- baan:modules:start -->
<!-- baan:modules:end -->
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
