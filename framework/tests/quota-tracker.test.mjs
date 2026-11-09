import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import http from "node:http";
import { parseClaudeUsageText, parseAgyUsageText, parseCodexUsageResponse, fetchCodexQuotaFromAuth, getWorkspaceQuota, parseClaudeUtilization, fetchClaudeQuota, formatResetDate } from "../src/quota-tracker.mjs";
import { startMonitor } from "../src/monitor.mjs";

test("quota-tracker: parseClaudeUtilization extracts quota and account info from ~/.claude.json structure", () => {
  const sample = {
    oauthAccount: {
      emailAddress: "developer@example.com",
      seatTier: "team_standard",
      billingType: "stripe_subscription",
    },
    cachedUsageUtilization: {
      utilization: {
        five_hour: { utilization: 0, resets_at: null },
        seven_day: { utilization: 0.15, resets_at: "2026-11-15T11:00:00+00:00" },
        limits: [
          { kind: "session", group: "session", percent: 10, resets_at: null },
          { kind: "weekly_all", group: "weekly", percent: 25, resets_at: "2026-11-15T11:00:00+00:00" },
        ],
      },
    },
  };

  const parsed = parseClaudeUtilization(sample);
  assert.equal(parsed.available, true);
  assert.equal(parsed.email, "developer@example.com");
  assert.equal(parsed.planType, "team_standard");
  assert.equal(parsed.accountLabel, "developer@example.com (Team Standard)");
  assert.equal(parsed.sessionUsedPct, 10);
  assert.equal(parsed.sessionRemainingPct, 90);
  assert.equal(parsed.weeklyUsedPct, 25);
  assert.equal(parsed.weeklyRemainingPct, 75);
  assert.ok(parsed.weeklyResetsAt.includes("15 Nov") || parsed.weeklyResetsAt.includes("Nov 15"));
});

test("quota-tracker: fetchClaudeQuota reads mock claude.json safely", async (t) => {
  const notFound = await fetchClaudeQuota("C:/non/existent/path/claude.json");
  assert.ok(notFound);

  const root = mkdtempSync(path.join(tmpdir(), "baan-claude-test-"));
  t.after(() => {
    try { rmSync(root, { recursive: true, force: true }); } catch {}
  });

  const mockClaudeJsonPath = path.join(root, ".claude.json");
  const { writeFileSync } = await import("node:fs");
  writeFileSync(mockClaudeJsonPath, JSON.stringify({
    oauthAccount: { emailAddress: "test@company.com", seatTier: "pro" },
    cachedUsageUtilization: {
      utilization: {
        limits: [
          { kind: "session", percent: 5 },
          { kind: "weekly_all", percent: 40, resets_at: "2026-11-20T00:00:00Z" },
        ],
      },
    },
  }));

  const res = await fetchClaudeQuota(mockClaudeJsonPath);
  assert.equal(res.available, true);
  assert.equal(res.email, "test@company.com");
  assert.equal(res.accountLabel, "test@company.com (Pro)");
  assert.equal(res.sessionUsedPct, 5);
  assert.equal(res.sessionRemainingPct, 95);
  assert.equal(res.weeklyUsedPct, 40);
  assert.equal(res.weeklyRemainingPct, 60);
});

test("quota-tracker: formatResetDate handles timestamps and date strings", () => {
  assert.equal(formatResetDate(null), null);
  assert.equal(formatResetDate(""), null);
  assert.ok(formatResetDate(1794390214).includes("Nov"));
  assert.ok(formatResetDate("2026-11-15T11:00:00+00:00").includes("Nov"));
  assert.equal(formatResetDate("8:00 PM on Friday"), "8:00 PM on Friday");
});

test("quota-tracker: parseClaudeUsageText parses 5-hour session and weekly limits", () => {
  const sample = `You are currently using your subscription to power your Claude Code usage

Current session: 15% used · resets Nov 8, 9:19pm (Asia/Bangkok)
Current week (all models): 80% used · resets Nov 8, 5:59pm (Asia/Bangkok)

What's contributing to your usage?
Approximate · sessions on this machine only · shares overlap

Last 7d · 2963 requests · 45 sessions
`;

  const parsed = parseClaudeUsageText(sample);
  assert.equal(parsed.available, true);
  assert.equal(parsed.sessionUsedPct, 15);
  assert.equal(parsed.sessionRemainingPct, 85);
  assert.equal(parsed.sessionResetsAt, "Nov 8, 9:19pm (Asia/Bangkok)");
  assert.equal(parsed.weeklyUsedPct, 80);
  assert.equal(parsed.weeklyRemainingPct, 20);
  assert.equal(parsed.weeklyResetsAt, "Nov 8, 5:59pm (Asia/Bangkok)");
  assert.equal(parsed.requestsLast7d, 2963);
  assert.equal(parsed.sessionsLast7d, 45);
});

test("quota-tracker: parseAgyUsageText parses Gemini, Argon Weekly, and Claude/GPT limits", () => {
  const sample = [
    "Gemini Models\tWeekly Limit Remaining\t53%\t2026-11-14T08:27:25Z",
    "Gemini Models\tFive Hour Limit Remaining\t50%\t2026-11-08T10:50:26Z",
    "Claude and GPT models\tWeekly Limit Remaining\t0%\t2026-11-11T01:29:45Z",
    "Claude and GPT models\tFive Hour Limit Remaining\tdisabled\t",
    "Gemini 4 Argon\tGemini 4 Argon Weekly Limit\t35%\t2026-11-14T07:51:18Z",
  ].join("\n");

  const parsed = parseAgyUsageText(sample);
  assert.equal(parsed.available, true);
  assert.equal(parsed.gemini5hRemainingPct, 50);
  assert.equal(parsed.gemini5hResetsAt, "2026-11-08T10:50:26Z");
  assert.equal(parsed.geminiWeeklyRemainingPct, 53);
  assert.equal(parsed.geminiWeeklyResetsAt, "2026-11-14T08:27:25Z");
  assert.equal(parsed.argonWeeklyRemainingPct, 35);
  assert.equal(parsed.argonWeeklyResetsAt, "2026-11-14T07:51:18Z");
  assert.equal(parsed.claudeGptWeeklyRemainingPct, 0);
  assert.equal(parsed.items.length, 5);
});

test("quota-tracker: parseCodexUsageResponse parses ChatGPT wham response accurately", () => {
  const sample = {
    email: "jaturapat.code@gmail.com",
    plan_type: "plus",
    rate_limit: {
      allowed: true,
      limit_reached: false,
      primary_window: {
        used_percent: 98,
        limit_window_seconds: 604800,
        reset_after_seconds: 259396,
        reset_at: 1794390214,
      },
      secondary_window: {
        used_percent: 20,
        reset_at: 1794390214,
      },
    },
    credits: {
      has_credits: false,
      balance: "0",
      unlimited: false,
    },
  };

  const parsed = parseCodexUsageResponse(sample);
  assert.equal(parsed.available, true);
  assert.equal(parsed.email, "jaturapat.code@gmail.com");
  assert.equal(parsed.planType, "plus");
  assert.equal(parsed.accountLabel, "jaturapat.code@gmail.com (Plus)");
  assert.equal(parsed.weeklyUsedPct, 98);
  assert.equal(parsed.weeklyRemainingPct, 2);
  assert.equal(parsed.weeklyWindowSeconds, 604800);
  assert.ok(parsed.weeklyResetsAt.includes("11 Nov") || parsed.weeklyResetsAt.includes("Nov 11") || parsed.weeklyResetsAt.includes("Nov"));
  assert.equal(parsed.sessionUsedPct, 20);
  assert.equal(parsed.sessionRemainingPct, 80);
  assert.equal(parsed.credits.hasCredits, false);
});

test("quota-tracker: fetchCodexQuotaFromAuth handles API key mode and missing file safely", async (t) => {
  const notFound = await fetchCodexQuotaFromAuth("C:/path/that/does/not/exist/auth.json");
  assert.equal(notFound.available, false);
  assert.ok(notFound.error);

  const root = mkdtempSync(path.join(tmpdir(), "baan-codex-test-"));
  t.after(() => {
    try { rmSync(root, { recursive: true, force: true }); } catch {}
  });
  const apiKeyAuthPath = path.join(root, "auth.json");
  const { writeFileSync } = await import("node:fs");
  writeFileSync(apiKeyAuthPath, JSON.stringify({ auth_mode: "api_key", OPENAI_API_KEY: "sk-fake" }));

  const apiKeyRes = await fetchCodexQuotaFromAuth(apiKeyAuthPath);
  assert.equal(apiKeyRes.available, true);
  assert.equal(apiKeyRes.planType, "api_key");
});

test("quota-tracker: getWorkspaceQuota returns valid cached structure", async () => {
  const quota = await getWorkspaceQuota(false);
  assert.ok(quota);
  assert.ok(quota.fetchedAt);
  assert.ok("claude" in quota);
  assert.ok("codex" in quota);
  assert.ok("agy" in quota);
});

test("monitor: /api/quota/refresh endpoint returns updated state", async (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "baan-quota-test-"));
  mkdirSync(path.join(root, ".baan", "runs"), { recursive: true });
  t.after(() => {
    try { rmSync(root, { recursive: true, force: true }); } catch {}
  });

  const port = 35100 + Math.floor(Math.random() * 500);
  const monitorInstance = await startMonitor({
    workspaceRoot: root,
    port,
    openBrowser: false,
    tui: false,
  });
  t.after(() => monitorInstance.server.close());

  const postRefresh = () =>
    new Promise((resolve, reject) => {
      const req = http.request(
        `http://localhost:${port}/api/quota/refresh`,
        { method: "POST" },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
        }
      );
      req.on("error", reject);
      req.end();
    });

  const res = await postRefresh();
  assert.equal(res.statusCode, 200);
  assert.ok("quota" in res.body);
  assert.equal(res.body.workspaceName, path.basename(root));
});
