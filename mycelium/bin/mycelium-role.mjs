#!/usr/bin/env node
// 🍄 MYCELIUM — มือระดับล่าง: เปิด session ของ role เดียวหรือหลาย agent พร้อมกัน (คำสั่ง mycelium-role)
// ตัวรัน/args/stdin/timeout อยู่ที่ src/runner.mjs · สถานะงาน/fallback อยู่ที่ src/role-session.mjs ใช้กติกาเดียวกับ mycelium
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { REPORTS_DIR, ROLES_DIR, listRoles, loadAgentsConfig, roleListText } from "../src/config.mjs";
import { adhocDirective, localDate, roleDirective } from "../src/prompts.mjs";
import { buildArgs, runCli } from "../src/runner.mjs";
import { statusLabel } from "../src/scheduler.mjs";
import { createRunDir, parseRoleArgs, runRoleAgents } from "../src/role-session.mjs";

function printResult(r) {
  const tier = [r.model && `model=${r.model}`, r.effort && `effort=${r.effort}`].filter(Boolean).join(" ");
  const via = r.fallback.length ? ` (สลับตัวรัน: ${r.fallback.join(", ")})` : "";
  console.log(`\n── ${r.agent} (${r.label})${tier ? ` [${tier}]` : ""} ── ${statusLabel(r)} in ${(r.durationMs / 1000).toFixed(1)}s${via}`);
  if (r.error) console.log(`   spawn error: ${r.error}`);
  if (r.timedOut) console.log("   ถูกยกเลิกเพราะเกิน timeout");
  console.log((r.answer || "(ไม่มีคำตอบ — ดู raw output ใน reports/) ").split("\n").map((l) => `   ${l}`).join("\n"));
  if (!r.ok) console.log(`   สถานะงาน: ${r.state}${r.marker ? ` (${r.marker})` : ""} — งานไม่สำเร็จ`);
}

async function main() {
  let opts;
  try { opts = parseRoleArgs(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(2); }
  const cfg = loadAgentsConfig();
  const agents = cfg.agents ?? {};
  const tiers = cfg.tiers ?? {};

  if (opts.list) {
    console.log("agents ที่ตั้งค่าไว้ใน agents.json:");
    for (const [name, def] of Object.entries(agents)) console.log(`  ${name.padEnd(8)} ${def.label}  ->  ${def.command} ${def.readArgs.join(" ")}`);
    console.log("tiers:");
    for (const [tname, conf] of Object.entries(tiers)) {
      const agentsLine = Object.entries(conf).filter(([a]) => !a.startsWith("_")).map(([a, c]) => `${a}: ${c === null ? "— (null)" : [c.model, c.effort].filter(Boolean).join("/")}`).join(", ");
      const extra = [conf._timeoutSec && `timeout ${conf._timeoutSec}s`, conf._fallback && `fallback ${conf._fallback.join("→")}`].filter(Boolean).join(" · ");
      console.log(`  ${tname.padEnd(8)} ${agentsLine}${extra ? ` (${extra})` : ""}`);
    }
    const roles = listRoles();
    if (roles.length) {
      console.log("roles (ใช้กับ --role <name>):");
      console.log(roleListText(roles));
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
  if (selected.length === 0) {
    console.error("ระบุ --agent <name> อย่างน้อยหนึ่งตัว หรือ --all");
    process.exit(2);
  }
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
  if (!existsSync(opts.cwd)) {
    console.error(`--cwd ชี้โฟลเดอร์ที่ไม่มี: ${opts.cwd}`);
    process.exit(2);
  }

  let task = opts.task;
  if (!task && opts.taskFile) task = readFileSync(opts.taskFile, "utf8");
  task = (task ?? "").trim();
  if (!task) {
    console.error('ระบุงานผ่าน --task "..." หรือ --task-file <path>');
    process.exit(2);
  }

  const workDate = opts.date || localDate();
  let fullTask = adhocDirective(task);
  if (opts.role) {
    const roleFile = path.join(ROLES_DIR, `${opts.role}.md`);
    if (!existsSync(roleFile)) {
      console.error(`ไม่พบ role: ${opts.role} (ไม่มีไฟล์ ${roleFile} — ดูรายชื่อทั้งหมดด้วย --list)`);
      process.exit(2);
    }
    if (opts.roleAlias) console.log(`(--role ${opts.roleAlias} = ชื่อเดิมของ ${opts.role} — ใช้ชื่อสั้นได้เลยครั้งหน้า)`);
    fullTask = roleDirective(opts.role, task, null, "", workDate);
  }

  const runDir = createRunDir(REPORTS_DIR, { role: opts.role, tier: opts.tier, write: opts.write, count: runnable.length });

  const resolveME = (name, isRequested) => {
    const t = (tiers[opts.tier] ?? {})[name] ?? {};
    if (!isRequested) return { model: t.model || "", effort: t.effort || "" };
    return { model: opts.model || t.model || "", effort: opts.effort || t.effort || "" };
  };

  console.log(`task    : ${task}`);
  if (opts.role) console.log(`role    : ${opts.role} (บทบาทจาก roles/${opts.role}.md + CONVENTIONS ผูกอยู่กับ task) · วันที่ของงาน ${workDate}`);
  console.log(`agents  : ${runnable.join(", ")}`);
  if (opts.tier) console.log(`tier    : ${opts.tier} -> ${runnable.map((n) => `${n}=${[resolveME(n, true).model, resolveME(n, true).effort].filter(Boolean).join("/")}`).join(", ")}`);
  console.log(`mode    : ${opts.write ? "write (อนุญาตให้แก้ไขไฟล์)" : "read-only"}${opts.seq ? " (ทีละตัว)" : " (ขนาน)"}`);
  console.log(`cwd     : ${opts.cwd}`);
  console.log(`timeout : ${opts.timeoutSec}s/agent — กำลังรัน...`);

  const attempt = async (name, isRequested) => {
    const def = agents[name];
    const { model, effort } = resolveME(name, isRequested);
    const answerFile = path.join(runDir, `${name}.answer.txt`);
    const args = buildArgs(def, model, effort, opts.write, answerFile);
    if (def.promptVia === "arg") args.push(fullTask);
    const r = await runCli(def, args, def.promptVia, fullTask, opts.cwd, opts.timeoutSec, answerFile);
    return { ...r, label: def.label, model, effort };
  };
  const results = await runRoleAgents({ cfg, opts, selected: runnable, attempt, onResult: printResult });

  for (const r of results) {
    writeFileSync(path.join(runDir, `${r.agent}.stdout.txt`), r.stdout, "utf8");
    writeFileSync(path.join(runDir, `${r.agent}.stderr.txt`), r.stderr, "utf8");
  }
  const report = {
    timestamp: new Date().toISOString(),
    task,
    role: opts.role || null,
    tier: opts.tier || null,
    date: opts.role ? workDate : null,
    mode: opts.write ? "write" : "read-only",
    cwd: opts.cwd,
    results: results.map(({ stdout, stderr, ...rest }) => rest),
  };
  writeFileSync(path.join(runDir, "report.json"), JSON.stringify(report, null, 2), "utf8");

  // exit 0 เฉพาะเมื่อทุกตัว completed — ผู้คุมใช้ exit code ตัดสินได้ทันทีว่าต้อง route ต่อหรือไม่ (เหมือนโหมดอัตโนมัติ)
  const okCount = results.filter((r) => r.ok).length;
  console.log(`\nสรุป: completed ${okCount}/${results.length} · ${results.map((r) => `${r.requested}${r.agent !== r.requested ? `→${r.agent}` : ""}=${r.state}`).join(", ")} — รายงานฉบับเต็มอยู่ที่ ${runDir}`);
  process.exitCode = okCount === results.length ? 0 : 1;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
