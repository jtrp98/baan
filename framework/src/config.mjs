import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { DEFAULT_TIMEOUT_SEC } from "./timeout.mjs";
import { parseModuleSpec, scanProjects } from "./knowledge-index.mjs";

export const TEAM_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ROLES_DIR = path.join(TEAM_DIR, "roles");
export const REPORTS_DIR = path.join(TEAM_DIR, "reports");

export function loadAgentsConfig(file = process.env.BAAN_AGENTS_FILE || path.join(TEAM_DIR, "agents.json")) {
  return JSON.parse(readFileSync(file, "utf8"));
}

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

export function workspaceRootOf(explicitPath, startDir = process.cwd()) {
  const found = resolveWorkspaceConfig(explicitPath, startDir);
  return found ? path.dirname(found) : "";
}

export function reportsDirOf(workspaceRoot) {
  return workspaceRoot ? path.join(workspaceRoot, "reports", "baan") : REPORTS_DIR;
}


export function loadWorkspace(configPath = null) {
  let raw = {};
  if (configPath) {
    try { raw = JSON.parse(readFileSync(configPath, "utf8")); }
    catch (e) { throw new Error(`อ่าน config ไม่ได้ (${configPath}): ${e.message}`); }
  }
  return {
    source: configPath ?? null,
    knowledge_roots: Array.isArray(raw.knowledge_roots) ? raw.knowledge_roots : [],
    defaults: {
      agent: raw.defaults?.agent ?? "codex",
      planner_tier: raw.defaults?.planner_tier ?? "t2",
      timeout_sec: Object.hasOwn(raw.defaults ?? {}, "timeout_sec") ? raw.defaults.timeout_sec : DEFAULT_TIMEOUT_SEC,
      max_parallel: raw.defaults?.max_parallel ?? 3,
    },
  };
}

export function memoryRootOf(kr) {
  return typeof kr?.memory_root === "string" ? kr.memory_root.trim() : "";
}

const isInside = (parent, child) => {
  const rel = path.relative(path.resolve(parent), path.resolve(child));
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
};

export function memoryRootIssues(kr, workspaceRoot, exists = existsSync) {
  const mem = memoryRootOf(kr);
  if (!mem) return [];
  const issues = [];
  if (!exists(mem)) issues.push("path ไม่มีจริง");
  else if (!exists(path.join(mem, ".git"))) issues.push("ไม่ใช่ git repo — --commit จะข้าม");
  if (kr.path && isInside(kr.path, mem)) issues.push("อยู่ภายใน knowledge root — ต้องเป็นโฟลเดอร์แยก");
  if (workspaceRoot && !isInside(workspaceRoot, mem)) issues.push(`อยู่นอกราก workspace (${workspaceRoot}) — agy จะอ่านไม่ได้`);
  return issues;
}

export function resolveTarget(ws, name) {
  for (const kr of ws.knowledge_roots) {
    for (const tg of kr.targets ?? []) {
      if (tg.name === name || `${kr.name}/${tg.name}` === name) return { knowledgeRoot: kr, target: tg };
    }
  }
  return null;
}

export function layoutOf(kr) {
  return kr?.layout === "project" ? "project" : "module";
}

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

export const LEGACY_ROLE_ALIASES = {
  // Existing project plans still store these owner IDs; they are metadata, not execution roles.
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
  ruler: "survey",
  crayon: "ui",
  highlighter: "review",
  pencil: "spec",
  dev: "build",
  developer: "build",
};


export function resolveRoleName(name) {
  return Object.hasOwn(LEGACY_ROLE_ALIASES, name ?? "") ? LEGACY_ROLE_ALIASES[name] : name;
}

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
