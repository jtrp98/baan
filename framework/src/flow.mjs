import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { collectWorkspaceAddDirs, resolveModules, resolveTarget, TEAM_DIR } from "./config.mjs";
import { resolveRoleRoute } from "./routing.mjs";
import { roleSessionHeader } from "./role-guard.mjs";
import { createWindowSlotPool, MAX_GRID_WINDOWS, runInteractiveWindow } from "./window-launcher.mjs";
import { createPackageWorktree, lockWorktree, removePackageWorktree } from "./worktree.mjs";
import { lock, repoLock } from "./repolock.mjs";
import { changedFiles, matches, snapshot } from "./snapshot.mjs";
import { lintKnowledge, updateIndexes } from "./knowledge-index.mjs";
import {
  appendWaveFile,
  refreshTestPlanIndex,
  refreshWaveIndex,
  scanTestPlans,
  scanWaves,
  setArtifactStatus,
  verifyLockedArtifacts,
} from "./flow-lock.mjs";
import {
  applyStepResult,
  loadFlowState,
  lockDoneArtifacts,
  recordGateApproval,
  recordTicketAnswer,
  saveFlowState,
  STAGE_ROLE_MAP,
  startNewRound,
} from "./flow-state.mjs";
import { save } from "./store.mjs";
import { runFlowStepJob } from "../bin/flow-step-runner.mjs";

const FLOW_STEP_RUNNER_BIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "bin", "flow-step-runner.mjs");

const STAGE_SKILL = {
  spec: "req-grill",
  knowledge_restructure: "project-survey",
  arch_survey: "project-survey",
  arch_design: "project-survey",
  dba: "",
  pm: "wave-plan",
  build: "",
  testplan: "wave-plan",
  check: "bug-fix",
};

const WRITE_STAGES = new Set([
  "spec",
  "knowledge_restructure",
  "arch_survey",
  "arch_design",
  "dba",
  "pm",
  "build",
  "testplan",
  "check",
]);

function resolveFlowModule(ws, o) {
  if (!o.module) {
    throw new Error("ต้องระบุ --module <project>/<module> เช่น --module school-bot/quiz");
  }
  const mods = resolveModules(ws, o.module);
  const mod = mods[0];
  const explicitTarget = o.target ? resolveTarget(ws, o.target) : null;
  if (o.target && !explicitTarget) throw new Error(`unknown target ${o.target}`);
  const targetObj = explicitTarget?.target ?? mod.target ?? null;
  const targetRepo = path.resolve(o.cwd || targetObj?.path || mod.dir);
  return { mod, targetObj, targetRepo };
}

function summarizeFlowStatus(state, mod) {
  const waves = scanWaves(mod.dir);
  const testPlans = scanTestPlans(mod.dir);
  const integrity = verifyLockedArtifacts(mod.dir, state.lockedFiles);
  let nextAction = "run: baan flow start";
  if (!integrity.ok) {
    nextAction = `IMMUTABLE_ARTIFACT_VIOLATION: ${integrity.violations.map((v) => v.relPath).join(", ")}`;
  } else if (state.openTickets?.length) {
    nextAction = `answer ${state.openTickets.length} open ticket(s) via: baan flow answer --module ${mod.project.name}/${mod.module} --ticket <id> --answer <text> --by user --source <ref>`;
  } else if (state.pendingGate) {
    nextAction = `approve gate ${state.pendingGate} via: baan flow approve --module ${mod.project.name}/${mod.module} --gate ${state.pendingGate} --by user --decision <text> --source <ref>`;
  } else if (state.stage === "completed") {
    nextAction = `completed (round ${state.round}) — start next iteration with: baan flow next --module ${mod.project.name}/${mod.module} --goal "<new goal>"`;
  }
  return {
    project: mod.project.name,
    module: mod.module,
    moduleDir: mod.dir,
    round: state.round,
    goal: state.goal,
    deltaMode: Boolean(state.deltaMode),
    stage: state.stage,
    status: state.status,
    waitingReason: state.waitingReason,
    pendingGate: state.pendingGate,
    hasDbChanges: Boolean(state.hasDbChanges),
    knowledgeImpact: state.knowledgeImpact,
    repairRound: state.repairRound,
    openTickets: state.openTickets ?? [],
    resolvedTicketsCount: state.resolvedTickets?.length ?? 0,
    waves: waves.map((w) => ({ id: w.id, title: w.title, status: w.status, round: w.round, file: w.relPath })),
    testPlans: testPlans.map((t) => ({ id: t.id, title: t.title, status: t.status, round: t.round, file: t.relPath })),
    lockedCount: Object.keys(state.lockedFiles ?? {}).length,
    integrityOk: integrity.ok,
    ...(integrity.ok ? {} : { integrityViolations: integrity.violations }),
    lastError: state.lastError,
    nextAction,
  };
}

function buildStageInstructions(stage, role, state, mod, targetRepo, { wave = null, subTask = null, repairTests = [] } = {}) {
  const skillName = STAGE_SKILL[stage];
  const roleFile = path.join(TEAM_DIR, "roles", `${role}.md`);
  const convFile = path.join(TEAM_DIR, "CONVENTIONS.md");
  const skillFile = skillName ? path.join(TEAM_DIR, "skills", skillName, "SKILL.md") : "";
  const schemaPath = path.join(TEAM_DIR, "schemas", "flow-step.result.json");
  const modIndex = path.join(mod.dir, "INDEX.md");

  const stageDirectives = {
    spec: [
      "1. อ่าน module INDEX, shared/requirements/, shared/oq/ และคำตอบจาก resolvedTickets ด้านล่าง",
      state.deltaMode
        ? "2. โหมด Delta (Round > 1): อ่านเฉพาะ INDEX.md, contracts/, และสรุป test-plan เดิมเพื่อประเมินผลกระทบของการปรับปรุงใหม่"
        : "2. ใช้ทักษะ req-grill สัมภาษณ์เก็บ requirement (ในโหมด Ticket & Close: หากยังขาดข้อมูลให้รวบคำถามเป็น tickets ใน JSON แล้วส่ง status: 'needs_input' — ห้ามถามใน terminal ตรงๆ)",
      "3. ประเมินความเป็นไปได้คร่าวๆ (feasibility), จัดหมวดเข้าโมดูล, และตรวจ knowledge_impact (ถ้ากระทบโครงสร้าง Knowledge ให้ระบุ knowledge_impact.required=true + plan + affected_paths)",
      "4. เขียน shared/requirements/ และ INDEX เมื่อได้ข้อมูลครบแล้วคืน status: 'done'",
    ],
    knowledge_restructure: [
      `1. ปฏิบัติตามแผน Knowledge Restructure: ${state.knowledgeImpact?.plan || "(ตามที่อนุมัติ)"}`,
      "2. รักษา ID เดิมใน shared/id-map.md, ห้ามแก้ไฟล์ wave/test-plan ที่ done แล้ว (ให้ mark superseded แล้วสร้างไฟล์ใหม่ต่อท้ายแทน)",
      "3. หลังปรับโครงสร้างเสร็จ คืน status: 'done' พร้อม artifacts_written",
    ],
    arch_survey: [
      "1. รอบที่ 1 ของ SA: ทำ /plan กำหนดจุดสำรวจโค้ดจริงและ DB schema ปัจจุบันใน targetRepo",
      "2. สำรวจโค้ดจริง API routes, services, data flow, dependencies และบันทึกสถานะปัจจุบันลง build/contracts/ ใน Knowledge",
      "3. ห้ามแก้โค้ด implementation ใน targetRepo; คืน status: 'done' เมื่อบันทึกการสำรวจลง Knowledge เรียบร้อย",
    ],
    arch_design: [
      "1. รอบที่ 2 ของ SA: ทำ /plan วิเคราะห์ออกแบบระบบจากข้อมูลสำรวจรอบ 1 และ shared/requirements/",
      "2. กติกา Ticket (ห้ามถามไปคิดไป): วิเคราะห์ให้ครบแล้วรวบรวมคำถามเชิง Business Logic ทั้งหมดส่งกลับมาเป็น tickets ชุดเดียว (to: 'spec') พร้อม status: 'needs_input' หากยังมีจุดต้องตัดสิน",
      "3. บันทึก ADR ใน <project>/shared/adr/ และ API/State contracts ใน build/contracts/; หากมีการเปลี่ยนฐานข้อมูลให้ตั้ง has_db_changes=true และเขียน DBML ลง build/db/",
    ],
    dba: [
      "1. อ่าน DBML ที่ SA สร้างใน build/db/ พร้อม shared/requirements/ และ schema เดิมใน targetRepo",
      "2. ตรวจสอบ Normalization, Indexes, Constraints, Foreign Keys, Idempotency และความปลอดภัยของ Migration + Rollback Plan",
      "3. เขียนไฟล์ .sql / migration scripts และอัปเดต build/db/INDEX.md (ห้ามรัน SQL กับฐานข้อมูลจริง)",
    ],
    pm: [
      "1. อ่าน build/contracts/, build/db/, shared/requirements/ และ build/waves/INDEX.md",
      "2. ทำ /plan แตกงานเป็น Waves (wave-001.md, wave-002.md, ...) ตามทักษะ wave-plan และอัปเดต build/waves/INDEX.md",
      "3. กฎเหล็ก Immutable History: ห้ามแก้ไขไฟล์ wave ที่ status=done แล้ว; หากกระทบแผนเดิมที่เริ่มทำไปแล้วให้ mark superseded + สร้าง wave ใหม่ต่อท้าย; แยกงานย่อยที่ owns ไม่ทับกันใส่ ```json baan-wave``` เพื่อเปิดขนานได้สูงสุด 4 หน้าต่าง",
    ],
    build: repairTests.length ? [
      `1. โหมด Repair Wave (รอบซ่อม ${state.repairRound}/${state.maxRepairRounds}): อ่านเฉพาะ test cases ที่พังด้านล่าง, error log, และไฟล์ที่เกี่ยวข้อง (ไม่ต้องอ่านใหม่ทั้ง repo)`,
      "2. ทำ /plan แก้โค้ดเฉพาะในขอบเขต owns ของ wave นี้พร้อมเพิ่ม/อัปเดต unit tests และรันคำสั่ง build/test ให้ผ่าน",
      "3. หากพบว่าต้นเหตุผิดที่ Requirement / DB Schema / Architecture ให้คืน status: 'escalate_upstream' พร้อม upstream_issue",
    ] : [
      `1. ทำงาน Wave ${wave?.id || ""} ${subTask ? `(Subtask: ${subTask.id})` : ""}`,
      "2. ทำ /plan ก่อนแก้โค้ด, แก้ไขเฉพาะในขอบเขต owns, เขียน unit test ของตัวเอง, และรัน build/test ให้ผ่าน",
      "3. ห้ามแก้ไขไฟล์ wave/test-plan ที่ล็อกไว้; หากพบปัญหาต้นน้ำให้คืน status: 'escalate_upstream'",
    ],
    testplan: [
      "1. อ่าน shared/requirements/, build/contracts/, build/db/, build/waves/ และชุด automated tests เดิมใน targetRepo",
      "2. ทำ /plan แตกแผนทดสอบระดับ System/Integration/E2E เป็นโฟลเดอร์ build/test-plan/ (INDEX.md + TP-001.md...) ตามทักษะ wave-plan",
      "3. กฎเหล็ก Immutable History: ห้ามแก้ไฟล์ TP ที่ done แล้ว; หากกระทบแผนเดิมให้ mark superseded แล้วสร้างไฟล์ TP ใหม่ต่อท้าย",
    ],
    check: [
      "1. อ่านแผนทดสอบทั้งหมดใน build/test-plan/ และ automated tests เดิมใน targetRepo",
      "2. เขียนหรืออัปเดต Automated Tests เฉพาะใน test files ตามแผนที่วางไว้ (ห้ามแก้โค้ด production) แล้วสั่งรันทดสอบจริง",
      "3. หากมีเคสไม่ผ่าน ให้คืน status: 'failed' พร้อมระบุ failed_tests [{case_id, file, command, error}] เพื่อส่งให้ Dev ซ่อมเฉพาะจุด",
    ],
  };

  const systemPrompt = [
    roleSessionHeader(role),
    "",
    `อ่านสัญญาบทบาท: ${roleFile}`,
    `กติกากลาง: ${convFile}`,
    ...(skillFile ? [`ทักษะประจำขั้น: ${skillFile}`] : []),
    `Output Schema: ${schemaPath}`,
    "",
    "กฎบังคับของ baan flow:",
    "- ห้ามโต้ตอบถามคนใน terminal โดยตรง ให้ส่งคำถามทั้งหมดผ่าน JSON field `tickets` แล้วจบการทำงาน",
    "- ห้ามแก้ไขไฟล์ใน build/waves/ หรือ build/test-plan/ ที่มี status เป็น done, superseded หรือ cancelled",
    "- ตอบท้ายสุดเป็น JSON ตรงตาม flow-step.result.json เท่านั้น",
  ].join("\n");

  const contextBlock = {
    project: mod.project.name,
    module: mod.module,
    moduleDir: mod.dir,
    moduleIndex: modIndex,
    targetRepo,
    round: state.round,
    deltaMode: Boolean(state.deltaMode),
    stage,
    goal: state.goal,
    resolvedTickets: state.resolvedTickets ?? [],
    ...(wave ? { activeWave: { id: wave.id, title: wave.title, file: wave.file, owns: wave.owns, commands: wave.commands } } : {}),
    ...(subTask ? { activeSubTask: subTask } : {}),
    ...(repairTests.length ? { failedTestsToRepair: repairTests } : {}),
  };

  const userPrompt = [
    `# BAAN FLOW STEP: ${stage} (role: ${role}, round: ${state.round})`,
    "",
    "## ขั้นตอนที่ต้องทำ",
    ...(stageDirectives[stage] ?? []),
    "",
    "## บริบทงาน (Context JSON)",
    "```json",
    JSON.stringify(contextBlock, null, 2),
    "```",
    "",
    "เมื่อทำงานเสร็จ ให้ตอบกลับเป็น JSON object เพียงชุดเดียวตาม flow-step.result.json (status, summary, artifacts_written, tickets, knowledge_impact, has_db_changes, failed_tests).",
  ].join("\n");

  return { systemPrompt, userPrompt };
}

function buildStepJob({ ws, cfg, local, root, mod, targetRepo, state, stage, runId, runDir, slot = 0, wave = null, subTask = null, repairTests = [], opts = {} }) {
  const role = STAGE_ROLE_MAP[stage];
  const explicitAgent = opts.agent || null;
  if (explicitAgent && !cfg.agents?.[explicitAgent]) throw new Error(`unknown agent ${explicitAgent}`);
  const route = resolveRoleRoute(cfg, role, {
    forcedAgent: explicitAgent,
    tier: opts.tier || null,
    localConfig: local,
  });
  const stepSuffix = subTask?.id || wave?.id || stage;
  const stepId = `r${state.round}-${stage}-${stepSuffix}-${randomUUID().slice(0, 6)}`;
  const { systemPrompt, userPrompt } = buildStageInstructions(stage, role, state, mod, targetRepo, { wave, subTask, repairTests });

  const promptFile = path.join(runDir, `${stepId}.prompt.md`);
  const systemPromptFile = path.join(runDir, `${stepId}.system.md`);
  const answerFile = path.join(runDir, `${stepId}.answer.txt`);
  const resultFile = path.join(runDir, `${stepId}.result.json`);
  const jobFile = path.join(runDir, `${stepId}.job.json`);

  writeFileSync(promptFile, userPrompt + "\n", "utf8");
  writeFileSync(systemPromptFile, systemPrompt + "\n", "utf8");

  const addDirs = collectWorkspaceAddDirs(ws, { repo: { path: targetRepo } }, root);
  const job = {
    runId,
    runDir,
    stepId,
    stage,
    role,
    project: mod.project.name,
    module: mod.module,
    title: `${mod.project.name}/${mod.module} · ${stage}${wave ? ` (${wave.id})` : ""}`,
    agent: route.agent,
    tier: route.tier,
    model: opts.model || route.model || "",
    effort: opts.effort || route.effort || "",
    cwd: targetRepo,
    workspaceRoot: root,
    addDirs,
    promptFile,
    systemPromptFile,
    answerFile,
    resultFile,
    schemaFile: path.join(TEAM_DIR, "schemas", "flow-step.result.json"),
    permissionPolicy: opts["permission-policy"] || (opts["allow-bypass"] ? "bypass" : ws.defaults.permission_policy || "native-safe"),
    timeoutSec: Number(opts.timeout ?? route.timeoutSec ?? ws.defaults.timeout_sec ?? 0),
    writeMode: WRITE_STAGES.has(stage),
    slot,
    waveId: wave?.id ?? null,
    subTaskId: subTask?.id ?? null,
  };
  save(jobFile, job);
  return { job, jobFile, route };
}

async function dispatchStepJob(job, jobFile, opts, options) {
  if (options.stepRunner) {
    return options.stepRunner(job);
  }
  const executionMode = opts["execution-mode"] || (opts.headless ? "headless" : null) || (opts.interactive ? "interactive" : null) || opts.defaultExecutionMode || "interactive";
  if (executionMode === "headless") {
    return runFlowStepJob(job, options);
  }
  await runInteractiveWindow({
    command: process.execPath,
    args: [FLOW_STEP_RUNNER_BIN, jobFile],
    cwd: job.cwd,
    runDir: job.runDir,
    name: job.stepId,
    slot: job.slot ?? 0,
    title: `[BAAN FLOW #${(job.slot ?? 0) + 1}] ${job.title} (${job.role} · ${job.agent} ${job.model || "default"}/${job.effort || "default"})`,
    briefFile: job.promptFile,
    bannerLines: [
      `Flow: ${job.project}/${job.module} | Stage: ${job.stage} | Role: ${job.role} (${job.tier})`,
      `Agent: ${job.agent} (${job.model || "default"}/${job.effort || "default"})`,
      `CWD: ${job.cwd}`,
    ],
    autoCloseBanner: true,
    signal: options.signal,
  });
  if (!existsSync(job.resultFile)) {
    return {
      ok: false,
      failureClass: "ENVIRONMENT_FAILURE",
      error: `หน้าต่าง CLI ของขั้น ${job.stage} ปิดลงโดยไม่ได้เขียนไฟล์ผลลัพธ์ (${job.resultFile})`,
    };
  }
  return JSON.parse(readFileSync(job.resultFile, "utf8"));
}

function syncWorktreeOwnedFiles(worktreePath, targetRepo, beforeSnap, owns = []) {
  const afterSnap = snapshot(worktreePath);
  const changed = changedFiles(beforeSnap, afterSnap);
  const allowed = owns.length ? changed.filter((f) => owns.some((g) => matches(f, g))) : changed;
  for (const rel of allowed) {
    const src = path.join(worktreePath, rel);
    const dest = path.join(targetRepo, rel);
    if (!existsSync(src)) continue;
    mkdirSync(path.dirname(dest), { recursive: true });
    copyFileSync(src, dest);
  }
  return allowed;
}

async function runWaveTasksParallel(tasks, ctx) {
  const { ws, cfg, local, root, mod, targetRepo, state, runId, runDir, wave, opts, options } = ctx;
  const maxParallel = Math.max(1, Math.min(MAX_GRID_WINDOWS, Number(opts["max-parallel"] ?? ws.defaults.max_parallel ?? MAX_GRID_WINDOWS)));
  const slotPool = createWindowSlotPool(maxParallel);
  const useWorktree = Boolean(opts.worktree ?? ws.defaults.worktree);

  const taskResults = [];
  const queue = [...tasks];
  const running = new Set();
  const activeRepoLocks = new Map();
  let stopped = false;

  const acquireRepoOrWorktree = (subTask) => {
    const repo = path.resolve(subTask.repo || targetRepo);
    const canWorktree = useWorktree && tasks.length > 1 && existsSync(path.join(repo, ".git"));
    if (canWorktree) {
      const wtPath = createPackageWorktree(runDir, `${wave.id}-${subTask.id}`, repo);
      const release = lockWorktree(root, wtPath);
      const beforeSnap = snapshot(wtPath);
      return { workRepo: wtPath, baseRepo: repo, isWorktree: true, beforeSnap, release };
    }
    const release = existsSync(path.join(repo, ".git")) ? repoLock(root, repo) : lock(root, `repo:${path.resolve(repo)}`);
    return { workRepo: repo, baseRepo: repo, isWorktree: false, beforeSnap: null, release };
  };

  await new Promise((resolve) => {
    const launchNext = () => {
      if (stopped || (queue.length === 0 && running.size === 0)) {
        if (running.size === 0) resolve();
        return;
      }
      while (!stopped && running.size < maxParallel && queue.length > 0) {
        const idx = queue.findIndex((t) => {
          const repo = path.resolve(t.repo || targetRepo);
          const canWt = useWorktree && tasks.length > 1 && existsSync(path.join(repo, ".git"));
          return canWt || !activeRepoLocks.has(repo);
        });
        if (idx === -1) break;
        const [subTask] = queue.splice(idx, 1);
        const repoKey = path.resolve(subTask.repo || targetRepo);
        const slot = slotPool.acquire();
        let lease;
        try {
          lease = acquireRepoOrWorktree(subTask);
        } catch (e) {
          slotPool.release(slot);
          taskResults.push({ subTask, outcome: { ok: false, failureClass: e.failureClass || "ENVIRONMENT_FAILURE", error: e.message } });
          stopped = true;
          if (running.size === 0) resolve();
          return;
        }
        if (!lease.isWorktree) activeRepoLocks.set(repoKey, true);

        const p = (async () => {
          try {
            const { job, jobFile } = buildStepJob({
              ws, cfg, local, root, mod,
              targetRepo: lease.workRepo,
              state,
              stage: "build",
              runId,
              runDir,
              slot,
              wave,
              subTask,
              opts,
            });
            const outcome = await dispatchStepJob(job, jobFile, opts, options);
            if (outcome?.ok && outcome.result?.status === "done" && lease.isWorktree) {
              syncWorktreeOwnedFiles(lease.workRepo, lease.baseRepo, lease.beforeSnap, subTask.owns ?? wave.owns ?? []);
              removePackageWorktree(runDir, `${wave.id}-${subTask.id}`, lease.baseRepo);
            }
            taskResults.push({ subTask, outcome });
            if (!outcome?.ok || outcome.result?.status !== "done") stopped = true;
          } finally {
            if (!lease.isWorktree) activeRepoLocks.delete(repoKey);
            lease.release?.();
            slotPool.release(slot);
            running.delete(p);
            launchNext();
          }
        })();
        running.add(p);
      }
    };
    launchNext();
  });

  return taskResults;
}

async function runBuildWavesStage(ctx) {
  const { ws, cfg, local, root, mod, targetRepo, state, runId, runDir, opts, options } = ctx;

  if (state.repairPending && state.lastFailedTests?.length) {
    const repairId = `wave-fix-${state.round}-${state.repairRound}`;
    const created = appendWaveFile(mod.dir, {
      id: repairId,
      title: `Repair failing QA tests (Round ${state.round}.${state.repairRound})`,
      status: "running",
      round: state.round,
      kind: "bugfix",
      target: mod.targetName || "",
      owns: [...new Set(state.lastFailedTests.map((f) => f.file).filter(Boolean))],
      body: state.lastFailedTests.map((f) => `- **${f.case_id}** (${f.file || "-"}): ${f.error}`).join("\n"),
    }, state);
    saveFlowState(mod.dir, state);

    const wave = scanWaves(mod.dir).find((w) => w.id === created.id);
    const { job, jobFile } = buildStepJob({
      ws, cfg, local, root, mod, targetRepo, state,
      stage: "build", runId, runDir, slot: 0, wave, repairTests: state.lastFailedTests, opts,
    });
    const outcome = await dispatchStepJob(job, jobFile, opts, options);
    if (!outcome?.ok) {
      return outcome;
    }
    if (outcome.result.status === "done") {
      setArtifactStatus(mod.dir, created.relPath, "done", {}, state);
      refreshWaveIndex(mod.dir);
    }
    applyStepResult(state, "build", outcome.result, { moduleDir: mod.dir });
    saveFlowState(mod.dir, state);
    return { ok: true };
  }

  for (;;) {
    const waves = scanWaves(mod.dir);
    const doneIds = new Set(waves.filter((w) => ["done", "superseded", "cancelled"].includes(w.status)).map((w) => w.id));
    const pendingWaves = waves.filter((w) => ["pending", "running"].includes(w.status));
    if (!pendingWaves.length) {
      if (!waves.length) {
        return { ok: false, failureClass: "BLOCKED", error: "ยังไม่มีไฟล์ Wave ใน build/waves/ — ให้ PM สร้างแผน Wave ก่อน" };
      }
      applyStepResult(state, "build", {
        status: "done",
        summary: `สร้างโค้ดและ unit test ครบ ${waves.filter((w) => w.status === "done").length} wave แล้ว`,
        artifacts_written: [],
        tickets: [],
        knowledge_impact: { required: false, plan: "", affected_paths: [] },
        has_db_changes: false,
        failed_tests: [],
      }, { moduleDir: mod.dir });
      saveFlowState(mod.dir, state);
      return { ok: true };
    }

    const nextWave = pendingWaves.find((w) => w.dependsOn.every((dep) => doneIds.has(dep)));
    if (!nextWave) {
      return { ok: false, failureClass: "BLOCKED", error: "Wave dependencies ติด deadlock หรือรอ wave ที่ยังไม่เสร็จ" };
    }

    if (nextWave.status !== "running") {
      setArtifactStatus(mod.dir, nextWave.relPath, "running", {}, state);
      refreshWaveIndex(mod.dir);
      saveFlowState(mod.dir, state);
    }

    const subTasks = nextWave.tasks?.length
      ? nextWave.tasks.map((t, i) => ({
          id: t.id || `T${i + 1}`,
          title: t.title || nextWave.title,
          owns: t.owns ?? nextWave.owns,
          repo: t.repo ? path.resolve(targetRepo, t.repo) : targetRepo,
          commands: t.commands ?? nextWave.commands,
        }))
      : [{ id: nextWave.id, title: nextWave.title, owns: nextWave.owns, repo: targetRepo, commands: nextWave.commands }];

    const results = await runWaveTasksParallel(subTasks, { ...ctx, wave: nextWave });
    const bad = results.find((r) => !r.outcome?.ok || r.outcome.result?.status !== "done");
    if (bad) {
      if (!bad.outcome?.ok) return bad.outcome;
      applyStepResult(state, "build", bad.outcome.result, { moduleDir: mod.dir });
      saveFlowState(mod.dir, state);
      return { ok: true };
    }

    setArtifactStatus(mod.dir, nextWave.relPath, "done", {}, state);
    refreshWaveIndex(mod.dir);
    lockDoneArtifacts(state, mod.dir);
    saveFlowState(mod.dir, state);
  }
}

export async function runFlowCommand(o, ws, cfg, root, local, options = {}) {
  const action = (o.subject || "status").toLowerCase();
  const { mod, targetRepo } = resolveFlowModule(ws, o);
  const state = loadFlowState(mod.dir, {
    project: mod.project.name,
    module: mod.module,
    goal: o.goal || (o["goal-file"] ? readFileSync(o["goal-file"], "utf8").trim() : ""),
  });

  if (action === "status") {
    return summarizeFlowStatus(state, mod);
  }

  if (action === "answer") {
    recordTicketAnswer(state, {
      ticketId: o.ticket,
      answer: o.answer,
      by: o.by,
      source: o.source,
      moduleDir: mod.dir,
    });
    saveFlowState(mod.dir, state);
    return summarizeFlowStatus(state, mod);
  }

  if (action === "approve") {
    recordGateApproval(state, {
      gateId: o.gate,
      decision: o.decision,
      by: o.by,
      source: o.source,
    });
    saveFlowState(mod.dir, state);
    return summarizeFlowStatus(state, mod);
  }

  if (action === "next" || action === "reset-round") {
    startNewRound(state, { goal: o.goal || (o["goal-file"] ? readFileSync(o["goal-file"], "utf8").trim() : "") });
    saveFlowState(mod.dir, state);
    return summarizeFlowStatus(state, mod);
  }

  if (action !== "start") {
    throw new Error(`คำสั่งย่อยของ flow ไม่ถูกต้อง: ${action} (ใช้ start | status | answer | approve | next)`);
  }

  if (o["round-new"]) {
    startNewRound(state, { goal: o.goal || "" });
    saveFlowState(mod.dir, state);
  } else if (o.goal && !state.goal) {
    state.goal = o.goal;
    saveFlowState(mod.dir, state);
  }

  if (o["dry-run"]) {
    const routes = {};
    for (const [stage, role] of Object.entries(STAGE_ROLE_MAP)) {
      const r = resolveRoleRoute(cfg, role, { forcedAgent: o.agent || null, tier: o.tier || null, localConfig: local });
      routes[stage] = { role, agent: r.agent, tier: r.tier, model: r.model, effort: r.effort };
    }
    return {
      ...summarizeFlowStatus(state, mod),
      dryRun: true,
      targetRepo,
      routes,
    };
  }

  const integrityBefore = verifyLockedArtifacts(mod.dir, state.lockedFiles);
  if (!integrityBefore.ok) {
    throw Object.assign(
      new Error(`พบไฟล์ที่ล็อกไว้ถูกแก้ไข: ${integrityBefore.violations.map((v) => v.relPath).join(", ")}`),
      { failureClass: "IMMUTABLE_ARTIFACT_VIOLATION" },
    );
  }

  const runId = `flow-${mod.project.name}-${mod.module}-${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 6)}`;
  const runDir = path.join(root, ".baan", "runs", runId);
  mkdirSync(runDir, { recursive: true });
  const runMeta = {
    version: 2,
    id: runId,
    pid: process.pid,
    root,
    mode: "flow",
    executionMode: o["execution-mode"] || (o.headless ? "headless" : (ws.defaults.execution_mode || "interactive")),
    createdAt: new Date().toISOString(),
    packages: [{ id: `${mod.project.name}/${mod.module}`, title: state.goal || mod.module, state: "running", repo: { path: targetRepo } }],
  };
  save(path.join(runDir, "run.json"), runMeta);

  const opts = { ...o, defaultExecutionMode: ws.defaults.execution_mode || "interactive" };
  try {
    while (state.status === "ready" && state.stage !== "completed") {
      const checkBefore = verifyLockedArtifacts(mod.dir, state.lockedFiles);
      if (!checkBefore.ok) {
        state.status = "blocked";
        state.lastError = `IMMUTABLE_ARTIFACT_VIOLATION: ${checkBefore.violations.map((v) => v.relPath).join(", ")}`;
        saveFlowState(mod.dir, state);
        break;
      }

      const currentStage = state.stage;
      if (currentStage === "build") {
        const res = await runBuildWavesStage({ ws, cfg, local, root, mod, targetRepo, state, runId, runDir, opts, options });
        if (!res.ok) {
          state.status = res.failureClass === "PROVIDER_LIMIT" ? "waiting_human" : "blocked";
          state.waitingReason = res.failureClass || "error";
          state.lastError = res.error;
          saveFlowState(mod.dir, state);
          break;
        }
      } else {
        const { job, jobFile } = buildStepJob({ ws, cfg, local, root, mod, targetRepo, state, stage: currentStage, runId, runDir, slot: 0, opts });
        const outcome = await dispatchStepJob(job, jobFile, opts, options);
        if (!outcome?.ok) {
          state.status = outcome?.failureClass === "PROVIDER_LIMIT" ? "waiting_human" : "blocked";
          state.waitingReason = outcome?.failureClass || "error";
          state.lastError = outcome?.error || `Step ${currentStage} failed`;
          saveFlowState(mod.dir, state);
          break;
        }
        const checkAfter = verifyLockedArtifacts(mod.dir, state.lockedFiles);
        if (!checkAfter.ok) {
          state.status = "blocked";
          state.lastError = `IMMUTABLE_ARTIFACT_VIOLATION: ${checkAfter.violations.map((v) => v.relPath).join(", ")}`;
          saveFlowState(mod.dir, state);
          break;
        }
        if (currentStage === "knowledge_restructure" && outcome.result.status === "done") {
          updateIndexes(mod.knowledgeRoot.path);
          const lint = lintKnowledge(mod.knowledgeRoot.path);
          if (lint.errors.length) {
            state.status = "blocked";
            state.lastError = `knowledge lint failed after restructure: ${lint.errors.join("; ")}`;
            saveFlowState(mod.dir, state);
            break;
          }
        }
        if (currentStage === "pm" && outcome.result.status === "done") {
          refreshWaveIndex(mod.dir);
        }
        if (currentStage === "testplan" && outcome.result.status === "done") {
          refreshTestPlanIndex(mod.dir);
        }
        if (currentStage === "check" && outcome.result.status === "done" && !outcome.result.failed_tests?.length) {
          for (const tp of scanTestPlans(mod.dir)) {
            if (["pending", "running"].includes(tp.status)) {
              setArtifactStatus(mod.dir, tp.relPath, "done", {}, state);
            }
          }
          refreshTestPlanIndex(mod.dir);
        }
        applyStepResult(state, currentStage, outcome.result, { moduleDir: mod.dir });
        saveFlowState(mod.dir, state);
      }
    }
  } finally {
    delete runMeta.pid;
    runMeta.packages[0].state = state.status === "completed" ? "done" : state.status;
    save(path.join(runDir, "run.json"), runMeta);
  }

  return {
    ...summarizeFlowStatus(state, mod),
    runId,
    runDir,
  };
}
