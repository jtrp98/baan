// การตั้งค่าและการ resolve: mycelium.json (workspace), agents.json (ตัวรัน+tier), roles/, targets
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const TEAM_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."); // รากของ package
export const ROLES_DIR = path.join(TEAM_DIR, "roles");
export const REPORTS_DIR = path.join(TEAM_DIR, "reports");
const WS_CONFIG = path.join(TEAM_DIR, "mycelium.json");

export function loadAgentsConfig() {
  return JSON.parse(readFileSync(path.join(TEAM_DIR, "agents.json"), "utf8"));
}

export function loadWorkspace() {
  // ไฟล์หรือ field ที่ไม่มี = ใช้ default ไม่ถือเป็น error (เครื่องอื่นแก้ path ใน mycelium.json เองได้)
  let raw = {};
  try { raw = JSON.parse(readFileSync(WS_CONFIG, "utf8")); } catch { /* ไม่มีไฟล์ = ใช้ default */ }
  return {
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
