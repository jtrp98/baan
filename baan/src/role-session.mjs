// แกนของ baan-role (มือของ นายช่าง ในโหมดหลัก): parse args, สร้าง runDir, รันพร้อมสถานะงาน + fallback
// แยกจาก bin เพื่อให้ทดสอบได้โดยไม่เรียก AI CLI จริง
import { mkdirSync, mkdtempSync } from "node:fs";
import path from "node:path";
import { loadWorkspace, resolveRoleName, resolveWorkspaceConfig } from "./config.mjs";
import { DEFAULT_TIMEOUT_SEC, resolveTimeout, validateTimeout } from "./timeout.mjs";
import { fallbackChainFor } from "./plan.mjs";
import { parseWorkDate } from "./prompts.mjs";
import { classifyOutcome, runWithFallback } from "./scheduler.mjs";

export { DEFAULT_TIMEOUT_SEC };
export const ROLE_USAGE = `ใช้ --agent <name> [--all] --task "..." [--role <name>] [--tier t0..t5] [--model <m>] [--effort <e>] [--date YYYY-MM-DD] [--write] [--seq] [--no-fallback] [--timeout <sec>] [--cwd <dir>] [--list]`;

// cwd เริ่มต้น = ไดเรกทอรีที่เรียกคำสั่ง — ค่าเดิม (โฟลเดอร์แม่ของ package) ทำให้ นายช่าง ที่อยู่ใน
// workspace จริงแต่ลืมส่ง --cwd ได้ role ที่อ่านไฟล์ผิด repo โดยไม่มีอะไรเตือน
export function parseRoleArgs(argv, baseCwd = process.cwd()) {
  const opts = {
    agents: [], task: "", taskFile: "", write: false, seq: false, list: false,
    cwd: path.resolve(baseCwd), timeoutSec: DEFAULT_TIMEOUT_SEC, timeoutSet: false,
    tier: "", model: "", effort: "", role: "", roleAlias: "", date: "", fallback: true,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--agent": opts.agents.push(argv[++i]); break;
      case "--all": opts.agents.push("*"); break;
      case "--task": opts.task = argv[++i] ?? ""; break;
      case "--task-file": opts.taskFile = argv[++i] ?? ""; break;
      case "--write": opts.write = true; break;
      case "--seq": opts.seq = true; break;
      case "--list": opts.list = true; break;
      case "--cwd": opts.cwd = path.resolve(baseCwd, argv[++i] ?? "."); break;
      case "--timeout": opts.timeoutSec = validateTimeout(Number(argv[++i])); opts.timeoutSet = true; break;
      case "--tier": opts.tier = argv[++i] ?? ""; break;
      case "--model": opts.model = argv[++i] ?? ""; break;
      case "--effort": opts.effort = argv[++i] ?? ""; break;
      case "--role": {
        const given = argv[++i] ?? "";
        opts.role = resolveRoleName(given);
        opts.roleAlias = opts.role !== given ? given : "";
        break;
      }
      case "--date": opts.date = parseWorkDate(argv[++i]); break;
      case "--no-fallback": opts.fallback = false; break;
      default: throw new Error(`อาร์กิวเมนต์ไม่รู้จัก: ${a}\n${ROLE_USAGE}`);
    }
  }
  return opts;
}

export function resolveRoleTimeout(opts, cfg) {
  const ws = loadWorkspace(resolveWorkspaceConfig(null, opts.cwd));
  return resolveTimeout({ ...opts, timeoutSec: opts.timeoutSet ? opts.timeoutSec : ws.defaults.timeout_sec }, cfg.tiers?.[opts.tier]);
}

// ชื่อโฟลเดอร์ต้องไม่ชนเมื่อเปิดหลาย baan-role พร้อมกัน (charter ข้อ 7) — timestamp ระดับวินาทีอย่างเดียว
// ทำให้สอง role ที่ tier เดียวกันเขียนทับ <agent>.answer.txt ของกันและกัน · mkdtemp เติม suffix สุ่มแบบ atomic
export function createRunDir(reportsDir, { role, tier, write, count }, now = new Date()) {
  mkdirSync(reportsDir, { recursive: true });
  const stamp = now.toISOString().replace(/[:T]/g, "-").slice(0, 19);
  const parts = [stamp, role || null, tier ? `tier-${tier}` : write ? "write" : "read", `${count}agents`].filter(Boolean);
  return mkdtempSync(path.join(reportsDir, `${parts.join("-")}-`));
}

// แต่ละ agent ที่สั่ง = งานหนึ่งชิ้น ตัดสินผลด้วย output state ท้ายคำตอบ (CONVENTIONS §8) เหมือนโหมดอัตโนมัติ
// สลับตัวรันเมื่อติดโควตาเฉพาะตอนสั่ง agent เดียวพร้อม --tier: --all รันทุกตัวอยู่แล้ว (สลับ = ได้คำตอบซ้ำ)
// และไม่มี tier = ไม่รู้ model ของตัวสำรอง
// attempt(agent, isRequested) — --model/--effort ที่ผู้ใช้ส่งเป็นชื่อเฉพาะของ agent ที่สั่ง ตัวสำรองต้องใช้ค่าของ tier
export async function runRoleAgents({ cfg, opts, selected, attempt, onResult = () => {}, log = console.log }) {
  const canFallback = opts.fallback && !!opts.tier && selected.length === 1;
  const runOne = async (name) => {
    const tierChain = canFallback ? fallbackChainFor(cfg, opts.tier, name) : [];
    const chain = tierChain.length ? tierChain : [name];
    const { r, agent, trail } = await runWithFallback(
      chain,
      (a) => attempt(a, a === name),
      (from, to, reason) => log(`${from} ${reason === "missing" ? "ไม่ได้ติดตั้งบนเครื่อง" : "ติดโควตา/limit"} — สลับไป ${to} (ตามลำดับ fallback ของ tier ${opts.tier})`),
    );
    const cls = classifyOutcome(r);
    const res = { ...r, requested: name, agent, fallback: trail, state: cls.state, marker: cls.marker, ok: cls.ok, cliOk: r.ok };
    onResult(res);
    return res;
  };
  if (opts.seq) {
    const results = [];
    for (const name of selected) results.push(await runOne(name));
    return results;
  }
  return Promise.all(selected.map(runOne));
}
