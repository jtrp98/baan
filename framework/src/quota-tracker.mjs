import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export function formatResetDate(raw) {
  if (!raw) return null;
  if (typeof raw === "number") {
    const ms = raw < 1e11 ? raw * 1000 : raw;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return String(raw);
    return formatDateParts(d);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed) && (trimmed.includes("T") || trimmed.includes("-") || trimmed.includes("Z"))) {
      return formatDateParts(new Date(parsed));
    }
    return trimmed;
  }
  return String(raw);
}

function formatDateParts(d) {
  try {
    const timePart = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const dayPart = d.getDate();
    const monthPart = d.toLocaleDateString("en-US", { month: "short" });
    return `${timePart} on ${dayPart} ${monthPart}`;
  } catch {
    return d.toISOString();
  }
}

export function parseClaudeUtilization(claudeJson) {
  const result = {
    available: false,
    email: null,
    planType: null,
    accountLabel: null,
    sessionUsedPct: null,
    sessionRemainingPct: null,
    sessionResetsAt: null,
    weeklyUsedPct: null,
    weeklyRemainingPct: null,
    weeklyResetsAt: null,
    raw: claudeJson || null,
  };
  if (!claudeJson) return result;

  const oauth = claudeJson.oauthAccount || {};
  const util = claudeJson.cachedUsageUtilization?.utilization || claudeJson.utilization || {};
  const limits = Array.isArray(util.limits) ? util.limits : [];

  const sessionLimit = limits.find((l) => l.kind === "session" || l.group === "session");
  const weeklyLimit = limits.find((l) => l.kind === "weekly_all" || l.group === "weekly");

  let sessionUsedPct = sessionLimit?.percent != null ? Math.round(sessionLimit.percent) : null;
  let sessionResetsAt = formatResetDate(sessionLimit?.resets_at);
  if (sessionUsedPct == null && util.five_hour?.utilization != null) {
    const v = util.five_hour.utilization;
    sessionUsedPct = Math.min(100, Math.round(v <= 1 && v > 0 ? v * 100 : v));
    sessionResetsAt = formatResetDate(util.five_hour.resets_at);
  }

  let weeklyUsedPct = weeklyLimit?.percent != null ? Math.round(weeklyLimit.percent) : null;
  let weeklyResetsAt = formatResetDate(weeklyLimit?.resets_at);
  if (weeklyUsedPct == null && util.seven_day?.utilization != null) {
    const v = util.seven_day.utilization;
    weeklyUsedPct = Math.min(100, Math.round(v <= 1 && v > 0 ? v * 100 : v));
    weeklyResetsAt = formatResetDate(util.seven_day.resets_at);
  }

  const email = oauth.emailAddress || null;
  const tierRaw = oauth.seatTier || oauth.billingType || null;
  const tierFormatted = tierRaw
    ? tierRaw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;
  const accountLabel = email
    ? (tierFormatted ? `${email} (${tierFormatted})` : email)
    : "Anthropic Subscription";
  const planType = oauth.seatTier || oauth.billingType || "subscription";

  result.email = email;
  result.planType = planType;
  result.accountLabel = accountLabel;

  if (sessionUsedPct != null || weeklyUsedPct != null) {
    result.available = true;
    result.sessionUsedPct = sessionUsedPct;
    result.sessionRemainingPct = sessionUsedPct != null ? Math.max(0, 100 - sessionUsedPct) : null;
    result.sessionResetsAt = sessionResetsAt;
    result.weeklyUsedPct = weeklyUsedPct;
    result.weeklyRemainingPct = weeklyUsedPct != null ? Math.max(0, 100 - weeklyUsedPct) : null;
    result.weeklyResetsAt = weeklyResetsAt;
  }

  return result;
}

export async function fetchClaudeQuota(claudeJsonPathOpt = null, credentialsPathOpt = null) {
  try {
    const isCustomPath = Boolean(claudeJsonPathOpt);
    const home = process.env.USERPROFILE || process.env.HOME;
    const claudeJsonPath = claudeJsonPathOpt || (home ? path.join(home, ".claude.json") : null);

    if (claudeJsonPath && fs.existsSync(claudeJsonPath)) {
      try {
        const raw = fs.readFileSync(claudeJsonPath, "utf8");
        const json = JSON.parse(raw);
        const parsed = parseClaudeUtilization(json);
        if (parsed.available) return parsed;
      } catch {}
    } else if (isCustomPath) {
      return { available: false, error: `Claude config not found at ${claudeJsonPath}` };
    }

    const credPath = credentialsPathOpt || (home ? path.join(home, ".claude", ".credentials.json") : null);
    if (credPath && fs.existsSync(credPath)) {
      try {
        const creds = JSON.parse(fs.readFileSync(credPath, "utf8"));
        const token = creds.claudeAiOauth?.accessToken;
        if (token) {
          const res = await fetch("https://api.anthropic.com/api/oauth/usage", {
            headers: {
              Authorization: `Bearer ${token}`,
              "User-Agent": "claude-code/2.1.319",
              "anthropic-client-version": "2.1.319",
            },
            signal: AbortSignal.timeout(3000),
          });
          if (res.ok) {
            const data = await res.json();
            const parsed = parseClaudeUtilization({ cachedUsageUtilization: { utilization: data } });
            if (parsed.available) return parsed;
          }
        }
      } catch {}
    }

    const cliRes = await execCommandWithTimeout("claude", ["-p", "/usage"], 6000);
    const parsedText = parseClaudeUsageText(cliRes.stdout || cliRes.stderr);
    if (parsedText.available) return parsedText;

    return { available: false, error: "Claude quota data not found in ~/.claude.json" };
  } catch (err) {
    return { available: false, error: err.message };
  }
}

export function parseClaudeUsageText(text) {
  const result = {
    available: false,
    sessionUsedPct: null,
    sessionRemainingPct: null,
    sessionResetsAt: null,
    weeklyUsedPct: null,
    weeklyRemainingPct: null,
    weeklyResetsAt: null,
    requestsLast7d: null,
    sessionsLast7d: null,
    rawText: text || "",
  };
  if (!text) return result;

  const mSession = text.match(/Current session:\s*(\d+)%\s*used(?:\s*·\s*resets\s*([^\r\n]+))?/i);
  if (mSession) {
    result.available = true;
    result.sessionUsedPct = parseInt(mSession[1], 10);
    result.sessionRemainingPct = Math.max(0, 100 - result.sessionUsedPct);
    if (mSession[2]) result.sessionResetsAt = mSession[2].trim();
  }

  const mWeekly = text.match(/Current week(?:\s*\([^)]*\))?:\s*(\d+)%\s*used(?:\s*·\s*resets\s*([^\r\n]+))?/i);
  if (mWeekly) {
    result.available = true;
    result.weeklyUsedPct = parseInt(mWeekly[1], 10);
    result.weeklyRemainingPct = Math.max(0, 100 - result.weeklyUsedPct);
    if (mWeekly[2]) result.weeklyResetsAt = mWeekly[2].trim();
  }

  const m7d = text.match(/Last 7d\s*·\s*(\d+)\s*requests\s*·\s*(\d+)\s*sessions/i);
  if (m7d) {
    result.requestsLast7d = parseInt(m7d[1], 10);
    result.sessionsLast7d = parseInt(m7d[2], 10);
  }

  return result;
}

export function parseAgyUsageText(text) {
  const result = {
    available: false,
    gemini5hRemainingPct: null,
    gemini5hResetsAt: null,
    geminiWeeklyRemainingPct: null,
    geminiWeeklyResetsAt: null,
    argonWeeklyRemainingPct: null,
    argonWeeklyResetsAt: null,
    claudeGptWeeklyRemainingPct: null,
    claudeGptWeeklyResetsAt: null,
    items: [],
    rawText: text || "",
  };
  if (!text) return result;

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const parts = line.split(/\t+/).map((p) => p.trim());
    if (parts.length < 3) continue;
    result.available = true;
    const [model, limitType, valStr, resetsAt] = parts;
    const pctMatch = valStr.match(/(\d+)%/);
    const pct = pctMatch ? parseInt(pctMatch[1], 10) : valStr.toLowerCase() === "disabled" ? 0 : null;

    result.items.push({ model, limitType, pct, resetsAt: resetsAt ?? null });

    const mLower = model.toLowerCase();
    const tLower = limitType.toLowerCase();

    if (mLower.includes("gemini 4 argon") || tLower.includes("argon")) {
      result.argonWeeklyRemainingPct = pct;
      if (resetsAt) result.argonWeeklyResetsAt = resetsAt;
    } else if (mLower.includes("gemini models") || mLower === "gemini") {
      if (tLower.includes("five hour") || tLower.includes("5 hour") || tLower.includes("5h") || tLower.includes("session")) {
        result.gemini5hRemainingPct = pct;
        if (resetsAt) result.gemini5hResetsAt = resetsAt;
      } else if (tLower.includes("weekly")) {
        result.geminiWeeklyRemainingPct = pct;
        if (resetsAt) result.geminiWeeklyResetsAt = resetsAt;
      }
    } else if (mLower.includes("claude") || mLower.includes("gpt")) {
      if (tLower.includes("weekly")) {
        result.claudeGptWeeklyRemainingPct = pct;
        if (resetsAt) result.claudeGptWeeklyResetsAt = resetsAt;
      }
    }
  }

  return result;
}

export function parseCodexUsageResponse(data) {
  const result = {
    available: false,
    email: null,
    planType: null,
    accountLabel: null,
    weeklyUsedPct: null,
    weeklyRemainingPct: null,
    weeklyResetsAt: null,
    weeklyWindowSeconds: null,
    sessionUsedPct: null,
    sessionRemainingPct: null,
    sessionResetsAt: null,
    credits: null,
    raw: data || null,
  };
  if (!data) return result;

  const obj = typeof data === "string" ? (() => {
    try { return JSON.parse(data); } catch { return null; }
  })() : data;

  if (!obj || !obj.rate_limit) return result;

  result.available = true;
  result.email = obj.email || null;
  result.planType = obj.plan_type || null;
  if (result.email && result.planType) {
    const capPlan = result.planType.charAt(0).toUpperCase() + result.planType.slice(1);
    result.accountLabel = `${result.email} (${capPlan})`;
  } else if (result.email) {
    result.accountLabel = result.email;
  }

  const primary = obj.rate_limit.primary_window;
  if (primary) {
    result.weeklyUsedPct = primary.used_percent ?? null;
    if (result.weeklyUsedPct != null) {
      result.weeklyRemainingPct = Math.max(0, 100 - result.weeklyUsedPct);
    }
    result.weeklyWindowSeconds = primary.limit_window_seconds ?? null;
    if (primary.reset_at) {
      result.weeklyResetsAt = formatResetDate(primary.reset_at);
    }
  }

  const secondary = obj.rate_limit.secondary_window;
  if (secondary) {
    result.sessionUsedPct = secondary.used_percent ?? null;
    if (result.sessionUsedPct != null) {
      result.sessionRemainingPct = Math.max(0, 100 - result.sessionUsedPct);
    }
    if (secondary.reset_at) {
      result.sessionResetsAt = formatResetDate(secondary.reset_at);
    }
  }

  if (obj.credits) {
    result.credits = {
      hasCredits: !!obj.credits.has_credits,
      balance: obj.credits.balance ?? "0",
      unlimited: !!obj.credits.unlimited,
    };
  }

  return result;
}

export async function fetchCodexQuotaFromAuth(authPathOpt = null) {
  try {
    const authPath = authPathOpt || (() => {
      const home = process.env.USERPROFILE || process.env.HOME;
      return home ? path.join(home, ".codex", "auth.json") : null;
    })();

    if (!authPath || !fs.existsSync(authPath)) {
      return { available: false, error: "Codex auth.json not found" };
    }

    const authData = JSON.parse(fs.readFileSync(authPath, "utf8"));
    if (authData.auth_mode === "api_key" || (!authData.tokens && authData.OPENAI_API_KEY)) {
      return {
        available: true,
        accountLabel: "OpenAI API Key (Pay-as-you-go)",
        planType: "api_key",
        weeklyUsedPct: null,
        weeklyRemainingPct: null,
        weeklyResetsAt: null,
        sessionUsedPct: null,
        sessionRemainingPct: null,
        sessionResetsAt: null,
      };
    }

    const token = authData.tokens?.access_token;
    const accountId = authData.tokens?.account_id;
    if (!token) {
      return { available: false, error: "No access token found in Codex auth.json" };
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "User-Agent": "codex/0.167.0",
    };
    if (accountId) {
      headers["chatgpt-account-id"] = accountId;
    }

    const res = await fetch("https://chatgpt.com/backend-api/wham/usage", {
      headers,
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return { available: false, httpStatus: res.status, error: `ChatGPT API HTTP ${res.status}` };
    }

    const json = await res.json();
    return parseCodexUsageResponse(json);
  } catch (err) {
    return { available: false, error: err.message };
  }
}

export function execCommandWithTimeout(cmd, args, timeoutMs = 8000) {
  return new Promise((resolve) => {
    let resolved = false;
    let stdout = "";
    let stderr = "";

    let actualCmd = cmd;
    let actualArgs = args;
    if (process.platform === "win32" && (cmd === "claude" || cmd === "agy")) {
      actualCmd = "cmd.exe";
      actualArgs = ["/d", "/s", "/c", cmd, ...args];
    }

    const child = spawn(actualCmd, actualArgs, {
      windowsHide: true,
      env: { ...process.env, CI: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const timer = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      try { child.kill("SIGKILL"); } catch {}
      resolve({ ok: false, stdout, stderr, timedOut: true });
    }, timeoutMs);

    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });

    child.on("error", (err) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      resolve({ ok: false, stdout, stderr, error: err.message });
    });

    child.on("close", (code) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      resolve({ ok: code === 0, stdout, stderr, exitCode: code });
    });
  });
}

let cachedQuota = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 60000;

export async function getWorkspaceQuota(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedQuota && (now - lastFetchedAt < CACHE_TTL_MS)) {
    return cachedQuota;
  }

  const [claudeQuota, agyRes, codexQuota] = await Promise.all([
    fetchClaudeQuota(),
    execCommandWithTimeout("agy", ["-p", "/usage"], 8000),
    fetchCodexQuotaFromAuth(),
  ]);

  const claude = claudeQuota || { available: false };
  const agy = parseAgyUsageText(agyRes.stdout || agyRes.stderr);
  const codex = codexQuota || { available: false };

  cachedQuota = {
    claude,
    codex,
    agy,
    fetchedAt: new Date(now).toISOString(),
    ttlSec: Math.round(CACHE_TTL_MS / 1000),
  };
  lastFetchedAt = now;
  return cachedQuota;
}
