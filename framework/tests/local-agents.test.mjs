import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  normalizeAgentStatus,
  normalizeLocalAgents,
  isAgentEnabled,
  applyLocalAgents,
  loadLocalConfig,
} from "../src/config.mjs";
import { fallbackChainFor } from "../src/plan.mjs";
import { updateClis } from "../src/update-clis.mjs";
import { runParityCommand, PARITY_STATUS } from "../src/parity.mjs";
import { cli } from "../src/cli.mjs";

test("normalizeAgentStatus: แปลงทั้ง string, boolean, และ object ได้ถูกต้อง", () => {
  assert.equal(normalizeAgentStatus("open"), true);
  assert.equal(normalizeAgentStatus("OPEN"), true);
  assert.equal(normalizeAgentStatus("enabled"), true);
  assert.equal(normalizeAgentStatus("true"), true);
  assert.equal(normalizeAgentStatus("on"), true);
  assert.equal(normalizeAgentStatus(true), true);
  assert.equal(normalizeAgentStatus({ enabled: true }), true);
  assert.equal(normalizeAgentStatus({ status: "open" }), true);

  assert.equal(normalizeAgentStatus("close"), false);
  assert.equal(normalizeAgentStatus("CLOSE"), false);
  assert.equal(normalizeAgentStatus("disabled"), false);
  assert.equal(normalizeAgentStatus("false"), false);
  assert.equal(normalizeAgentStatus("off"), false);
  assert.equal(normalizeAgentStatus(false), false);
  assert.equal(normalizeAgentStatus({ enabled: false }), false);
  assert.equal(normalizeAgentStatus({ status: "close" }), false);
});

test("normalizeLocalAgents: คืน null เมื่อไม่มีข้อมูล และแปลง map ทุกคีย์เป็นตัวพิมพ์เล็ก", () => {
  assert.equal(normalizeLocalAgents(null), null);
  assert.equal(normalizeLocalAgents(undefined), null);

  const res = normalizeLocalAgents({
    Claude: "open",
    CODEX: true,
    agy: "close",
  });
  assert.deepEqual(res, {
    claude: true,
    codex: true,
    agy: false,
  });
});

test("isAgentEnabled: backward compatible เมื่อไม่มี localConfig และตรวจสอบสถานะถูกต้อง", () => {
  assert.equal(isAgentEnabled("codex", null), true);
  assert.equal(isAgentEnabled("codex", {}), true);
  assert.equal(isAgentEnabled("codex", { agents: null }), true);

  const local = {
    agents: {
      claude: true,
      codex: true,
      agy: false,
    },
  };
  assert.equal(isAgentEnabled("claude", local), true);
  assert.equal(isAgentEnabled("Claude", local), true);
  assert.equal(isAgentEnabled("codex", local), true);
  assert.equal(isAgentEnabled("agy", local), false);
  assert.equal(isAgentEnabled("AGY", local), false);
  assert.equal(isAgentEnabled("unknown_agent", local), true);
});

test("applyLocalAgents: อัปเดตฟิลด์ enabled บน cfg.agents ตาม localConfig", () => {
  const cfg = {
    agents: {
      claude: { label: "Claude" },
      codex: { label: "Codex" },
      agy: { label: "Agy" },
    },
  };
  const local = { agents: { claude: true, codex: true, agy: false } };
  applyLocalAgents(cfg, local);
  assert.equal(cfg.agents.claude.enabled, true);
  assert.equal(cfg.agents.codex.enabled, true);
  assert.equal(cfg.agents.agy.enabled, false);
});

test("loadLocalConfig: อ่านบล็อก agents ใน local.json รูปแบบ open/close ได้สมบูรณ์", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "baan-local-agents-"));
  try {
    const file = path.join(dir, "local.json");
    writeFileSync(file, JSON.stringify({
      auto_update: true,
      agents: {
        claude: "open",
        codex: "open",
        agy: "close",
      },
      workspaces: ["C:/src/project-a"],
    }), "utf8");

    const res = loadLocalConfig(dir);
    assert.equal(res.auto_update, true);
    assert.deepEqual(res.agents, {
      claude: true,
      codex: true,
      agy: false,
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("fallbackChainFor: คัด agent ที่ปิดออกจาก fallback chain อัตโนมัติ", () => {
  const cfg = {
    agents: {
      claude: { label: "Claude Code", enabled: true },
      codex: { label: "Codex CLI", enabled: true },
      agy: { label: "Agy", enabled: false },
    },
    tiers: {
      t2: {
        _fallback: ["codex", "agy", "claude"],
        claude: { model: "opus" },
        codex: { model: "sol" },
        agy: { model: "argon" },
      },
    },
  };

  const chain = fallbackChainFor(cfg, "t2", "codex");
  assert.deepEqual(chain, ["codex", "claude"]);
  assert.ok(!chain.includes("agy"));

  const chainAgyChosen = fallbackChainFor(cfg, "t2", "agy");
  assert.deepEqual(chainAgyChosen, ["codex", "claude"]);
});

test("fallbackChainFor: เคารพ localConfig ที่ส่งตรงเข้ามา", () => {
  const cfg = {
    agents: {
      claude: { label: "Claude Code" },
      codex: { label: "Codex CLI" },
      agy: { label: "Agy" },
    },
    tiers: {
      t2: {
        _fallback: ["codex", "agy", "claude"],
        claude: { model: "opus" },
        codex: { model: "sol" },
        agy: { model: "argon" },
      },
    },
  };
  const local = { agents: { claude: false, codex: true, agy: false } };
  const chain = fallbackChainFor(cfg, "t2", "codex", local);
  assert.deepEqual(chain, ["codex"]);
});

test("updateClis: ข้าม agent ที่ถูกปิดใน localConfig พร้อมบันทึกสถานะ skipped", async () => {
  const logs = [];
  const fakeClis = [
    {
      name: "claude",
      label: "Claude Code",
      checkCmd: 'node -e "console.log(\'1.0.0\')"',
      updateCmd: 'node -e "process.exit(0)"',
    },
    {
      name: "agy",
      label: "Agy",
      checkCmd: 'node -e "console.log(\'1.0.0\')"',
      updateCmd: 'node -e "process.exit(0)"',
    },
  ];
  const local = { agents: { claude: true, agy: false } };

  const res = await updateClis({
    clis: fakeClis,
    localConfig: local,
    onLog: (m) => logs.push(m),
  });

  assert.equal(res.ok, true);
  assert.equal(res.results.length, 2);
  assert.equal(res.results[0].name, "claude");
  assert.equal(res.results[0].skipped, undefined);
  assert.equal(res.results[1].name, "agy");
  assert.equal(res.results[1].skipped, true);
  assert.equal(res.results[1].reason, "disabled_in_local_config");
  assert.ok(logs.some((l) => l.includes("ข้าม: ปิดใช้งานใน local.json (close)")));
});

test("runParityCommand: แสดง disabled_by_config เมื่อ agent ถูกปิดใน localConfig", async () => {
  const local = { agents: { claude: true, codex: true, agy: false } };
  const res = await runParityCommand({
    json: true,
    localConfig: local,
  });

  const agyReport = res.find((r) => r.agent === "agy");
  assert.ok(agyReport);
  assert.equal(agyReport.matrix.execution.status, PARITY_STATUS.DISABLED_BY_CONFIG);

  await assert.rejects(
    async () => {
      await runParityCommand({ agent: "agy", json: true, localConfig: local });
    },
    /agent 'agy' ถูกปิดการใช้งานใน local\.json \(close\)/
  );
});

test("CLI: ปฏิเสธเมื่อระบุ --agent ตัวที่ถูกปิดใน localConfig", async () => {
  const local = { agents: { agy: false, codex: true, claude: true } };
  await assert.rejects(
    cli(["run", "--goal", "test goal", "--build", "echo build", "--test", "echo test", "--agent", "agy", "--dry-run"], { localConfig: local }),
    /agent 'agy' ถูกปิดการใช้งานใน local\.json \(close\)/
  );
});

test("CLI: สลับไปใช้ agent ตัวอื่นที่เปิดอัตโนมัติเมื่อ default agent ถูกปิดใน localConfig", async () => {
  const local = { agents: { codex: false, claude: true, agy: false } };
  const res = await cli(["run", "--goal", "test goal", "--build", "echo build", "--test", "echo test", "--dry-run"], { localConfig: local });
  assert.ok(res.packages.length > 0);
});

test("CLI: ปฏิเสธเมื่อไม่มี agent ใดเปิดใช้งานใน localConfig เลย", async () => {
  const local = { agents: { codex: false, claude: false, agy: false } };
  await assert.rejects(
    cli(["run", "--goal", "test goal", "--build", "echo build", "--test", "echo test", "--dry-run"], { localConfig: local }),
    /ไม่มี agent ใดเปิดใช้งานใน local\.json สำหรับ tier นี้/
  );
});

test("CLI: baan --list แสดง local_agents ที่ถูกบันทึกใน localConfig", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "baan-local-list-"));
  try {
    const file = path.join(dir, "local.json");
    writeFileSync(file, JSON.stringify({
      agents: {
        claude: "open",
        codex: "open",
        agy: "close",
      },
    }), "utf8");

    const oldEnv = process.env.BAAN_LOCAL_FILE;
    process.env.BAAN_LOCAL_FILE = file;
    try {
      const res = await cli(["--list"]);
      assert.deepEqual(res.local_agents, {
        claude: true,
        codex: true,
        agy: false,
      });
    } finally {
      if (oldEnv) process.env.BAAN_LOCAL_FILE = oldEnv;
      else delete process.env.BAAN_LOCAL_FILE;
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

