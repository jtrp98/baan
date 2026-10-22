#!/usr/bin/env node
// 🏗️ นายช่าง (โหมดอัตโนมัติ) — goal → PM → planner → execute ตามแผน DAG
// โหมดหลักของ นายช่าง คือ "AI session สวมบท" ตาม BAAN.md แล้วเปิด session ราย role
// ด้วย baan-role — ไฟล์นี้คือทางเลือกอัตโนมัติทั้งก้อนเมื่อไม่ต้องมีคน/session คุมเอง
// การตั้งค่าอยู่ที่ <ราก workspace>\baan.config.json (นอก package) · วิธีใช้เต็ม: baan/README.md
import { existsSync, mkdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TEAM_DIR, REPORTS_DIR, listRoles, loadAgentsConfig, loadWorkspace, resolveTarget, resolveWorkspaceConfig, roleListText, tierMatrixText, workspaceRootOf } from "../src/config.mjs";
import { extractJson, fallbackChainFor, printPlan, validateAndFixPlan } from "../src/plan.mjs";
import { execute, runWithFallback } from "../src/scheduler.mjs";
import { applyManifestToOpts, preloadDone, readManifest, writeAtomic, writeManifest } from "../src/run-store.mjs";
import { performInit } from "../src/init.mjs";
import { localDate, parseWorkDate, pmPrompt, plannerPrompt } from "../src/prompts.mjs";
import { buildArgs, runCli } from "../src/runner.mjs";
import { resolveTimeout, validateTimeout } from "../src/timeout.mjs";

function parseArgs(argv) {
  // explicit = flag ที่ผู้ใช้พิมพ์เอง — ตอน resume ค่าที่ระบุเองชนะค่าจาก manifest เสมอ
  const opts = { goal: "", goalFile: "", dryRun: false, planFile: "", resume: "", list: false, init: false, target: "", agent: "", plannerTier: "", maxParallel: 0, cwd: "", timeoutSec: 0, write: false, config: "", date: "", explicit: new Set() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--goal": opts.goal = argv[++i] ?? ""; opts.explicit.add("goal"); break;
      case "--goal-file": opts.goalFile = argv[++i] ?? ""; opts.explicit.add("goalFile"); break;
      case "--dry-run": opts.dryRun = true; break;
      case "--plan-file": opts.planFile = argv[++i] ?? ""; opts.explicit.add("planFile"); break;
      case "--resume": opts.resume = argv[++i] ?? ""; opts.explicit.add("resume"); break;
      case "--list": opts.list = true; break;
      case "--init": opts.init = true; break;
      case "--target": opts.target = argv[++i] ?? ""; opts.explicit.add("target"); break;
      case "--agent": opts.agent = argv[++i] ?? ""; opts.explicit.add("agent"); break;
      case "--planner-tier": opts.plannerTier = argv[++i] ?? ""; opts.explicit.add("plannerTier"); break;
      case "--max-parallel": opts.maxParallel = Number(argv[++i]) || 0; opts.explicit.add("maxParallel"); break;
      case "--cwd": opts.cwd = argv[++i] ?? ""; opts.explicit.add("cwd"); break;
      case "--timeout": opts.timeoutSec = validateTimeout(Number(argv[++i])); opts.explicit.add("timeoutSec"); break;
      case "--write": opts.write = true; opts.explicit.add("write"); break;
      case "--config": opts.config = argv[++i] ?? ""; opts.explicit.add("config"); break;
      case "--date":
        try { opts.date = parseWorkDate(argv[++i]); } catch (e) { console.error(e.message); process.exit(2); }
        opts.explicit.add("date"); break;
      default:
        console.error(`อาร์กิวเมนต์ไม่รู้จัก: ${a}\nใช้: baan [--list] [--init] [--config <file>] [--target <name>] --goal "..." [--goal-file <f>] [--dry-run] [--agent <a>] [--planner-tier <t>] [--plan-file <f>] [--resume <runDir>] [--cwd <dir>] [--max-parallel <n>] [--timeout <sec>] [--date YYYY-MM-DD] [--write]`);
        process.exit(2);
    }
  }
  return opts;
}

function printWorkspace(ws) {
  console.log(`config   : ${ws.source ?? "(ไม่พบ config ของ workspace — ใช้ default ในโค้ด · วางที่ <ราก workspace>\\baan.config.json หรือใช้ --config · ตัวอย่าง: baan.example.json)"}`);
  console.log(`main_root : ${ws.main_root || "(ไม่ได้ตั้ง)"}`);
  for (const kr of ws.knowledge_roots) {
    console.log(`knowledge : ${kr.name} → ${kr.path}`);
    for (const tg of kr.targets ?? []) console.log(`   target : ${tg.name} → ${tg.path}${existsSync(tg.path) ? "" : "  (path ไม่มีจริง!)"}`);
  }
  const d = ws.defaults;
  console.log(`defaults : agent=${d.agent} · planner_tier=${d.planner_tier} · timeout=${d.timeout_sec}s · max_parallel=${d.max_parallel}`);
}

// ขั้นต้นทางหนึ่งขั้น (PM/planner) — สลับตัวถัดไปตามลำดับ fallback ของ tier เมื่อติดโควตา/limit
export async function callStageWithFallback(cfg, opts, runDir, tier, fileName, promptText, runner = runCli) {
  const answerFile = path.join(runDir, fileName);
  const { r, agent } = await runWithFallback(
    fallbackChainFor(cfg, tier, opts.agent),
    (agent) => {
      const def = cfg.agents[agent];
      const conf = cfg.tiers[tier]?.[agent] ?? {};
      const args = buildArgs(def, conf.model ?? "", conf.effort ?? "", false, answerFile, opts.workspaceRoot);
      if (def.promptVia === "arg") args.push(promptText);
      return runner(def, args, def.promptVia, promptText, opts.cwd, resolveTimeout(opts, cfg.tiers[tier]), def.answerFrom === "answerFile" ? answerFile : undefined);
    },
    (from, to) => console.log(`[${fileName.split(".")[0]}] ${from} ติดโควตา/limit — สลับไป ${to} (ตามลำดับ fallback ของ tier ${tier})`),
  );
  return { r, agent, answerFile };
}

async function main() {
  let opts;
  try { opts = parseArgs(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(2); }
  let ws;
  try {
    ws = loadWorkspace(resolveWorkspaceConfig(opts.config || null));
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
  const cfg = loadAgentsConfig();
  cfg.roleNames = listRoles().map((r) => r.name);
  // รากของ workspace (จาก config เดียวกับที่โหลดไป) — ให้ runner ส่ง --add-dir ให้ agy โหมดอ่าน อ่าน knowledge/ นอก cwd ได้
  opts.workspaceRoot = workspaceRootOf(opts.config || null);

  opts.agent = opts.agent || ws.defaults.agent;
  opts.plannerTier = opts.plannerTier || ws.defaults.planner_tier;
  if (!opts.explicit.has("timeoutSec")) opts.timeoutSec = ws.defaults.timeout_sec;
  opts.maxParallel = opts.maxParallel || ws.defaults.max_parallel;
  // วันที่ไม่คืนจาก manifest ตอน resume — งานที่รันวันนี้ต้องลง Change Log ด้วยวันที่รันจริง
  opts.date = opts.date || localDate();
  if (!Number.isInteger(opts.maxParallel) || opts.maxParallel < 1 || opts.maxParallel > 64) { console.error(`--max-parallel ต้องเป็นจำนวนเต็ม 1–64 (ได้: ${opts.maxParallel})`); process.exit(2); }

  if (opts.resume && opts.planFile) { console.error("ใช้ --resume กับ --plan-file พร้อมกันไม่ได้ — resume ใช้แผนใน run เดิมอยู่แล้ว"); process.exit(2); }
  if (opts.resume && (opts.explicit.has("goal") || opts.goalFile)) console.log("(--goal/--goal-file ถูกละเว้น — resume ใช้ goal จาก run เดิม)");

  // คืนบริบท run เดิม (target/cwd/write/projectCtx) จาก manifest ก่อนแกะ target/cwd —
  // ไม่คืนแล้ว resume จะทำงานที่โฟลเดอร์ package ซึ่งอาจอ่าน/เขียนผิดโปรเจกต์
  let runDir = "";
  if (opts.resume) {
    runDir = path.resolve(opts.resume);
    if (!existsSync(runDir)) { console.error(`ไม่พบ run directory: ${runDir}`); process.exit(2); }
    if (!existsSync(path.join(runDir, "plan.json"))) { console.error(`ไม่พบ plan.json ใน ${runDir} — ไม่ใช่ run directory ของ pipeline`); process.exit(2); }
    const manifest = readManifest(runDir);
    if (!manifest) console.log(`(run เดิมไม่มี run.json — เป็น run ก่อน v0.3.0 จะไม่คืน target/cwd/write อัตโนมัติ)`);
    else {
      try { applyManifestToOpts(opts, manifest, console.log); } catch (e) { console.error(e.message); process.exit(2); }
    }
  }

  let projectCtx = opts.projectCtx ?? "";
  if (opts.target) {
    const hit = resolveTarget(ws, opts.target);
    if (!hit) {
      const all = ws.knowledge_roots.flatMap((kr) => (kr.targets ?? []).map((tg) => `${kr.name}/${tg.name}`));
      console.error(`ไม่พบ target: ${opts.target}\nที่มี: ${all.join(", ") || "(ไม่มี)"}${ws.source ? `\nconfig: ${ws.source}` : `\nไม่พบ config ของ workspace — เรียกจากภายใน workspace ที่มี baan.config.json หรือใช้ --config <file> (ตัวอย่าง: baan.example.json)`}`);
      process.exit(2);
    }
    if (!existsSync(hit.target.path)) { console.error(`path ของ target ไม่มีจริง: ${hit.target.path}`); process.exit(2); }
    projectCtx = [
      `- โปรเจกต์เป้าหมาย (code): ${hit.target.name} — ${hit.target.path}`,
      `- ที่เก็บเอกสาร (knowledge): ${hit.knowledgeRoot.name} — ${hit.knowledgeRoot.path}`,
      "- role ที่ทำงานเกี่ยวกับโค้ดให้อ่าน/แก้ในโปรเจกต์เป้าหมาย · role ที่ผลิตเอกสารให้อิงโครงสร้างของที่เก็บเอกสาร (ถ้า task ระบุ)",
    ].join("\n");
    opts.cwd = path.resolve(hit.target.path);
  }
  opts.cwd = opts.cwd ? path.resolve(opts.cwd) : TEAM_DIR;
  if (opts.resume && !opts.explicit.has("cwd") && !opts.target && !readManifest(runDir)?.cwd) {
    console.warn(`⚠ resume โดยไม่มี --cwd/--target และ run เดิมไม่มี manifest — จะทำงานที่ ${opts.cwd} (โฟลเดอร์ package) ซึ่งอาจไม่ใช่โปรเจกต์เป้าหมายของ run เดิม`);
  }
  opts.projectCtx = projectCtx;

  console.log(`🏗️ นายช่าง — ผู้คุมทีม AI (คุม ${cfg.roleNames.length} role)${opts.target ? ` · target: ${opts.target}` : ""}`);

  // --init: ติดตั้งลง workspace ครั้งเดียว — config + CLAUDE.md/AGENTS.md ให้ session สวมบทเอง
  if (opts.init) {
    console.log(`ติดตั้ง นายช่าง ลง workspace นี้: ${process.cwd()}`);
    performInit(process.cwd(), TEAM_DIR);
    console.log(`\nเสร็จแล้ว — เปิด AI session ที่ ${process.cwd()} ได้เลย มันจะสวมบท นายช่าง เอง ไม่ต้องพิมพ์คำสั่งสวมบทอีก`);
    return;
  }

  if (opts.list) {
    printWorkspace(ws);
    console.log(`cwd      : ${opts.cwd}`);
    console.log("roles    :");
    console.log(roleListText(listRoles()));
    console.log("tiers (agents.json):");
    console.log(tierMatrixText(cfg.tiers, cfg.agents));
    return;
  }

  if (opts.resume || opts.planFile) {
    let plan;
    try {
      if (opts.resume) {
        plan = validateAndFixPlan(JSON.parse(readFileSync(path.join(runDir, "plan.json"), "utf8")), cfg, opts);
        opts.goal = plan.goal ?? opts.goal;
        console.log(`ต่อจากแผนเดิม: ${path.join(runDir, "plan.json")}`);
        if (!readManifest(runDir)) writeManifest(runDir, opts); // backfill ให้รอบ resume ถัดไปมีบริบท
      } else {
        plan = validateAndFixPlan(JSON.parse(readFileSync(opts.planFile, "utf8")), cfg, opts);
        opts.goal = plan.goal ?? opts.goal;
        const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
        runDir = path.join(REPORTS_DIR, `pipeline-${stamp}`);
        mkdirSync(runDir, { recursive: true });
        writeManifest(runDir, opts);
        writeAtomic(path.join(runDir, "plan.json"), JSON.stringify({ goal: opts.goal, target: opts.target || null, ...plan }, null, 2));
        console.log(`โหลดแผนจาก ${opts.planFile}`);
      }
    } catch (e) {
      console.error(`แผนไม่ผ่าน validation หรืออ่านไม่ได้: ${e.message}`);
      process.exit(1);
    }
    const done = opts.resume ? preloadDone(runDir, plan) : new Map(); // plan-file = run ใหม่ ไม่มีของเก่าให้ preload
    printPlan(plan);
    const { ok } = await execute(plan, opts, runDir, cfg, done);
    process.exitCode = ok ? 0 : 1;
    return;
  }

  let goal = opts.goal;
  if (!goal && opts.goalFile) goal = readFileSync(opts.goalFile, "utf8");
  goal = (goal ?? "").trim();
  if (!goal) { console.error('ระบุเป้าหมายผ่าน --goal "..." หรือ --goal-file <path> หรือ --resume <runDir>'); process.exit(2); }
  opts.goal = goal;
  if (!(opts.agent in cfg.agents)) { console.error(`agent ไม่รู้จัก: ${opts.agent}`); process.exit(2); }
  if (!(opts.plannerTier in cfg.tiers)) { console.error(`planner tier ไม่รู้จัก: ${opts.plannerTier}`); process.exit(2); }
  if (cfg.tiers[opts.plannerTier]?.[opts.agent] === null) { console.error(`planner ใช้ ${opts.agent} ไม่ได้ใน tier ${opts.plannerTier} (null)`); process.exit(2); }

  const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
  runDir = path.join(REPORTS_DIR, `pipeline-${stamp}`);
  mkdirSync(runDir, { recursive: true });
  writeManifest(runDir, opts); // บันทึกบริบทก่อนเรียก provider ใดๆ — crash กลางทางก็ resume ได้ครบ

  console.log(`[pm] ${opts.agent} @ t2 รับ goal แล้วเขียนคำมอบหมาย...`);
  const pm = await callStageWithFallback(cfg, opts, runDir, "t2", "pm.answer.txt", pmPrompt(goal, projectCtx, opts.date));
  const pmDirective = pm.r.answer || "(PM ไม่ตอบ — planner ใช้ goal ตรงๆ)";
  writeAtomic(pm.answerFile, pmDirective);
  console.log(`[pm] ${pm.agent} คำมอบหมาย: ${pmDirective.split("\n")[0].slice(0, 100)}...`);

  console.log(`[planner] ${opts.agent} @ ${opts.plannerTier} กำลังวางแผน...`);
  const p = await callStageWithFallback(cfg, opts, runDir, opts.plannerTier, "planner.answer.txt", plannerPrompt(pmDirective, goal, cfg, projectCtx, opts.date));
  writeAtomic(p.answerFile, p.r.answer);
  if (!p.r.ok) { console.error(`planner ล้มเหลว: exit=${p.r.exitCode} ${p.r.error} (agent สุดท้าย: ${p.agent})`); process.exit(1); }
  let plan;
  try {
    plan = validateAndFixPlan(extractJson(p.r.answer), cfg, opts);
  } catch (e) {
    console.error(`แผนจาก planner ใช้ไม่ได้: ${e.message}\nดูผลดิบที่ ${p.answerFile}`);
    process.exit(1);
  }
  writeAtomic(path.join(runDir, "plan.json"), JSON.stringify({ goal, target: opts.target || null, ...plan }, null, 2));

  printPlan(plan);
  const { ok } = await execute(plan, opts, runDir, cfg, new Map());
  process.exitCode = ok ? 0 : 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e); process.exitCode = 1; });
}
