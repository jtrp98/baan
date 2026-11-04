// การตั้งค่าและการ resolve: workspace config (discovery จากที่เรียก), agents.json (ตัวรัน+tier), roles/, targets
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { DEFAULT_TIMEOUT_SEC } from "./timeout.mjs";
import { parseModuleSpec, scanProjects } from "./knowledge-index.mjs";

export const TEAM_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // รากของ package
export const ROLES_DIR = path.join(TEAM_DIR, "roles");
export const REPORTS_DIR = path.join(TEAM_DIR, "reports");

// BAAN_AGENTS_FILE: ใช้ชุดตัวรันอื่นชั่วคราวโดยไม่แก้ไฟล์ของ package (เช่น การทดลองที่ต้องปิด sandbox ทุก arm เท่ากัน)
export function loadAgentsConfig(file = process.env.BAAN_AGENTS_FILE || path.join(TEAM_DIR, "agents.json")) {
  return JSON.parse(readFileSync(file, "utf8"));
}

// config ของ workspace เก็บ path ของเครื่องนี้ จึงต้องอยู่ "นอก" package —
// ไม่งั้นการ update version/clone package ใหม่จะทับ config ของ workspace ทุกครั้ง
// หา `baan.config.json` ที่ราก workspace (เช่น C:\src\schoolbright\baan.config.json)
// โดยเดินขึ้นจากจุดที่เรียก — ตัวใกล้สุดชนะ (workspace ซ้อนกันได้)
export function findWorkspaceConfig(startDir) {
  let dir = path.resolve(startDir);
  for (;;) {
    const flat = path.join(dir, "baan.config.json");
    if (existsSync(flat)) return flat;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

// ลำดับ: --config ที่ส่งมา > env BAAN_CONFIG > discovery จากไดเรกทอรีที่เรียก
export function resolveWorkspaceConfig(explicitPath, startDir = process.cwd()) {
  const check = (p, label) => {
    const resolved = path.resolve(p);
    if (!existsSync(resolved)) throw new Error(`${label} ชี้ไฟล์ที่ไม่มี: ${resolved}`);
    return resolved;
  };
  if (explicitPath) return check(explicitPath, "--config");
  if (process.env.BAAN_CONFIG) return check(process.env.BAAN_CONFIG, "BAAN_CONFIG");
  return findWorkspaceConfig(startDir);
}

// โฟลเดอร์แม่ของ workspace config = ขอบเขต workspace จริง (มีทั้ง knowledge/ และ target repo)
// runner ใช้ค่านี้ส่ง --add-dir ให้ agy ในโหมดอ่าน — ไม่เจอ config = คืน "" (ไม่ส่ง flag)
export function workspaceRootOf(explicitPath, startDir = process.cwd()) {
  const found = resolveWorkspaceConfig(explicitPath, startDir);
  return found ? path.dirname(found) : "";
}

// run dir อยู่ใต้ราก workspace เพราะสิทธิ์อ่านของ agy ผูกกับขอบเขต workspace (--add-dir โหมดอ่าน ·
// read_file rule โหมดเขียน) — เดิมอยู่ใน package จน role ถัดไปอ่านคำตอบของ role ก่อนหน้าไม่ได้
// (agy T3 โหมดเขียนล้มที่ 29 วิ ตอนอ่านโค้ดต้นแบบของ arch) · ไม่เจอ workspace = reports/ ของ package เหมือนเดิม
export function reportsDirOf(workspaceRoot) {
  return workspaceRoot ? path.join(workspaceRoot, "reports", "baan") : REPORTS_DIR;
}

// ระดับการตรวจ (charter ข้อ 14) — normal = happy flow ระหว่างพัฒนา · full = ตรวจเต็มรอบเดียวตอนท้าย
// normal เป็นค่าเริ่มต้นเพราะ school-bot (2026-11-03) ตรวจเต็มทุก task ระหว่างพัฒนาจนงาน License
// วนแก้เคสขอบอยู่หลายรอบ ขณะที่อีก 75 task ยังไม่ได้เริ่ม
export const TEST_LEVELS = ["normal", "full"];

export function validateTestLevel(v, source = "--test-level") {
  if (!TEST_LEVELS.includes(v)) throw new Error(`${source} ต้องเป็น ${TEST_LEVELS.join("/")} (ได้: ${JSON.stringify(v ?? "")})`);
  return v;
}

export function loadWorkspace(configPath = null) {
  // ไม่พบ config = ใช้ default ในโค้ด (ไม่มี targets/knowledge) พร้อมแจ้งให้ผู้ใช้รู้ตอน --list
  let raw = {};
  if (configPath) {
    try { raw = JSON.parse(readFileSync(configPath, "utf8")); }
    catch (e) { throw new Error(`อ่าน config ไม่ได้ (${configPath}): ${e.message}`); }
  }
  const testLevel = validateTestLevel(raw.defaults?.test_level ?? "normal", `defaults.test_level ใน ${configPath}`);
  return {
    source: configPath ?? null,
    main_root: raw.main_root ?? "",
    knowledge_roots: Array.isArray(raw.knowledge_roots) ? raw.knowledge_roots : [],
    defaults: {
      agent: raw.defaults?.agent ?? "codex",
      planner_tier: raw.defaults?.planner_tier ?? "t2",
      timeout_sec: Object.hasOwn(raw.defaults ?? {}, "timeout_sec") ? raw.defaults.timeout_sec : DEFAULT_TIMEOUT_SEC,
      max_parallel: raw.defaults?.max_parallel ?? 3,
      test_level: testLevel,
    },
  };
}

// memory_root = ความจำของ BAAN (ใบงาน คิว ผลตรวจรายรอบ หลักฐาน) แยกจาก knowledge ที่คนอื่นใช้ร่วม —
// knowledge ที่ปนของพวกนี้ใช้ร่วมกันไม่ได้ (school-bot: 255 จาก 707 ไฟล์เป็นใบงาน/หลักฐาน)
// ไม่ตั้ง = เขียนลง knowledge แบบเดิม ให้ workspace ที่ตั้งไว้ก่อนหน้านี้ไม่ต้องแก้อะไร
export function memoryRootOf(kr) {
  return typeof kr?.memory_root === "string" ? kr.memory_root.trim() : "";
}

const isInside = (parent, child) => {
  const rel = path.relative(path.resolve(parent), path.resolve(child));
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
};

// ข้อผิดที่ทำให้ memory ใช้งานไม่ได้จริง — คืนเป็นข้อความเตือน ไม่ throw เพราะ run ยังเดินได้ (แค่ไม่ได้แยก)
export function memoryRootIssues(kr, workspaceRoot, exists = existsSync) {
  const mem = memoryRootOf(kr);
  if (!mem) return [];
  const issues = [];
  if (!exists(mem)) issues.push("path ไม่มีจริง");
  else if (!exists(path.join(mem, ".git"))) issues.push("ไม่ใช่ git repo — auto commit จะข้าม ประวัติที่ใช้ resume จะไม่ถูกเก็บ");
  // อยู่ใน knowledge = git ของ knowledge เห็นทั้งก้อน แยกไม่จริง
  if (kr.path && isInside(kr.path, mem)) issues.push("อยู่ภายใน knowledge root — ต้องเป็นโฟลเดอร์แยก");
  // สิทธิ์อ่านของ agy ผูกกับขอบเขต workspace (ดู reportsDirOf) — อยู่นอกแล้ว role ถัดไปอ่านใบงาน/ผลตรวจไม่ได้
  if (workspaceRoot && !isInside(workspaceRoot, mem)) issues.push(`อยู่นอกราก workspace (${workspaceRoot}) — agy จะอ่านไม่ได้`);
  return issues;
}

// รับได้ทั้งชื่อตรงและชื่อ knowledge root เป็น prefix เช่น schoolbright-knowledge/sb-api-gateway
export function resolveTarget(ws, name) {
  for (const kr of ws.knowledge_roots) {
    for (const tg of kr.targets ?? []) {
      if (tg.name === name || `${kr.name}/${tg.name}` === name) return { knowledgeRoot: kr, target: tg };
    }
  }
  return null;
}

// "project" = <project>/modules/<module>/ + ช่อง shared/design/build · ไม่ตั้ง = โฟลเดอร์ระดับบนคือ module แบบเดิม
export function layoutOf(kr) {
  return kr?.layout === "project" ? "project" : "module";
}

// --module school-bot/quiz+app-shell → module จริงใน knowledge root ที่ตั้ง layout "project"
// target ของ module มาจากหัวไฟล์ INDEX ของ module (`target:`) ไม่มีก็ใช้ของ project
export function resolveModules(ws, spec) {
  const wanted = parseModuleSpec(spec);
  const roots = ws.knowledge_roots.filter((kr) => layoutOf(kr) === "project");
  if (!roots.length) throw new Error('--module ใช้ได้กับ knowledge root ที่ตั้ง "layout": "project" ใน baan.config.json เท่านั้น');
  const scanned = roots.map((kr) => ({ kr, projects: scanProjects(kr.path) }));
  const out = [];
  const missing = [];
  for (const w of wanted) {
    let hit = null;
    for (const { kr, projects } of scanned) {
      const p = projects.find((x) => x.name === w.project);
      const m = p?.modules.find((x) => x.module === w.module);
      if (m) {
        const targetName = m.target || p.header.target || "";
        hit = { ...m, knowledgeRoot: kr, project: p, target: (kr.targets ?? []).find((t) => t.name === targetName) ?? null, targetName };
        break;
      }
    }
    if (hit) out.push(hit); else missing.push(`${w.project}/${w.module}`);
  }
  if (missing.length) {
    const all = scanned.flatMap(({ projects }) => projects.flatMap((p) => p.modules.map((m) => `${p.name}/${m.module}`)));
    throw new Error(`ไม่พบ module: ${missing.join(", ")}\nที่มี: ${all.join(", ") || "(ไม่มี)"}`);
  }
  return out;
}

// ID role เดิมทั้งสองรุ่น (ชื่อยาวก่อน 0.8.0 และชื่อย่อ ba/sa/fe ก่อนเปลี่ยนธีมงานก่อสร้าง) —
// ยังรับได้ทั้งหมด เพราะแผนเก่า (plan.json ใน run ที่จะ resume), --plan-file ที่เขียนไว้
// และคำสั่งใน session/สคริปต์ของผู้ใช้ยังอ้างชื่อเหล่านี้อยู่
export const LEGACY_ROLE_ALIASES = {
  planner: "plan",
  pm: "gm",
  "project-manager": "gm",
  ba: "spec",
  "business-analyst": "spec",
  sa: "arch",
  "system-analyst": "arch",
  ux: "int",
  "uxui-designer": "int",
  fe: "front",
  "frontend-engineer": "front",
  be: "sys",
  "backend-engineer": "sys",
  dba: "vault",
  "database-administrator": "vault",
  tp: "inspect",
  "test-planner": "inspect",
  qa: "check",
  sec: "jpo",
  security: "jpo",
  // ชื่อเดิมของทีมออกแบบใน sketchbook — ทีมยังพิมพ์ชื่อเหล่านี้อยู่
  ruler: "survey",
  crayon: "ui",
  highlighter: "review",
  pencil: "spec",
};

// role ที่ต้องคุยกับผู้ใช้สดและแตะ canvas บน Claude Design — นายช่างเรียกใน session (subagent)
// ไม่ผ่าน baan-role / planner เพราะโหมด non-interactive ถามผู้ใช้และ publish canvas ไม่ได้
export function isInteractiveRole(role) {
  return role?.tier === "interactive";
}

export function resolveRoleName(name) {
  return Object.hasOwn(LEGACY_ROLE_ALIASES, name ?? "") ? LEGACY_ROLE_ALIASES[name] : name;
}

// ข้อมูลแสดงผลอ่านจากหัวไฟล์ role เอง (# บทบาท: / > หน้าที่: / > tier:) — เพิ่ม role = เพิ่มไฟล์เดียว
// ไม่ต้องแก้ทะเบียนในโค้ด
export function parseRoleHeader(text, name) {
  const lines = text.split("\n").map((l) => l.trim());
  const pick = (prefix) => lines.find((l) => l.startsWith(prefix))?.slice(prefix.length).trim() ?? "";
  return {
    name,
    title: pick("# ").replace(/^บทบาท:\s*/, "") || name,
    summary: pick("> หน้าที่:"),
    tier: pick("> tier:").split(/\s+/)[0] ?? "",
  };
}

export function roleListText(roles) {
  const aliasOf = (id) => Object.entries(LEGACY_ROLE_ALIASES).find(([, v]) => v === id)?.[0];
  return roles.map((r) => {
    const legacy = aliasOf(r.name);
    return `  ${r.name.padEnd(8)} ${r.title} [tier ${r.tier || "?"}] — ${r.summary || "(ไม่มีบรรทัด > หน้าที่:)"}${legacy ? ` (ชื่อเดิม: ${legacy})` : ""}`;
  }).join("\n");
}

export function listRoles() {
  try {
    return readdirSync(ROLES_DIR).filter((f) => f.endsWith(".md")).map((f) =>
      parseRoleHeader(readFileSync(path.join(ROLES_DIR, f), "utf8"), f.replace(/\.md$/, "")));
  } catch { return []; }
}

export function tierMatrixText(tiers, agents) {
  return Object.entries(tiers).map(([t, conf]) => {
    const cells = Object.keys(agents).map((a) => {
      const c = conf[a];
      if (c === null) return `${a}=null`;
      if (!c) return `${a}=(default)`;
      return `${a}=${[c.model, c.effort].filter(Boolean).join("/")}`;
    }).join(", ");
    return `  ${t}: ${cells}${conf._timeoutSec ? ` (timeout ${conf._timeoutSec}s)` : ""}`;
  }).join("\n");
}
