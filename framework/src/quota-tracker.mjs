// Quota tracking ถอดออกเพื่อความปลอดภัย 100% ต่อ ToS (ไม่ยิง private web APIs และไม่ส่อง token ภายนอก)
// BAAN ติดตามการใช้งานจริงผ่าน usage-aggregator.mjs (Calls, Tokens, Cost) แทน

export function formatResetDate() {
  return null;
}

export function parseClaudeUtilization() {
  return { available: false };
}

export async function fetchClaudeQuota() {
  return { available: false };
}

export function parseClaudeUsageText() {
  return { available: false };
}

export function parseAgyUsageText() {
  return { available: false };
}

export function parseCodexUsageResponse() {
  return { available: false };
}

export async function fetchCodexQuotaFromAuth() {
  return { available: false };
}

export async function getWorkspaceQuota() {
  return null;
}
