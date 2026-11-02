// knowledge แบบ layout "project": <project>/{shared,design,build}/ + <project>/modules/<module>/{shared,design,build}/
// ตาราง module ใน <project>/INDEX.md สร้างจากหัวไฟล์ INDEX.md ของแต่ละ module ที่เดียว —
// เขียนมือหลายจุดแล้วเพี้ยนกันเสมอ (sketchbook ต้องอัปเดตวันที่/สถานะ 3 จุดด้วยมือ)
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

export const TEAM_SLOTS = ["shared", "design", "build"];
// ของที่อยู่ระดับ project/module ได้นอกจากช่องทีม — ที่เหลือคือไฟล์ที่ยังไม่ได้จัดเข้าช่อง (เตือน ไม่ใช่ error)
const PROJECT_EXTRAS = new Set(["INDEX.md", "index.md", "modules", "changelog", "archive"]);
const MODULE_EXTRAS = new Set(["INDEX.md", "index.md", "changelog", "archive", "features"]);
const START = "<!-- baan:modules:start -->";
const END = "<!-- baan:modules:end -->";

// หัวไฟล์แบบ `key: value` ระหว่าง --- ทั้งสองเส้น · `[a, b]` = รายการ — ไม่ต้องมี YAML parser ทั้งตัว
export function readFrontMatter(text) {
  const m = /^﻿?---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    const v = kv[2].trim();
    out[kv[1]] = v.startsWith("[") && v.endsWith("]")
      ? v.slice(1, -1).split(",").map((s) => s.trim()).filter((s) => s && s !== "-")
      : v;
  }
  return out;
}

// "school-bot/quiz+app-shell+schoolbright-web/school-bot" → ชิ้นที่ไม่มี project ใช้ project ของชิ้นก่อนหน้า
export function parseModuleSpec(spec) {
  const out = [];
  let project = "";
  for (const raw of String(spec ?? "").split("+").map((s) => s.trim()).filter(Boolean)) {
    const parts = raw.split("/");
    if (parts.length === 2 && parts[0] && parts[1]) { project = parts[0]; out.push({ project, module: parts[1] }); }
    else if (parts.length === 1 && project) out.push({ project, module: parts[0] });
    else throw new Error(`ระบุ module ผิดรูป: "${raw}" — ใช้ <project>/<module> เช่น school-bot/quiz (ต่อหลาย module ด้วย +)`);
  }
  if (!out.length) throw new Error("ต้องระบุ module เช่น --module school-bot/quiz");
  return out;
}

const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const readText = (p) => { try { return readFileSync(p, "utf8"); } catch { return ""; } };

function indexFileOf(dir) {
  for (const n of ["INDEX.md", "index.md"]) if (existsSync(path.join(dir, n))) return path.join(dir, n);
  return "";
}

function firstHeading(text) {
  return /^#\s+(.+)$/m.exec(text)?.[1].trim() ?? "";
}

const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// ความรู้ UX ของ package แยกตามแพลตฟอร์ม — role อ่านแค่หมวดของ module ไม่ใช่ HIG ของ Mac ตอนทำเว็บ
export const PLATFORM_OS = { web: {}, desktop: { mac: "apple", windows: "windows" }, mobile: { ios: "ios", android: "android" } };

export function uxKnowledgeDirs(teamDir, platform, os = []) {
  const base = path.join(teamDir, "ux-knowledge");
  const dirs = [path.join(base, "common")];
  if (PLATFORM_OS[platform]) {
    dirs.push(path.join(base, platform));
    for (const o of os) if (PLATFORM_OS[platform][o]) dirs.push(path.join(base, platform, PLATFORM_OS[platform][o]));
  }
  return [...new Set(dirs)].filter(isDir);
}

// project = โฟลเดอร์ระดับบนที่มี modules/ · ขึ้นต้นด้วย _ หรือ . = ของกลาง ไม่ใช่ project
export function scanProjects(root) {
  if (!isDir(root)) return [];
  return readdirSync(root).filter((n) => !/^[_.]/.test(n) && isDir(path.join(root, n, "modules"))).sort().map((name) => {
    const dir = path.join(root, name);
    const idx = indexFileOf(dir);
    const header = idx ? readFrontMatter(readText(idx)) : {};
    const modules = readdirSync(path.join(dir, "modules")).filter((m) => !/^[_.]/.test(m) && isDir(path.join(dir, "modules", m))).sort().map((m) => {
      const mdir = path.join(dir, "modules", m);
      const file = indexFileOf(mdir);
      const text = file ? readText(file) : "";
      const fm = readFrontMatter(text);
      return {
        project: name, module: m, dir: mdir, indexFile: file,
        summary: fm.summary || firstHeading(text),
        status: fm.status || "", updated: fm.updated || "",
        dependsOn: asList(fm.depends_on), requestedBy: asList(fm.requested_by), target: fm.target || "",
        // ไม่ระบุที่ module = ใช้ของ project (project ส่วนใหญ่มีแพลตฟอร์มเดียว)
        platform: fm.platform || header.platform || "", os: asList(fm.os ?? header.os),
      };
    });
    return { name, dir, indexFile: idx, header, modules };
  });
}

// "quiz" = module ใน project เดียวกัน · "school-bot/quiz" = ข้าม project
export function qualify(dep, project) {
  return dep.includes("/") ? dep : `${project}/${dep}`;
}

function relLink(fromDir, toFile) {
  return path.relative(fromDir, toFile).split(path.sep).join("/");
}

export function renderModuleTable(project, projects) {
  const cell = (s) => String(s || "-").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  const own = project.modules.map((m) => {
    const deps = m.dependsOn.length ? m.dependsOn.join(", ") : "-";
    const from = m.requestedBy.length ? ` · ขอโดย ${m.requestedBy.join(", ")}` : "";
    const link = m.indexFile ? `[modules/${m.module}](${relLink(project.dir, m.indexFile)})` : `modules/${m.module}`;
    return `| ${m.module} | ${cell(m.summary)}${from} | ${cell(m.status)} | ${cell(m.updated)} | ${cell(deps)} | ${link} |`;
  });
  const foreign = [];
  for (const p of projects) {
    if (p.name === project.name) continue;
    for (const m of p.modules) {
      const why = [];
      if (m.requestedBy.includes(project.name)) why.push(`ขอโดย ${project.name}`);
      const deps = m.dependsOn.map((d) => qualify(d, p.name)).filter((d) => d.startsWith(`${project.name}/`));
      if (deps.length) why.push(`พึ่ง ${deps.join(", ")}`);
      if (!why.length) continue;
      const link = m.indexFile ? `[${p.name}/modules/${m.module}](${relLink(project.dir, m.indexFile)})` : `${p.name}/modules/${m.module}`;
      foreign.push(`| ${m.module} | ${cell(m.summary)} | ${cell(m.status)} | ${cell(m.updated)} | ${why.join(" · ")} | ${link} |`);
    }
  }
  const lines = [
    START,
    "<!-- ตารางนี้สร้างจากหัวไฟล์ INDEX.md ของแต่ละ module ด้วย `baan --index` — แก้ที่หัวไฟล์ของ module ไม่ใช่ที่นี่ -->",
    "",
    "| Module | สรุป | สถานะ | อัปเดต | พึ่งพา | ไฟล์ |",
    "|---|---|---|---|---|---|",
    ...(own.length ? own : ["| - | ยังไม่มี module | - | - | - | - |"]),
  ];
  if (foreign.length) {
    lines.push("", "**module ที่อยู่ project อื่นแต่เกี่ยวกับ project นี้**", "", "| Module | สรุป | สถานะ | อัปเดต | เกี่ยวข้อง | อยู่ที่ |", "|---|---|---|---|---|---|", ...foreign);
  }
  lines.push(END);
  return lines.join("\n");
}

// ใส่ตารางแทนช่วงระหว่าง marker · ไม่มี marker = ต่อท้าย (ไฟล์ไม่มี = สร้างพร้อมชื่อ project)
export function applyModuleTable(text, table, projectName) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const t = table.split("\n").join(eol);
  if (!text) return `# ${projectName}${eol}${eol}## Modules${eol}${eol}${t}${eol}`;
  const s = text.indexOf(START);
  const e = text.indexOf(END);
  if (s >= 0 && e > s) return text.slice(0, s) + t + text.slice(e + END.length);
  return `${text.replace(/\s*$/, "")}${eol}${eol}## Modules${eol}${eol}${t}${eol}`;
}

// คืนรายการไฟล์ INDEX ที่ต้องเปลี่ยน (write=true เขียนจริง)
export function updateIndexes(root, { write = true } = {}) {
  const projects = scanProjects(root);
  const changed = [];
  for (const p of projects) {
    const file = p.indexFile || path.join(p.dir, "INDEX.md");
    const before = p.indexFile ? readText(file) : "";
    const after = applyModuleTable(before, renderModuleTable(p, projects), p.name);
    if (after !== before) {
      changed.push(file);
      if (write) writeFileSync(file, after, "utf8");
    }
  }
  return changed;
}

function walkMarkdown(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (n.startsWith(".")) continue;
    const p = path.join(dir, n);
    if (isDir(p)) walkMarkdown(p, out);
    else if (n.endsWith(".md")) out.push(p);
  }
  return out;
}

// ลิงก์ relative ใน markdown ที่ชี้ไฟล์ไม่มีจริง (ข้าม URL, anchor ล้วน, mailto) — โค้ดบล็อกไม่นับ
export function brokenLinks(file, text = readText(file)) {
  const body = text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  const bad = [];
  for (const m of body.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = m[1].split("#")[0];
    if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    let p;
    try { p = decodeURIComponent(target); } catch { p = target; }
    if (!existsSync(path.resolve(path.dirname(file), p))) bad.push(m[1]);
  }
  return bad;
}

export function lintKnowledge(root) {
  const errors = [];
  const warnings = [];
  const projects = scanProjects(root);
  const known = new Set(projects.flatMap((p) => p.modules.map((m) => `${p.name}/${m.module}`)));
  const projectNames = new Set(projects.map((p) => p.name));
  const rel = (f) => path.relative(root, f).split(path.sep).join("/");
  for (const p of projects) {
    for (const n of readdirSync(p.dir)) {
      if (!TEAM_SLOTS.includes(n) && !PROJECT_EXTRAS.has(n)) warnings.push(`${p.name}/${n}: อยู่นอกช่อง shared/design/build ของ project`);
    }
    for (const m of p.modules) {
      if (!m.indexFile) errors.push(`${p.name}/modules/${m.module}: ไม่มี INDEX.md`);
      for (const n of readdirSync(m.dir)) {
        if (!TEAM_SLOTS.includes(n) && !MODULE_EXTRAS.has(n)) warnings.push(`${p.name}/modules/${m.module}/${n}: อยู่นอกช่อง shared/design/build ของ module`);
      }
      for (const d of m.dependsOn) {
        if (!known.has(qualify(d, p.name))) errors.push(`${p.name}/${m.module}: depends_on "${d}" ไม่มี module นี้`);
      }
      for (const r of m.requestedBy) {
        if (!projectNames.has(r)) errors.push(`${p.name}/${m.module}: requested_by "${r}" ไม่มี project นี้`);
      }
      if (!m.platform) warnings.push(`${p.name}/${m.module}: ยังไม่ระบุ platform (web · desktop · mobile) — ทีมออกแบบจะอ่านแค่ความรู้ UX กลาง`);
      else if (!PLATFORM_OS[m.platform]) errors.push(`${p.name}/${m.module}: platform "${m.platform}" ไม่รู้จัก — ใช้ ${Object.keys(PLATFORM_OS).join(" · ")}`);
      else {
        for (const o of m.os) {
          if (!PLATFORM_OS[m.platform][o]) errors.push(`${p.name}/${m.module}: os "${o}" ใช้กับ platform ${m.platform} ไม่ได้${Object.keys(PLATFORM_OS[m.platform]).length ? ` — ใช้ ${Object.keys(PLATFORM_OS[m.platform]).join(" · ")}` : " (web ไม่แยก os)"}`);
        }
      }
    }
    const idx = p.indexFile ? readText(p.indexFile) : "";
    if (applyModuleTable(idx, renderModuleTable(p, projects), p.name) !== idx) {
      errors.push(`${p.name}/INDEX.md: ตาราง module ไม่ตรงหัวไฟล์ของ module — รัน baan --index`);
    }
    for (const f of walkMarkdown(p.dir)) {
      if (rel(f).split("/").includes("archive")) continue;
      for (const b of brokenLinks(f)) errors.push(`${rel(f)}: ลิงก์เสีย ${b}`);
    }
  }
  return { projects, errors, warnings };
}
