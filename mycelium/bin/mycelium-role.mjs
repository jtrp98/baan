#!/usr/bin/env node
// 🍄 MYCELIUM — มือระดับล่าง: เปิด session ของ role เดียวหรือหลาย agent พร้อมกัน (คำสั่ง mycelium-role)
// ตัวรัน/args/stdin/timeout อยู่ที่ src/runner.mjs ใช้ร่วมกับ mycelium
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { REPORTS_DIR, ROLES_DIR, TEAM_DIR, loadAgentsConfig } from "../src/config.mjs";
import { readConventions } from "../src/prompts.mjs";
import { buildArgs, runCli } from "../src/runner.mjs";

const DEFAULT_TIMEOUT_SEC = 240;
const PROJECT_ROOT = path.resolve(TEAM_DIR, ".."); // default cwd = โฟลเดอร์แม่ของ package (ต่างจาก pipeline ที่ default = TEAM_DIR)

function parseArgs(argv) {
  const opts = { agents: [], task: "", taskFile: "", write: false, seq: false, list: false, cwd: PROJECT_ROOT, timeoutSec: DEFAULT_TIMEOUT_SEC, timeoutSet: false, tier: "", model: "", effort: "", role: "" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--agent": opts.agents.push(argv[++i]); break;
      case "--all": opts.agents.push("*"); break;
      case "--task": opts.task = argv[++i] ?? ""; break;
      case "--task-file": opts.taskFile = argv[++i] ?? ""; break;
      case "--write": opts.write = true; break;
      case "--seq": opts.seq = true; break;
      case "--list": opts.list = true; break;
      case "--cwd": opts.cwd = path.resolve(argv[++i] ?? "."); break;
      case "--timeout": opts.timeoutSec = Number(argv[++i]) || DEFAULT_TIMEOUT_SEC; opts.timeoutSet = true; break;
      case "--tier": opts.tier = argv[++i] ?? ""; break;
      case "--model": opts.model = argv[++i] ?? ""; break;
      case "--effort": opts.effort = argv[++i] ?? ""; break;
      case "--role": opts.role = argv[++i] ?? ""; break;
      default:
        console.error(`อาร์กิวเมนต์ไม่รู้จัก: ${a}\nใช้ --agent <name> [--all] --task "..." [--role <name>] [--tier t0..t5] [--model <m>] [--effort <e>] [--write] [--seq] [--timeout <sec>] [--cwd <dir>] [--list]`);
        process.exit(2);
    }
  }
  return opts;
}

async function runAgent(name, def, task, opts, runDir, model, effort) {
  const answerFile = path.join(runDir, `${name}.answer.txt`);
  const args = buildArgs(def, model, effort, opts.write, answerFile);
  if (def.promptVia === "arg") args.push(task);
  const r = await runCli(def, args, def.promptVia, task, opts.cwd, opts.timeoutSec, answerFile);
  return { ...r, agent: name, label: def.label, model, effort };
}

function printResult(r) {
  const status = r.timedOut ? "TIMEOUT" : r.ok ? "OK" : `FAIL(exit=${r.exitCode})`;
  const tier = [r.model && `model=${r.model}`, r.effort && `effort=${r.effort}`].filter(Boolean).join(" ");
  console.log(`\n── ${r.agent} (${r.label})${tier ? ` [${tier}]` : ""} ── ${status} in ${(r.durationMs / 1000).toFixed(1)}s`);
  if (r.error) console.log(`   spawn error: ${r.error}`);
  if (r.timedOut) console.log("   ถูกยกเลิกเพราะเกิน timeout");
  console.log((r.answer || "(ไม่มีคำตอบ — ดู raw output ใน reports/) ").split("\n").map((l) => `   ${l}`).join("\n"));
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const cfg = loadAgentsConfig();
  const agents = cfg.agents ?? {};
  const tiers = cfg.tiers ?? {};

  if (opts.list) {
    console.log("agents ที่ตั้งค่าไว้ใน agents.json:");
    for (const [name, def] of Object.entries(agents)) console.log(`  ${name.padEnd(8)} ${def.label}  ->  ${def.command} ${def.readArgs.join(" ")}`);
    console.log("tiers:");
    for (const [tname, conf] of Object.entries(tiers)) {
      const agentsLine = Object.entries(conf).filter(([a]) => !a.startsWith("_")).map(([a, c]) => `${a}: ${c === null ? "— (null)" : [c.model, c.effort].filter(Boolean).join("/")}`).join(", ");
      const extra = conf._timeoutSec ? ` (timeout ${conf._timeoutSec}s)` : "";
      console.log(`  ${tname.padEnd(8)} ${agentsLine}${extra}`);
    }
    let roleFiles = [];
    try { roleFiles = readdirSync(ROLES_DIR).filter((f) => f.endsWith(".md")); } catch { /* ไม่มีโฟลเดอร์ roles */ }
    if (roleFiles.length) {
      console.log("roles (ใช้กับ --role <name>):");
      for (const f of roleFiles) {
        const name = f.replace(/\.md$/, "");
        const title = readFileSync(path.join(ROLES_DIR, f), "utf8").split("\n").find((l) => l.startsWith("# "))?.replace(/^#\s+/, "") ?? name;
        console.log(`  ${name.padEnd(13)} ${title}`);
      }
    }
    return;
  }

  if (opts.tier && !(opts.tier in tiers)) {
    console.error(`ไม่พบ tier: ${opts.tier} (ที่มี: ${Object.keys(tiers).join(", ") || "ไม่มี"})`);
    process.exit(2);
  }
  // tier ระบุ timeout เริ่มต้นไว้ (เช่น t0 = งานยาก) แต่ --timeout ที่ส่งมาเองชนะเสมอ
  const tierTimeout = (tiers[opts.tier] ?? {})._timeoutSec;
  if (tierTimeout && !opts.timeoutSet) opts.timeoutSec = tierTimeout;

  const selected = opts.agents.includes("*") ? Object.keys(agents) : [...new Set(opts.agents)];
  const unknown = selected.filter((n) => !(n in agents));
  if (unknown.length) {
    console.error(`ไม่พบ agent: ${unknown.join(", ")} (ที่มี: ${Object.keys(agents).join(", ")})`);
    process.exit(2);
  }

  // agent ที่ tier นี้เป็น null = ยังไม่มี model ทัดเทียม — --all ข้ามเงียบๆ แต่ถ้าระบุชื่อตรงๆ ให้ error ชัดๆ
  const tierConfAll = opts.tier ? (tiers[opts.tier] ?? {}) : {};
  const nullAgents = selected.filter((n) => tierConfAll[n] === null);
  if (nullAgents.length) {
    if (!opts.agents.includes("*")) {
      console.error(`agent เหล่านี้ยังไม่มี model ทัดเทียมใน tier ${opts.tier}: ${nullAgents.join(", ")} (ตั้งเป็น null ไว้ใน agents.json — เลือก tier อื่นหรือ agent อื่น)`);
      process.exit(2);
    }
    for (const n of nullAgents) console.log(`ข้าม ${n}: ไม่มี model ทัดเทียมใน tier ${opts.tier} (null ใน agents.json)`);
  }
  const runnable = selected.filter((n) => tierConfAll[n] !== null);
  if (runnable.length === 0) {
    console.error(`ไม่มี agent ที่รันได้ใน tier ${opts.tier} (ทุกตัวเป็น null)`);
    process.exit(2);
  }
  if (selected.length === 0) {
    console.error("ระบุ --agent <name> อย่างน้อยหนึ่งตัว หรือ --all");
    process.exit(2);
  }

  let task = opts.task;
  if (!task && opts.taskFile) task = readFileSync(opts.taskFile, "utf8");
  task = (task ?? "").trim();
  if (!task) {
    console.error('ระบุงานผ่าน --task "..." หรือ --task-file <path>');
    process.exit(2);
  }

  let fullTask = task;
  if (opts.role) {
    const roleFile = path.join(ROLES_DIR, `${opts.role}.md`);
    let roleContent = "";
    try {
      roleContent = readFileSync(roleFile, "utf8").trim();
    } catch {
      console.error(`ไม่พบ role: ${opts.role} (ไม่มีไฟล์ ${roleFile} — ดูรายชื่อทั้งหมดด้วย --list)`);
      process.exit(2);
    }
    const conv = `\n\n---\n\n## กติกากลางทุก role ต้องถือ (ถือเป็นสัญญา):\n${readConventions()}`;
    fullTask = `คุณกำลังปฏิบัติหน้าที่ในทีมพัฒนาซอฟต์แวร์ตามบทบาทต่อไปนี้อย่างเคร่งครัด:\n\n${roleContent}${conv}\n\n---\n\n## งานที่ได้รับมอบหมาย:\n${task}`;
  }

  const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
  const runDir = path.join(REPORTS_DIR, `${stamp}-${opts.tier ? `tier-${opts.tier}` : opts.write ? "write" : "read"}-${runnable.length}agents`);
  mkdirSync(runDir, { recursive: true });

  const resolveME = (name) => {
    const t = (tiers[opts.tier] ?? {})[name] ?? {};
    return { model: opts.model || t.model || "", effort: opts.effort || t.effort || "" };
  };

  console.log(`task    : ${task}`);
  if (opts.role) console.log(`role    : ${opts.role} (บทบาทจาก roles/${opts.role}.md ผูกอยู่กับ task)`);
  console.log(`agents  : ${runnable.join(", ")}`);
  if (opts.tier) console.log(`tier    : ${opts.tier} -> ${runnable.map((n) => `${n}=${[resolveME(n).model, resolveME(n).effort].filter(Boolean).join("/")}`).join(", ")}`);
  console.log(`mode    : ${opts.write ? "write (อนุญาตให้แก้ไขไฟล์)" : "read-only"}${opts.seq ? " (ทีละตัว)" : " (ขนาน)"}`);
  console.log(`cwd     : ${opts.cwd}`);
  console.log(`timeout : ${opts.timeoutSec}s/agent — กำลังรัน...`);

  const results = [];
  if (opts.seq) {
    for (const name of runnable) {
      const { model, effort } = resolveME(name);
      const r = await runAgent(name, agents[name], fullTask, opts, runDir, model, effort);
      results.push(r);
      printResult(r);
    }
  } else {
    const rs = await Promise.all(runnable.map((name) => {
      const { model, effort } = resolveME(name);
      return runAgent(name, agents[name], fullTask, opts, runDir, model, effort);
    }));
    results.push(...rs);
    rs.forEach(printResult);
  }

  for (const r of results) {
    writeFileSync(path.join(runDir, `${r.agent}.stdout.txt`), r.stdout, "utf8");
    writeFileSync(path.join(runDir, `${r.agent}.stderr.txt`), r.stderr, "utf8");
  }
  const report = {
    timestamp: new Date().toISOString(),
    task,
    role: opts.role || null,
    tier: opts.tier || null,
    mode: opts.write ? "write" : "read-only",
    cwd: opts.cwd,
    results: results.map(({ stdout, stderr, ...rest }) => rest),
  };
  writeFileSync(path.join(runDir, "report.json"), JSON.stringify(report, null, 2), "utf8");

  const okCount = results.filter((r) => r.ok).length;
  console.log(`\nสรุป: สำเร็จ ${okCount}/${results.length} — รายงานฉบับเต็มอยู่ที่ ${runDir}`);
  process.exitCode = okCount === results.length ? 0 : 1;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
