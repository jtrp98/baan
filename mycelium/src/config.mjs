// การตั้งค่าและการ resolve: workspace config (discovery จากที่เรียก), agents.json (ตัวรัน+tier), roles/, targets
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { DEFAULT_TIMEOUT_SEC } from "./timeout.mjs";

export const TEAM_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // รากของ package
export const ROLES_DIR = path.join(TEAM_DIR, "roles");
export const REPORTS_DIR = path.join(TEAM_DIR, "reports");

export function loadAgentsConfig() {
  return JSON.parse(readFileSync(path.join(TEAM_DIR, "agents.json"), "utf8"));
}

// config ของ workspace เก็บ path ของเครื่องนี้ จึงต้องอยู่ "นอก" package —
// ไม่งั้นการ update version/clone package ใหม่จะทับ config ของ workspace ทุกครั้ง
// หา `mycelium.config.json` ที่ราก workspace (เช่น C:\src\schoolbright\mycelium.config.json)
// โดยเดินขึ้นจากจุดที่เรียก — ตัวใกล้สุดชนะ (workspace ซ้อนกันได้)
// แผนเก่า mycelium/mycelium.json ยังถูกพบได้เพื่อ workspace ที่ตั้งไว้ก่อนหน้า
export function findWorkspaceConfig(startDir) {
  let dir = path.resolve(startDir);
  for (;;) {
    const flat = path.join(dir, "mycelium.config.json");
    if (existsSync(flat)) return flat;
    const legacy = path.join(dir, "mycelium", "mycelium.json");
    if (existsSync(legacy)) return legacy;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

// ลำดับ: --config ที่ส่งมา > env MYCELIUM_CONFIG > discovery จากไดเรกทอรีที่เรียก
export function resolveWorkspaceConfig(explicitPath, startDir = process.cwd()) {
  const check = (p, label) => {
    const resolved = path.resolve(p);
    if (!existsSync(resolved)) throw new Error(`${label} ชี้ไฟล์ที่ไม่มี: ${resolved}`);
    return resolved;
  };
  if (explicitPath) return check(explicitPath, "--config");
  if (process.env.MYCELIUM_CONFIG) return check(process.env.MYCELIUM_CONFIG, "MYCELIUM_CONFIG");
  return findWorkspaceConfig(startDir);
}

// โฟลเดอร์แม่ของ workspace config = ขอบเขต workspace จริง (มีทั้ง knowledge/ และ target repo)
// runner ใช้ค่านี้ส่ง --add-dir ให้ agy ในโหมดอ่าน — ไม่เจอ config = คืน "" (ไม่ส่ง flag)
export function workspaceRootOf(explicitPath, startDir = process.cwd()) {
  const found = resolveWorkspaceConfig(explicitPath, startDir);
  return found ? path.dirname(found) : "";
}

export function loadWorkspace(configPath = null) {
  // ไม่พบ config = ใช้ default ในโค้ด (ไม่มี targets/knowledge) พร้อมแจ้งให้ผู้ใช้รู้ตอน --list
  let raw = {};
  if (configPath) {
    try { raw = JSON.parse(readFileSync(configPath, "utf8")); }
    catch (e) { throw new Error(`อ่าน config ไม่ได้ (${configPath}): ${e.message}`); }
  }
  return {
    source: configPath ?? null,
    main_root: raw.main_root ?? "",
    knowledge_roots: Array.isArray(raw.knowledge_roots) ? raw.knowledge_roots : [],
    defaults: {
      agent: raw.defaults?.agent ?? "codex",
      planner_tier: raw.defaults?.planner_tier ?? "t2",
      timeout_sec: Object.hasOwn(raw.defaults ?? {}, "timeout_sec") ? raw.defaults.timeout_sec : DEFAULT_TIMEOUT_SEC,
      max_parallel: raw.defaults?.max_parallel ?? 3,
    },
  };
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

// ID role เดิมก่อนย่อ (ถึง 0.8.0) — ยังรับได้ เพราะแผนเก่า (plan.json ใน run ที่จะ resume), --plan-file
// ที่เขียนไว้ และคำสั่งใน session/สคริปต์ของผู้ใช้ยังอ้างชื่อเหล่านี้อยู่
export const LEGACY_ROLE_ALIASES = {
  "project-manager": "pm",
  "business-analyst": "ba",
  "system-analyst": "sa",
  "uxui-designer": "ux",
  "frontend-engineer": "fe",
  "backend-engineer": "be",
  "database-administrator": "dba",
  "test-planner": "tp",
  security: "sec",
};

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
