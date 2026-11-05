import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { classifyFailure, ENVIRONMENT_FAILURE } from "./failure-class.mjs";

const DIR_STAMP = /^(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/;
const REWORK_HEAD_CHARS = 300;
const REWORK_RE = /rework|re-check|รอบแก้|ตรวจซ้ำ|รันซ้ำ|รอบ ?2|r1|r2/i;

export function dirStartMs(name) {
  const m = DIR_STAMP.exec(name);
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) : null;
}

export function loadReports(dir) {
  const rows = [];
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name, "report.json");
    if (!existsSync(file) || !statSync(path.join(dir, name)).isDirectory()) continue;
    let r;
    try { r = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
    const reportStart = r.startedAt ? Date.parse(r.startedAt) : dirStartMs(name);
    for (const x of r.results ?? []) {
      const state = x.state ?? (x.ok ? "completed" : "failed");
      const start = x.startedAt && (r.results ?? []).length > 1 ? Date.parse(x.startedAt) : reportStart;
      rows.push({
        dir: name,
        role: r.role ?? "adhoc",
        tier: r.tier ?? null,
        mode: r.mode ?? null,
        taskIds: Array.isArray(r.taskIds) ? r.taskIds : [],
        task: r.task ?? "",
        agent: x.agent ?? null,
        state,
        failureClass: x.failureClass ?? classifyFailure({ state, answer: x.answer, error: x.error }),
        fallback: x.fallback ?? [],
        startMs: start,
        durationMs: x.durationMs ?? 0,
        promptBytes: r.promptBytes ?? null,
        usage: x.usage ?? null,
      });
    }
  }
  return rows;
}

const pick = (sorted, q) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] : 0);
const sum = (a) => a.reduce((x, y) => x + y, 0);
const count = (list, key) => list.reduce((m, r) => ((m[r[key] ?? "?"] = (m[r[key] ?? "?"] ?? 0) + 1), m), {});

function groupStats(list) {
  const ms = list.map((r) => r.durationMs).sort((a, b) => a - b);
  return { n: list.length, medianMs: pick(ms, 0.5), p90Ms: pick(ms, 0.9), totalMs: sum(ms), states: count(list, "state") };
}

function localDay(ms, tzOffsetMin) {
  return new Date(ms - tzOffsetMin * 60_000).toISOString().slice(0, 10);
}

export function slotUsage(list) {
  if (!list.length) return null;
  const iv = list.filter((r) => r.startMs != null).map((r) => [r.startMs, r.startMs + r.durationMs]).sort((a, b) => a[0] - b[0]);
  if (!iv.length) return null;
  const span = Math.max(...iv.map((x) => x[1])) - iv[0][0];
  let busy = 0;
  let [cs, ce] = iv[0];
  for (const [a, b] of iv.slice(1)) {
    if (a <= ce) ce = Math.max(ce, b);
    else { busy += ce - cs; cs = a; ce = b; }
  }
  busy += ce - cs;
  const points = iv.flatMap(([a, b]) => [[a, 1], [b, -1]]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  let c = 0;
  let maxConcurrency = 0;
  for (const [, d] of points) { c += d; maxConcurrency = Math.max(maxConcurrency, c); }
  const agentMs = sum(iv.map(([a, b]) => b - a));
  return { calls: iv.length, spanMs: span, busyMs: busy, agentMs, avgParallel: busy ? agentMs / busy : 0, maxConcurrency, idleMs: span - busy };
}

export function summarize(rows, { tzOffsetMin = new Date().getTimezoneOffset() } = {}) {
  const notDone = rows.filter((r) => r.state !== "completed");
  const env = notDone.filter((r) => r.failureClass === ENVIRONMENT_FAILURE);
  const rework = rows.filter((r) => REWORK_RE.test(r.task.slice(0, REWORK_HEAD_CHARS)));
  const reworkAnywhere = rows.filter((r) => /rework/i.test(r.task));
  const byRole = {};
  for (const r of rows) (byRole[r.role] ??= []).push(r);
  const byDay = {};
  for (const r of rows) if (r.startMs != null) (byDay[localDay(r.startMs, tzOffsetMin)] ??= []).push(r);
  const withUsage = rows.filter((r) => r.usage);
  return {
    total: rows.length,
    completed: rows.length - notDone.length,
    totalAgentMs: sum(rows.map((r) => r.durationMs)),
    roles: Object.fromEntries(Object.entries(byRole).sort((a, b) => b[1].length - a[1].length).map(([k, v]) => [k, groupStats(v)])),
    agents: count(rows, "agent"),
    tiers: count(rows, "tier"),
    modes: count(rows, "mode"),
    fallbacks: rows.filter((r) => r.fallback.length).length,
    failureClasses: count(notDone, "failureClass"),
    environment: { calls: env.length, ms: sum(env.map((r) => r.durationMs)) },
    rework: { calls: rework.length, ms: sum(rework.map((r) => r.durationMs)), anywhereCalls: reworkAnywhere.length, anywhereMs: sum(reworkAnywhere.map((r) => r.durationMs)) },
    withTaskIds: rows.filter((r) => r.taskIds.length).length,
    usage: withUsage.length ? {
      calls: withUsage.length,
      inputTokens: sum(withUsage.map((r) => r.usage.inputTokens ?? 0)),
      cacheReadTokens: sum(withUsage.map((r) => r.usage.cacheReadTokens ?? 0)),
      outputTokens: sum(withUsage.map((r) => r.usage.outputTokens ?? 0)),
      costUsd: sum(withUsage.map((r) => r.usage.costUsd ?? 0)),
    } : null,
    days: Object.fromEntries(Object.entries(byDay).sort().map(([d, l]) => [d, slotUsage(l)])),
  };
}

const min = (ms) => (ms / 60_000).toFixed(1);
const hr = (ms) => (ms / 3_600_000).toFixed(2);
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : "-");
const kv = (o) => Object.entries(o).map(([k, v]) => `${k} ${v}`).join(" · ");

export function formatSummary(s) {
  const lines = [];
  lines.push(`call ทั้งหมด ${s.total} · completed ${s.completed} (${pct(s.completed, s.total)}) · ไม่ completed ${s.total - s.completed} · เวลา agent รวม ${hr(s.totalAgentMs)} ชม.`);
  lines.push(`agent: ${kv(s.agents)} · tier: ${kv(s.tiers)} · mode: ${kv(s.modes)} · fallback ${s.fallbacks} call · มี task id ${s.withTaskIds}/${s.total}`);
  lines.push("");
  lines.push("| role | call | median (นาที) | p90 (นาที) | รวม (ชม.) | สถานะ |");
  lines.push("|---|---|---|---|---|---|");
  for (const [k, v] of Object.entries(s.roles)) lines.push(`| ${k} | ${v.n} | ${min(v.medianMs)} | ${min(v.p90Ms)} | ${hr(v.totalMs)} | ${kv(v.states)} |`);
  lines.push("");
  lines.push(`เหตุที่ไม่ completed: ${kv(s.failureClasses) || "-"}`);
  lines.push(`สภาพแวดล้อมขวาง (ENVIRONMENT_FAILURE): ${s.environment.calls} call · ${hr(s.environment.ms)} ชม.`);
  lines.push(`รอบแก้/ตรวจซ้ำ/รันซ้ำ (หัวใบงาน): ${s.rework.calls} call · ${hr(s.rework.ms)} ชม. (${pct(s.rework.ms, s.totalAgentMs)}) · มีคำว่า rework ที่ใดก็ได้: ${s.rework.anywhereCalls} call · ${hr(s.rework.anywhereMs)} ชม. (${pct(s.rework.anywhereMs, s.totalAgentMs)})`);
  if (s.usage) lines.push(`token (${s.usage.calls} call ที่เก็บได้): in ${s.usage.inputTokens} · cache read ${s.usage.cacheReadTokens} · out ${s.usage.outputTokens} · $${s.usage.costUsd.toFixed(2)}`);
  lines.push("");
  lines.push("| วัน | call | ช่วงเวลา (ชม.) | มี agent รัน (ชม.) | เวลา agent รวม (ชม.) | ขนานเฉลี่ยขณะมีงาน | ขนานสูงสุด | ช่วงว่าง agent (ชม.) |");
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const [d, u] of Object.entries(s.days)) lines.push(`| ${d} | ${u.calls} | ${hr(u.spanMs)} | ${hr(u.busyMs)} | ${hr(u.agentMs)} | ${u.avgParallel.toFixed(2)} | ${u.maxConcurrency} | ${hr(u.idleMs)} |`);
  return lines.join("\n");
}
