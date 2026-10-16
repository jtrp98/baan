// การตั้งค่าและการ resolve: workspace config (discovery จากที่เรียก), agents.json (ตัวรัน+tier), roles/, targets
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

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
      timeout_sec: raw.defaults?.timeout_sec ?? 600,
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

export function listRoles() {
  try {
    return readdirSync(ROLES_DIR).filter((f) => f.endsWith(".md")).map((f) => {
      const name = f.replace(/\.md$/, "");
      const title = readFileSync(path.join(ROLES_DIR, f), "utf8").split("\n").find((l) => l.startsWith("# "))?.replace(/^#\s+/, "") ?? name;
      return { name, title };
    });
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
