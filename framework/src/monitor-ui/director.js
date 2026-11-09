// Maps telemetry sessions onto engine characters. Rule: a character only does what a live session says;
// anything telemetry does not state (provider, role, outcome) is shown as unknown, never guessed.

const ROLE_IDS = ["orchestrator", "pm", "planner", "spec", "worker", "build", "verifier", "check", "review", "arch", "survey", "ui"];
const EXEC_ROLES = ["planner", "worker", "verifier"];
const PROVIDERS = ["claude", "codex", "agy"];
const MAX_VISIBLE = 3;
const ROLE_VERB = { planner: "PLANNING...", worker: "CODING...", verifier: "VERIFYING..." };
const UI_VERB = {
  READING: "READING FILE", CODING: "EDITING CODE", EXECUTING: "RUNNING COMMAND", THINKING: "THINKING",
  PLANNING: "PLANNING", VERIFYING: "VERIFYING", PROCESSING: "PROCESSING",
};
const ROLE_COLORS = {
  orchestrator: "#FACC15", planner: "#38BDF8", worker: "#F472B6", verifier: "#34D399",
  spec: "#A3E635", arch: "#FB923C", pm: "#E879F9", build: "#60A5FA",
  check: "#2DD4BF", survey: "#FCA5A5", ui: "#C084FC", review: "#FDE047",
};

function roleAnim(role, s) {
  if (role === "planner") return "write";
  if (role === "worker") return s.uiState === "READING" ? "read" : s.uiState === "THINKING" ? "think" : "type";
  return s.uiState === "THINKING" ? "think" : "read";
}

function providerAnim(s) {
  const atBoard = s.station === "planner";
  switch (s.uiState) {
    case "CODING": case "EXECUTING": return "type";
    case "READING": case "VERIFYING": return "read";
    case "THINKING": case "PLANNING": return atBoard ? "write" : "think";
    default: return atBoard ? "write" : "type";
  }
}

export class Director {
  constructor(engine, { world, telemetry }) {
    this.engine = engine;
    this.world = world;
    this.t = telemetry;
    this.current = new Map();
    this.prev = new Map();
    this.pending = [];
    this.assign = new Map();
    this.instances = new Map();
    this.endedOwner = new Map();
    this.rolePending = new Map(ROLE_IDS.map((r) => [r, new Set()]));
    this.seats = new Map();
    this.agg = new Map();
    this.sig = new Map();
    this.agentsEnabled = {};
    this.quotaLevels = {};
    this.pipeline = null;
    this.activeStations = new Set();
  }

  _meta(p) { return this.t.PROVIDER_META[p]; }

  init({ agentsEnabled = {} } = {}) {
    const W = this.world;
    this.agentsEnabled = agentsEnabled ?? {};
    for (const r of ROLE_IDS) {
      const st = W.STATIONS[r];
      let tile = st.roleSeat && W.isWalkable(st.roleSeat.x, st.roleSeat.y) ? st.roleSeat : null;
      if (!tile) {
        const pt = (W.IDLE_POINTS[W.ROLE_HOME[r]] ?? []).find(([x, y]) => W.isWalkable(x, y));
        tile = pt ? { x: pt[0], y: pt[1] } : W.PROVIDER_HOME.claude;
      }
      this.engine.addCharacter({
        id: `role:${r}`, spriteId: r, kind: "role", label: this.t.ROLE_META[r].name.toUpperCase(),
        tile: { x: tile.x, y: tile.y }, dir: st.roleSeat?.dir ?? "down", meta: { role: r },
      });
    }
    for (const p of PROVIDERS) this._spawnInstance(p, 1);
    this._settle();
    this.engine.requestRender();
  }

  update({ sessions = [], callEnds = [], agentsEnabled = {}, quotaLevels = {}, pipeline = null, now = Date.now(), reconcile = false } = {}) {
    const T = this.t;
    this.agentsEnabled = agentsEnabled ?? {};
    this.quotaLevels = quotaLevels ?? {};
    this.pipeline = pipeline;
    const diff = T.diffSessions(this.prev, sessions);
    this.current = diff.next;

    for (const s of diff.ended) {
      const inst = this._unassign(s.key);
      if (reconcile) continue;
      this.pending.push({ session: s, endedAt: now });
      this.endedOwner.set(s.key, inst ? inst.id : null);
      if (inst) inst.pendingKeys.add(s.key);
      if (s.role) this.rolePending.get(s.role).add(s.key);
    }
    if (reconcile) {
      // Outcomes of calls that ended while we were away are unknown to this view: show none of them.
      this.pending = [];
      this.endedOwner.clear();
      for (const inst of this.instances.values()) inst.pendingKeys.clear();
      for (const set of this.rolePending.values()) set.clear();
    }
    for (const ch of diff.changed) if (ch.fields.includes("provider")) this._unassign(ch.next.key);

    this._assignAll();

    const res = T.resolveEnded(this.pending, callEnds, now);
    this.pending = res.pending;
    for (const r of res.resolved) this._onResolved(r.session, r.verdict);

    this._settle();
    this.prev = diff.next;
    this.engine.requestRender();
  }

  // ---- bookkeeping ----
  _unassign(key) {
    const id = this.assign.get(key);
    this.assign.delete(key);
    const inst = id ? this.instances.get(id) : null;
    if (inst && inst.session === key) inst.session = null;
    return inst ?? null;
  }

  _instancesOf(p) { return [...this.instances.values()].filter((i) => i.provider === p); }

  _spawnInstance(p, n) {
    const id = `prov:${p}#${n}`;
    const home = this.world.PROVIDER_HOME[p];
    const c = this.engine.addCharacter({
      id, spriteId: p, kind: "provider", label: this._meta(p).short, tile: { x: home.x, y: home.y }, dir: "down", meta: { provider: p, n },
    });
    c.badge = n > 1 ? `#${n}` : null;
    const inst = { id, provider: p, n, session: null, pendingKeys: new Set(), seat: null };
    this.instances.set(id, inst);
    return inst;
  }

  _assignAll() {
    const byProv = Object.fromEntries(PROVIDERS.map((p) => [p, []]));
    for (const s of this.current.values()) if (s.provider) byProv[s.provider].push(s);
    for (const p of PROVIDERS) {
      const list = byProv[p];
      for (const s of list) {
        const id = this.assign.get(s.key);
        if (id && this.instances.get(id)?.session === s.key) continue;
        this.assign.delete(s.key);
        let inst = this._freeInstance(p);
        if (!inst) {
          const used = new Set(this._instancesOf(p).map((i) => i.n));
          if (used.size < MAX_VISIBLE) {
            let n = 2;
            while (used.has(n)) n++;
            inst = this._spawnInstance(p, n);
          }
        }
        if (!inst) continue;
        inst.session = s.key;
        this.assign.set(s.key, inst.id);
      }
      const overflow = list.some((s) => !this.assign.has(s.key));
      this._setAggregate(p, overflow ? list.length : 0);
    }
  }

  // Prefer an instance that just finished at a desk, so a provider switching roles walks straight to the next seat.
  _freeInstance(p) {
    const free = this._instancesOf(p).filter((i) => !i.session);
    if (!free.length) return null;
    free.sort((a, b) => (b.pendingKeys.size > 0) - (a.pendingKeys.size > 0) || a.n - b.n);
    return free[0];
  }

  _setAggregate(p, count) {
    const W = this.world;
    const id = `prov:${p}#agg`;
    let rec = this.agg.get(p);
    if (count > 0) {
      let c = this.engine.getCharacter(id);
      if (!c) {
        const home = W.PROVIDER_HOME[p];
        c = this.engine.addCharacter({ id, spriteId: p, kind: "provider", label: this._meta(p).short, tile: { x: home.x, y: home.y }, dir: "down", meta: { provider: p, aggregate: true } });
      }
      if (!rec) { rec = { id }; this.agg.set(p, rec); }
      rec.count = count;
      c.badge = `×${count}`;
      this._apply(c, { where: "spot", tile: W.OVERFLOW_SPOT, dir: "down", anim: "stand_down", bubble: `${this._meta(p).short} ×${count} ACTIVE`, kind: "real" });
    } else if (rec) {
      this.agg.delete(p);
      const c = this.engine.getCharacter(id);
      if (c) this._leave(c, () => { if (!this.agg.has(p)) this._dropCharacter(id); });
    }
  }

  _onResolved(session, verdict) {
    const text = verdict === "success" ? "TASK COMPLETE!" : verdict === "error" ? "ERROR!" : "CALL ENDED";
    const kind = verdict ?? "real";
    const instId = this.endedOwner.get(session.key);
    this.endedOwner.delete(session.key);
    const inst = instId ? this.instances.get(instId) : null;
    if (inst) {
      inst.pendingKeys.delete(session.key);
      const c = this.engine.getCharacter(inst.id);
      if (c) {
        c.setBubble(text, kind, 3000);
        if (verdict && !c.moving) c.react(verdict);
      }
    }
    if (session.role) {
      this.rolePending.get(session.role)?.delete(session.key);
      const c = this.engine.getCharacter(`role:${session.role}`);
      const remaining = [...this.current.values()].some((s) => s.role === session.role);
      if (c) {
        c.setBubble(text, kind, 3000);
        if (verdict && !remaining && !c.moving) c.react(verdict);
      }
    }
  }

  _seatFor(inst, station) {
    if (inst.seat?.station === station) return inst.seat;
    this._releaseSeat(inst);
    const W = this.world;
    const st = W.STATIONS[station];
    let arr = this.seats.get(station);
    if (!arr) { arr = []; this.seats.set(station, arr); }
    let idx = st.providerSeats.findIndex((_, i) => !arr[i]);
    let tile;
    if (idx >= 0) tile = st.providerSeats[idx];
    else {
      // More providers than chairs: stand on a free floor spot in the same zone rather than stacking on a seat.
      const pts = W.IDLE_POINTS[st.zone] ?? [];
      idx = st.providerSeats.length;
      while (arr[idx]) idx++;
      const pt = pts[(idx - st.providerSeats.length) % Math.max(1, pts.length)] ?? [W.OVERFLOW_SPOT.x, W.OVERFLOW_SPOT.y];
      tile = { x: pt[0], y: pt[1], dir: "down" };
    }
    arr[idx] = inst.id;
    inst.seat = { station, index: idx, x: tile.x, y: tile.y, dir: tile.dir ?? "down" };
    return inst.seat;
  }

  _releaseSeat(inst) {
    if (!inst.seat) return;
    const arr = this.seats.get(inst.seat.station);
    if (arr && arr[inst.seat.index] === inst.id) arr[inst.seat.index] = null;
    inst.seat = null;
  }

  _dropCharacter(id) {
    this.engine.removeCharacter(id);
    this.sig.delete(id);
  }

  _leave(c, onGone) {
    if (this.sig.get(c.id) === "leave") return;
    this.sig.set(c.id, "leave");
    this.engine.release(c.id);
    c.stopIdle();
    c.setBubble(null, "real");
    const home = this.world.PROVIDER_HOME[c.meta.provider] ?? this.world.OVERFLOW_SPOT;
    c.goTo(home, { faceDir: "down", onArrive: onGone });
  }

  // Idempotent: re-applying the same wish never restarts a walk or an animation.
  _apply(c, w) {
    const prev = this.sig.get(c.id);
    if (w.where === "seat" || w.where === "spot") {
      const loc = `${w.where}:${w.tile.x},${w.tile.y}`;
      if (prev !== loc) {
        if (c.mode === "offline" || c._baseMode?.() === "offline") c.setOffline(false);
        this.engine.reserve(w.tile, c.id);
        c.goTo(w.tile, { faceDir: w.dir });
        this.sig.set(c.id, loc);
      }
      c.setWork(w.anim);
      c.setBubble(w.bubble, w.kind);
    } else if (w.where === "idle") {
      const loc = `idle:${w.zone}`;
      if (prev !== loc) {
        if (c.dimmed) c.setOffline(false);
        this.engine.release(c.id);
        c.startIdle(w.zone, { extraPoints: w.extra ?? [] });
        this.sig.set(c.id, loc);
      }
    } else if (w.where === "offline") {
      if (prev !== "offline") {
        this.engine.release(c.id);
        c.setBubble(null, "real");
        c.stopIdle();
        c.goTo(this.world.PROVIDER_HOME[c.meta.provider], { faceDir: "down" });
        c.setOffline(true);
        this.sig.set(c.id, "offline");
      }
    }
  }

  _sessionsWhere(fn) { return [...this.current.values()].filter(fn); }

  _settle() {
    const W = this.world;
    const E = this.engine;
    const pipe = this.pipeline;
    const humanNeeded = (pipe?.states?.waiting_human ?? 0) > 0;

    const orch = E.getCharacter("role:orchestrator");
    if (orch) {
      if (pipe?.orchestrator) {
        const seat = W.STATIONS.orchestrator.roleSeat;
        const [bubble, kind] = humanNeeded ? ["HUMAN DECISION NEEDED", "warn"] : [`COORDINATING ${pipe.activeRunCount ?? 0} RUN(S)`, "real"];
        this._apply(orch, { where: "seat", tile: seat, dir: seat.dir, anim: "type", bubble, kind });
      } else this._apply(orch, { where: "idle", zone: W.ROLE_HOME.orchestrator });
    }

    for (const r of EXEC_ROLES) {
      const c = E.getCharacter(`role:${r}`);
      if (!c) continue;
      const list = this._sessionsWhere((s) => s.role === r);
      if (list.length) {
        const seat = W.STATIONS[r].roleSeat;
        let bubble;
        let kind = "real";
        if (list.every((s) => s.stale)) { bubble = "NO UPDATE"; kind = "warn"; }
        else if (list.some((s) => !s.provider)) bubble = "PROVIDER UNKNOWN";
        else bubble = ROLE_VERB[r] + (list.length > 1 ? ` ×${list.length}` : "");
        this._apply(c, { where: "seat", tile: seat, dir: seat.dir, anim: roleAnim(r, list[0]), bubble, kind });
      } else if (!this.rolePending.get(r).size) {
        this._apply(c, { where: "idle", zone: W.ROLE_HOME[r] });
      }
    }

    for (const r of this.t.CHAT_ROLES) {
      const c = E.getCharacter(`role:${r}`);
      const seat = W.STATIONS[r]?.roleSeat;
      if (c) this._apply(c, { where: "idle", zone: W.ROLE_HOME[r], extra: seat ? [[seat.x, seat.y]] : [] });
    }

    for (const inst of [...this.instances.values()]) {
      const c = E.getCharacter(inst.id);
      if (!c) { this.instances.delete(inst.id); continue; }
      const p = inst.provider;
      const disabled = this.agentsEnabled?.[p] === false;
      const s = inst.session ? this.current.get(inst.session) : null;
      if (s) {
        const seat = this._seatFor(inst, s.station);
        let bubble = s.bubble;
        let kind = "real";
        if (s.stale) { bubble = "NO UPDATE"; kind = "warn"; }
        else if (!s.role) bubble = `ROLE UNKNOWN — ${UI_VERB[s.uiState] ?? s.uiState}`;
        this._apply(c, { where: "seat", tile: seat, dir: seat.dir, anim: providerAnim(s), bubble, kind });
      } else if (inst.pendingKeys.size) {
        // Waiting for the call_end verdict: stay at the desk instead of guessing an outcome.
      } else {
        this._releaseSeat(inst);
        if (inst.n > 1) {
          this._leave(c, () => {
            if (!inst.session && !inst.pendingKeys.size && this.instances.get(inst.id) === inst) {
              this.instances.delete(inst.id);
              this._dropCharacter(inst.id);
            }
          });
        } else if (disabled) this._apply(c, { where: "offline" });
        else this._apply(c, { where: "idle", zone: "lounge" });
      }
      c.label = disabled && !s ? `${this._meta(p).short} (OFF)` : this._meta(p).short;
    }

    for (const p of PROVIDERS) {
      const lvl = this.quotaLevels?.[p];
      const icon = lvl === "warn" || lvl === "low" ? lvl : null;
      for (const c of E.characters()) if (c.meta?.provider === p) c.warnIcon = icon;
    }

    const want = new Set([...this.current.values()].map((s) => s.station));
    if (pipe?.orchestrator) want.add("orchestrator");
    for (const st of this.activeStations) if (!want.has(st)) E.setStationActive(st, false);
    for (const st of want) if (!this.activeStations.has(st)) E.setStationActive(st, true);
    this.activeStations = want;
  }

  // ---- inspection (plain data for dialogs / a11y strip) ----
  inspect(hit) {
    if (!hit) return null;
    if (hit.kind === "station") return this._inspectStation(hit.id);
    if (hit.kind === "role") return this._inspectRole(hit.id);
    if (hit.kind === "provider") return this._inspectProvider(hit.id);
    if (hit.kind === "character") {
      if (hit.id.startsWith("role:")) return this._inspectRole(hit.id.slice(5));
      if (hit.id.startsWith("prov:")) return this._inspectProvider(hit.id.slice(5).split("#")[0]);
    }
    return null;
  }

  _roleStatus(r) {
    if (r === "orchestrator") return this.pipeline?.orchestrator ? "COORDINATING" : "IDLE";
    return this._sessionsWhere((s) => s.role === r).length ? "WORKING" : "IDLE";
  }

  _inspectRole(r) {
    const meta = this.t.ROLE_META[r];
    if (!meta) return null;
    const sessions = r === "orchestrator" ? [] : this._sessionsWhere((s) => s.role === r);
    const out = {
      kind: "role", id: r, characterId: `role:${r}`, name: meta.name, duty: meta.duty,
      telemetry: this.t.CHAT_ROLES.includes(r) ? "none" : "live",
      status: this._roleStatus(r),
      sessions,
      providers: [...new Set(sessions.map((s) => s.provider ?? "unknown"))],
    };
    if (r === "orchestrator") {
      out.activeRunCount = this.pipeline?.activeRunCount ?? 0;
      out.humanDecisionNeeded = (this.pipeline?.states?.waiting_human ?? 0) > 0;
    }
    return out;
  }

  _inspectProvider(p) {
    const meta = this._meta(p);
    if (!meta) return null;
    const sessions = this._sessionsWhere((s) => s.provider === p);
    const en = this.agentsEnabled?.[p];
    return {
      kind: "provider", id: p, name: meta.name,
      enabled: typeof en === "boolean" ? en : null,
      quotaLevel: this.quotaLevels?.[p] ?? "unknown",
      instances: this._instancesOf(p).length,
      aggregated: this.agg.get(p)?.count ?? 0,
      sessions,
      roles: [...new Set(sessions.map((s) => s.role ?? "unknown"))],
    };
  }

  _inspectStation(id) {
    const st = this.world.STATIONS[id];
    if (!st) return null;
    const sessions = id === "orchestrator" ? [...this.current.values()] : this._sessionsWhere((s) => s.station === id);
    return { kind: "station", id, label: st.label, zone: st.zone, telemetry: this.t.CHAT_ROLES.includes(id) ? "none" : "live", sessions };
  }

  inspectSession(key) {
    const s = this.current.get(key);
    if (!s) return null;
    const providerChar = this.assign.get(key) ?? (s.provider && this.agg.has(s.provider) ? `prov:${s.provider}#agg` : null);
    return { ...s, characters: { provider: providerChar, role: s.role ? `role:${s.role}` : null } };
  }

  roster() {
    const out = ROLE_IDS.map((r) => ({
      id: `role:${r}`, kind: "role", label: this.t.ROLE_META[r].name.toUpperCase(),
      status: this._roleStatus(r), color: ROLE_COLORS[r], spriteId: r,
    }));
    for (const p of PROVIDERS) {
      const n = this._sessionsWhere((s) => s.provider === p).length;
      const short = this._meta(p).short;
      out.push({
        id: `prov:${p}#1`, kind: "provider", label: n > 1 ? `${short} ×${n}` : short,
        status: this.agentsEnabled?.[p] === false && !n ? "OFF" : n ? `${n} ACTIVE` : "IDLE",
        color: this._meta(p).color, spriteId: p,
      });
    }
    return out;
  }
}
