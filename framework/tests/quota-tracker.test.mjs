import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import http from "node:http";
import {
  parseClaudeUsageText,
  parseAgyUsageText,
  parseCodexUsageResponse,
  fetchCodexQuotaFromAuth,
  getWorkspaceQuota,
  parseClaudeUtilization,
  fetchClaudeQuota,
  formatResetDate,
} from "../src/quota-tracker.mjs";
import { startMonitor } from "../src/monitor.mjs";

test("quota-tracker: getWorkspaceQuota returns null (quota tracking disabled for zero ToS risk)", async () => {
  const quota = await getWorkspaceQuota(false);
  assert.equal(quota, null);
});

test("quota-tracker: fetchClaudeQuota returns disabled without external network calls", async () => {
  const res = await fetchClaudeQuota();
  assert.equal(res.available, false);
});

test("quota-tracker: fetchCodexQuotaFromAuth returns disabled without external network calls", async () => {
  const res = await fetchCodexQuotaFromAuth();
  assert.equal(res.available, false);
});

test("quota-tracker: helper parsers return safe disabled structures", () => {
  assert.equal(formatResetDate(), null);
  assert.equal(parseClaudeUtilization().available, false);
  assert.equal(parseClaudeUsageText().available, false);
  assert.equal(parseAgyUsageText().available, false);
  assert.equal(parseCodexUsageResponse().available, false);
});

test("monitor: /api/quota/refresh endpoint returns updated state with null quota", async (t) => {
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
  assert.equal(res.body.quota, null);
  assert.equal(res.body.workspaceName, path.basename(root));
});
