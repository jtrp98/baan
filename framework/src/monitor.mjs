import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import { scanActiveRuns, aggregateWorkspaceUsage, getRecentRuns } from "./usage-aggregator.mjs";
import { getWorkspaceQuota } from "./quota-tracker.mjs";

export function formatNumber(num) {
  if (num == null || isNaN(num)) return "0";
  return Number(num).toLocaleString();
}

export function formatCost(num) {
  if (num == null || isNaN(num)) return "$0.00";
  return `$${Number(num).toFixed(3)}`;
}

export function openBrowser(url) {
  try {
    if (process.platform === "win32") {
      spawn("cmd.exe", ["/c", "start", '""', url], { windowsHide: true, stdio: "ignore" });
    } else if (process.platform === "darwin") {
      spawn("open", [url], { stdio: "ignore" });
    } else {
      spawn("xdg-open", [url], { stdio: "ignore" });
    }
  } catch {}
}

export async function getMonitorState(workspaceRoot, forceRefreshQuota = false) {
  const activeRuns = scanActiveRuns(workspaceRoot);
  const usage = aggregateWorkspaceUsage(workspaceRoot);
  const recentRuns = getRecentRuns(workspaceRoot, 10);
  let quota = null;
  try {
    quota = await getWorkspaceQuota(forceRefreshQuota);
  } catch {}
  return {
    workspaceRoot,
    workspaceName: path.basename(workspaceRoot),
    activeRuns,
    usage,
    quota,
    recentRuns,
    timestamp: new Date().toISOString(),
  };
}

export function renderTui(state) {
  const { activeRuns, usage, quota, workspaceName } = state;
  const lines = [];
  lines.push(`\x1b[1;36m========================================================================\x1b[0m`);
  lines.push(`\x1b[1;32m 🏗️  BAAN MONITOR  \x1b[0m — Workspace: \x1b[1m${workspaceName}\x1b[0m | Active: \x1b[1;33m${activeRuns.length} run(s)\x1b[0m`);
  lines.push(`\x1b[1;36m========================================================================\x1b[0m`);
  lines.push("");

  if (quota) {
    const { claude, codex, agy } = quota;
    lines.push(`\x1b[1mACCOUNT LIMITS & REMAINING QUOTA:\x1b[0m`);
    const tuiRow = (label, used, reset) => {
      if (used == null) return null;
      const left = Math.max(0, 100 - Math.round(used));
      const col = left > 40 ? "[32m" : left > 15 ? "[33m" : "[31m";
      return `${label}: ${col}${Math.round(used)}% used (${left}% left)[0m${/[0-9]/.test(reset ?? "") ? ` [Resets: ${reset}]` : ""}`;
    };
    const usedOf = (used, remaining) => used ?? (remaining != null ? 100 - remaining : null);
    const tuiLine = (name, ...rows) => lines.push(` ▶ ${name.padEnd(12)} ${rows.filter(Boolean).join(" | ")}`);
    if (claude?.available) {
      tuiLine("Claude Code",
        tuiRow("5-Hour Limit", usedOf(claude.sessionUsedPct, claude.sessionRemainingPct), claude.sessionResetsAt),
        tuiRow("Weekly Limit", usedOf(claude.weeklyUsedPct, claude.weeklyRemainingPct), claude.weeklyResetsAt));
    }
    if (codex?.available) {
      tuiLine("OpenAI Codex",
        tuiRow("5-Hour Limit", usedOf(codex.sessionUsedPct, codex.sessionRemainingPct), codex.sessionResetsAt),
        tuiRow("Weekly Limit", usedOf(codex.weeklyUsedPct, codex.weeklyRemainingPct), codex.weeklyResetsAt));
    }
    if (agy?.available) {
      tuiLine("Google AGY",
        tuiRow("5-Hour Limit", usedOf(null, agy.gemini5hRemainingPct), agy.gemini5hResetsAt),
        tuiRow("Weekly Limit", usedOf(null, agy.geminiWeeklyRemainingPct), agy.geminiWeeklyResetsAt),
        tuiRow("Argon Weekly Limit", usedOf(null, agy.argonWeeklyRemainingPct), agy.argonWeeklyResetsAt));
    }
    lines.push("");
  }

  lines.push(`\x1b[1m3-CLI USAGE BREAKDOWN (WORKSPACE TOTALS):\x1b[0m`);
  lines.push(`+------------------+--------+-------------+-------------+------------+----------+`);
  lines.push(`| CLI Provider     | Calls  | In Tokens   | Out Tokens  | Cache Read | Cost     |`);
  lines.push(`+------------------+--------+-------------+-------------+------------+----------+`);
  for (const [key, name] of [["claude", "Claude Code"], ["codex", "Codex CLI"], ["agy", "Google AGY"]]) {
    const s = usage.agents[key] ?? {};
    const cName = name.padEnd(16);
    const calls = String(s.calls ?? 0).padStart(6);
    const inTok = formatNumber(s.inputTokens ?? 0).padStart(11);
    const outTok = formatNumber(s.outputTokens ?? 0).padStart(11);
    const cache = formatNumber(s.cacheReadTokens ?? 0).padStart(10);
    const cost = formatCost(s.costUsd ?? 0).padStart(8);
    lines.push(`| ${cName} | ${calls} | ${inTok} | ${outTok} | ${cache} | ${cost} |`);
  }
  lines.push(`+------------------+--------+-------------+-------------+------------+----------+`);
  const tot = usage.total ?? {};
  lines.push(`| TOTAL COMBINED   | ${String(tot.calls ?? 0).padStart(6)} | ${formatNumber(tot.inputTokens ?? 0).padStart(11)} | ${formatNumber(tot.outputTokens ?? 0).padStart(11)} | ${formatNumber(tot.cacheReadTokens ?? 0).padStart(10)} | ${formatCost(tot.costUsd ?? 0).padStart(8)} |`);
  lines.push(`+------------------+--------+-------------+-------------+------------+----------+`);
  lines.push("");

  if (activeRuns.length) {
    lines.push(`\x1b[1;32mACTIVE RUNS & LIVE ACTIVITY:\x1b[0m`);
    for (const r of activeRuns) {
      const p = r.activePackages?.[0] ?? {};
      const act = p.recentActivity ? `[${p.recentActivity.name}] ${p.recentActivity.detail}` : "Starting...";
      lines.push(` ▶ \x1b[1m[${r.repoName}]\x1b[0m Run: ${r.runId.slice(0, 16)} | Role: \x1b[33m${r.role}\x1b[0m (${r.agent})`);
      lines.push(`   Task: ${r.title.slice(0, 60)}`);
      lines.push(`   Live Tool: \x1b[36m${act}\x1b[0m`);
      if (p.recentThought) lines.push(`   Thought: \x1b[90m${p.recentThought.slice(0, 70)}\x1b[0m`);
      lines.push("");
    }
  } else {
    lines.push(`\x1b[90m(No active runs right now — standing by for next command...)\x1b[0m`);
    lines.push("");
  }

  lines.push(`\x1b[90mPress Ctrl+C to exit monitor.\x1b[0m`);
  return lines.join("\n");
}

export function getHtmlDashboard() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BAAN Live Monitor</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #38bdf8;
      --claude: #f97316;
      --codex: #10b981;
      --agy: #6366f1;
      --success: #22c55e;
      --warning: #eab308;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      padding: 18px 24px 40px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 20px;
    }
    .logo-area { display: flex; align-items: center; gap: 12px; }
    .logo-badge {
      background: #0284c7;
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 14px;
    }
    h1 { font-size: 20px; font-weight: 600; display: inline; }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: pulse 1.8s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } }

    .btn-refresh {
      background: #0284c7;
      color: white;
      border: none;
      padding: 5px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
    }
    .btn-refresh:hover { background: #0369a1; }

    /* Tabs */
    .tabs { display: flex; gap: 8px; margin-bottom: 22px; flex-wrap: wrap; }
    .tab-btn {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .tab-btn:hover { background: #334155; color: var(--text); }
    .tab-btn.active {
      background: #0369a1;
      border-color: var(--primary);
      color: white;
    }

    /* 3 CLI Usage Grid */
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px 18px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px; }
    .card.claude::before { background: var(--claude); }
    .card.codex::before { background: var(--codex); }
    .card.agy::before { background: var(--agy); }
    .card.total::before { background: var(--primary); }

    .card-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 10px; display: flex; justify-content: space-between; }
    .card-main-val { font-size: 24px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .card-sub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; font-size: 12px; }
    .card-sub-grid span { color: var(--text-muted); }
    .card-sub-grid strong { color: var(--text); font-weight: 600; text-align: right; }

    /* Quota section on cards */
    .quota-box {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px dashed var(--card-border);
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }
    .quota-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .badge-plan {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.08);
      color: var(--text);
    }
    .account-line {
      font-size: 11px;
      color: #38bdf8;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 5px;
      min-height: 16px;
    }
    .slot-row {
      min-height: 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .bar-label-line {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin-bottom: 3px;
    }
    .bar-track {
      background: #0f172a;
      height: 6px;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s;
    }
    .bar-fill.green { background: #22c55e; }
    .bar-fill.yellow { background: #eab308; }
    .bar-fill.red { background: #ef4444; }
    .bar-fill.purple { background: #a855f7; }
    .reset-subtext {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .alert-pill {
      font-size: 10px;
      color: #ef4444;
      font-weight: 600;
      margin-top: 3px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Live Session Area */
    .section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .active-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; margin-bottom: 26px; }
    .active-card {
      background: #1e293b;
      border: 1px solid #0284c7;
      border-radius: 12px;
      padding: 18px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }
    .active-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .project-name { font-size: 17px; font-weight: 700; color: #38bdf8; }
    .role-badge { padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #075985; color: #e0f2fe; }
    .live-action-box {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .live-label { font-size: 11px; text-transform: uppercase; color: #38bdf8; font-weight: 700; margin-bottom: 4px; }
    .live-text { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; color: #f1f5f9; word-break: break-all; }
    .live-thought { font-size: 12px; color: #94a3b8; font-style: italic; margin-top: 6px; }

    /* Timeline / Activity feed */
    .history-feed {
      background: #0f172a;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 10px 14px;
      max-height: 220px;
      overflow-y: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
    }
    .feed-item { padding: 5px 0; border-bottom: 1px solid #1e293b; display: flex; gap: 8px; }
    .feed-time { color: #64748b; font-size: 11px; min-width: 60px; }
    .feed-type { font-weight: 600; }
    .feed-type.tool { color: #38bdf8; }
    .feed-type.thought { color: #a855f7; }
    .feed-detail { color: #cbd5e1; word-break: break-all; }

    .standby-card {
      background: var(--card-bg);
      border: 1px dashed var(--card-border);
      border-radius: 12px;
      padding: 36px 20px;
      text-align: center;
      color: var(--text-muted);
      margin-bottom: 24px;
    }
    .standby-card h3 { font-size: 16px; margin-bottom: 6px; color: var(--text); }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
    th { text-align: left; padding: 10px 12px; color: var(--text-muted); border-bottom: 1px solid var(--card-border); font-weight: 600; }
    td { padding: 10px 12px; border-bottom: 1px solid #1e293b; }
    tr:hover td { background: rgba(255, 255, 255, 0.02); }
  </style>
</head>
<body>
  <header>
    <div class="logo-area">
      <div class="logo-badge">BAAN</div>
      <div>
        <h1>🏗️ Live Process & 3-CLI Monitor</h1>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;" id="ws-label">Workspace: ...</div>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <button class="btn-refresh" onclick="refreshQuota()" id="btn-refresh-quota">🔄 Refresh Quota</button>
      <div class="status-badge">
        <div class="status-dot"></div>
        <span id="conn-status">Connected</span>
      </div>
    </div>
  </header>

  <div class="tabs" id="tab-container">
    <button class="tab-btn active" onclick="selectTab('all')">🌐 ภาพรวมทั้งหมด (Overview)</button>
  </div>

  <!-- 3-CLI USAGE CARDS -->
  <div class="section-title">📊 3-CLI Usage & Remaining Limits (5-Hour & Weekly)</div>
  <div class="grid-3" id="usage-cards">
    <!-- Rendered dynamically -->
  </div>

  <!-- ACTIVE LIVE RUNS -->
  <div class="section-title">⚡ Live Process & Active Sessions</div>
  <div id="active-runs-area">
    <div class="standby-card">
      <h3>พร้อมตรวจจับงาน (Standby)</h3>
      <p>เมื่อสั่งงานใน terminal (เช่น <code>baan WP-1</code> หรือคุยกับ agent ใน <code>C:\\src\\schoolbright</code>) ข้อมูลจะขึ้นที่นี่สดๆ ทันที</p>
    </div>
  </div>

  <!-- RECENT RUNS TABLE -->
  <div class="section-title" style="margin-top: 30px;">📜 Recent Runs History</div>
  <div class="card" style="padding: 6px 12px;">
    <table>
      <thead>
        <tr>
          <th>Run ID</th>
          <th>Project(s)</th>
          <th>Packages</th>
          <th>Mode</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="recent-runs-tbody">
        <!-- Rendered dynamically -->
      </tbody>
    </table>
  </div>

  <script>
    let currentTab = 'all';
    let lastState = null;

    function formatNumber(num) {
      if (num == null || isNaN(num)) return "0";
      return Number(num).toLocaleString();
    }

    function formatCost(num) {
      if (num == null || isNaN(num)) return "$0.00";
      return "$" + Number(num).toFixed(3);
    }

    function normalizeResetDate(input) {
      if (!input) return '';
      try {
        if (typeof input === 'number' || (/^\d{10}$/.test(String(input).trim()))) {
          const d = new Date(Number(input) * 1000);
          return formatStandardDate(d);
        }
        if (/^\d{4}-\d{2}-\d{2}T/.test(String(input))) {
          const d = new Date(input);
          if (!isNaN(d.getTime())) return formatStandardDate(d);
        }
        const m = String(input).match(/([a-zA-Z]+ \d+)[,\s]+(\d+:\d+\s*[apmAPM]+)/i);
        if (m) {
          return m[1] + ', ' + m[2].toUpperCase().replace(/\s+/, ' ');
        }
        const d = new Date(input);
        if (!isNaN(d.getTime())) return formatStandardDate(d);
        return String(input).replace(/\s*\([^)]*\)/, '');
      } catch {
        return String(input);
      }
    }

    function formatStandardDate(d) {
      const m = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return m + ', ' + t;
    }

    function getBarColor(remainingPct) {
      if (remainingPct == null) return 'green';
      if (remainingPct > 40) return 'green';
      if (remainingPct > 15) return 'yellow';
      return 'red';
    }

    function selectTab(tabId) {
      currentTab = tabId;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById('tab-' + tabId);
      if (activeBtn) activeBtn.classList.add('active');
      renderDashboard();
    }

    async function refreshQuota() {
      const btn = document.getElementById('btn-refresh-quota');
      if (btn) btn.textContent = '⏳ Checking...';
      try {
        const res = await fetch('/api/quota/refresh', { method: 'POST' });
        if (res.ok) {
          lastState = await res.json();
          renderDashboard();
        }
      } catch (e) {}
      if (btn) btn.textContent = '🔄 Refresh Quota';
    }

    function resetLabel(v) {
      const t = normalizeResetDate(v);
      return /[0-9]/.test(t) ? t : '';
    }

    function quotaRow(label, usedPct, resetsAt) {
      if (usedPct == null) return '';
      const used = Math.round(usedPct);
      const left = Math.max(0, 100 - used);
      const low = left <= 15;
      const reset = resetLabel(resetsAt);
      return '<div class="slot-row">'
        + '<div class="bar-label-line"><span>' + label + ':</span>'
        + '<strong' + (low ? ' style="color: #ef4444;"' : '') + '>' + used + '% used (' + left + '% left)</strong></div>'
        + '<div class="bar-track"><div class="bar-fill ' + getBarColor(left) + '" style="width: ' + left + '%"></div></div>'
        + (reset ? '<div class="reset-subtext">Resets: ' + reset + '</div>' : '')
        + (low ? '<div class="alert-pill">⚠️ ' + label + ': only ' + left + '% left</div>' : '')
        + '</div>';
    }

    function quotaCard(plan, account, rows, emptyText) {
      return '<div class="quota-box">'
        + '<div class="quota-title"><span>Quota & Limits</span><span class="badge-plan">' + plan + '</span></div>'
        + '<div class="account-line">👤 ' + account + '</div>'
        + (rows || '<div style="font-size: 11px; color: var(--text-muted); line-height: 1.4; padding: 20px 0; text-align: center;">' + emptyText + '</div>')
        + '</div>';
    }

    function usedOf(used, remaining) {
      return used ?? (remaining != null ? 100 - remaining : null);
    }

    function renderDashboard() {
      if (!lastState) return;
      const { activeRuns, usage, quota, recentRuns, workspaceName } = lastState;
      document.getElementById('ws-label').textContent = 'Workspace: ' + workspaceName;

      // Update Tabs with active projects
      const projectNames = new Set();
      activeRuns.forEach(r => projectNames.add(r.repoName));
      if (usage.projects) Object.keys(usage.projects).forEach(p => projectNames.add(p));

      const tabContainer = document.getElementById('tab-container');
      tabContainer.innerHTML = '<button id="tab-all" class="tab-btn ' + (currentTab === 'all' ? 'active' : '') + '" onclick="selectTab(\\'all\\')">🌐 ภาพรวมทั้งหมด (Overview)</button>';
      
      projectNames.forEach(name => {
        if (!name) return;
        const btn = document.createElement('button');
        btn.id = 'tab-' + name;
        btn.className = 'tab-btn ' + (currentTab === name ? 'active' : '');
        btn.textContent = name;
        btn.onclick = () => selectTab(name);
        tabContainer.appendChild(btn);
      });

      // Filter usage if single project tab
      let displayUsage = usage.agents;
      let displayTotal = usage.total;

      // Render 3-CLI Cards
      const cClaude = displayUsage.claude ?? {};
      const cCodex = displayUsage.codex ?? {};
      const cAgy = displayUsage.agy ?? {};
      const cTot = displayTotal ?? {};

      let claudeQuotaHtml = '';
      const qc = quota?.claude;
      if (qc?.available) {
        claudeQuotaHtml = quotaCard('SUBSCRIPTION', 'Anthropic Subscription',
          quotaRow('5-Hour Limit', usedOf(qc.sessionUsedPct, qc.sessionRemainingPct), qc.sessionResetsAt)
          + quotaRow('Weekly Limit', usedOf(qc.weeklyUsedPct, qc.weeklyRemainingPct), qc.weeklyResetsAt));
      } else {
        claudeQuotaHtml = quotaCard('SUBSCRIPTION', 'Anthropic Subscription', '', qc?.rawText ? 'Claude subscription active' : 'พร้อมตรวจจับโควตาจาก claude -p "/usage"');
      }

      let codexQuotaHtml = '';
      const qx = quota?.codex;
      if (qx?.available) {
        codexQuotaHtml = quotaCard(qx.planType ? qx.planType.toUpperCase() : 'PLUS', qx.accountLabel || 'ChatGPT Plus Account',
          quotaRow('5-Hour Limit', usedOf(qx.sessionUsedPct, qx.sessionRemainingPct), qx.sessionResetsAt)
          + quotaRow('Weekly Limit', usedOf(qx.weeklyUsedPct, qx.weeklyRemainingPct), qx.weeklyResetsAt));
      } else {
        codexQuotaHtml = quotaCard('PLUS', 'OpenAI Codex CLI', '', qx?.error ? qx.error : 'พร้อมตรวจจับโควตาจาก ~/.codex/auth.json');
      }

      let agyQuotaHtml = '';
      const qa = quota?.agy;
      if (qa?.available) {
        agyQuotaHtml = quotaCard('ANTIGRAVITY', 'Google Antigravity / Gemini',
          quotaRow('5-Hour Limit', 100 - (qa.gemini5hRemainingPct ?? 100), qa.gemini5hResetsAt)
          + quotaRow('Weekly Limit', 100 - (qa.geminiWeeklyRemainingPct ?? 100), qa.geminiWeeklyResetsAt)
          + quotaRow('Argon Weekly Limit', 100 - (qa.argonWeeklyRemainingPct ?? 100), qa.argonWeeklyResetsAt));
      } else {
        agyQuotaHtml = quotaCard('ANTIGRAVITY', 'Google Antigravity / Gemini', '', 'พร้อมตรวจจับโควตาจาก agy -p "/usage"');
      }

      const usageCards = document.getElementById('usage-cards');
      usageCards.innerHTML = \`
        <div class="card claude">
          <div class="card-title"><span>Claude Code (Anthropic)</span> <span>\${cClaude.calls ?? 0} calls</span></div>
          <div class="card-main-val">\${formatCost(cClaude.costUsd)}</div>
          <div class="card-sub-grid">
            <span>Input:</span><strong>\${formatNumber(cClaude.inputTokens)}</strong>
            <span>Output:</span><strong>\${formatNumber(cClaude.outputTokens)}</strong>
            <span>Cache Read:</span><strong>\${formatNumber(cClaude.cacheReadTokens)}</strong>
            <span>Turns:</span><strong>\${cClaude.turns ?? 0}</strong>
          </div>
          \${claudeQuotaHtml}
        </div>
        <div class="card codex">
          <div class="card-title"><span>Codex CLI (OpenAI)</span> <span>\${cCodex.calls ?? 0} calls</span></div>
          <div class="card-main-val">\${formatCost(cCodex.costUsd)}</div>
          <div class="card-sub-grid">
            <span>Input:</span><strong>\${formatNumber(cCodex.inputTokens)}</strong>
            <span>Output:</span><strong>\${formatNumber(cCodex.outputTokens)}</strong>
            <span>Cache Read:</span><strong>\${formatNumber(cCodex.cacheReadTokens)}</strong>
            <span>Turns:</span><strong>\${cCodex.turns ?? 0}</strong>
          </div>
          \${codexQuotaHtml}
        </div>
        <div class="card agy">
          <div class="card-title"><span>Antigravity (AGY)</span> <span>\${cAgy.calls ?? 0} calls</span></div>
          <div class="card-main-val">\${formatCost(cAgy.costUsd)}</div>
          <div class="card-sub-grid">
            <span>Input:</span><strong>\${formatNumber(cAgy.inputTokens)}</strong>
            <span>Output:</span><strong>\${formatNumber(cAgy.outputTokens)}</strong>
            <span>Cache Read:</span><strong>\${formatNumber(cAgy.cacheReadTokens)}</strong>
            <span>Turns:</span><strong>\${cAgy.turns ?? 0}</strong>
          </div>
          \${agyQuotaHtml}
        </div>
        <div class="card total">
          <div class="card-title"><span>Total Workspace Used</span> <span>\${cTot.calls ?? 0} total calls</span></div>
          <div class="card-main-val">\${formatCost(cTot.costUsd)}</div>
          <div class="card-sub-grid">
            <span>In Tokens:</span><strong>\${formatNumber(cTot.inputTokens)}</strong>
            <span>Out Tokens:</span><strong>\${formatNumber(cTot.outputTokens)}</strong>
            <span>Cache Read:</span><strong>\${formatNumber(cTot.cacheReadTokens)}</strong>
            <span>Runs:</span><strong>\${cTot.runs ?? 0}</strong>
          </div>
        </div>
      \`;

      // Render Active Runs
      const activeArea = document.getElementById('active-runs-area');
      const filteredActive = currentTab === 'all' ? activeRuns : activeRuns.filter(r => r.repoName === currentTab);

      if (filteredActive.length) {
        let html = '<div class="active-grid">';
        filteredActive.forEach(r => {
          const p = r.activePackages?.[0] ?? {};
          const act = p.recentActivity ? \`[\${p.recentActivity.name}] \${p.recentActivity.detail}\` : 'Active / Processing...';
          const thought = p.recentThought ? \`💭 "\${p.recentThought}"\` : '';
          
          let historyHtml = '';
          if (p.history && p.history.length) {
            historyHtml = '<div class="history-feed">' + p.history.slice(-8).reverse().map(h => {
              const time = h.at ? h.at.slice(11, 19) : '';
              return \`<div class="feed-item"><span class="feed-time">\${time}</span><span class="feed-type \${h.type}">\${h.name || h.type}:</span><span class="feed-detail">\${h.detail || h.thought}</span></div>\`;
            }).join('') + '</div>';
          }

          html += \`
            <div class="active-card">
              <div class="active-header">
                <div>
                  <div class="project-name">\${r.repoName}</div>
                  <div style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">\${r.title}</div>
                </div>
                <div class="role-badge">\${r.role.toUpperCase()} (\${r.agent})</div>
              </div>
              <div class="live-action-box">
                <div class="live-label">⚡ Live Action Right Now</div>
                <div class="live-text">\${act}</div>
                \${thought ? \`<div class="live-thought">\${thought}</div>\` : ''}
              </div>
              \${historyHtml ? \`<div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; font-weight: 700;">Recent Tool Activity Stream</div>\` + historyHtml : ''}
            </div>
          \`;
        });
        html += '</div>';
        activeArea.innerHTML = html;
      } else {
        activeArea.innerHTML = \`
          <div class="standby-card">
            <h3>\${currentTab === 'all' ? 'พร้อมตรวจจับงาน (Standby)' : 'ไม่มีงานรันอยู่ใน ' + currentTab}</h3>
            <p>เมื่อสั่งงานใน session (เช่น <code>baan WP-1</code> ใน <code>C:\\\\src\\\\schoolbright</code>) ข้อมูลจะสตรีมขึ้นที่นี่สดๆ ทันที</p>
          </div>
        \`;
      }

      // Render Recent Runs Table
      const tbody = document.getElementById('recent-runs-tbody');
      tbody.innerHTML = (recentRuns || []).map(r => \`
        <tr>
          <td><span style="font-family: monospace; color: var(--primary);">\${r.id.slice(0, 22)}...</span></td>
          <td>\${(r.projects || []).join(', ') || '-'}</td>
          <td>\${r.completedPackages}/\${r.totalPackages}</td>
          <td><span style="font-size: 12px; color: var(--text-muted);">\${r.mode}</span></td>
          <td><span style="color: \${r.isDone ? 'var(--success)' : 'var(--warning)'}; font-weight: 600;">\${r.isDone ? 'COMPLETED' : 'IN PROGRESS'}</span></td>
        </tr>
      \`).join('');
    }

    // Connect to Server-Sent Events (SSE)
    function connectSse() {
      const connStatus = document.getElementById('conn-status');
      const es = new EventSource('/api/stream');
      
      es.onopen = () => {
        connStatus.textContent = 'Live Connected';
        connStatus.style.color = '#4ade80';
      };

      es.onmessage = (e) => {
        try {
          lastState = JSON.parse(e.data);
          renderDashboard();
        } catch (err) {}
      };

      es.onerror = () => {
        connStatus.textContent = 'Reconnecting...';
        connStatus.style.color = '#f87171';
      };
    }

    connectSse();
  </script>
</body>
</html>`;
}

export function startMonitor({ workspaceRoot, port = 3456, tui = false, openBrowser: shouldOpen = true, runId = null }) {
  if (tui) {
    console.log(`Starting BAAN TUI Monitor for ${workspaceRoot}... (Press Ctrl+C to exit)`);
    let rendering = false;
    const render = async () => {
      if (rendering) return;
      rendering = true;
      try {
        const state = await getMonitorState(workspaceRoot);
        process.stdout.write("\x1b[2J\x1b[H");
        process.stdout.write(renderTui(state));
      } catch {} finally {
        rendering = false;
      }
    };
    render();
    const interval = setInterval(render, 1000);
    process.on("SIGINT", () => {
      clearInterval(interval);
      process.exit(0);
    });
    return new Promise(() => {}); // Keep alive in terminal
  }

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

      if (url.pathname === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(getHtmlDashboard());
        return;
      }

      if (url.pathname === "/api/quota/refresh" && req.method === "POST") {
        const state = await getMonitorState(workspaceRoot, true);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(state));
        return;
      }

      if (url.pathname === "/api/stats") {
        const state = await getMonitorState(workspaceRoot);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(state));
        return;
      }

      if (url.pathname === "/api/runs") {
        const runs = getRecentRuns(workspaceRoot, 30);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(runs));
        return;
      }

      if (url.pathname === "/api/stream") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
        });

        let sending = false;
        const send = async () => {
          if (sending) return;
          sending = true;
          try {
            const state = await getMonitorState(workspaceRoot);
            res.write(`data: ${JSON.stringify(state)}\n\n`);
          } catch {} finally {
            sending = false;
          }
        };

        send();
        const timer = setInterval(send, 1000);
        req.on("close", () => clearInterval(timer));
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Try a different port with --port <number>`);
      }
      reject(err);
    });

    server.listen(port, () => {
      const url = `http://localhost:${port}`;
      console.log(`\n======================================================`);
      console.log(`🏗️  BAAN Live Monitor Dashboard running at: ${url}`);
      console.log(`   Workspace: ${workspaceRoot}`);
      console.log(`   Press Ctrl+C to stop monitor.`);
      console.log(`======================================================\n`);
      if (shouldOpen) {
        openBrowser(url);
      }
      resolve({ server, port, url });
    });
  });
}
