// Procedural pixel art for BAAN Pixel HQ. Everything is drawn with fillRect so the module stays
// dependency-free and testable with a stub 2D context.

export const CHAR_W = 16, CHAR_H = 24;
export const CHARACTER_IDS = ["orchestrator", "planner", "worker", "verifier", "spec", "arch", "pm", "build", "check", "survey", "ui", "review", "claude", "codex", "agy"];
export const ANIMS = { walk_down: 4, walk_up: 4, walk_left: 4, walk_right: 4, stand_down: 2, stand_up: 2, stand_left: 2, stand_right: 2, sit: 2, type: 4, read: 2, think: 2, write: 4, drink: 2, success: 2, error: 2, warning: 2, offline: 1 };

const OL = "#1b1b2a";
const PAPER = "#F4F1E8", PAPER_S = "#D3CCBA";
const BEZ = "#262C3D", SCR_ON = "#0B2A3C", SCR_OFF = "#141B27", LED_STBY = "#F59E0B";
const MET_M = "#6E7A8F", MET_D = "#4A5468";
const GREEN = "#22C55E", RED = "#EF4444", YELLOW = "#FACC15", ACCENT = "#38BDF8";
const THEME = { claude: "#F97316", codex: "#10B981", agy: "#8B5CF6" };
const CODE = ["#7DD3FC", "#F472B6", "#A3E635", "#FDE68A", "#C4B5FD", "#94A3B8"];

// ---------- low-level helpers ----------

function canvas(doc, w, h) {
  const c = doc.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function hash(a, b = 0, c = 0) {
  let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1) ^ Math.imul(c | 0, 0x9e3779b1) ^ 0x5bd1e995;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

function strHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rgb(c) {
  let h = c.slice(1);
  if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  const n = parseInt(h.slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r, g, b) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}

function adjust(c, k) {
  if (typeof c !== "string" || c[0] !== "#") return c;
  const [r, g, b] = rgb(c);
  return toHex(r + k, g + k, b + k);
}

function toGray(c) {
  if (typeof c !== "string" || c[0] !== "#") return c;
  const [r, g, b] = rgb(c);
  const v = 70 + (0.3 * r + 0.59 * g + 0.11 * b) * 0.55;
  return toHex(v, v, v + 6);
}

// Mirroring and greying happen in the pen so a single drawing routine serves left/right and offline.
function pen(g, W, mirror = false, gray = false) {
  const r = (x, y, w, h, c) => {
    if (!c || w <= 0 || h <= 0) return;
    g.fillStyle = gray ? toGray(c) : c;
    g.fillRect(mirror ? W - x - w : x, y, w, h);
  };
  return {
    r,
    p: (x, y, c) => r(x, y, 1, 1, c),
    box: (x, y, w, h, c, ol = OL) => { r(x, y, w, h, ol); r(x + 1, y + 1, w - 2, h - 2, c); },
    frame: (x, y, w, h, c) => { r(x, y, w, 1, c); r(x, y + h - 1, w, 1, c); r(x, y, 1, h, c); r(x + w - 1, y, 1, h, c); },
  };
}

// ---------- characters ----------

const SKINS = ["#F6CFA8", "#E7B48A", "#C68C62", "#8F5B3C"];
const DROID = "#E6EAF3";

const SPECS = {
  orchestrator: { skin: SKINS[0], hair: "#3B2A20", style: "side_part", top: "#2F5FB3", shade: "#1F407E", inner: "#E8EEF5", detail: "tie", tie: "#C0392B", pants: "#24324F", shoes: "#16161E", acc: ["headset"], set: ACCENT, held: "clipboard" },
  planner: { skin: SKINS[1], hair: "#6A3E1F", style: "short", top: "#E7B416", shade: "#B88A0E", inner: "#4A7BD0", detail: "open", pants: "#3C4A63", shoes: "#5A3A22", acc: ["glasses"], held: "notebook" },
  worker: { skin: SKINS[2], hair: "#1E1B22", style: "messy", top: "#3E7480", shade: "#29525B", detail: "hoodie", pants: "#2B2F3A", shoes: "#E8E8E8", acc: ["headphones"], phones: "#E94B5A", held: "laptop", readItem: "laptop" },
  verifier: { skin: SKINS[0], hair: "#2A2A2A", style: "short", top: "#F2F4F7", shade: "#C3CAD5", inner: "#5B8DEF", detail: "open", pants: "#3A3F4E", shoes: "#2A2A30", acc: ["glasses"], held: "magnifier" },
  spec: { skin: SKINS[1], hair: "#B5562B", style: "ponytail", top: "#3E9A57", shade: "#2B6E3E", inner: "#F1EEE6", sleeve: "#F1EEE6", detail: "vest", pants: "#4A3B2E", shoes: "#2E2219", held: "folder" },
  arch: { skin: SKINS[3], hair: "#B8BCC6", style: "short", top: "#22305A", shade: "#151F3D", detail: "turtleneck", pants: "#2A2A33", shoes: "#111118", held: "tube" },
  pm: { skin: SKINS[0], hair: "#2B1A14", style: "bun", top: "#8E2A3E", shade: "#621B2B", inner: "#F3E6E0", detail: "open", pants: "#2E2430", shoes: "#3A1A22", held: "tablet" },
  build: { skin: SKINS[2], hair: "#3A2414", style: "cap_back", cap: "#2E64C9", top: "#B8612A", shade: "#7E3F18", detail: "flannel", pants: "#3B4D6B", shoes: "#4A3020", held: "wrench" },
  check: { skin: SKINS[3], hair: "#1A1410", style: "curly", top: "#1FA39A", shade: "#147069", detail: "polo", pants: "#2C3442", shoes: "#EDEDED", held: "checklist" },
  survey: { skin: SKINS[1], hair: "#5A3A1E", style: "hat_explorer", hat: "#C9A867", top: "#A89060", shade: "#776640", inner: "#E9E1C8", detail: "open", pants: "#5B4A32", shoes: "#4A3220", held: "map" },
  ui: { skin: SKINS[0], hair: "#2E1F3A", style: "beret", hat: "#EC5FA5", top: "#F5F5F5", shade: "#BDBDBD", detail: "stripes", stripes: ["#F05A7E", "#FFC94A", "#4CC3F0"], pants: "#33334A", shoes: "#EC5FA5", held: "stylus" },
  review: { skin: SKINS[1], hair: "#2A1A1A", style: "long", top: "#4B2A6B", shade: "#321B49", detail: "sweater", pants: "#2A2433", shoes: "#1C1620", acc: ["roundglasses"], held: "redpen" },
  claude: { droid: THEME.claude, skin: DROID, hair: "#7A3B12", style: "neat", top: THEME.claude, shade: "#C2560C", detail: "jacket", pants: "#2A2A33", shoes: "#1A1A22", acc: ["headset"], set: THEME.claude, held: "terminal" },
  codex: { droid: THEME.codex, skin: DROID, hair: "#0B5E45", style: "hood", top: THEME.codex, shade: "#0A7F59", detail: "hoodie", pants: "#22262E", shoes: "#0F1A16", acc: ["headset"], set: "#6EE7B7", held: "keyboard", grin: true },
  agy: { droid: THEME.agy, skin: DROID, hair: "#4C2A99", style: "spiky", top: THEME.agy, shade: "#5B34B8", detail: "future", trim: "#22D3EE", pants: "#241A3D", shoes: "#140E26", acc: ["visor", "drone"], held: null },
};

function fallbackSpec(id) {
  const h = strHash(String(id));
  const pick = (arr, k) => arr[(h >>> k) % arr.length];
  const top = pick(["#64748B", "#0EA5E9", "#A855F7", "#84CC16", "#F43F5E"], 9);
  return { skin: pick(SKINS, 0), hair: pick(["#2B1D16", "#6A3E1F", "#C9A227", "#1E1B22"], 3), style: pick(["short", "messy", "curly", "bun"], 6), top, shade: adjust(top, -40), detail: "polo", pants: "#2E3440", shoes: "#1A1A22", held: null };
}

const has = (s, a) => !!(s.acc && s.acc.includes(a));
const SIDE_STEP = [[8, 4], [7, 5], [4, 8], [7, 5]];

function poseFor(anim, f) {
  const [kind, dn] = anim.split("_");
  const dir = dn === "up" ? "up" : dn === "left" || dn === "right" ? "side" : "down";
  const o = { kind, dir: "down", b: 0, lift: [0, 0], swing: [0, 0], swingX: 0, step: 1, arms: "side", eyes: "open", mouth: "smile", frame: f, seated: false, slump: false, item: false };
  switch (kind) {
    case "walk":
      Object.assign(o, { dir, item: true, step: f, b: f % 2 ? 0 : 1, lift: [[0, 0], [1, 0], [0, 0], [0, 1]][f], swing: [[0, 0], [-1, 1], [0, 0], [1, -1]][f], swingX: [-1, 0, 1, 0][f] });
      break;
    case "stand": Object.assign(o, { dir, item: true, b: f }); break;
    case "sit": Object.assign(o, { seated: true, b: f }); break;
    case "type": Object.assign(o, { seated: true, arms: "type", keys: [[1, 0], [0, 1], [1, 0], [0, 0]][f] }); break;
    case "read": o.arms = "read"; break;
    case "think": Object.assign(o, { arms: "think", dots: f }); break;
    case "write": Object.assign(o, { dir: "up", arms: "write" }); break;
    case "drink": Object.assign(o, { arms: "drink", eyes: f ? "closed" : "open" }); break;
    case "success": Object.assign(o, { arms: "up", eyes: "happy", mouth: "open", b: f ? 0 : 1, sparkle: true }); break;
    case "error": Object.assign(o, { arms: "limp", slump: true, b: 1, eyes: "sad", mouth: "frown", mark: f ? "#B91C1C" : RED }); break;
    case "warning": Object.assign(o, { b: f, mouth: "frown", mark: YELLOW, markDy: f }); break;
    case "offline": Object.assign(o, { eyes: "closed", mouth: "none", zz: true }); break;
  }
  return o;
}

function drawFigure(p, s, o) {
  const seat = o.seated ? 2 : 0;
  const by = 11 + o.b + seat;
  const hy = 3 + o.b + seat + (o.slump ? 1 : 0);
  drawLegs(p, s, o);
  drawBody(p, s, o, by);
  drawHead(p, s, o, hy);
  drawArms(p, s, o, by, hy);
  drawExtras(p, s, o, by);
}

function leg(p, x, lift, pants, shoe) {
  const h = 6 - lift;
  p.box(x, 18, 4, h, pants);
  p.r(x + 1, 18 + h - 3, 2, 2, shoe);
}

function drawLegs(p, s, o) {
  if (o.seated) {
    for (const x of [4, 8]) { p.box(x, 20, 4, 4, s.pants); p.r(x + 1, 22, 2, 1, s.shoes); }
    return;
  }
  if (o.dir === "side") {
    const [back, front] = SIDE_STEP[o.step] || SIDE_STEP[1];
    leg(p, back, 0, adjust(s.pants, -25), adjust(s.shoes, -15));
    leg(p, front, 0, s.pants, s.shoes);
    return;
  }
  leg(p, 4, o.lift[0], s.pants, s.shoes);
  leg(p, 8, o.lift[1], s.pants, s.shoes);
}

function drawBody(p, s, o, by) {
  const side = o.dir === "side";
  const x = side ? 5 : 4, w = side ? 6 : 8;
  p.box(x, by, w, 8, s.top);
  p.r(x + 1, by + 6, w - 2, 1, s.pants);
  p.r(x + w - 2, by + 1, 1, 5, s.shade);
  if (o.dir === "down") frontDetail(p, s, by);
  else if (side) sideDetail(p, s, by);
  else backDetail(p, s, by);
}

function frontDetail(p, s, by) {
  const t = s.top, sh = s.shade, inn = s.inner || "#F1F5F9";
  switch (s.detail) {
    case "tie": p.r(6, by + 1, 4, 1, inn); p.r(7, by + 2, 2, 3, s.tie); p.p(6, by + 2, sh); p.p(9, by + 2, sh); break;
    case "open": p.r(7, by + 1, 2, 5, inn); p.r(6, by + 1, 1, 5, sh); p.r(9, by + 1, 1, 5, sh); break;
    case "vest": p.r(6, by + 1, 4, 2, inn); p.r(7, by + 3, 2, 1, inn); p.p(8, by + 4, adjust(t, 50)); break;
    case "hoodie": p.r(6, by + 1, 1, 2, "#F1F5F9"); p.r(9, by + 1, 1, 2, "#F1F5F9"); p.r(6, by + 4, 4, 1, sh); break;
    case "turtleneck": p.r(5, by + 1, 6, 1, adjust(t, 30)); p.r(7, by + 2, 2, 3, adjust(t, 14)); break;
    case "flannel":
      for (let yy = 1; yy < 6; yy++) for (let xx = 5; xx < 11; xx++) {
        const v = xx === 6 || xx === 9, hz = yy === 2 || yy === 4;
        if (v || hz) p.p(xx, by + yy, v && hz ? adjust(sh, -25) : sh);
      }
      break;
    case "polo": p.r(6, by + 1, 4, 1, adjust(t, 70)); p.r(7, by + 2, 1, 2, adjust(t, 70)); break;
    case "stripes": (s.stripes || []).forEach((c, i) => p.r(5, by + 1 + i * 2, 6, 1, c)); break;
    case "sweater": p.r(6, by + 1, 4, 1, sh); p.r(7, by + 2, 2, 1, sh); p.r(5, by + 5, 6, 1, sh); break;
    case "jacket": p.r(7, by + 1, 1, 5, "#3A1A08"); p.r(5, by + 1, 2, 1, sh); p.r(8, by + 1, 2, 1, sh); break;
    case "future": p.r(5, by + 3, 6, 1, s.trim); p.p(6, by + 1, s.trim); p.p(9, by + 1, s.trim); break;
  }
  if (s.droid) { p.p(9, by + 3, "#FFFFFF"); p.p(9, by + 4, adjust(s.droid, 60)); }
}

function sideDetail(p, s, by) {
  const sh = s.shade;
  if (["tie", "open", "vest", "jacket"].includes(s.detail)) p.r(5, by + 1, 1, 5, s.detail === "jacket" ? sh : s.inner || "#F1F5F9");
  if (s.detail === "hoodie") p.r(8, by + 1, 2, 2, sh);
  if (s.detail === "stripes") (s.stripes || []).forEach((c, i) => p.r(6, by + 1 + i * 2, 4, 1, c));
  if (s.detail === "flannel") { p.r(6, by + 2, 4, 1, sh); p.r(6, by + 4, 4, 1, sh); p.r(7, by + 1, 1, 5, sh); }
  if (s.detail === "future") p.r(6, by + 3, 4, 1, s.trim);
  if (s.detail === "turtleneck") p.r(6, by + 1, 4, 1, adjust(s.top, 30));
  if (s.droid) p.p(6, by + 3, "#FFFFFF");
}

function backDetail(p, s, by) {
  const sh = s.shade;
  if (s.detail === "hoodie") p.r(6, by + 1, 4, 2, sh);
  if (s.detail === "stripes") (s.stripes || []).forEach((c, i) => p.r(5, by + 1 + i * 2, 6, 1, c));
  if (s.detail === "flannel") { p.r(5, by + 2, 6, 1, sh); p.r(5, by + 4, 6, 1, sh); p.r(7, by + 1, 1, 5, sh); }
  if (s.detail === "future") { p.r(5, by + 3, 6, 1, s.trim); p.r(7, by + 1, 2, 2, s.trim); }
  if (s.detail === "open" || s.detail === "tie") p.r(7, by + 3, 1, 3, sh);
}

function drawHead(p, s, o, hy) {
  p.box(3, hy, 10, 9, s.skin);
  if (o.dir === "up") p.r(5, hy + 7, 6, 1, adjust(s.skin, -25));
  drawHair(p, s, o, hy);
  if (o.dir !== "up") drawFace(p, s, o, hy);
  drawHeadAcc(p, s, o, hy);
}

function drawHair(p, s, o, hy) {
  const H = s.hair, d = o.dir, st = s.style;
  if (st === "hood") {
    const t = s.top;
    p.box(2, hy - 1, 12, 11, t);
    p.p(7, hy - 2, OL); p.p(8, hy - 2, OL);
    if (d === "down") { p.r(4, hy + 2, 8, 6, s.shade); p.r(5, hy + 3, 6, 5, s.skin); p.r(5, hy + 3, 6, 1, H); }
    else if (d === "side") { p.r(2, hy + 2, 6, 6, s.shade); p.r(3, hy + 3, 4, 5, s.skin); p.r(3, hy + 3, 4, 1, H); }
    else p.r(7, hy, 2, 9, s.shade);
    return;
  }
  if (d === "up") p.r(4, hy + 1, 8, 6, H);
  else if (d === "side") { p.r(4, hy + 1, 8, 2, H); p.r(8, hy + 3, 4, 4, H); }
  else { p.r(4, hy + 1, 8, 2, H); p.r(4, hy + 3, 1, 2, H); p.r(11, hy + 3, 1, 2, H); }
  const hl = adjust(H, 45);
  switch (st) {
    case "side_part":
      if (d === "down") { p.r(4, hy + 3, 4, 1, H); p.p(8, hy + 1, hl); }
      else if (d === "side") p.r(4, hy + 3, 2, 1, H);
      else p.r(8, hy + 1, 1, 2, hl);
      break;
    case "neat": if (d !== "up") p.r(5, hy + 1, 3, 1, hl); break;
    case "messy":
      for (const x of [5, 8, 10]) { p.p(x, hy - 1, OL); p.p(x, hy, H); }
      if (d === "down") { p.p(6, hy + 3, H); p.p(9, hy + 3, H); }
      break;
    case "spiky":
      for (const x of [4, 6, 8, 10]) { p.p(x, hy - 2, OL); p.p(x, hy - 1, H); p.p(x, hy, H); }
      if (d !== "up") p.p(6, hy + 1, adjust(s.droid || H, 40));
      break;
    case "curly":
      p.r(3, hy - 1, 10, 1, OL); p.r(4, hy, 8, 1, H);
      p.r(2, hy + 2, 1, 4, OL); p.r(13, hy + 2, 1, 4, OL);
      p.r(3, hy + 2, 1, 3, H); p.r(12, hy + 2, 1, 3, H);
      p.p(5, hy + 1, hl); p.p(9, hy + 1, hl); p.p(7, hy, hl);
      if (d === "up") { p.p(6, hy + 4, hl); p.p(9, hy + 5, hl); }
      break;
    case "ponytail":
      if (d === "down") { p.box(12, hy + 3, 3, 6, H); p.p(13, hy + 3, "#E94B5A"); }
      else if (d === "side") { p.box(11, hy + 3, 3, 7, H); p.p(12, hy + 3, "#E94B5A"); }
      else { p.box(6, hy + 6, 4, 7, H); p.r(7, hy + 6, 2, 1, "#E94B5A"); }
      break;
    case "bun":
      p.box(5, hy - 3, 6, 4, H); p.p(6, hy - 2, hl);
      break;
    case "long":
      if (d === "down") {
        p.r(2, hy + 1, 3, 10, OL); p.r(3, hy + 1, 2, 9, H);
        p.r(11, hy + 1, 3, 10, OL); p.r(11, hy + 1, 2, 9, H);
      } else if (d === "side") p.box(8, hy + 2, 5, 10, H);
      else p.box(3, hy + 1, 10, 11, H);
      break;
    case "cap_back": {
      const cap = s.cap || "#2E64C9";
      p.r(4, hy + 1, 8, 2, cap);
      if (d === "down") p.r(6, hy + 1, 4, 1, adjust(cap, 35));
      else if (d === "side") p.box(11, hy + 1, 4, 3, adjust(cap, -30));
      else { p.r(4, hy + 3, 8, 1, cap); p.box(5, hy + 3, 6, 3, adjust(cap, -30)); }
      break;
    }
    case "hat_explorer": {
      const hat = s.hat || "#C9A867";
      p.box(4, hy - 3, 8, 5, hat);
      p.r(5, hy, 6, 1, adjust(hat, -55));
      p.box(1, hy + 1, 14, 3, adjust(hat, -15));
      break;
    }
    case "beret": {
      const hat = s.hat || "#EC5FA5";
      p.box(2, hy - 2, 10, 4, hat);
      p.p(9, hy - 3, OL);
      p.r(4, hy - 1, 3, 1, adjust(hat, 45));
      break;
    }
  }
}

function drawFace(p, s, o, hy) {
  const side = o.dir === "side";
  const eye = s.droid ? "#111827" : s.eye || "#2B1D16";
  const xs = side ? [5] : [5, 10];
  const glasses = has(s, "glasses") || has(s, "roundglasses");
  if (glasses) {
    const fc = has(s, "roundglasses") ? "#8B3A3A" : "#6B7A90";
    for (const x of xs) { p.r(x - 1, hy + 4, 3, 2, "#CDEBFF"); p.r(x - 1, hy + 3, 3, 1, fc); }
    if (has(s, "roundglasses")) for (const x of xs) p.r(x - 1, hy + 6, 3, 1, fc);
    if (side) p.r(7, hy + 4, 1, 1, fc); else p.r(7, hy + 4, 2, 1, fc);
  }
  for (const x of xs) {
    if (o.eyes === "closed") p.r(x === 5 ? 4 : 10, hy + 5, 2, 1, eye);
    else if (o.eyes === "happy") { p.p(x - 1, hy + 5, eye); p.p(x, hy + 4, eye); p.p(x + 1, hy + 5, eye); }
    else if (o.eyes === "sad") p.r(x, hy + 5, 1, 1, eye);
    else p.r(x, hy + 4, 1, 2, eye);
  }
  const m = s.droid ? adjust(s.droid, -40) : adjust(s.skin, -75);
  const mx = side ? 4 : 7, mw = side ? 1 : 2;
  if (o.mouth === "open") p.r(mx, hy + 6, mw, 2, "#7A2E2E");
  else if (o.mouth === "frown") { p.r(mx, hy + 7, mw, 1, m); if (!side) { p.p(6, hy + 7, OL); } }
  else if (o.mouth !== "none") p.r(mx, hy + 6, s.grin && !side ? 3 : mw, 1, s.grin ? "#7A2E2E" : m);
  const cheek = s.droid || "#F2998A";
  if (side) p.p(6, hy + 6, cheek);
  else if (!glasses || s.droid) { p.p(4, hy + 6, cheek); p.p(11, hy + 6, cheek); }
}

function drawHeadAcc(p, s, o, hy) {
  const d = o.dir;
  if (has(s, "visor")) {
    if (d === "down") { p.r(3, hy + 4, 10, 2, "#22D3EE"); p.r(4, hy + 4, 2, 1, "#A5F3FC"); }
    else if (d === "side") { p.r(2, hy + 4, 6, 2, "#22D3EE"); p.p(3, hy + 4, "#A5F3FC"); }
    else p.r(3, hy + 4, 10, 1, adjust(s.top, -30));
  }
  if (has(s, "headphones")) {
    const c = s.phones || "#E94B5A";
    p.r(3, hy - 1, 10, 1, OL); p.r(4, hy - 1, 8, 1, c);
    if (d === "side") p.box(8, hy + 2, 4, 5, c);
    else { p.box(1, hy + 2, 3, 5, c); p.box(12, hy + 2, 3, 5, c); }
  }
  if (has(s, "headset")) {
    const c = s.set || ACCENT;
    p.r(4, hy, 8, 1, c);
    if (d === "side") { p.r(8, hy + 3, 3, 4, OL); p.r(9, hy + 4, 1, 2, c); p.r(4, hy + 7, 3, 1, c); }
    else {
      p.r(2, hy + 3, 2, 4, OL); p.r(2, hy + 4, 1, 2, c);
      p.r(12, hy + 3, 2, 4, OL); p.r(13, hy + 4, 1, 2, c);
      if (d === "down") p.r(4, hy + 7, 3, 1, c);
    }
  }
}

function drawArms(p, s, o, by, hy) {
  const sl = s.sleeve || s.top, sk = s.skin;
  const armDown = (x, dy) => { p.box(x, by + 1 + dy, 3, 6, sl); p.p(x + 1, by + 5 + dy, sk); };
  if (o.dir === "side") { armDown(6 + o.swingX, 0); return; }
  switch (o.arms) {
    case "type": {
      const [l, r] = o.keys;
      p.box(2, by + 1, 3, 5, sl); p.box(11, by + 1, 3, 5, sl);
      p.r(5, by + 5 - l, 2, 1, sk); p.r(9, by + 5 - r, 2, 1, sk);
      break;
    }
    case "read": armDown(2, 0); armDown(11, 0); drawBook(p, s, by, o.frame); break;
    case "think":
      armDown(2, 0);
      p.box(11, by + 1, 3, 4, sl);
      p.box(9, hy + 6, 3, by - hy, sl);
      p.p(10, hy + 7, sk);
      break;
    case "write": {
      armDown(2, 0);
      const dx = [0, 1, 2, 1][o.frame % 4], top = hy - 1 + (o.frame % 2);
      p.box(10 + dx, top, 3, by + 3 - top, sl);
      p.p(11 + dx, top + 1, sk);
      p.p(11 + dx, top, "#2563EB");
      break;
    }
    case "drink":
      armDown(2, 0);
      if (o.frame) { p.box(11, hy + 8, 3, by + 7 - (hy + 8), sl); mug(p, 10, hy + 6, "#F1F5F9"); }
      else { armDown(11, 0); mug(p, 11, by + 4, "#F1F5F9"); }
      break;
    case "up": {
      const t = hy + 1 + (o.frame ? 0 : 1);
      p.box(1, t, 3, by + 3 - t, sl); p.box(12, t, 3, by + 3 - t, sl);
      p.p(2, t + 1, sk); p.p(13, t + 1, sk);
      break;
    }
    case "limp": armDown(2, 1); armDown(11, 1); break;
    default: armDown(2, o.swing[0]); armDown(11, o.swing[1]);
  }
}

function drawBook(p, s, by, f) {
  if (s.readItem === "laptop") {
    p.box(4, by + 2, 8, 5, "#A3ACBD");
    p.r(5, by + 3, 6, 2, "#38BDF8");
    p.r(5, by + 3 + f, 4, 1, "#E0F2FE");
  } else {
    p.box(4, by + 2, 8, 5, s.shade);
    p.r(5, by + 3, 3, 3, PAPER); p.r(8, by + 3, 3, 3, "#E6DFCC");
    if (f) { p.r(7, by + 1, 3, 1, "#FFFFFF"); p.p(9, by + 2, "#FFFFFF"); }
  }
  p.p(4, by + 5, s.skin); p.p(11, by + 5, s.skin);
}

function drawItem(p, kind, x, y) {
  switch (kind) {
    case "clipboard": case "checklist":
      p.box(x, y, 4, 5, "#9B6A3C"); p.r(x + 1, y + 1, 2, 3, PAPER); p.r(x + 1, y, 2, 1, "#CBD5E1");
      if (kind === "checklist") { p.p(x + 1, y + 2, GREEN); p.p(x + 2, y + 3, GREEN); }
      break;
    case "notebook": p.box(x, y, 4, 5, "#E2574C"); p.r(x + 1, y + 2, 2, 1, "#FBE9C8"); p.r(x + 3, y - 1, 1, 4, YELLOW); break;
    case "laptop": p.box(x, y, 3, 6, "#A3ACBD"); p.p(x + 1, y + 2, "#E2E8F0"); break;
    case "magnifier": p.box(x, y, 4, 4, "#C9A227"); p.r(x + 1, y + 1, 2, 2, "#BFE9FF"); p.r(x + 1, y + 4, 1, 2, "#5A3A22"); break;
    case "folder": p.box(x, y, 4, 5, "#E8C35A"); p.r(x + 1, y, 2, 1, "#C9A23A"); p.r(x + 1, y + 1, 2, 1, "#FFFFFF"); break;
    case "tube": p.box(x + 1, y - 3, 3, 8, "#3B82F6"); p.p(x + 2, y - 2, "#DBEAFE"); p.p(x + 2, y + 3, "#DBEAFE"); break;
    case "tablet": p.box(x, y, 4, 5, "#2A2F3D"); p.r(x + 1, y + 1, 2, 3, "#7DD3FC"); break;
    case "wrench": p.r(x, y, 1, 2, "#A9B4C2"); p.r(x + 2, y, 1, 2, "#A9B4C2"); p.r(x + 1, y + 1, 1, 4, "#A9B4C2"); p.p(x + 1, y + 5, OL); break;
    case "map": p.box(x - 1, y, 5, 4, "#E9D8A6"); p.p(x, y + 1, "#C0392B"); p.r(x + 1, y + 2, 2, 1, "#3B82F6"); break;
    case "stylus": p.r(x + 1, y - 1, 1, 5, "#F5F5F5"); p.p(x + 1, y + 4, "#EC5FA5"); break;
    case "redpen": p.r(x + 1, y - 1, 1, 5, "#DC2626"); p.p(x + 1, y - 1, "#F5F5F5"); break;
    case "terminal": p.box(x - 1, y, 5, 4, "#2A2F3D"); p.r(x, y + 1, 3, 2, THEME.claude); p.p(x, y + 1, "#2A2F3D"); break;
    case "keyboard": p.box(x - 2, y + 1, 6, 3, "#334155"); p.p(x - 1, y + 2, "#6EE7B7"); p.p(x + 1, y + 2, "#6EE7B7"); break;
  }
}

function drawExtras(p, s, o, by) {
  if (o.item && s.held) {
    const sw = o.dir === "side" ? 0 : o.swing[1];
    if (o.dir === "down") { drawItem(p, s.held, 12, by + 3 + sw); p.p(12, by + 5 + sw, s.skin); }
    else if (o.dir === "side") { drawItem(p, s.held, 3, by + 3); p.p(6 + o.swingX, by + 5, s.skin); }
  }
  if (has(s, "drone")) {
    const dy = o.frame % 2;
    p.p(0, 1 + dy, "#E5E7EB"); p.p(2, 1 + dy, "#E5E7EB");
    p.r(0, 2 + dy, 3, 1, "#A78BFA");
    p.p(1, 3 + dy, "#22D3EE");
  }
  if (o.mark) {
    const y = o.markDy || 0;
    p.r(12, y, 4, 6, OL); p.r(13, y + 1, 2, 2, o.mark); p.r(13, y + 4, 2, 1, o.mark);
  }
  if (o.dots !== undefined) {
    const c = "#E2E8F0";
    p.p(10, 1, c); p.p(12, 1, c);
    if (o.dots) p.p(14, 1, c);
  }
  if (o.sparkle) {
    const c = "#FDE047", [x, y, dx, dy] = o.frame ? [13, 1, 1, 5] : [1, 1, 14, 4];
    p.r(x - 1, y, 3, 1, c); p.r(x, y - 1, 1, 3, c);
    p.p(dx, dy, "#FFFFFF");
  }
  if (o.zz) { const c = "#CBD5E1"; p.r(12, 0, 3, 1, c); p.p(13, 1, c); p.r(12, 2, 3, 1, c); p.p(15, 3, c); }
}

function drawAnim(g, s, anim, f) {
  const o = poseFor(anim, f);
  const p = pen(g, CHAR_W, anim.endsWith("_right"), anim === "offline");
  drawFigure(p, s, o);
}

export function buildCharacterSheet(id, doc = document) {
  const s = SPECS[id] || fallbackSpec(id);
  const sheet = {};
  for (const [anim, n] of Object.entries(ANIMS)) {
    sheet[anim] = [];
    for (let f = 0; f < n; f++) {
      const c = canvas(doc, CHAR_W, CHAR_H);
      drawAnim(c.getContext("2d"), s, anim, f);
      sheet[anim].push(c);
    }
  }
  return sheet;
}

export function buildAllCharacters(doc = document) {
  return Object.fromEntries(CHARACTER_IDS.map((id) => [id, buildCharacterSheet(id, doc)]));
}

// ---------- floor tiles ----------

function carpet(base, light, dark) {
  return (p, tx, ty) => {
    p.r(0, 0, 16, 16, base);
    for (let y = 2; y < 16; y += 4) for (let x = ((y >> 2) % 2) * 2; x < 16; x += 4) p.p(x, y, light);
    for (let i = 0; i < 8; i++) {
      const hv = hash(tx, ty, i);
      p.p(hv % 16, (hv >>> 4) % 16, i % 2 ? light : dark);
    }
  };
}

function tiles(base, grout, hl) {
  return (p, tx, ty) => {
    for (let cy = 0; cy < 16; cy += 8) for (let cx = 0; cx < 16; cx += 8) {
      const v = hash(tx * 2 + cx / 8, ty * 2 + cy / 8) % 3;
      p.r(cx, cy, 8, 8, v === 0 ? adjust(base, 6) : v === 1 ? base : adjust(base, -5));
      p.r(cx, cy, 8, 1, grout); p.r(cx, cy, 1, 8, grout);
      p.p(cx + 1, cy + 1, hl);
    }
  };
}

const WOOD_F = ["#6B4931", "#64442E", "#714E35"];

const TILES = {
  wood(p, tx, ty) {
    for (let r = 0; r < 4; r++) {
      const y = r * 4, hv = hash(tx, ty, r);
      p.r(0, y, 16, 4, WOOD_F[hv % 3]);
      p.r(0, y + 3, 16, 1, "#4A3020");
      p.r((hv >>> 4) % 16, y, 1, 3, "#4A3020");
      p.r((hv >>> 9) % 14, y + 1, 2, 1, "#7E5A40");
    }
  },
  carpet_blue: carpet("#2F4B78", "#3A5A8E", "#283F66"),
  carpet_purple: carpet("#48356A", "#56417C", "#3D2C5B"),
  carpet_warm: carpet("#6E4234", "#7E5040", "#5E372B"),
  tile_dark: tiles("#2C3546", "#222937", "#3A4559"),
  tile_light: tiles("#6B7C92", "#58687E", "#8193AA"),
  corridor(p, tx, ty) {
    p.r(0, 0, 16, 16, "#394152");
    p.r(0, 0, 16, 1, "#444D60"); p.r(0, 0, 1, 16, "#444D60");
    p.r(0, 15, 16, 1, "#2F3645"); p.r(15, 0, 1, 16, "#2F3645");
    for (let i = 0; i < 3; i++) { const hv = hash(tx, ty, i + 20); p.p(1 + (hv % 14), 1 + ((hv >>> 5) % 14), "#323A4A"); }
  },
  door(p) {
    p.r(0, 0, 16, 16, "#5C4634");
    p.r(5, 0, 1, 16, "#4A3828"); p.r(10, 0, 1, 16, "#4A3828");
    p.r(0, 0, 1, 16, "#9AA5B8"); p.r(15, 0, 1, 16, "#9AA5B8");
    p.r(3, 2, 10, 12, "#5A2A2A"); p.r(4, 3, 8, 10, "#7F3434");
    p.r(5, 4, 6, 8, "#8E4040");
  },
  wall(p, tx, ty) {
    p.r(0, 0, 16, 16, "#2A3142");
    p.r(0, 0, 16, 4, "#4F5A73");
    p.r(0, 0, 16, 1, "#6A7590");
    p.r(0, 4, 16, 1, "#1C2130");
    const off = (tx & 1) * 8;
    p.r(off, 5, 1, 8, "#323A4E"); p.r((off + 8) % 16 + 4, 5, 1, 8, "#262C3C");
    p.r(0, 13, 16, 3, "#202636");
    p.r(0, 13, 16, 1, "#39425A");
    if (hash(tx, ty) % 7 === 0) p.p(3 + (hash(tx, ty, 1) % 10), 8, "#353E54");
  },
};

export function renderTile(kind, tx = 0, ty = 0, doc = document) {
  const c = canvas(doc, 16, 16);
  const p = pen(c.getContext("2d"), 16);
  (TILES[kind] || TILES.corridor)(p, tx | 0, ty | 0);
  return c;
}

// ---------- furniture ----------

const WALL_TYPES = new Set(["taskboard", "status_display", "window", "whiteboard", "quality_board", "arch_board", "pixel_poster", "lounge_sign"]);

const WOODS = {
  oak: ["#B88654", "#946638", "#D3A673"],
  walnut: ["#7A4E33", "#5A3623", "#94664A"],
  metal: ["#7E8AA0", "#56617A", "#A3AEC2"],
  white: ["#D9DEE7", "#A9B2C2", "#F1F4F8"],
  dark: ["#3C4458", "#2A3142", "#525C74"],
};

function mug(p, x, y, c) {
  p.box(x, y, 3, 4, c);
  p.p(x + 1, y + 1, "#6B4226");
  p.p(x + 3, y + 1, OL); p.p(x + 3, y + 2, OL);
}

function keyboard(p, x, y, w, rgb) {
  p.box(x, y, w, 3, "#3A4255");
  for (let i = 0; i < w - 2; i += 2) p.p(x + 1 + i, y + 1, rgb ? CODE[(i >> 1) % CODE.length] : "#A3AEC2");
}

function screen(p, x, y, w, h, mode, f, seed, color) {
  switch (mode) {
    case "graph":
      for (let xx = 0; xx < w; xx++) {
        const v = Math.round(((Math.sin((xx + f * 2 + seed) * 0.8) + 1) / 2) * (h - 2));
        p.r(x + xx, y + h - v, 1, v, "#14532D");
        p.p(x + xx, y + h - 1 - v, "#4ADE80");
      }
      break;
    case "tests":
      for (let i = 0; i * 2 < h - 1; i++) {
        const len = Math.min(w - 1, 2 + ((f + i * 2) % 4) * Math.ceil(w / 4));
        p.r(x, y + 1 + i * 2, len, 1, hash(seed, i, f >> 1) % 6 === 0 ? RED : GREEN);
      }
      break;
    case "kanban":
      for (let c = 0; c < 3; c++) {
        p.r(x + c * 3, y, 2, 1, [RED, YELLOW, GREEN][c]);
        for (let k = 0; k < 2; k++) if (hash(c, k, seed) % 3) p.r(x + c * 3, y + 2 + k * 2, 2, 1, "#E2E8F0");
      }
      p.r(x + (f % 3) * 3, y + h - 1, 2, 1, ACCENT);
      break;
    case "doc":
      for (let i = 0; i < h; i += 2) p.r(x, y + i, 2 + (hash(seed, i) % (w - 2)), 1, i === (f * 2) % h ? ACCENT : "#E2E8F0");
      break;
    case "diff":
      for (let i = 0; i < h; i++) {
        const k = i + f, add = hash(seed, k) % 2;
        p.p(x, y + i, add ? GREEN : RED);
        p.r(x + 2, y + i, 1 + (hash(seed, k, 4) % (w - 3)), 1, add ? "#86EFAC" : "#FCA5A5");
      }
      break;
    case "radar": {
      const cx = x + (w >> 1), cy = y + (h >> 1);
      p.frame(cx - 3, cy - 3, 7, 7, "#166534");
      p.p(cx, cy, "#4ADE80");
      const [dx, dy] = [[0, -2], [2, 0], [0, 2], [-2, 0]][f];
      p.p(cx + dx, cy + dy, "#86EFAC");
      p.p(cx + (hash(seed) % 5) - 2, cy - 1, YELLOW);
      break;
    }
    case "build":
      for (let i = 0; i < h - 2; i++) p.r(x, y + i, 1 + (hash(seed, i + f) % (w - 1)), 1, i % 2 ? "#94A3B8" : "#FDE68A");
      p.r(x, y + h - 1, w, 1, "#1E293B");
      p.r(x, y + h - 1, Math.ceil(((f + 1) * w) / 4), 1, f === 3 ? GREEN : YELLOW);
      break;
    case "term": {
      const c = color || GREEN;
      for (let i = 0; i < h - 1; i++) {
        const k = i + f;
        p.p(x, y + i, adjust(c, 40));
        p.r(x + 2, y + i, 1 + (hash(seed, k) % (w - 3)), 1, hash(seed, k, 2) % 3 ? c : "#E2E8F0");
      }
      if (f % 2 === 0) p.r(x + 2, y + h - 1, 2, 1, c);
      break;
    }
    default:
      for (let i = 0; i < h; i++) {
        const k = i + f;
        if (hash(seed, k) % 5 === 0) continue;
        const ind = hash(seed, k, 1) % 3;
        p.r(x + ind, y + i, 1 + (hash(seed, k, 2) % Math.max(1, w - ind - 1)), 1, CODE[hash(seed, k, 3) % CODE.length]);
      }
      if (f % 2 === 0) p.p(x + w - 2, y + h - 1, "#F8FAFC");
  }
}

function monitor(p, x, y, w, h, o, mode, seed, color) {
  if (o.active) p.r(x - 1, y - 1, w + 2, h + 2, "rgba(56,189,248,0.25)");
  p.box(x, y, w, h, BEZ);
  p.r(x + 1, y + 1, w - 2, h - 2, o.active ? SCR_ON : SCR_OFF);
  if (o.active) screen(p, x + 1, y + 1, w - 2, h - 2, mode, o.frame, seed, color);
  else {
    p.r(x + 1, y + 1, w - 2, 1, "#1E2838");
    if (o.frame % 2 === 0) p.p(x + w - 2, y + h - 1, LED_STBY);
  }
  p.r(x + (w >> 1) - 1, y + h, 2, 2, MET_D);
  p.r(x + (w >> 1) - 2, y + h + 1, 4, 1, MET_M);
}

function standbyLed(p, x, y, o) {
  if (!o.active && o.frame % 2 === 0) p.p(x, y, LED_STBY);
}

function deskBase(p, o, wood, top = 12) {
  const [t, fr, hl] = WOODS[wood] || WOODS.oak;
  const front = o.H - 6;
  p.box(0, top, o.W, o.H - top, t);
  p.r(1, top + 1, o.W - 2, 1, hl);
  p.r(1, front - 1, o.W - 2, 1, adjust(fr, -25));
  p.r(1, front, o.W - 2, o.H - 1 - front, fr);
  for (let i = 0; i < o.w; i++) p.r(i * 16 + 7, front + 2, 2, 1, adjust(fr, -35));
  return front;
}

const PROPS = {
  pinboard(p, x) {
    p.r(x + 3, 10, 1, 7, "#6E4528"); p.r(x + 12, 10, 1, 7, "#6E4528");
    p.box(x + 2, 3, 12, 8, "#C89B6A");
    p.r(x + 4, 5, 2, 2, "#FDE047"); p.r(x + 7, 5, 2, 2, "#F9A8D4"); p.r(x + 10, 6, 2, 2, "#93C5FD"); p.r(x + 5, 8, 3, 1, PAPER);
  },
  mug_tablet(p, x, o) {
    p.box(x + 2, 16, 7, 5, "#2A2F3D");
    p.r(x + 3, 17, 5, 3, o.active ? "#7DD3FC" : "#334155");
    mug(p, x + 11, 15, "#E11D48");
  },
  papers(p, x) {
    p.box(x + 5, 13, 8, 6, PAPER_S);
    p.box(x + 3, 15, 8, 6, PAPER);
    p.r(x + 4, 17, 5, 1, PAPER_S); p.r(x + 4, 19, 4, 1, PAPER_S);
  },
  papers_red(p, x) {
    PROPS.papers(p, x);
    p.p(x + 9, 17, "#DC2626"); p.r(x + 5, 19, 2, 1, "#DC2626");
  },
  folders(p, x) {
    ["#3B82F6", "#F59E0B", "#10B981", "#EF4444"].forEach((c, k) => p.box(x + 2 + k * 3, 6 + (k % 2), 3, 10, c));
    p.box(x + 1, 13, 14, 5, "#475569");
  },
  lamp_small(p, x) {
    p.r(x + 3, 14, 9, 4, "rgba(253,224,71,0.22)");
    p.box(x + 4, 17, 6, 3, MET_D);
    p.r(x + 6, 9, 1, 8, MET_M);
    p.box(x + 5, 6, 6, 4, "#FACC15");
  },
  coffee_books(p, x) {
    p.box(x + 2, 15, 9, 3, "#2563EB");
    p.box(x + 3, 12, 8, 4, "#DC2626");
    p.r(x + 4, 13, 6, 1, "#FCA5A5");
    mug(p, x + 11, 15, "#F1F5F9");
  },
  toolbox(p, x) {
    p.r(x + 5, 12, 5, 1, OL); p.r(x + 5, 13, 1, 1, OL); p.r(x + 9, 13, 1, 1, OL);
    p.box(x + 2, 14, 11, 7, "#DC2626");
    p.r(x + 3, 15, 9, 1, "#F87171");
    p.r(x + 7, 16, 1, 2, YELLOW);
  },
  printer(p, x, o) {
    p.box(x + 2, 9, 12, 10, "#CBD5E1");
    p.r(x + 4, 11, 8, 1, OL);
    p.r(x + 5, 15, 6, 4, PAPER);
    p.p(x + 12, 17, o.active && o.frame % 2 ? GREEN : "#475569");
  },
  serverbox(p, x, o) {
    p.box(x + 3, 3, 10, 17, "#334155");
    for (let k = 0; k < 4; k++) {
      p.r(x + 4, 5 + k * 3, 6, 1, "#1E293B");
      p.p(x + 11, 5 + k * 3, hash(k, o.frame) % 3 ? GREEN : "#14532D");
    }
  },
  bugjar(p, x, o) {
    p.box(x + 4, 9, 8, 9, "#BFE9FF");
    p.box(x + 4, 7, 8, 3, "#94A3B8");
    const bx = x + 6 + (o.frame % 2);
    p.r(bx, 13, 2, 2, "#16A34A");
    p.p(bx - 1, 13, OL); p.p(bx + 2, 14, OL); p.p(bx, 12, OL);
  },
  clipboard(p, x) {
    p.box(x + 4, 12, 8, 10, "#9B6A3C");
    p.r(x + 5, 14, 6, 7, PAPER);
    p.r(x + 6, 11, 4, 2, "#CBD5E1");
    p.p(x + 6, 15, GREEN); p.p(x + 6, 17, GREEN); p.p(x + 6, 19, RED);
    p.r(x + 8, 15, 2, 1, PAPER_S); p.r(x + 8, 17, 2, 1, PAPER_S); p.r(x + 8, 19, 2, 1, PAPER_S);
  },
  mug_pen(p, x) {
    mug(p, x + 3, 15, "#F1F5F9");
    p.r(x + 8, 19, 6, 1, "#DC2626"); p.p(x + 13, 19, "#F5F5F5");
  },
  map(p, x) {
    p.box(x + 1, 13, 15, 10, "#E9D8A6");
    p.r(x + 3, 15, 4, 3, "#86EFAC"); p.r(x + 9, 17, 4, 4, "#86EFAC");
    p.p(x + 5, 20, "#DC2626"); p.p(x + 7, 19, "#DC2626"); p.p(x + 9, 16, "#DC2626");
    p.p(x + 11, 15, "#B91C1C"); p.p(x + 12, 14, "#B91C1C"); p.p(x + 12, 16, "#B91C1C"); p.p(x + 13, 15, "#B91C1C");
  },
  globe(p, x, o) {
    p.r(x + 7, 16, 2, 4, MET_D);
    p.box(x + 4, 19, 8, 3, "#8A5A34");
    p.box(x + 3, 6, 10, 10, "#3B82F6");
    const s = o.frame % 3;
    p.r(x + 4 + s, 8, 3, 3, "#4ADE80"); p.r(x + 7 + (s % 2), 11, 3, 2, "#4ADE80");
    p.p(x + 5, 7, "#BFDBFE");
  },
  palette(p, x) {
    p.box(x + 2, 15, 9, 7, "#D6B98C");
    ["#EF4444", "#FACC15", "#3B82F6", "#22C55E"].forEach((c, k) => p.p(x + 4 + (k % 2) * 3, 17 + (k >> 1) * 2, c));
    p.box(x + 11, 10, 4, 6, "#64748B");
    p.r(x + 12, 7, 1, 3, "#F472B6"); p.r(x + 13, 6, 1, 4, "#FDE047");
  },
  tablet(p, x, o) {
    p.box(x + 3, 15, 9, 6, "#1F2937");
    p.r(x + 4, 16, 7, 4, o.active ? "#F0ABFC" : "#334155");
    if (o.active) p.r(x + 5, 17 + (o.frame % 2), 3, 1, "#FFFFFF");
    p.r(x + 13, 14, 1, 6, "#F5F5F5");
  },
  drafting(p, x, o) {
    p.r(x + 3, 15, 1, 6, "#6E4528"); p.r(x + 12, 15, 1, 6, "#6E4528");
    if (o.active) p.r(x, 3, 16, 13, "rgba(244,114,182,0.2)");
    p.box(x + 1, 4, 14, 11, o.active ? "#FBF8EF" : "#CFCBC0");
    p.r(x + 1, 15, 14, 2, "#8A5A34");
    if (!o.active) { p.r(x + 3, 7, 6, 1, "#B8B4A8"); p.r(x + 4, 10, 7, 1, "#B8B4A8"); standbyLed(p, x + 13, 13, o); return; }
    const f = o.frame;
    p.r(x + 3, 6, 3, 3, "#F472B6");
    if (f >= 1) p.r(x + 7, 7, 5, 1, ACCENT);
    if (f >= 2) p.frame(x + 8, 9, 4, 3, "#F59E0B");
    if (f >= 3) p.r(x + 3, 11, 4, 1, "#22C55E");
    const tip = [[6, 8], [12, 7], [12, 11], [7, 11]][f];
    p.p(x + tip[0], tip[1], OL);
  },
};

const DESK_DEFS = {
  command_desk: { wood: "walnut", accent: ACCENT, slot: (i, w) => (i === 1 || i === w - 2 ? "mon:graph" : "mon:code") },
  desk_board: { wood: "oak", slot: (i) => ["pinboard", "mon:kanban", "mug_tablet"][i] || "papers" },
  desk_docs: { wood: "oak", slot: (i) => ["papers", "mon:doc", "folders"][i] || "papers" },
  code_desk: { wood: "dark", rgb: true, mugs: true, slot: (i, w) => (i === 0 ? "lamp_small" : i === w - 1 ? "coffee_books" : "mon:code") },
  build_station: { wood: "metal", slot: (i) => ["toolbox", "mon:build", "printer"][i] || "toolbox" },
  qa_console: { wood: "metal", accent: GREEN, slot: (i, w) => (i === 0 ? "serverbox" : i === w - 1 ? "printer" : "mon:tests") },
  test_desk: { wood: "white", slot: (i) => ["bugjar", "mon:tests", "clipboard"][i] || "papers" },
  review_desk: { wood: "white", slot: (i) => ["papers_red", "mon:diff", "mug_pen"][i] || "papers" },
  desk_map: { wood: "oak", slot: (i) => ["map", "mon:radar", "globe"][i] || "map" },
  drawing_table: { wood: "white", slot: (i) => ["palette", "drafting", "tablet"][i] || "palette" },
  cli_desk: { wood: "dark", rgb: true, accent: THEME.agy, slot: () => "mon:term" },
};
const TERM = [THEME.claude, THEME.codex, THEME.agy];

// Monitors sit low (rows 5-13 of the overhang) so a seated character's face stays visible above them.
function drawDesk(p, o, def) {
  const front = deskBase(p, o, def.wood);
  if (def.accent) p.r(1, front + 2, o.W - 2, 1, o.active ? def.accent : adjust(def.accent, -110));
  for (let i = 0; i < o.w; i++) {
    const kind = def.slot(i, o.w), x = i * 16;
    if (kind.startsWith("mon:")) {
      const mode = kind.slice(4);
      monitor(p, x + 3, 5, 10, 9, o, mode, i * 7 + 3, mode === "term" ? TERM[i % 3] : null);
      keyboard(p, x + 3, 18, 10, def.rgb);
      if (def.mugs && hash(i, 5) % 3 === 0) mug(p, x + 13, 16, "#F1F5F9");
    } else (PROPS[kind] || PROPS.papers)(p, x, o);
  }
}

function drawPlanningTable(p, o) {
  const top = 12;
  p.box(0, top, o.W, o.H - top, "#C99A63");
  p.r(1, top + 1, o.W - 2, 1, "#E0B783");
  p.r(1, o.H - 7, o.W - 2, 1, "#7A5230");
  p.r(1, o.H - 6, o.W - 2, 5, "#A27645");
  const cols = ["#FDE047", "#F9A8D4", "#93C5FD", "#86EFAC", "#FDBA74"];
  const n = o.w * o.h * 2, spanX = Math.max(1, o.W - 10), spanY = Math.max(1, o.H - top - 14);
  for (let k = 0; k < n; k++) {
    const hv = hash(k, o.w, 77);
    const nx = 3 + (hv % spanX), ny = top + 3 + ((hv >>> 8) % spanY);
    const col = o.active ? cols[k % 5] : adjust(cols[k % 5], -50);
    if (o.active && k === o.frame % n) p.r(nx - 1, ny - 1, 6, 6, "#FFFFFF");
    p.r(nx + 1, ny + 1, 4, 4, "rgba(0,0,0,0.25)");
    p.r(nx, ny, 4, 4, col);
    p.p(nx + 3, ny + 3, adjust(col, -40));
  }
  const cx = o.W >> 1;
  p.box(cx - 7, top + 6, 14, 8, "#A3ACBD");
  p.r(cx - 6, top + 7, 12, 4, o.active ? SCR_ON : SCR_OFF);
  if (o.active) screen(p, cx - 6, top + 7, 12, 4, "doc", o.frame, 9);
  else standbyLed(p, cx + 5, top + 12, o);
  mug(p, o.W - 12, top + 5, "#F1F5F9");
}

function diagram(p, o, x0, y0, w, h, cols, link, faint) {
  const els = [];
  for (let k = 0, x = x0 + 2; x + 9 < x0 + w - 1; k++, x += 13) els.push({ x, y: y0 + 1 + (k % 2) * 5, k });
  const show = o.active ? Math.min(els.length, 1 + o.frame + Math.ceil(els.length / 2)) : els.length;
  els.slice(0, show).forEach((e, i) => {
    p.frame(e.x, e.y, 9, 5, faint || cols[e.k % cols.length]);
    if (!faint) p.r(e.x + 2, e.y + 2, 5, 1, adjust(cols[e.k % cols.length], 60));
    const nx = els[i + 1];
    if (nx && i + 1 < show) {
      const my = e.y + 2;
      p.r(e.x + 9, my, 2, 1, faint || link);
      p.r(e.x + 10, Math.min(my, nx.y + 2), 1, Math.abs(nx.y - e.y) + 1, faint || link);
      p.r(e.x + 10, nx.y + 2, 3, 1, faint || link);
    }
  });
  if (o.active && show > 0) { const e = els[show - 1]; p.p(e.x + 8, e.y + 4, link); }
}

const DRAW = {
  taskboard(p, o) {
    p.box(0, 1, o.W, 14, "#8A5A34");
    p.r(1, 2, o.W - 2, 12, o.active ? "#F1F5F9" : "#8C96A6");
    const cw = Math.max(4, Math.floor((o.W - 2) / 3));
    for (let c = 0; c < 3; c++) {
      const x = 1 + c * cw;
      if (c) p.r(x, 2, 1, 12, "#94A3B8");
      p.r(x + 2, 3, cw - 4, 1, o.active ? [RED, YELLOW, GREEN][c] : "#64748B");
      for (let k = 0; k < 3; k++) if (hash(c, k, o.W) % 4) p.r(x + 2, 5 + k * 3, cw - 5, 2, o.active ? ["#FDE68A", "#BFDBFE", "#BBF7D0"][c] : "#A3ACBA");
    }
    if (o.active) { const c = o.frame % 3; p.r(1 + c * cw + 3, 5 + (o.frame >> 1) * 3, cw - 5, 2, ACCENT); }
    standbyLed(p, o.W - 3, 13, o);
  },
  status_display(p, o) {
    p.box(0, 1, o.W, 14, BEZ);
    p.r(1, 2, o.W - 2, 12, o.active ? "#0B1E2E" : "#151C28");
    if (!o.active) { standbyLed(p, o.W - 3, 13, o); return; }
    p.r(3, 3, 10, 1, ACCENT); p.p(o.W - 4, 3, o.frame % 2 ? GREEN : "#14532D");
    screen(p, 3, 5, o.W - 16, 8, "graph", o.frame, 2);
    for (let k = 0; k < 3; k++) {
      const v = 2 + ((hash(k, o.frame) % 6));
      p.r(o.W - 11 + k * 3, 13 - v, 2, v, [ACCENT, "#A78BFA", YELLOW][k]);
    }
  },
  quality_board(p, o) {
    p.box(0, 1, o.W, 14, BEZ);
    p.r(1, 2, o.W - 2, 12, o.active ? "#0B1E2E" : "#151C28");
    if (!o.active) { p.r(3, 4, o.W - 14, 1, "#1F2A3A"); standbyLed(p, o.W - 3, 13, o); return; }
    const bw = o.W - 18;
    for (let k = 0; k < 4; k++) {
      const y = 3 + k * 3, fail = hash(k, o.frame >> 1, 3) % 5 === 0;
      p.r(3, y, 3, 2, "#64748B");
      p.r(7, y, Math.max(1, Math.round((bw * (((o.frame + k) % 4) + 1)) / 4)), 2, fail ? RED : GREEN);
    }
    p.r(o.W - 9, 3, 6, 10, "#14532D");
    p.p(o.W - 8, 8, "#4ADE80"); p.p(o.W - 7, 9, "#4ADE80"); p.p(o.W - 6, 8, "#4ADE80"); p.p(o.W - 5, 7, "#4ADE80");
  },
  whiteboard(p, o) {
    p.box(0, 1, o.W, 13, o.active ? "#F8FAFC" : "#C9D1DC");
    p.r(2, 14, o.W - 4, 1, MET_M);
    ["#2563EB", "#DC2626", "#16A34A"].forEach((c, i) => p.r(o.W - 12 + i * 3, 13, 2, 1, c));
    diagram(p, o, 0, 3, o.W, 10, ["#2563EB", "#DC2626", "#16A34A"], "#334155", o.active ? null : "#B0BAC8");
  },
  arch_board(p, o) {
    p.box(0, 1, o.W, 14, o.active ? "#1E40AF" : "#1E3354");
    for (let y = 3; y < 14; y += 3) for (let x = 2; x < o.W - 1; x += 3) p.p(x, y, o.active ? "#2F54C8" : "#24406A");
    diagram(p, o, 0, 3, o.W, 11, ["#E0F2FE", "#FFFFFF", "#BAE6FD"], "#FDE68A", o.active ? null : "#3A5A8A");
  },
  window(p, o) {
    p.box(0, 1, o.W, 14, "#64748B");
    p.r(1, 2, o.W - 2, 12, "#0B1430");
    for (let i = 0; i < o.w * 3; i++) {
      const hv = hash(i, o.W, 5);
      p.p(2 + (hv % (o.W - 4)), 3 + ((hv >>> 6) % 4), (i + o.frame) % 5 ? "#CBD5E1" : "#64748B");
    }
    p.r(o.W - 7, 3, 2, 2, "#FEF3C7");
    for (let x = 1; x < o.W - 1;) {
      const hv = hash(x, o.W, 9), bw = 3 + (hv % 4), bh = 3 + ((hv >>> 4) % 6);
      p.r(x, 14 - bh, Math.min(bw, o.W - 1 - x), bh, "#1E293B");
      for (let yy = 15 - bh; yy < 13; yy += 2) for (let xx = x + 1; xx < Math.min(x + bw, o.W - 1); xx += 2) if (hash(xx, yy, o.W) % 3 === 0) p.p(xx, yy, "#FDE68A");
      x += bw + 1;
    }
    p.r(o.W >> 1, 2, 1, 12, "#64748B");
    p.r(1, 7, o.W - 2, 1, "#64748B");
    p.r(0, 14, o.W, 1, "#94A3B8");
  },
  pixel_poster(p, o) {
    p.box(1, 1, o.W - 2, 14, "#0F172A", "#F59E0B");
    const cx = o.W >> 1;
    for (let r = 0; r < 4; r++) p.r(cx - 1 - r, 3 + r, 2 + r * 2, 1, ACCENT);
    p.r(cx - 3, 7, 6, 5, "#E2E8F0");
    p.r(cx - 1, 9, 2, 3, "#B45309");
    p.p(cx + 1, 8, YELLOW);
    p.r(3, 12, o.W - 6, 1, "#334155");
  },
  lounge_sign(p, o) {
    p.box(0, 2, o.W, 12, "#1E1B2E");
    const text = "AI LOUNGE", tw = text.length * 4 - 1, x0 = Math.max(1, (o.W - tw) >> 1);
    p.r(x0 - 1, 4, Math.min(tw + 2, o.W - 2), 7, "rgba(56,189,248,0.12)");
    [...text].forEach((ch, i) => {
      const c = i < 2 ? ACCENT : TERM[(i - 3) % 3];
      const flick = o.frame === 3 && i === 5;
      glyph(p, ch, x0 + i * 4, 5, flick ? adjust(c, -90) : c);
    });
  },
  plant(p, o) {
    const sway = o.frame % 2;
    p.box(6 + sway, 2, 4, 7, "#22A04B");
    p.box(1, 10, 7, 5, "#16A34A"); p.box(9, 9, 6, 5, "#16A34A");
    p.box(4, 6, 8, 11, "#15803D");
    p.r(5, 8, 2, 4, "#4ADE80"); p.p(10, 11, "#4ADE80"); p.p(3, 12, "#4ADE80"); p.p(7 + sway, 4, "#4ADE80");
    p.box(4, 21, 8, 10, "#B45309");
    p.box(3, 19, 10, 3, "#D97706");
    p.r(5, 23, 1, 6, "#C2610C");
  },
  bookshelf(p, o) {
    p.box(0, 2, o.W, o.H - 2, "#6E4528");
    p.r(2, 4, o.W - 4, o.H - 6, "#3B2616");
    const books = ["#DC2626", "#2563EB", "#16A34A", "#F59E0B", "#7C3AED", "#0EA5E9", "#F1F5F9"];
    for (let sy = 4, s = 0; sy + 9 < o.H - 2; sy += 11, s++) {
      for (let x = 2; x < o.W - 3;) {
        const hv = hash(x, s, o.W), bw = 2 + (hv % 2), bh = 6 + ((hv >>> 3) % 4);
        if (hv % 9) { p.r(x, sy + 9 - bh, bw, bh, books[(hv >>> 6) % books.length]); p.p(x, sy + 10 - bh, adjust(books[(hv >>> 6) % books.length], 50)); }
        x += bw + (hv % 7 === 0 ? 1 : 0);
      }
      p.r(1, sy + 9, o.W - 2, 2, "#8A5A34");
    }
  },
  lamp(p) {
    p.r(4, 26, 8, 4, "rgba(253,230,138,0.14)");
    p.box(5, 27, 6, 3, MET_D);
    p.r(7, 9, 2, 18, MET_M);
    p.box(3, 2, 10, 8, "#FDE68A");
    p.r(4, 8, 8, 1, "#FEF9C3");
  },
  coffee_machine(p, o) {
    p.box(1, 20, 14, 11, "#5B6476");
    p.r(1, 20, 14, 2, "#94A3B8");
    p.p(4, 25, "#94A3B8"); p.p(11, 25, "#94A3B8");
    p.box(2, 4, 9, 17, "#334155");
    p.r(4, 6, 5, 3, SCR_ON); p.p(5, 7, ACCENT);
    p.r(5, 11, 2, 2, OL);
    p.r(3, 18, 7, 1, "#1E293B");
    mug(p, 11, 16, "#F8FAFC");
    const st = "rgba(226,232,240,0.85)";
    if (o.frame % 2) { p.p(12, 14, st); p.p(13, 12, st); p.p(12, 10, st); } else { p.p(13, 14, st); p.p(12, 12, st); p.p(13, 10, st); }
  },
  server_rack(p, o) {
    p.box(1, 2, 14, o.H - 2, "#1F2937");
    p.r(2, 3, 12, 2, "#4B5563");
    for (let k = 0, y = 6; y + 3 < o.H - 1; k++, y += 4) {
      p.r(2, y, 12, 3, "#374151");
      p.r(3, y + 1, 6, 1, "#111827");
      p.p(11, y + 1, hash(k, o.frame) % 3 ? GREEN : "#14532D");
      p.p(12, y + 1, hash(k, o.frame, 1) % 4 === 0 ? "#F59E0B" : "#3F3F46");
    }
  },
  shelves(p, o) {
    p.box(0, 6, o.W, o.H - 6, "#8A5A34");
    p.r(2, 7, o.W - 4, o.H - 9, "#4A3020");
    const cols = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#A855F7", "#E2E8F0"];
    [7, 15].forEach((sy, s) => {
      for (let x = 2; x < o.W - 4; x += 3) if (hash(x, s, 3) % 5) p.r(x, sy + 1, 2, 6, cols[hash(x, s) % cols.length]);
      p.r(1, sy + 7, o.W - 2, 1, "#A06A3E");
    });
    for (let x = 3; x + 7 < o.W - 2; x += 10) p.box(x, 24, 8, 6, "#C9A867");
  },
  couch(p, o) {
    const c = "#4C5BA8", sh = "#37448A";
    p.box(2, 8, o.W - 4, 13, sh);
    p.box(2, 17, o.W - 4, 12, c);
    for (let x = 16; x < o.W - 8; x += 16) p.r(x, 18, 1, 9, sh);
    p.box(0, 12, 6, 18, sh); p.box(o.W - 6, 12, 6, 18, sh);
    p.box(8, 12, 7, 6, THEME.claude); p.box(o.W - 15, 12, 7, 6, THEME.codex);
    if (o.W >= 48) p.box((o.W >> 1) - 3, 12, 7, 6, THEME.agy);
    p.r(3, 29, 2, 2, OL); p.r(o.W - 5, 29, 2, 2, OL);
  },
  robot(p, o) {
    p.box(3, 27, 4, 3, MET_D); p.box(9, 27, 4, 3, MET_D);
    p.box(3, 16, 10, 12, "#94A3B8");
    p.p(7, 20, o.frame % 2 ? ACCENT : "#1E3A5F");
    p.box(1, 18, 3, 7, "#7C8AA0"); p.box(12, 18, 3, 7, "#7C8AA0");
    p.box(2, 7, 12, 10, "#CBD5E1");
    p.r(4, 10, 8, 4, "#1E293B");
    p.r(5, 12, 2, 1, ACCENT); p.r(9, 12, 2, 1, ACCENT);
    p.r(7, 4, 2, 3, MET_D); p.box(6, 2, 4, 3, "#F87171");
    if (o.frame % 2) { const z = "#E2E8F0"; p.r(12, 0, 3, 1, z); p.p(13, 1, z); p.r(12, 2, 3, 1, z); }
  },
};

function drawCrate(p, o) {
  const top = o.H - o.h * 16;
  p.box(1, top + 1, o.W - 2, o.H - top - 2, "#A16207");
  p.r(2, top + 2, o.W - 4, 1, "#CA8A04");
  for (let y = top + 5; y < o.H - 3; y += 4) p.r(2, y, o.W - 4, 1, "#854D0E");
  p.r(2, top + 2, 2, o.H - top - 4, "#854D0E"); p.r(o.W - 4, top + 2, 2, o.H - top - 4, "#854D0E");
}

const FONT = {
  A: "010101111101101", I: "111010010010111", L: "100100100100111", O: "111101101101111",
  U: "101101101101111", N: "110101101101101", G: "011100101101011", E: "111100110100111",
};

function glyph(p, ch, x, y, c) {
  const bits = FONT[ch];
  if (!bits) return;
  for (let i = 0; i < 15; i++) if (bits[i] === "1") p.p(x + (i % 3), y + ((i / 3) | 0), c);
}

export const FURNITURE_TYPES = ["taskboard", "status_display", "window", "command_desk", "desk_board", "plant", "bookshelf", "lamp", "whiteboard", "planning_table", "desk_docs", "code_desk", "build_station", "coffee_machine", "pixel_poster", "qa_console", "test_desk", "review_desk", "server_rack", "quality_board", "arch_board", "desk_map", "drawing_table", "shelves", "cli_desk", "couch", "robot", "lounge_sign"];

export function renderFurniture(type, w, h, opts = {}, doc = document) {
  w = Math.max(1, w | 0);
  h = Math.max(1, h | 0);
  const wall = WALL_TYPES.has(type);
  const W = w * 16, H = (wall ? h : h + 1) * 16;
  const c = canvas(doc, W, H);
  const p = pen(c.getContext("2d"), W);
  const o = { active: !!(opts && opts.active), frame: ((opts && opts.frame) | 0) & 3, w, h, W, H };
  if (DRAW[type]) DRAW[type](p, o);
  else if (DESK_DEFS[type]) drawDesk(p, o, DESK_DEFS[type]);
  else if (type === "planning_table") drawPlanningTable(p, o);
  else drawCrate(p, o);
  return c;
}
