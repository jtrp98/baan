// Canvas renderer + character simulation for Pixel HQ. Knows nothing about BAAN: director.js maps telemetry onto it.

const WALK_FPS = 8;
const IDLE_FPS = 4;
const SCREEN_MS = 333;
// Browsers throttle rAF to ~1 fps for occluded/background panes; a 100ms clamp made walkers crawl there.
// step() splits this into small substeps, and a hidden tab pauses the loop entirely, so 1s is safe.
const MAX_DT = 1000;
const RETRY_MS = 1000;
const LINE_MAX = 26;
const DECOR_TTL = 3000;
const DECOR_COOLDOWN = 20000;
const FLASH_TTL = 3000;
const TEXT_CACHE_MAX = 256;
const DECOR_LINES = ["COFFEE TIME!", "READY TO WORK!", "JUST CHILLING...", "TIME TO CODE!", "STRETCH BREAK!", "NICE DAY!"];

// 3x5 glyphs, one 3-bit row per entry (MSB = left pixel).
const FONT = {
  A: [2, 5, 7, 5, 5], B: [6, 5, 6, 5, 6], C: [3, 4, 4, 4, 3], D: [6, 5, 5, 5, 6], E: [7, 4, 6, 4, 7],
  F: [7, 4, 6, 4, 4], G: [3, 4, 5, 5, 3], H: [5, 5, 7, 5, 5], I: [7, 2, 2, 2, 7], J: [1, 1, 1, 5, 2],
  K: [5, 5, 6, 5, 5], L: [4, 4, 4, 4, 7], M: [5, 7, 7, 5, 5], N: [6, 5, 5, 5, 5], O: [2, 5, 5, 5, 2],
  P: [6, 5, 6, 4, 4], Q: [2, 5, 5, 6, 3], R: [6, 5, 6, 5, 5], S: [3, 4, 2, 1, 6], T: [7, 2, 2, 2, 2],
  U: [5, 5, 5, 5, 7], V: [5, 5, 5, 5, 2], W: [5, 5, 7, 7, 5], X: [5, 5, 2, 5, 5], Y: [5, 5, 2, 2, 2],
  Z: [7, 1, 2, 4, 7],
  0: [7, 5, 5, 5, 7], 1: [2, 6, 2, 2, 7], 2: [6, 1, 2, 4, 7], 3: [6, 1, 2, 1, 6], 4: [5, 5, 7, 1, 1],
  5: [7, 4, 6, 1, 6], 6: [3, 4, 7, 5, 7], 7: [7, 1, 2, 2, 2], 8: [7, 5, 7, 5, 7], 9: [7, 5, 7, 1, 6],
  " ": [0, 0, 0, 0, 0], ".": [0, 0, 0, 0, 2], ",": [0, 0, 0, 2, 4], ":": [0, 2, 0, 2, 0], "!": [2, 2, 2, 0, 2],
  "?": [6, 1, 2, 0, 2], "+": [0, 2, 7, 2, 0], "-": [0, 0, 7, 0, 0], "—": [0, 0, 7, 0, 0], "/": [1, 1, 2, 4, 4],
  "(": [1, 2, 2, 2, 1], ")": [4, 2, 2, 2, 4], "#": [5, 7, 5, 7, 5], "×": [0, 5, 2, 5, 0], "%": [5, 1, 2, 4, 5],
  "'": [2, 2, 0, 0, 0], "_": [0, 0, 0, 0, 7], "=": [0, 7, 0, 7, 0], "<": [1, 2, 4, 2, 1], ">": [4, 2, 1, 2, 4],
};
const ADV = 4;
const GLYPH_H = 5;

const BUBBLE_STYLE = {
  real: { bg: "#ffffff", border: "#1b1b2a", fg: "#1b1b2a" },
  decor: { bg: "#f2f2f2", border: "#9a9a9a", fg: "#7a7a7a", dotted: true, italic: true },
  warn: { bg: "#ffd84a", border: "#6b4a00", fg: "#3a2a00" },
  error: { bg: "#ff5a5a", border: "#5a0000", fg: "#ffffff" },
  success: { bg: "#5ad66a", border: "#0b4a14", fg: "#062a0b" },
};
const PERSISTENT = new Set(["real", "warn"]);

export function normalizeText(text) {
  const s = String(text ?? "").toUpperCase().replace(/[–]/g, "-").replace(/…/g, "...");
  let out = "";
  for (const ch of s) out += FONT[ch] ? ch : "?";
  return out;
}

function clip(line, max = LINE_MAX) {
  return line.length > max ? `${line.slice(0, max - 3)}...` : line;
}

// Two short lines read better than one truncated line: "WORKER + CODEX — EDITING CODE" keeps its verb.
export function wrapText(text, max = LINE_MAX, maxLines = 2) {
  const s = normalizeText(text).trim();
  if (s.length <= max) return [s];
  const dash = s.indexOf(" — ");
  if (dash > 0 && maxLines >= 2) {
    const a = s.slice(0, dash + 2).trim();
    const b = s.slice(dash + 3).trim();
    if (a.length <= max) return [a, clip(b, max)];
  }
  const lines = [];
  let cur = "";
  for (const w of s.split(" ")) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= max || !cur) cur = next;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    // The greedy wrap guarantees this join exceeds max, so clip always adds the ellipsis.
    kept[maxLines - 1] = clip(`${kept[maxLines - 1]} ${lines[maxLines]}`, max);
    return kept.map((l) => clip(l, max));
  }
  return lines.map((l) => clip(l, max));
}

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  return c;
}

function drawGlyphs(ctx, text, x, y, color, italic = false) {
  ctx.fillStyle = color;
  let cx = x;
  for (const ch of text) {
    const g = FONT[ch] ?? FONT["?"];
    for (let row = 0; row < GLYPH_H; row++) {
      const bits = g[row];
      if (!bits) continue;
      const sx = italic && row < 2 ? 1 : 0;
      for (let col = 0; col < 3; col++) if (bits & (4 >> col)) ctx.fillRect(cx + col + sx, y + row, 1, 1);
    }
    cx += ADV;
  }
}

function textWidth(text) {
  return Math.max(0, [...text].length * ADV - 1);
}

const now = () => (globalThis.performance?.now ? performance.now() : Date.now());

export class Character {
  constructor(engine, { id, spriteId, kind = "role", label = "", tile, dir = "down", meta = {} }) {
    const T = engine.world.TILE;
    this.engine = engine;
    this.id = id;
    this.spriteId = spriteId ?? id;
    this.kind = kind;
    this.label = label;
    this.meta = meta ?? {};
    this.tile = { x: tile.x, y: tile.y };
    this.px = tile.x * T + T / 2;
    this.py = tile.y * T + engine.feetY;
    this.dir = dir;
    this.anim = `stand_${dir}`;
    this.frame = 0;
    this.path = [];
    this.mode = "idle";
    this.workAnim = null;
    this.idleAnim = null;
    this.dimmed = false;
    this.badge = null;
    this.warnIcon = null;
    this.bubble = null;
    this.flash = null;
    this.speed = kind === "provider" ? 48 : 40;
    this._frameT = 0;
    this._step = null;
    this._dest = null;
    this._faceDir = null;
    this._onArrive = null;
    this._retry = 0;
    this._react = null;
    this._modeBeforeReact = null;
    this._idle = null;
    this._idleZone = null;
    this._idleExtra = [];
    this._decorCooldown = 0;
    this._sortEntry = { key: 0, c: this, f: null };
  }

  get moving() { return this._step != null || this.path.length > 0; }
  get destination() { return this._dest ? { ...this._dest } : null; }

  _baseMode() { return this.mode === "react" ? this._modeBeforeReact : this.mode; }

  _setMode(m) {
    if (this.mode === "react") {
      if (this._modeBeforeReact !== m) { this._modeBeforeReact = m; this.engine._transition(); }
      return;
    }
    if (this.mode !== m) { this.mode = m; this.engine._transition(); }
  }

  goTo(tile, { faceDir = null, onArrive = null, keepMode = false } = {}) {
    if (!keepMode && this._baseMode() === "idle") { this._idle = null; this.idleAnim = null; this._setMode("travel"); }
    this._dest = { x: tile.x, y: tile.y };
    this._faceDir = faceDir;
    this._onArrive = onArrive;
    this._retry = 0;
    this._plan();
    this.engine.requestRender();
    return this;
  }

  _plan() {
    const dest = this._dest;
    if (!dest) return;
    const from = this._step ?? this.tile;
    if (from.x === dest.x && from.y === dest.y) {
      this.path = [];
      if (!this._step) this._arrive();
      return;
    }
    const p = this.engine.world.findPath(from, dest, this.engine._avoidFor(this));
    if (!p) { this.path = []; this._retry = RETRY_MS; return; }
    this.path = p;
    this._retry = 0;
    if (!this.engine.animationEnabled) this._snap();
  }

  _snap() {
    const T = this.engine.world.TILE;
    const last = this.path.length ? this.path[this.path.length - 1] : this._step;
    if (last) this.tile = { x: last.x, y: last.y };
    this.path = [];
    this._step = null;
    this.px = this.tile.x * T + T / 2;
    this.py = this.tile.y * T + this.engine.feetY;
    if (this._dest && this._dest.x === this.tile.x && this._dest.y === this.tile.y) this._arrive();
  }

  _arrive() {
    this._dest = null;
    if (this._faceDir) this.dir = this._faceDir;
    const cb = this._onArrive;
    this._onArrive = null;
    if (cb) this.engine._defer(() => cb(this));
  }

  setWork(anim, bubble) {
    this._idle = null;
    this.idleAnim = null;
    if (this.workAnim !== anim) {
      this.workAnim = anim;
      if (this._baseMode() === "work") this.engine._transition();
    }
    this._setMode("work");
    if (bubble !== undefined) this.setBubble(bubble, "real");
    this.engine.requestRender();
  }

  // Persistent kinds (real/warn) stay until replaced; anything with a ttl is a transient flash drawn over it.
  setBubble(text, kind = "real", ttl) {
    const style = BUBBLE_STYLE[kind] ? kind : "real";
    const transient = ttl != null || !PERSISTENT.has(style);
    if (text == null || text === "") {
      if (transient) this.flash = null; else this.bubble = null;
      this.engine.requestRender();
      return;
    }
    const t = String(text);
    if (!transient) {
      if (this.bubble && this.bubble.text === t && this.bubble.kind === style) return;
      this.bubble = { text: t, kind: style };
    } else if (style === "decor") {
      if (this.bubble || this.flash || this._decorCooldown > 0) return;
      this.flash = { text: t, kind: style, ttl: ttl ?? DECOR_TTL };
      this._decorCooldown = DECOR_COOLDOWN;
    } else {
      this.flash = { text: t, kind: style, ttl: ttl ?? FLASH_TTL };
    }
    this.engine.requestRender();
  }

  clearBubble() { this.bubble = null; this.flash = null; this.engine.requestRender(); }

  react(kind, ms = 1600, cb = null) {
    const anim = kind === "success" ? "success" : kind === "error" ? "error" : "warning";
    if (!this.engine.animationEnabled) { if (cb) this.engine._defer(() => cb(this)); return; }
    if (this._react) { const prev = this._react.cb; this._react = null; if (prev) this.engine._defer(() => prev(this)); }
    else { this._modeBeforeReact = this.mode; this.mode = "react"; this.engine._transition(); }
    this._react = { anim, t: ms, cb };
  }

  _endReact() {
    const r = this._react;
    this._react = null;
    this.mode = this._modeBeforeReact ?? "idle";
    this._modeBeforeReact = null;
    this.engine._transition();
    if (r?.cb) this.engine._defer(() => r.cb(this));
  }

  startIdle(zoneId, { extraPoints = [] } = {}) {
    this._idleZone = zoneId;
    this._idleExtra = extraPoints;
    this.workAnim = null;
    this.bubble = null;
    this.dimmed = false;
    const wasIdle = this._baseMode() === "idle" && this._idle;
    this._setMode("idle");
    // Drop any errand (and its callback) but finish the tile being crossed so feet stay on the grid.
    this.path = [];
    this._onArrive = null;
    this._dest = this._step ? { ...this._step } : null;
    this._faceDir = null;
    if (!wasIdle) { this._idle = { phase: "wait", t: 300 + this.engine.rand() * 1200 }; this.idleAnim = null; }
    // Static mode has no wander tick, so jump into the zone now; otherwise a freed provider would linger at a desk looking busy.
    if (!this.engine.animationEnabled && this.engine.world.zoneAt(this.tile.x, this.tile.y) !== zoneId) {
      const pt = this.engine._pickIdlePoint(this, zoneId, extraPoints);
      if (pt) { this.engine.reserve(pt, this.id); this.goTo(pt, { keepMode: true }); }
    }
    this.engine.requestRender();
  }

  stopIdle() {
    this._idle = null;
    this.idleAnim = null;
    if (this._baseMode() === "idle") this._setMode("travel");
  }

  setOffline(on) {
    if (on) {
      this._idle = null;
      this.idleAnim = null;
      this.workAnim = null;
      this.bubble = null;
      this.flash = null;
      this.dimmed = true;
      this._setMode("offline");
    } else {
      this.dimmed = false;
      if (this._baseMode() === "offline") this._setMode("travel");
    }
    this.engine.requestRender();
  }

  update(dt) {
    if (this.flash) { this.flash.ttl -= dt; if (this.flash.ttl <= 0) this.flash = null; }
    if (this._decorCooldown > 0) this._decorCooldown -= dt;
    if (this._react) {
      this._react.t -= dt;
      if (this._react.t <= 0) this._endReact();
    } else {
      if (this._dest && !this.moving && this._retry > 0) {
        this._retry -= dt;
        if (this._retry <= 0) this._plan();
      }
      this._move(dt);
      if (this.mode === "idle") this._idleTick(dt);
    }
    this._resolveAnim();
    this._tickFrame(dt);
  }

  _move(dt) {
    const T = this.engine.world.TILE;
    let budget = (this.speed * dt) / 1000;
    while (budget > 0) {
      if (!this._step) {
        if (!this.path.length) break;
        this._step = this.path.shift();
      }
      const tx = this._step.x * T + T / 2;
      const ty = this._step.y * T + this.engine.feetY;
      const dx = tx - this.px;
      const dy = ty - this.py;
      if (dx || dy) this.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
      const mx = Math.min(Math.abs(dx), budget);
      this.px += Math.sign(dx) * mx;
      budget -= mx;
      const my = Math.min(Math.abs(dy), budget);
      this.py += Math.sign(dy) * my;
      budget -= my;
      if (this.px === tx && this.py === ty) {
        this.tile = { x: this._step.x, y: this._step.y };
        this._step = null;
        if (!this.path.length) {
          if (this._dest && this._dest.x === this.tile.x && this._dest.y === this.tile.y) this._arrive();
          break;
        }
      }
    }
  }

  _idleTick(dt) {
    const st = this._idle;
    if (!st) return;
    if (st.phase === "walk") {
      if (this._dest && !this.moving && this._retry > 0) { this._dest = null; st.phase = "wait"; st.t = 2000; return; }
      if (!this._dest && !this.moving) this._onIdleArrive();
      return;
    }
    st.t -= dt;
    if (st.t > 0) return;
    const pt = this.engine._pickIdlePoint(this, this._idleZone, this._idleExtra);
    if (!pt) { st.t = 2000; return; }
    this.engine.reserve(pt, this.id);
    this.idleAnim = null;
    st.phase = "walk";
    this.goTo(pt, { keepMode: true });
  }

  _onIdleArrive() {
    const e = this.engine;
    const acts = e.world.IDLE_ACTIONS ?? ["stand"];
    const act = acts[Math.floor(e.rand() * acts.length)];
    if (act === "look") { this.dir = e._lookDir(this.tile); this.idleAnim = `stand_${this.dir}`; }
    else if (act === "stand") { this.dir = ["down", "left", "right", "down"][Math.floor(e.rand() * 4)]; this.idleAnim = `stand_${this.dir}`; }
    else this.idleAnim = act;
    this._idle = { phase: "wait", t: 3000 + e.rand() * 6000 };
    if (e.rand() < 0.08) this.setBubble(DECOR_LINES[Math.floor(e.rand() * DECOR_LINES.length)], "decor");
  }

  _resolveAnim() {
    let a;
    if (this.moving) a = `walk_${this.dir}`;
    else if (this._react) a = this._react.anim;
    else if (this.mode === "offline") a = "offline";
    else if (this._dest) a = `stand_${this.dir}`;
    else if (this.mode === "work" && this.workAnim) a = this.workAnim;
    else if (this.mode === "idle" && this.idleAnim) a = this.idleAnim;
    else a = `stand_${this.dir}`;
    if (a !== this.anim) { this.anim = a; this.frame = 0; this._frameT = 0; }
  }

  _tickFrame(dt) {
    const period = 1000 / (this.anim.startsWith("walk_") ? WALK_FPS : IDLE_FPS);
    const count = this.engine.frameCount(this.spriteId, this.anim);
    this._frameT += dt;
    if (this._frameT >= period) {
      const n = Math.floor(this._frameT / period);
      this._frameT -= n * period;
      this.frame = (this.frame + n) % count;
    }
  }

  // Static mode: settle wherever the current errand leads, as if the walk had finished.
  _snapToDestination() {
    if (this._react) { const cb = this._react.cb; this._react.cb = null; this._endReact(); if (cb) this.engine._defer(() => cb(this)); }
    if (this._idle?.phase === "walk") this._idle = { phase: "wait", t: 3000 };
    if (!this._dest && !this.moving) return;
    if (this._dest && !this.moving && this._retry > 0) {
      const p = this.engine.world.findPath(this.tile, this._dest, null);
      if (!p) return;
      this.path = p;
    }
    this._snap();
  }
}

export class Engine {
  constructor(canvas, { sprites, world }) {
    this.canvas = canvas;
    this.sprites = sprites;
    this.world = world;
    const T = world.TILE;
    this.width = world.COLS * T;
    this.height = world.ROWS * T;
    canvas.width = this.width;
    canvas.height = this.height;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.charW = sprites.CHAR_W ?? 16;
    this.charH = sprites.CHAR_H ?? 24;
    // Feet sit 2px above the tile's bottom edge so the sprite's bottom row lines up with the tile edge.
    this.feetY = T - 2;
    this._sheets = sprites.buildAllCharacters();
    this._chars = new Map();
    this._reserved = new Map();
    this._reservedBy = new Map();
    this._activeStations = new Set();
    this._furnCache = new Map();
    this._textCache = new Map();
    this._deferred = [];
    this._drawList = [];
    this._placed = [];
    this.stats = { frames: 0, transitions: 0, rafActive: false };
    this.hover = null;
    this.selectedId = null;
    this.onPick = null;
    this.onHover = null;
    this.rand = Math.random;
    this.clock = 0;
    this.screenFrame = 0;
    this._screenT = 0;
    this._raf = null;
    this._renderRaf = null;
    this._lastT = null;
    this._lastStatic = now();
    this._destroyed = false;

    const mq = typeof globalThis.matchMedia === "function" ? globalThis.matchMedia("(prefers-reduced-motion: reduce)") : null;
    this.animationEnabled = !(mq && mq.matches);

    this._objects = world.FURNITURE.filter((f) => f.layer === "object").map((f) => ({ key: (f.y + f.h) * T - 1, c: null, f }));
    this._wallFurn = world.FURNITURE.filter((f) => f.layer === "wall");
    this._bg = this._buildBackground();

    this._tick = this._tick.bind(this);
    this._onVis = () => { this._syncLoop(); if (!document.hidden) this.requestRender(); };
    this._onMove = (ev) => this._hoverAt(ev.clientX, ev.clientY);
    this._onLeave = () => this._setHover(null);
    this._onClick = (ev) => { const hit = this.pick(ev.clientX, ev.clientY); this.onPick?.(hit); };
    document.addEventListener?.("visibilitychange", this._onVis);
    canvas.addEventListener?.("pointermove", this._onMove);
    canvas.addEventListener?.("pointerleave", this._onLeave);
    canvas.addEventListener?.("click", this._onClick);

    this._syncLoop();
    this.requestRender();
  }

  // ---- characters ----
  addCharacter(opts) {
    if (this._chars.has(opts.id)) return this._chars.get(opts.id);
    const c = new Character(this, opts);
    this._chars.set(c.id, c);
    this._transition();
    this.requestRender();
    return c;
  }

  removeCharacter(id) {
    if (!this._chars.delete(id)) return false;
    this.release(id);
    if (this.selectedId === id) this.selectedId = null;
    if (this.hover?.kind === "character" && this.hover.id === id) this.hover = null;
    this._transition();
    this.requestRender();
    return true;
  }

  getCharacter(id) { return this._chars.get(id) ?? null; }
  characters() { return [...this._chars.values()]; }

  frameCount(spriteId, anim) {
    return this._sheets?.[spriteId]?.[anim]?.length || 1;
  }

  _transition() { this.stats.transitions++; }

  // ---- reservations ----
  reserve(tile, ownerId) {
    const k = `${tile.x},${tile.y}`;
    const holder = this._reserved.get(k);
    if (holder && holder !== ownerId) return false;
    this.release(ownerId);
    this._reserved.set(k, ownerId);
    this._reservedBy.set(ownerId, k);
    return true;
  }

  release(ownerId) {
    const k = this._reservedBy.get(ownerId);
    if (k == null) return;
    this._reservedBy.delete(ownerId);
    if (this._reserved.get(k) === ownerId) this._reserved.delete(k);
  }

  isReserved(tile, exceptOwner = null) {
    const h = this._reserved.get(`${tile.x},${tile.y}`);
    return h != null && h !== exceptOwner;
  }

  _avoidFor(c) {
    const s = new Set();
    for (const o of this._chars.values()) if (o !== c && !o.moving) s.add(`${o.tile.x},${o.tile.y}`);
    for (const [k, owner] of this._reserved) if (owner !== c.id) s.add(k);
    return s;
  }

  _pickIdlePoint(c, zone, extra = []) {
    const pts = [...(this.world.IDLE_POINTS[zone] ?? []), ...extra];
    const taken = new Set();
    for (const o of this._chars.values()) {
      if (o === c) continue;
      taken.add(`${o.tile.x},${o.tile.y}`);
      if (o._dest) taken.add(`${o._dest.x},${o._dest.y}`);
    }
    const free = pts.filter(([x, y]) => this.world.isWalkable(x, y) && !this.isReserved({ x, y }, c.id) &&
      !taken.has(`${x},${y}`) && !(x === c.tile.x && y === c.tile.y));
    if (!free.length) return null;
    const [x, y] = free[Math.floor(this.rand() * free.length)];
    return { x, y };
  }

  _lookDir(tile) {
    let best = null;
    for (const f of this.world.FURNITURE) {
      const nx = Math.max(f.x, Math.min(tile.x, f.x + f.w - 1));
      const ny = Math.max(f.y, Math.min(tile.y, f.y + f.h - 1));
      const d = Math.abs(nx - tile.x) + Math.abs(ny - tile.y);
      if (d > 0 && d <= 3 && (!best || d < best.d)) best = { d, dx: nx - tile.x, dy: ny - tile.y };
    }
    if (!best) return "down";
    return Math.abs(best.dx) > Math.abs(best.dy) ? (best.dx > 0 ? "right" : "left") : (best.dy > 0 ? "down" : "up");
  }

  _defer(fn) { this._deferred.push(fn); }

  _flush() {
    for (let i = 0; i < 50 && this._deferred.length; i++) {
      const q = this._deferred;
      this._deferred = [];
      for (const fn of q) fn();
    }
  }

  // ---- stations / selection ----
  setStationActive(stationId, on) {
    const had = this._activeStations.has(stationId);
    if (on && !had) this._activeStations.add(stationId);
    else if (!on && had) this._activeStations.delete(stationId);
    else return;
    this.requestRender();
  }

  isStationActive(stationId) { return this._activeStations.has(stationId); }

  select(id) {
    this.selectedId = id ?? null;
    this.requestRender();
  }

  // ---- loop ----
  _shouldRun() {
    return !this._destroyed && this.animationEnabled && !(globalThis.document && document.hidden);
  }

  _syncLoop() {
    const run = this._shouldRun();
    if (run && this._raf == null) {
      if (this._renderRaf != null) { cancelAnimationFrame(this._renderRaf); this._renderRaf = null; }
      this._lastT = null;
      this._raf = requestAnimationFrame(this._tick);
    } else if (!run && this._raf != null) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
    this.stats.rafActive = this._raf != null;
  }

  _tick(t) {
    this._raf = null;
    if (!this._shouldRun()) { this.stats.rafActive = false; return; }
    const dt = this._lastT == null ? 16 : Math.max(0, Math.min(MAX_DT, t - this._lastT));
    this._lastT = t;
    this.step(dt);
    this.render();
    this._raf = requestAnimationFrame(this._tick);
    this.stats.rafActive = true;
  }

  // Large dt is split so simulated time (tests) behaves like many real frames without tunnelling.
  step(dtMs) {
    let left = Math.max(0, Number(dtMs) || 0);
    while (left > 0) {
      const dt = Math.min(MAX_DT, left);
      left -= dt;
      this.clock += dt;
      this._screenT += dt;
      if (this._screenT >= SCREEN_MS) {
        this.screenFrame = (this.screenFrame + Math.floor(this._screenT / SCREEN_MS)) % 4;
        this._screenT %= SCREEN_MS;
      }
      for (const c of this._chars.values()) c.update(dt);
      this._flush();
    }
  }

  requestRender() {
    this._flush();
    if (this._destroyed || this._raf != null || this._renderRaf != null) return;
    this._renderRaf = requestAnimationFrame(() => {
      this._renderRaf = null;
      this._staticTick();
      this.render();
    });
  }

  // Without the loop only transient bubbles age, so nothing moves while the page is static.
  _staticTick() {
    const t = now();
    const dt = Math.max(0, Math.min(60000, t - this._lastStatic));
    this._lastStatic = t;
    for (const c of this._chars.values()) {
      if (c.flash) { c.flash.ttl -= dt; if (c.flash.ttl <= 0) c.flash = null; }
      if (c._decorCooldown > 0) c._decorCooldown -= dt;
      c._resolveAnim();
    }
  }

  setAnimationEnabled(on) {
    on = !!on;
    if (on === this.animationEnabled) return;
    this.animationEnabled = on;
    if (!on) {
      for (const c of this._chars.values()) c._snapToDestination();
      this._flush();
      for (const c of this._chars.values()) c._resolveAnim();
    }
    this._lastStatic = now();
    this._syncLoop();
    this.requestRender();
  }

  destroy() {
    this._destroyed = true;
    if (this._raf != null) cancelAnimationFrame(this._raf);
    if (this._renderRaf != null) cancelAnimationFrame(this._renderRaf);
    this._raf = null;
    this._renderRaf = null;
    this.stats.rafActive = false;
    document.removeEventListener?.("visibilitychange", this._onVis);
    this.canvas.removeEventListener?.("pointermove", this._onMove);
    this.canvas.removeEventListener?.("pointerleave", this._onLeave);
    this.canvas.removeEventListener?.("click", this._onClick);
    this._chars.clear();
    this._deferred = [];
  }

  // ---- picking ----
  toWorld(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect?.();
    if (!r || !r.width || !r.height) return null;
    return { x: ((clientX - r.left) * this.width) / r.width, y: ((clientY - r.top) * this.height) / r.height };
  }

  pick(clientX, clientY) {
    const p = this.toWorld(clientX, clientY);
    return p ? this.hitAt(p.x, p.y) : null;
  }

  hitAt(x, y) {
    const T = this.world.TILE;
    const chars = [...this._chars.values()].sort((a, b) => b.py - a.py);
    for (const c of chars) {
      const left = c.px - this.charW / 2;
      const top = c.py + 2 - this.charH;
      if (x >= left && x < left + this.charW && y >= top && y < top + this.charH) return { kind: "character", id: c.id };
    }
    const objs = this._objects.filter((o) => o.f.station).sort((a, b) => b.key - a.key);
    for (const { f } of objs) {
      if (x >= f.x * T && x < (f.x + f.w) * T && y >= (f.y - 1) * T && y < (f.y + f.h) * T) return { kind: "station", id: f.station };
    }
    for (const f of this._wallFurn) {
      if (f.station && x >= f.x * T && x < (f.x + f.w) * T && y >= f.y * T && y < (f.y + f.h) * T) return { kind: "station", id: f.station };
    }
    return null;
  }

  _hoverAt(clientX, clientY) { this._setHover(this.pick(clientX, clientY)); }

  _setHover(hit) {
    const same = (hit?.kind ?? null) === (this.hover?.kind ?? null) && (hit?.id ?? null) === (this.hover?.id ?? null);
    if (same) return;
    this.hover = hit;
    if (this.canvas.style) this.canvas.style.cursor = hit ? "pointer" : "default";
    this.onHover?.(hit);
    this.requestRender();
  }

  // ---- drawing ----
  _buildBackground() {
    const T = this.world.TILE;
    const bg = makeCanvas(this.width, this.height);
    const g = bg.getContext("2d");
    g.imageSmoothingEnabled = false;
    for (let y = 0; y < this.world.ROWS; y++) {
      for (let x = 0; x < this.world.COLS; x++) g.drawImage(this.sprites.renderTile(this.world.FLOOR[y][x], x, y), x * T, y * T);
    }
    for (const f of this._wallFurn) g.drawImage(this._furn(f, false), f.x * T, f.y * T);
    return bg;
  }

  _furn(f, active) {
    const frame = active ? this.screenFrame : 0;
    const k = `${f.type}|${f.w}|${f.h}|${active ? 1 : 0}|${frame}`;
    let c = this._furnCache.get(k);
    if (!c) {
      c = this.sprites.renderFurniture(f.type, f.w, f.h, { active, frame });
      this._furnCache.set(k, c);
    }
    return c;
  }

  _cached(key, build) {
    let c = this._textCache.get(key);
    if (c) return c;
    if (this._textCache.size >= TEXT_CACHE_MAX) this._textCache.delete(this._textCache.keys().next().value);
    c = build();
    this._textCache.set(key, c);
    return c;
  }

  _bubbleCanvas(text, kind) {
    return this._cached(`b|${kind}|${text}`, () => {
      const st = BUBBLE_STYLE[kind] ?? BUBBLE_STYLE.real;
      const lines = wrapText(text);
      const w = Math.max(...lines.map(textWidth)) + 6;
      const h = lines.length * (GLYPH_H + 1) - 1 + 4;
      const c = makeCanvas(w, h);
      const g = c.getContext("2d");
      g.fillStyle = st.bg;
      g.fillRect(1, 1, w - 2, h - 2);
      g.fillStyle = st.border;
      for (let x = 1; x < w - 1; x++) {
        if (st.dotted && x % 2) continue;
        g.fillRect(x, 0, 1, 1);
        g.fillRect(x, h - 1, 1, 1);
      }
      for (let y = 1; y < h - 1; y++) {
        if (st.dotted && y % 2) continue;
        g.fillRect(0, y, 1, 1);
        g.fillRect(w - 1, y, 1, 1);
      }
      lines.forEach((l, i) => drawGlyphs(g, l, 3 + Math.floor((w - 6 - textWidth(l)) / 2), 2 + i * (GLYPH_H + 1), st.fg, st.italic));
      return c;
    });
  }

  _tagCanvas(text, fg, bg) {
    return this._cached(`t|${fg}|${bg}|${text}`, () => {
      const t = clip(normalizeText(text));
      const w = textWidth(t) + 4;
      const c = makeCanvas(w, GLYPH_H + 2);
      const g = c.getContext("2d");
      g.fillStyle = bg;
      g.fillRect(0, 0, w, GLYPH_H + 2);
      drawGlyphs(g, t, 2, 1, fg);
      return c;
    });
  }

  render() {
    if (this._destroyed) return;
    const ctx = this.ctx;
    const T = this.world.TILE;
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;
    ctx.drawImage(this._bg, 0, 0);
    for (const f of this._wallFurn) {
      if (f.station && this._activeStations.has(f.station)) ctx.drawImage(this._furn(f, true), f.x * T, f.y * T);
    }
    const list = this._drawList;
    list.length = 0;
    for (const o of this._objects) list.push(o);
    for (const c of this._chars.values()) { c._sortEntry.key = c.py; list.push(c._sortEntry); }
    // Ties go to furniture first so a character on the same baseline is drawn in front.
    list.sort((a, b) => a.key - b.key || (a.f ? 0 : 1) - (b.f ? 0 : 1));
    for (const e of list) {
      if (e.f) ctx.drawImage(this._furn(e.f, !!e.f.station && this._activeStations.has(e.f.station)), e.f.x * T, (e.f.y - 1) * T);
      else this._drawChar(e.c);
    }
    for (const c of this._chars.values()) this._drawOverlays(c);
    this._drawBubbles();
    this.stats.frames++;
  }

  _drawChar(c) {
    const ctx = this.ctx;
    const sheet = this._sheets?.[c.spriteId];
    const frames = sheet?.[c.anim] ?? sheet?.[`stand_${c.dir}`] ?? sheet?.stand_down;
    const x = Math.round(c.px - this.charW / 2);
    const y = Math.round(c.py + 2 - this.charH);
    if (c.dimmed) ctx.globalAlpha = 0.45;
    if (frames?.length) ctx.drawImage(frames[c.frame % frames.length], x, y);
    else { ctx.fillStyle = "#888"; ctx.fillRect(x + 4, y + 6, 8, 16); }
    ctx.globalAlpha = 1;
    if (this.selectedId === c.id) {
      const pulse = this.animationEnabled ? Math.floor(this.clock / 300) % 2 === 0 : true;
      ctx.fillStyle = pulse ? "#ffe066" : "#ffffff";
      ctx.fillRect(x - 1, y - 1, this.charW + 2, 1);
      ctx.fillRect(x - 1, y + this.charH, this.charW + 2, 1);
      ctx.fillRect(x - 1, y, 1, this.charH);
      ctx.fillRect(x + this.charW, y, 1, this.charH);
    }
  }

  _drawOverlays(c) {
    const ctx = this.ctx;
    const top = Math.round(c.py + 2 - this.charH);
    let y = Math.round(c.py + 3);
    if (c.badge) {
      const b = this._tagCanvas(c.badge, "#ffe066", "#1b1b2a");
      ctx.drawImage(b, this._clampX(Math.round(c.px - b.width / 2), b.width), Math.min(y, this.height - b.height));
      y += b.height + 1;
    }
    const showLabel = this.selectedId === c.id || (this.hover?.kind === "character" && this.hover.id === c.id);
    if (showLabel && c.label) {
      const l = this._tagCanvas(c.label, "#ffffff", "rgba(0,0,0,0.75)");
      ctx.drawImage(l, this._clampX(Math.round(c.px - l.width / 2), l.width), Math.min(y, this.height - l.height));
    }
    if (c.warnIcon) {
      // Battery glyph: drawn over the sprite so the working animation underneath keeps playing.
      const bx = Math.round(c.px + 3);
      const by = Math.max(0, top - 4);
      ctx.fillStyle = "#1b1b2a";
      ctx.fillRect(bx, by, 7, 4);
      ctx.fillRect(bx + 7, by + 1, 1, 2);
      ctx.fillStyle = c.warnIcon === "low" ? "#ff4040" : "#ffd84a";
      ctx.fillRect(bx + 1, by + 1, c.warnIcon === "low" ? 1 : 3, 2);
    }
  }

  _clampX(x, w) { return Math.max(1, Math.min(this.width - w - 1, x)); }

  _drawBubbles() {
    const ctx = this.ctx;
    const placed = this._placed;
    placed.length = 0;
    for (const c of this._chars.values()) {
      const b = c.flash ?? c.bubble;
      if (!b) continue;
      const img = this._bubbleCanvas(b.text, b.kind);
      const w = img.width;
      const h = img.height;
      const headTop = Math.round(c.py + 2 - this.charH);
      let x = this._clampX(Math.round(c.px - w / 2), w);
      let y = headTop - 3 - h;
      const below = y < 1;
      if (below) y = Math.round(c.py + 5);
      for (let i = 0; i < 6 && placed.some((r) => x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y); i++) {
        y += below ? h + 1 : -(h + 1);
      }
      y = Math.max(0, Math.min(this.height - h, y));
      placed.push({ x, y, w, h });
      ctx.drawImage(img, x, y);
      const st = BUBBLE_STYLE[b.kind] ?? BUBBLE_STYLE.real;
      const tx = Math.max(x + 3, Math.min(x + w - 4, Math.round(c.px)));
      const edge = below ? y : y + h - 1;
      const s = below ? -1 : 1;
      ctx.fillStyle = st.bg;
      ctx.fillRect(tx - 1, edge, 3, 1);
      ctx.fillRect(tx - 1, edge + s, 3, 1);
      ctx.fillRect(tx, edge + 2 * s, 1, 1);
      ctx.fillStyle = st.border;
      ctx.fillRect(tx - 2, edge + s, 1, 1);
      ctx.fillRect(tx + 2, edge + s, 1, 1);
      ctx.fillRect(tx - 1, edge + 2 * s, 1, 1);
      ctx.fillRect(tx + 1, edge + 2 * s, 1, 1);
      ctx.fillRect(tx, edge + 3 * s, 1, 1);
    }
  }
}
