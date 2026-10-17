// Sanity ของ agents.json: ทุก tier ต้องมีครบทั้งสาม agent (null = ยังไม่มี model ทัดเทียม)
// และ entry ที่ไม่ใช่ null ต้องมี model เป็น string
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const cfg = JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "agents.json"), "utf8"));
const AGENTS = ["claude", "codex", "agy"];

test("ทุก tier ประกาศครบทั้งสาม agent และรูปแบบถูกต้อง", () => {
  for (const [tier, conf] of Object.entries(cfg.tiers)) {
    for (const a of AGENTS) {
      assert.ok(a in conf, `tier ${tier} ต้องประกาศ ${a} ไว้เสมอ (ถ้ายังไม่มี model ให้ใส่ null)`);
      if (conf[a] !== null) {
        assert.equal(typeof conf[a].model, "string", `tier ${tier}/${a}: ต้องมี model เป็น string`);
        assert.ok(conf[a].model.length > 0);
      }
    }
  }
});

test("agy ครบทุก tier แล้วหลัง Argon เปิดตัว (2026-10-17)", () => {
  for (const tier of ["t0", "t1", "t2"]) {
    assert.match(cfg.tiers[tier].agy.model, /^gemini-4-argon-(high|medium|low)$/, `tier ${tier}: agy ต้องใช้ gemini-4-argon`);
  }
  for (const tier of ["t3", "t4", "t5"]) {
    assert.match(cfg.tiers[tier].agy.model, /^gemini-3\.8-flash-/, `tier ${tier}: agy คงเป็น flash`);
  }
});
