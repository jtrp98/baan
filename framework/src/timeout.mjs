export const DEFAULT_TIMEOUT_SEC = 1800;

export function validateTimeout(value, label = "--timeout", allowZero = false) {
  if (allowZero && value === 0) return 0;
  if (!Number.isInteger(value) || value < 1 || value > 86400) {
    throw new Error(`${label} ต้องเป็นจำนวนเต็ม 1–86400 วินาที (ได้: ${value})`);
  }
  return value;
}

export function resolveTimeout(opts, tier = {}) {
  if (opts.timeoutSet || opts.explicit?.has("timeoutSec")) return validateTimeout(opts.timeoutSec);
  if (Object.hasOwn(tier, "_timeoutSec")) return validateTimeout(tier._timeoutSec, "tier._timeoutSec");
  return validateTimeout(opts.timeoutSec === undefined ? DEFAULT_TIMEOUT_SEC : opts.timeoutSec, "defaults.timeout_sec");
}
