import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { writeAtomic } from "./store.mjs";
import { lockArtifact, scanTestPlans, scanWaves } from "./flow-lock.mjs";

export const FLOW_STAGES = [
  "spec",
  "knowledge_restructure",
  "arch_survey",
  "arch_design",
  "dba",
  "pm",
  "build",
  "testplan",
  "check",
  "completed",
];

export const FLOW_GATES = ["G-SPEC", "G-KB-RESTRUCTURE", "G-ARCH-DBA", "G-WAVES"];

export const STAGE_ROLE_MAP = {
  spec: "spec",
  knowledge_restructure: "arch",
  arch_survey: "arch",
  arch_design: "arch",
  dba: "dba",
  pm: "pm",
  build: "build",
  testplan: "testplan",
  check: "check",
};

export function flowStatePath(moduleDir) {
  return path.join(moduleDir, "build", "flow.json");
}

export function initFlowState(project, moduleName, goal = "") {
  const now = new Date().toISOString();
  return {
    version: 1,
    project,
    module: moduleName,
    round: 1,
    goal,
    deltaMode: false,
    stage: "spec",
    status: "ready",
    waitingReason: null,
    pendingGate: null,
    returnStageAfterSpec: null,
    hasDbChanges: false,
    knowledgeImpact: { required: false, completed: false, plan: "", affected_paths: [] },
    repairRound: 0,
    maxRepairRounds: 2,
    repairPending: false,
    lastFailedTests: [],
    gates: {},
    openTickets: [],
    resolvedTickets: [],
    lockedFiles: {},
    history: [],
    lastError: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function loadFlowState(moduleDir, { project = "", module = "", goal = "" } = {}) {
  const file = flowStatePath(moduleDir);
  if (!existsSync(file)) {
    return initFlowState(project, module, goal);
  }
  const state = JSON.parse(readFileSync(file, "utf8"));
  if (goal && !state.goal) state.goal = goal;
  return state;
}

export function saveFlowState(moduleDir, state) {
  state.updatedAt = new Date().toISOString();
  const file = flowStatePath(moduleDir);
  mkdirSync(path.dirname(file), { recursive: true });
  writeAtomic(file, JSON.stringify(state, null, 2) + "\n");
  return file;
}

function appendTicketToOqFile(moduleDir, ticket) {
  const oqDir = path.join(moduleDir, "shared", "oq");
  mkdirSync(oqDir, { recursive: true });
  const indexFile = path.join(oqDir, "INDEX.md");
  const header = "# Open Questions\n\n| รหัส | คำถาม | ที่มา | ผู้ตัดสิน | สถานะ |\n|---|---|---|---|---|\n";
  let text = existsSync(indexFile) ? readFileSync(indexFile, "utf8") : header;
  if (!text.includes(`| ${ticket.id} |`)) {
    const cleanQ = String(ticket.question ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
    const cleanAns = ticket.answer ? ` (${String(ticket.answer).replace(/\|/g, "\\|").replace(/\r?\n/g, " ")})` : "";
    text = `${text.trimEnd()}\n| ${ticket.id} | ${cleanQ}${cleanAns} | ${ticket.fromStage} | user | ${ticket.answer ? "resolved" : "open"} |\n`;
    writeAtomic(indexFile, text);
  }
}

function updateOqFileResolution(moduleDir, ticket) {
  const indexFile = path.join(moduleDir, "shared", "oq", "INDEX.md");
  if (!existsSync(indexFile)) {
    appendTicketToOqFile(moduleDir, ticket);
    return;
  }
  const lines = readFileSync(indexFile, "utf8").split(/\r?\n/);
  const cleanQ = String(ticket.question ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  const cleanAns = String(ticket.answer ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  let found = false;
  const updated = lines.map((line) => {
    if (line.startsWith(`| ${ticket.id} |`)) {
      found = true;
      return `| ${ticket.id} | ${cleanQ} (${cleanAns}) | ${ticket.fromStage} | ${ticket.answeredBy || "user"} | resolved |`;
    }
    return line;
  });
  if (!found) updated.push(`| ${ticket.id} | ${cleanQ} (${cleanAns}) | ${ticket.fromStage} | ${ticket.answeredBy || "user"} | resolved |`);
  writeAtomic(indexFile, updated.join("\n"));
}

function enqueueTickets(state, stage, tickets, moduleDir = null) {
  for (const t of tickets) {
    if (!t?.id || !t?.question) continue;
    if (state.openTickets.some((x) => x.id === t.id)) continue;
    const rec = {
      id: t.id,
      fromStage: stage,
      to: t.to || "user",
      question: t.question,
      options: Array.isArray(t.options) ? t.options : [],
      context: t.context || "",
      createdAt: new Date().toISOString(),
    };
    state.openTickets.push(rec);
    if (moduleDir) appendTicketToOqFile(moduleDir, rec);
  }
}

export function lockDoneArtifacts(state, moduleDir) {
  if (!moduleDir) return [];
  const locked = [];
  for (const item of [...scanWaves(moduleDir), ...scanTestPlans(moduleDir)]) {
    if (["done", "superseded", "cancelled"].includes(item.status) && !state.lockedFiles?.[item.relPath]) {
      lockArtifact(state, moduleDir, item.relPath);
      locked.push(item.relPath);
    }
  }
  return locked;
}

function handleTestFailures(state, stage, result, moduleDir) {
  const failedTests = Array.isArray(result.failed_tests) ? result.failed_tests : [];
  if (state.repairRound < (state.maxRepairRounds ?? 2)) {
    state.repairRound += 1;
    state.repairPending = true;
    state.lastFailedTests = failedTests;
    state.stage = "build";
    state.status = "ready";
    state.waitingReason = null;
    return state;
  }
  const summaryLines = failedTests.map((f) => `- ${f.case_id}: ${f.error}`).join("\n");
  enqueueTickets(state, stage, [{
    id: `T-REPAIR-${state.round}-${state.repairRound}`,
    to: "user",
    question: `QA Autotest ยังไม่ผ่านหลังซ่อมครบ ${state.maxRepairRounds ?? 2} รอบ:\n${summaryLines || result.summary}`,
    context: "ต้องตัดสินใจว่าจะแก้สเปก/โค้ดต่อหรือปรับ Test Plan",
  }], moduleDir);
  state.status = "waiting_human";
  state.waitingReason = "repair_limit_exceeded";
  return state;
}

export function applyStepResult(state, stage, result, { moduleDir = null } = {}) {
  const now = new Date().toISOString();
  state.history.push({
    round: state.round,
    stage,
    status: result.status,
    summary: result.summary || "",
    artifacts_written: result.artifacts_written ?? [],
    at: now,
  });
  state.lastError = null;
  if (moduleDir) lockDoneArtifacts(state, moduleDir);

  if (result.status === "escalate_upstream") {
    const targetStage = result.upstream_issue?.target_stage || "spec";
    enqueueTickets(state, stage, [{
      id: `T-ESC-${state.round}-${state.openTickets.length + 1}`,
      to: "user",
      question: `พบปัญหาต้นน้ำ (${targetStage}) ระหว่างขั้น ${stage}: ${result.upstream_issue?.reason || result.summary}`,
      context: result.summary || "",
    }], moduleDir);
    state.status = "waiting_human";
    state.waitingReason = "upstream_escalation";
    return state;
  }

  if (result.status === "needs_input" || (Array.isArray(result.tickets) && result.tickets.length > 0)) {
    const hasSpecReturn = stage === "arch_design" && result.tickets.some((t) => t.to === "spec");
    enqueueTickets(state, stage, result.tickets?.length ? result.tickets : [{
      id: `T-${stage.toUpperCase()}-${state.round}-${state.openTickets.length + 1}`,
      to: "user",
      question: result.summary || `ขั้น ${stage} ต้องการข้อมูลเพิ่มเติม`,
    }], moduleDir);
    if (hasSpecReturn) {
      state.returnStageAfterSpec = "arch_design";
      state.stage = "spec";
    }
    state.status = "waiting_human";
    state.waitingReason = "ticket";
    return state;
  }

  if (result.status === "failed") {
    if (stage === "check" && (result.failed_tests?.length > 0 || result.summary)) {
      return handleTestFailures(state, stage, result, moduleDir);
    }
    state.status = "blocked";
    state.lastError = result.summary || `step ${stage} failed`;
    return state;
  }

  // status === "done"
  if (result.knowledge_impact?.required && !state.knowledgeImpact?.completed) {
    state.knowledgeImpact = {
      required: true,
      completed: false,
      plan: result.knowledge_impact.plan || "",
      affected_paths: result.knowledge_impact.affected_paths ?? [],
    };
  }

  switch (stage) {
    case "spec":
      if (state.returnStageAfterSpec) {
        state.stage = state.returnStageAfterSpec;
        state.returnStageAfterSpec = null;
        state.status = "ready";
        state.waitingReason = null;
      } else {
        state.pendingGate = "G-SPEC";
        state.status = "waiting_human";
        state.waitingReason = "gate";
      }
      break;

    case "knowledge_restructure":
      state.knowledgeImpact = { ...(state.knowledgeImpact ?? {}), required: true, completed: true };
      state.stage = "arch_survey";
      state.status = "ready";
      state.waitingReason = null;
      break;

    case "arch_survey":
      state.stage = "arch_design";
      state.status = "ready";
      state.waitingReason = null;
      break;

    case "arch_design":
      state.hasDbChanges = Boolean(result.has_db_changes);
      if (state.knowledgeImpact?.required && !state.knowledgeImpact?.completed) {
        state.pendingGate = "G-KB-RESTRUCTURE";
        state.status = "waiting_human";
        state.waitingReason = "gate";
      } else if (state.hasDbChanges) {
        state.stage = "dba";
        state.status = "ready";
        state.waitingReason = null;
      } else {
        state.pendingGate = "G-ARCH-DBA";
        state.status = "waiting_human";
        state.waitingReason = "gate";
      }
      break;

    case "dba":
      state.pendingGate = "G-ARCH-DBA";
      state.status = "waiting_human";
      state.waitingReason = "gate";
      break;

    case "pm":
      state.pendingGate = "G-WAVES";
      state.status = "waiting_human";
      state.waitingReason = "gate";
      break;

    case "build":
      if (state.repairPending) {
        state.repairPending = false;
        state.lastFailedTests = [];
        state.stage = "check";
      } else {
        state.stage = "testplan";
      }
      state.status = "ready";
      state.waitingReason = null;
      break;

    case "testplan":
      state.stage = "check";
      state.status = "ready";
      state.waitingReason = null;
      break;

    case "check":
      if (Array.isArray(result.failed_tests) && result.failed_tests.length > 0) {
        return handleTestFailures(state, stage, result, moduleDir);
      }
      state.repairRound = 0;
      state.repairPending = false;
      state.lastFailedTests = [];
      state.stage = "completed";
      state.status = "completed";
      state.waitingReason = null;
      break;

    default:
      throw new Error(`unknown flow stage: ${stage}`);
  }
  return state;
}

export function recordTicketAnswer(state, { ticketId, answer, by, source, moduleDir = null }) {
  if (by !== "user") throw new Error("การตอบ Ticket ต้องระบุ --by user");
  if (!source?.trim()) throw new Error("การตอบ Ticket ต้องระบุ --source");
  if (!answer?.trim()) throw new Error("การตอบ Ticket ต้องระบุ --answer");
  const idx = state.openTickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) throw new Error(`ไม่พบ Ticket รหัส ${ticketId}`);
  const [ticket] = state.openTickets.splice(idx, 1);
  const resolved = {
    ...ticket,
    answer: answer.trim(),
    answeredBy: by,
    source: source.trim(),
    resolvedAt: new Date().toISOString(),
  };
  state.resolvedTickets.push(resolved);
  if (moduleDir) updateOqFileResolution(moduleDir, resolved);
  if (state.openTickets.length === 0 && !state.pendingGate) {
    state.status = "ready";
    state.waitingReason = null;
  }
  return state;
}

export function recordGateApproval(state, { gateId, decision, by, source }) {
  if (!FLOW_GATES.includes(gateId)) throw new Error(`unknown gate ${gateId} (ใช้ ${FLOW_GATES.join(", ")})`);
  if (by !== "user") throw new Error("การอนุมัติ Gate ต้องระบุ --by user");
  if (!source?.trim() || !decision?.trim()) throw new Error("การอนุมัติ Gate ต้องระบุ --decision และ --source");
  if (state.openTickets.length > 0) {
    throw new Error(`ยังมี Ticket ค้างอยู่ ${state.openTickets.length} ข้อ — กรุณาตอบ Ticket ก่อนอนุมัติ Gate`);
  }
  state.gates[gateId] = {
    approved: true,
    round: state.round,
    by,
    decision: decision.trim(),
    source: source.trim(),
    approvedAt: new Date().toISOString(),
  };
  state.pendingGate = null;
  state.waitingReason = null;

  switch (gateId) {
    case "G-SPEC":
      if (state.knowledgeImpact?.required && !state.knowledgeImpact?.completed) {
        state.pendingGate = "G-KB-RESTRUCTURE";
        state.status = "waiting_human";
        state.waitingReason = "gate";
      } else {
        state.stage = "arch_survey";
        state.status = "ready";
      }
      break;
    case "G-KB-RESTRUCTURE":
      state.stage = "knowledge_restructure";
      state.status = "ready";
      break;
    case "G-ARCH-DBA":
      state.stage = "pm";
      state.status = "ready";
      break;
    case "G-WAVES":
      state.stage = "build";
      state.status = "ready";
      break;
  }
  return state;
}

export function startNewRound(state, { goal = "" } = {}) {
  state.round = (Number(state.round) || 1) + 1;
  if (goal) state.goal = goal;
  state.deltaMode = true;
  state.stage = "spec";
  state.status = "ready";
  state.waitingReason = null;
  state.pendingGate = null;
  state.returnStageAfterSpec = null;
  state.hasDbChanges = false;
  state.knowledgeImpact = { required: false, completed: false, plan: "", affected_paths: [] };
  state.repairRound = 0;
  state.repairPending = false;
  state.lastFailedTests = [];
  state.gates = {};
  state.lastError = null;
  return state;
}
