import { isAgentEnabled } from "./config.mjs";
import { fallbackChainFor, isTierLower } from "./plan.mjs";

const CRITICAL_DOCS_RE = /adr|contract|security|auth|pii|password|token|สิทธิ์|สัญญาร่วม|สถาปัตยกรรม|database|schema/i;

export function isCriticalDocsPacket(packet) {
  if (!packet) return false;
  const text = [packet.goal, packet.title, ...(packet.risk_tags ?? [])].join(" ");
  return Boolean((packet.contracts?.length > 0) || packet.risk === "high" || CRITICAL_DOCS_RE.test(text));
}

export function effectiveRoutingRole(role, packet = null) {
  if (role === "worker" && packet?.kind === "docs") return "docs";
  return role;
}

export function enabledProviders(cfg, localConfig = null) {
  if (!cfg?.agents) return [];
  return Object.keys(cfg.agents).filter(
    (a) => cfg.agents[a]?.enabled !== false && isAgentEnabled(a, localConfig)
  );
}

export function sortedRoleTiers(roleDef) {
  const keys = Object.keys(roleDef?.tiers ?? {});
  return keys.sort((a, b) => {
    const na = Number(a.replace(/^t/i, ""));
    const nb = Number(b.replace(/^t/i, ""));
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return a.localeCompare(b);
  });
}

function tierNumber(t) {
  if (typeof t === "number") return t;
  const m = String(t ?? "").trim().toLowerCase().match(/^t?(\d+)$/);
  return m ? Number(m[1]) : NaN;
}

export function normalizeTierName(t) {
  const n = tierNumber(t);
  return Number.isFinite(n) ? `t${n}` : null;
}

export function normalizeRoleTier(roleDef, requestedTier, { routingRole = "", packet = null, baseTier = null } = {}) {
  const ordered = sortedRoleTiers(roleDef);
  if (!ordered.length) return { tier: normalizeTierName(requestedTier) || "t2", clamped: false };

  const highest = ordered[0];
  const lowest = ordered[ordered.length - 1];
  const defaultTier = roleDef.defaultTier && ordered.includes(roleDef.defaultTier) ? roleDef.defaultTier : ordered[Math.min(1, ordered.length - 1)];

  let target = normalizeTierName(requestedTier);
  let clamped = false;

  if (!target) {
    if (routingRole === "docs") {
      target = isCriticalDocsPacket(packet) ? highest : defaultTier;
    } else {
      target = defaultTier;
    }
  } else if (target === "t0") {
    // Legacy t0 overdrive maps to the highest tier (t1) of the target role.
    target = highest;
    clamped = target !== "t0";
  }

  // Clamp to the role's own tier bounds so specialist roles never drop below their floor.
  if (!ordered.includes(target)) {
    const n = tierNumber(target);
    const minN = tierNumber(highest);
    const maxN = tierNumber(lowest);
    if (Number.isFinite(n) && n < minN) {
      target = highest;
      clamped = true;
    } else if (Number.isFinite(n) && n > maxN) {
      target = lowest;
      clamped = true;
    } else {
      target = defaultTier;
      clamped = true;
    }
  }

  // Strict High-Risk Guard for code/bugfix workers: minimum t2 to prevent rework penalty.
  if (routingRole === "worker" && (packet?.kind === "code" || packet?.kind === "bugfix" || !packet?.kind)) {
    if (packet?.risk === "high" && ordered.includes("t2") && tierNumber(target) > 2) {
      target = "t2";
      clamped = true;
    }
    const explicit = normalizeTierName(packet?.worker_tier ?? packet?.workerTier);
    const base = normalizeTierName(baseTier) || defaultTier;
    if (explicit && isTierLower(target, base)) {
      const hasContract = (packet?.contracts?.length > 0) || Boolean(packet?.read_first?.some((r) => r.pin));
      if (!hasContract && ordered.includes(base)) {
        target = base;
        clamped = true;
      }
    }
  }

  if (routingRole === "docs" && isCriticalDocsPacket(packet) && tierNumber(target) > 1) {
    target = highest;
    clamped = true;
  }

  return { tier: target, clamped };
}

export function escalateRoleTier(cfg, role, currentTier, packet = null) {
  const routingRole = effectiveRoutingRole(role, packet);
  const roleDef = cfg?.roles?.[routingRole];
  if (!roleDef?.tiers) return currentTier;
  const ordered = sortedRoleTiers(roleDef);
  const norm = normalizeTierName(currentTier);
  const idx = ordered.indexOf(norm);
  if (idx <= 0) return ordered[0] ?? currentTier;
  return ordered[idx - 1];
}

function resolveLegacyRoute(cfg, role, { forcedAgent = null, tier = null, localConfig = null, workerAgent = null } = {}) {
  const effectiveTier = tier || "t2";
  const tierConf = cfg?.tiers?.[effectiveTier] ?? {};
  const pool = enabledProviders(cfg, localConfig);
  if (forcedAgent) {
    if (!cfg?.agents?.[forcedAgent]) throw Object.assign(new Error(`ไม่พบ agent '${forcedAgent}' ใน agents config`), { failureClass: "PROVIDER_UNAVAILABLE" });
    if (!pool.includes(forcedAgent)) {
      throw Object.assign(new Error(`agent '${forcedAgent}' ถูกปิดการใช้งานใน local.json (close) — BAAN ไม่สวมรอยสลับค่ายแทน`), { failureClass: "PROVIDER_UNAVAILABLE" });
    }
    const conf = tierConf[forcedAgent] ?? {};
    return {
      role, routingRole: role, agent: forcedAgent, tier: effectiveTier, requestedTier: tier,
      clamped: false, model: conf.model ?? "", effort: conf.effort ?? "",
      timeoutSec: tierConf._timeoutSec ?? null, strict: true, tierLabel: effectiveTier,
      independentCrossProvider: Boolean(role === "verifier" && workerAgent && forcedAgent !== workerAgent),
      independentSessionOnly: Boolean(role === "verifier" && workerAgent && forcedAgent === workerAgent),
      availablePool: [forcedAgent],
    };
  }
  const chain = fallbackChainFor(cfg, effectiveTier, pool[0], localConfig);
  let chosen = chain[0];
  if (role === "verifier" && workerAgent) {
    const distinct = chain.find((a) => a !== workerAgent);
    if (distinct) chosen = distinct;
  }
  if (!chosen) {
    throw Object.assign(new Error(`ไม่มี agent ที่เปิดใช้งานใน local.json สำหรับ ${role}/${effectiveTier}`), { failureClass: "PROVIDER_UNAVAILABLE" });
  }
  const conf = tierConf[chosen] ?? {};
  return {
    role, routingRole: role, agent: chosen, tier: effectiveTier, requestedTier: tier,
    clamped: false, model: conf.model ?? "", effort: conf.effort ?? "",
    timeoutSec: tierConf._timeoutSec ?? null, strict: false, tierLabel: effectiveTier,
    independentCrossProvider: Boolean(role === "verifier" && workerAgent && chosen !== workerAgent),
    independentSessionOnly: Boolean(role === "verifier" && workerAgent && chosen === workerAgent),
    availablePool: pool,
  };
}

export function resolveRoleRoute(cfg, role, { forcedAgent = null, tier = null, localConfig = null, workerAgent = null, packet = null, baseTier = null } = {}) {
  const routingRole = effectiveRoutingRole(role, packet);
  const roleDef = cfg?.roles?.[routingRole];

  // Keep compatibility with minimal unit-test fixtures that only define { agents, tiers }.
  if (!roleDef) {
    return resolveLegacyRoute(cfg, role, { forcedAgent, tier, localConfig, workerAgent });
  }

  const allEnabled = enabledProviders(cfg, localConfig);
  let pool;
  if (forcedAgent) {
    if (!cfg?.agents?.[forcedAgent]) {
      throw Object.assign(new Error(`ไม่พบ agent '${forcedAgent}' ใน agents config`), { failureClass: "PROVIDER_UNAVAILABLE" });
    }
    if (!allEnabled.includes(forcedAgent)) {
      throw Object.assign(
        new Error(`agent '${forcedAgent}' ถูกปิดการใช้งานใน local.json (close) — BAAN ไม่สวมรอยสลับค่ายแทน`),
        { failureClass: "PROVIDER_UNAVAILABLE" }
      );
    }
    pool = [forcedAgent];
  } else {
    pool = allEnabled;
  }

  if (!pool.length) {
    throw Object.assign(
      new Error(`ไม่มี agent ใดเปิดใช้งานใน local.json สำหรับบทบาท ${routingRole}`),
      { failureClass: "PROVIDER_UNAVAILABLE" }
    );
  }

  const { tier: effectiveTier, clamped } = normalizeRoleTier(roleDef, tier, { routingRole, packet, baseTier });
  const tierDef = roleDef.tiers[effectiveTier];
  if (!tierDef) {
    throw Object.assign(new Error(`ไม่พบ tier '${effectiveTier}' ในบทบาท '${routingRole}'`), { failureClass: "PROVIDER_UNAVAILABLE" });
  }

  const pref = Array.isArray(tierDef.preference) && tierDef.preference.length
    ? tierDef.preference
    : Array.isArray(roleDef.preference) && roleDef.preference.length
      ? roleDef.preference
      : Object.keys(cfg.agents);

  const candidates = pref.filter((a) => pool.includes(a) && tierDef[a] !== null && tierDef[a] !== undefined);
  if (!candidates.length) {
    throw Object.assign(
      new Error(`ค่ายที่เปิดใช้งานใน local.json (${pool.join(", ")}) ไม่รองรับ ${routingRole}/${effectiveTier} — BAAN ไม่สวมรอยสลับค่ายที่ถูกปิด`),
      { failureClass: "PROVIDER_UNAVAILABLE" }
    );
  }

  let agent = candidates[0];
  let independentCrossProvider = false;
  let independentSessionOnly = false;

  if (roleDef.mustDifferFromWorker && workerAgent) {
    const distinct = candidates.find((a) => a !== workerAgent);
    if (distinct) {
      agent = distinct;
      independentCrossProvider = true;
    } else {
      // Single enabled provider: run verifier in a fresh independent session with no worker narrative.
      independentSessionOnly = true;
    }
  }

  const entry = tierDef[agent] ?? {};
  return {
    role,
    routingRole,
    agent,
    tier: effectiveTier,
    requestedTier: tier ?? null,
    clamped,
    model: entry.model ?? "",
    effort: entry.effort ?? "",
    timeoutSec: tierDef._timeoutSec ?? null,
    strict: roleDef.strict !== false,
    tierLabel: tierDef.label ?? effectiveTier,
    independentCrossProvider,
    independentSessionOnly,
    availablePool: pool,
  };
}

export function formatRoleMatrix(cfg, localConfig = null) {
  if (!cfg?.roles) return "";
  const agents = Object.keys(cfg.agents ?? {});
  const pool = enabledProviders(cfg, localConfig);
  const lines = [`  enabled_providers: ${pool.length ? pool.join(", ") : "(none)"}`];
  for (const [role, def] of Object.entries(cfg.roles)) {
    const pref = (def.preference ?? []).join(" → ");
    lines.push(`  [${role}] ${def.label ?? ""} (default: ${def.defaultTier} · pref: ${pref})`);
    for (const tier of sortedRoleTiers(def)) {
      const td = def.tiers[tier];
      let picked = "(unavailable)";
      try {
        const r = resolveRoleRoute(cfg, role, { tier, localConfig });
        picked = `${r.agent}=${r.model}/${r.effort}`;
      } catch { /* no enabled provider for this tier */ }
      const cells = agents.map((a) => {
        const c = td[a];
        if (!c) return `${a}=null`;
        return `${a}=${[c.model, c.effort].filter(Boolean).join("/")}`;
      }).join(", ");
      const timeoutNote = td._timeoutSec ? ` (timeout ${td._timeoutSec}s)` : "";
      lines.push(`    ${tier}: active[${picked}] | ${cells}${timeoutNote} — ${td.label ?? ""}`);
    }
  }
  return lines.join("\n");
}
