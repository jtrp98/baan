import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const frameworkDir = path.resolve(testDir, "..");
const repoRoot = path.resolve(frameworkDir, "..");

test("ToS Compliance: AGENTS.md และ CLAUDE.md ต้องมีอยู่จริง และเนื้อหาเหมือนกัน 100%", () => {
  const agentsPath = path.join(repoRoot, "AGENTS.md");
  const claudePath = path.join(repoRoot, "CLAUDE.md");

  assert.ok(existsSync(agentsPath), "ต้องมี AGENTS.md ที่ราก repo");
  assert.ok(existsSync(claudePath), "ต้องมี CLAUDE.md ที่ราก repo");

  const agentsContent = readFileSync(agentsPath, "utf8");
  const claudeContent = readFileSync(claudePath, "utf8");

  assert.equal(
    agentsContent,
    claudeContent,
    "AGENTS.md และ CLAUDE.md ต้องเหมือนกันทุกประการ (zero drift)"
  );
});

test("ToS Compliance: AGENTS.md / CLAUDE.md ต้องบรรจุกฎเหล็ก ToS 5 ข้อของทั้ง 3 ค่าย", () => {
  const content = readFileSync(path.join(repoRoot, "AGENTS.md"), "utf8");

  // ต้องครอบคลุมทั้ง 3 ค่าย
  assert.match(content, /ToS ทั้ง 3 ค่าย/);
  assert.match(content, /OpenAI/);
  assert.match(content, /Anthropic/);
  assert.match(content, /Google/);
  assert.match(content, /codex/);
  assert.match(content, /claude/);
  assert.match(content, /agy/);

  // 5 กฎเหล็ก
  assert.match(content, /Official & Documented Interfaces Only/);
  assert.match(content, /No Credential Sniffing/);
  assert.match(content, /Anti-Abuse & Zero Evasion/);
  assert.match(content, /Account Safety First/);
  assert.match(content, /No Model Distillation/);
});

test("ToS Compliance: CONVENTIONS.md และ LEARNING.md ต้องบรรจุข้อกำหนด ToS และหลักการข้อที่ 10", () => {
  const conventionsPath = path.join(frameworkDir, "CONVENTIONS.md");
  const conventions = readFileSync(conventionsPath, "utf8");

  assert.match(conventions, /ToS ของ 3 ค่าย \(OpenAI, Anthropic, Google\)/);
  assert.match(conventions, /sanctioned subprocess adapters/);
  assert.match(conventions, /Account Safety First/);

  const learningPath = path.join(frameworkDir, "LEARNING.md");
  const learning = readFileSync(learningPath, "utf8");

  assert.match(learning, /10\. \*\*ความปลอดภัยของบัญชีผู้ใช้และ ToS ของ 3 ค่ายสำคัญสูงสุด\*\*/);
  assert.match(learning, /OpenAI, Anthropic และ Google/);
});

test("ToS Compliance: ซอร์สโค้ดใน src/ ต้องไม่มีการแอบส่อง .credentials.json หรือเรียก Private Web Endpoints", () => {
  const srcDir = path.join(frameworkDir, "src");

  function scanDir(dir) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        scanDir(full);
      } else if (full.endsWith(".mjs") || full.endsWith(".js")) {
        const code = readFileSync(full, "utf8");
        // ห้ามเข้าถึง private web API endpoints ของ web chatgpt / claude
        assert.ok(
          !code.includes("chatgpt.com/backend-api"),
          `พบ private endpoint ใน ${full}: chatgpt.com/backend-api`
        );
        assert.ok(
          !code.includes("claude.ai/api"),
          `พบ private endpoint ใน ${full}: claude.ai/api`
        );
        // ห้ามส่อง .credentials.json
        assert.ok(
          !code.includes(".credentials.json"),
          `พบการอ้างอิงไฟล์ private credentials ใน ${full}: .credentials.json`
        );
      }
    }
  }

  scanDir(srcDir);
});
