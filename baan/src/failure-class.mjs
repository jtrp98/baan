// จัดประเภทเหตุที่งานไม่สำเร็จ เพื่อแยก "สภาพแวดล้อมขวาง" ออกจาก "งานทำไม่ได้/ไม่ผ่าน" ในตัวชี้วัด
// school-bot 2026-10-29..11-04: ครึ่งหนึ่งของ call ที่ไม่สำเร็จเกิดจาก sandbox/สิทธิ์/feed/startup ไม่ใช่โค้ด
// แต่ report เดิมแยกไม่ได้ จึงมองไม่เห็นว่าเวลาเสียไปกับอะไร
//
// ดูเฉพาะ error ที่สรุปแล้ว + ท้ายคำตอบ ไม่ดู stderr ดิบ เพราะ stderr ของ codex มี transcript ของใบงานปนอยู่
// และใบงานมักมีคำอย่าง "sandbox"/"read-only" ในคำสั่ง ซึ่งไม่ใช่อาการของงานนั้น
const TAIL_CHARS = 1500;
const ENV_PATTERNS = /sandbox|permission|access is denied|read-only|writable|NU1900|NuGet|feed|socket|couldn.t reach|getaddrinfo|ENOTFOUND|no data of the requested type|failed to write file|เขียนไม่ได้|นอกขอบเขตเขียน|ไม่มีสิทธิ์/i;

const BY_STATE = {
  fail: "VERDICT_FAIL",
  needs_design_change: "NEEDS_DESIGN",
  needs_requirement_change: "NEEDS_REQUIREMENT",
  needs_human: "NEEDS_HUMAN",
  blocked: "BLOCKED_OTHER",
  failed: "RUNNER_FAILURE",
};

export const ENVIRONMENT_FAILURE = "ENVIRONMENT_FAILURE";

export function classifyFailure({ state, answer = "", error = "" } = {}) {
  if (!state || state === "completed") return null;
  if (state === "timeout") return "TIMEOUT";
  const hay = `${error ?? ""}\n${String(answer ?? "").slice(-TAIL_CHARS)}`;
  if (ENV_PATTERNS.test(hay)) return ENVIRONMENT_FAILURE;
  return BY_STATE[state] ?? "OTHER";
}
