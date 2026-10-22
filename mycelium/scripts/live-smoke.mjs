// live smoke ของตัวรันทุกค่ายผ่าน mycelium-role จริง — ใช้โควตาจริง จึงไม่อยู่ใน npm test
// พิสูจน์ด้วยค่าที่ AI เดาไม่ได้ (nonce สุ่ม, sha256, commit hash) และตรวจผลจากดิสก์เอง ไม่เชื่อคำตอบของ AI
// ใช้: npm run smoke:live -- [--tier t3] [--agents claude,codex,agy]
import { spawn, spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/mycelium-role.mjs", import.meta.url));

function parseArgs(argv) {
  const o = { tier: "t3", agents: ["claude", "codex", "agy"] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--tier") o.tier = argv[++i];
    else if (argv[i] === "--agents") o.agents = argv[++i].split(",").filter(Boolean);
    else { console.error(`อาร์กิวเมนต์ไม่รู้จัก: ${argv[i]}\nใช้: npm run smoke:live -- [--tier t3] [--agents claude,codex,agy]`); process.exit(2); }
  }
  return o;
}

const PROBE_JS = `const fs = require("fs");
const c = require("crypto");
console.log(c.createHash("sha256").update(fs.readFileSync(__dirname + "/secret.txt", "utf8").trim() + "-shell").digest("hex").slice(0, 16));
`;

// sandbox ต่อค่าย/โหมด: secret สุ่ม + probe.js + git repo หนึ่ง commit (hash เดาไม่ได้ ใช้พิสูจน์ว่ารันคำสั่งอ่านอย่างเดียวได้)
function sandbox(base, name) {
  const dir = path.join(base, name);
  mkdirSync(dir, { recursive: true });
  const secret = `NONCE-${randomBytes(6).toString("hex").toUpperCase()}`;
  writeFileSync(path.join(dir, "secret.txt"), secret + "\n");
  writeFileSync(path.join(dir, "probe.js"), PROBE_JS);
  const git = (...a) => spawnSync("git", ["-c", "user.name=smoke", "-c", "user.email=smoke@localhost", ...a], { cwd: dir, encoding: "utf8" });
  git("init", "-q");
  git("add", "probe.js");
  git("commit", "-q", "-m", `smoke ${randomBytes(4).toString("hex")}`);
  const commit = git("rev-parse", "HEAD").stdout.trim();
  return { dir, secret, hash: createHash("sha256").update(secret + "-shell").digest("hex").slice(0, 16), commit };
}

function run(agent, tier, sb, write, task) {
  return new Promise((resolve) => {
    const args = [BIN, "--agent", agent, "--tier", tier, "--no-fallback", "--timeout", "420", "--cwd", sb.dir, "--task", task];
    if (write) args.push("--write");
    const child = spawn(process.execPath, args, { windowsHide: true });
    let out = "";
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { out += d; });
    child.on("close", () => {
      const reportDir = out.match(/รายงานฉบับเต็มอยู่ที่ (.+)$/m)?.[1]?.trim() ?? null;
      let rec = null;
      let stderr = "";
      try { rec = JSON.parse(readFileSync(path.join(reportDir, "report.json"), "utf8")).results[0]; } catch { /* ไม่มีรายงาน = ดู out ดิบ */ }
      try { stderr = readFileSync(path.join(reportDir, `${agent}.stderr.txt`), "utf8"); } catch { /* ไม่มี */ }
      resolve({ answer: rec?.answer ?? "", state: rec?.state ?? "no-report", secs: ((rec?.durationMs ?? 0) / 1000).toFixed(1), reportDir, stderr, tail: out.slice(-500) });
    });
  });
}

const READ_TASK = (outerFile) => `งานทดสอบระบบ (smoke) — ตอบสั้นๆ ตามข้อ:
1) อ่านไฟล์ secret.txt ในโฟลเดอร์ปัจจุบัน และไฟล์ ${outerFile} (อยู่นอกโฟลเดอร์ปัจจุบัน) แล้วตอบค่าจากทั้งสองไฟล์ตรงตัว ไฟล์ละหนึ่งบรรทัด
2) รันคำสั่ง \`git log -1 --format=%H\` ในโฟลเดอร์ปัจจุบัน แล้วตอบ output ตรงตัว
3) รันคำสั่ง \`node probe.js\` ในโฟลเดอร์ปัจจุบัน แล้วตอบ output ตรงตัว
4) ลองสร้างไฟล์ ro-probe.txt เนื้อหา "x" — ข้อนี้คาดว่าทำไม่ได้ในโหมดอ่านอย่างเดียว ถ้าระบบไม่อนุญาตให้ตอบว่า "เขียนไม่ได้" (ไม่นับเป็นข้อที่ล้ม)
ห้ามคำนวณหรือเดาค่าเอง ข้อไหนทำไม่ได้ให้บอกตรงๆ · ทำข้อ 1–3 ได้ครบให้จบด้วยบรรทัด DONE ถ้ามีข้อใน 1–3 ที่ทำไม่ได้ให้จบด้วยบรรทัด BLOCKED`;
const WRITE_TASK = `งานทดสอบระบบ (smoke, อนุญาตให้เขียนไฟล์) — รันคำสั่ง \`node probe.js\` ในโฟลเดอร์ปัจจุบัน แล้วสร้างไฟล์ result.txt ในโฟลเดอร์ปัจจุบัน
ที่มีเนื้อหาบรรทัดเดียวคือ output นั้นตรงตัว (ห้ามคำนวณหรือเดาเอง) แล้วตอบสั้นๆ ว่าเขียนอะไรลงไป
ทำได้ครบให้จบด้วยบรรทัด DONE ถ้าทำไม่ได้ให้จบด้วยบรรทัด BLOCKED`;

const mark = (b) => (b === null ? "–" : b ? "✅" : "❌");

async function main() {
  const { tier, agents } = parseArgs(process.argv.slice(2));
  const base = mkdtempSync(path.join(tmpdir(), "mycelium-live-smoke-"));
  // ปลอม sandbox ให้เป็นรูป workspace จริง: config ที่ราก + ไฟล์ลับนอก cwd ของ agent
  // (jetski ของ agy กันอ่านนอก workspace และ headless ปฏิเสธแทนการถาม — sandbox เดิมที่อยู่ใน %TEMP%
  //  safe area ทั้งหมดเลยตรวจไม่พบบั๊กนี้ จน SA จริงที่ schoolbright fallback ไป agy ได้คำตอบว่าง 2026-10-22)
  const outerSecret = `OUTER-${randomBytes(6).toString("hex").toUpperCase()}`;
  const outerFile = path.join(base, "outer-secret.txt");
  writeFileSync(outerFile, outerSecret + "\n");
  writeFileSync(path.join(base, "mycelium.config.json"), "{}\n");
  console.log(`live smoke @ ${tier}: ${agents.join(", ")} · sandbox: ${base} (ใช้โควตาจริง ${agents.length * 2} session)`);

  const results = await Promise.all(agents.flatMap((agent) => {
    const ro = sandbox(base, `${agent}-ro`);
    const rw = sandbox(base, `${agent}-rw`);
    return [
      run(agent, tier, ro, false, READ_TASK(outerFile)).then((r) => ({ agent, kind: "ro", sb: ro, r })),
      run(agent, tier, rw, true, WRITE_TASK).then((r) => ({ agent, kind: "rw", sb: rw, r })),
    ];
  }));

  const v = Object.fromEntries(agents.map((a) => [a, { agent: a, notes: [], reports: [] }]));
  for (const { agent, kind, sb, r } of results) {
    const x = v[agent];
    x.reports.push(r.reportDir ?? `(ไม่มีรายงาน) ${r.tail}`);
    if (/setup refresh had errors/.test(r.stderr)) x.notes.push(`${kind}: shell sandbox ของ codex พัง (setup refresh had errors)`);
    if (/mcp: node_repl/.test(r.stderr)) x.notes.push(`${kind}: ใช้ MCP node_repl แทน shell`);
    if (kind === "ro") {
      x.readFile = r.answer.includes(sb.secret);
      x.readOuter = r.answer.includes(outerSecret);
      x.readCmd = r.answer.includes(sb.commit);
      x.runCode = r.answer.includes(sb.hash);
      x.roBlocked = !existsSync(path.join(sb.dir, "ro-probe.txt"));
      x.roState = r.state;
      x.roSecs = r.secs;
      // completed ทั้งที่ข้อบังคับล้ม = role รายงานสถานะเกินจริง (CONVENTIONS §8)
      x.roStateHonest = !(r.state === "completed" && !(x.readFile && x.readOuter && x.readCmd && x.runCode));
    } else {
      const f = path.join(sb.dir, "result.txt");
      x.writeFile = existsSync(f) && readFileSync(f, "utf8").trim() === sb.hash;
      x.rwState = r.state;
      x.rwSecs = r.secs;
      x.rwStateHonest = !(r.state === "completed" && !x.writeFile);
    }
  }

  // เกณฑ์ผ่าน: อ่านไฟล์ (ใน cwd และนอก cwd แบบ absolute path) + รันคำสั่งอ่านอย่างเดียว + read-only กันเขียนจริง
  // + --write รันโค้ดแล้วเขียนได้ + สถานะไม่เกินจริง · runCode ใน read-only เป็นข้อมูลประกอบ
  // (claude อนุญาตเฉพาะคำสั่งอ่านอย่างเดียวในโหมดนี้โดยตั้งใจ)
  const rows = Object.values(v).map((x) => ({ ...x, pass: !!(x.readFile && x.readOuter && x.readCmd && x.roBlocked && x.writeFile && x.roStateHonest && x.rwStateHonest) }));
  console.log("\n| agent | อ่านไฟล์ | อ่านนอก cwd | คำสั่งอ่าน (git log) | รันโค้ดใน RO | RO กันเขียน | --write | สถานะ RO / RW | สถานะตรงจริง | ผล |");
  console.log("|---|---|---|---|---|---|---|---|---|---|");
  for (const x of rows) {
    console.log(`| ${x.agent} | ${mark(x.readFile)} | ${mark(x.readOuter)} | ${mark(x.readCmd)} | ${mark(x.runCode)} | ${mark(x.roBlocked)} | ${mark(x.writeFile)} | ${x.roState} (${x.roSecs}s) / ${x.rwState} (${x.rwSecs}s) | ${mark(x.roStateHonest && x.rwStateHonest)} | ${x.pass ? "PASS" : "FAIL"} |`);
  }
  for (const x of rows) for (const n of [...new Set(x.notes)]) console.log(`  · ${x.agent}: ${n}`);
  console.log("\nรายงาน:");
  for (const x of rows) for (const r of x.reports) console.log(`  ${x.agent}: ${r}`);
  process.exitCode = rows.every((x) => x.pass) ? 0 : 1;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
