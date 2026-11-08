// Office map, furniture, workstations and A* — pure data/logic so node:test can verify every route.

export const TILE = 16;
export const COLS = 40;
export const ROWS = 24;

// Floor kinds per tile; walls are "wall". Corridor = cols 19-20, walls at cols 18/21 and rows 8/16 with doors.
export const ZONES = {
  management: { name: "MANAGEMENT", x: 1, y: 1, w: 17, h: 7, floor: "wood" },
  planning: { name: "PLANNING", x: 22, y: 1, w: 17, h: 7, floor: "carpet_blue" },
  development: { name: "DEVELOPMENT", x: 1, y: 9, w: 17, h: 7, floor: "tile_dark" },
  qa: { name: "QUALITY ASSURANCE", x: 22, y: 9, w: 17, h: 7, floor: "tile_light" },
  design: { name: "DESIGN & RESEARCH", x: 1, y: 17, w: 17, h: 6, floor: "carpet_purple" },
  lounge: { name: "AI PROVIDER LOUNGE", x: 22, y: 17, w: 17, h: 6, floor: "carpet_warm" },
  corridor: { name: "MAIN WALKWAY", x: 19, y: 1, w: 2, h: 22, floor: "corridor" },
};

const DOORS = [[18, 4], [21, 4], [18, 12], [21, 12], [18, 19], [18, 20], [21, 19], [21, 20]];

// layer: "wall" = painted on a wall tile (never blocks floor); "object" = y-sorted with characters.
// station: screen/board lights up while that station has a live session.
export const FURNITURE = [
  // Management
  { type: "taskboard", x: 2, y: 0, w: 4, h: 1, layer: "wall", station: "orchestrator" },
  { type: "status_display", x: 7, y: 0, w: 4, h: 1, layer: "wall", station: "orchestrator" },
  { type: "window", x: 13, y: 0, w: 3, h: 1, layer: "wall" },
  { type: "command_desk", x: 7, y: 4, w: 4, h: 1, layer: "object", block: true, station: "orchestrator" },
  { type: "desk_board", x: 13, y: 5, w: 3, h: 1, layer: "object", block: true, station: "pm" },
  { type: "plant", x: 1, y: 1, w: 1, h: 1, layer: "object", block: true },
  { type: "plant", x: 17, y: 1, w: 1, h: 1, layer: "object", block: true },
  { type: "bookshelf", x: 1, y: 6, w: 2, h: 2, layer: "object", block: true },
  { type: "lamp", x: 16, y: 7, w: 1, h: 1, layer: "object", block: true },
  // Planning
  { type: "whiteboard", x: 25, y: 0, w: 6, h: 1, layer: "wall", station: "planner" },
  { type: "window", x: 33, y: 0, w: 3, h: 1, layer: "wall" },
  { type: "planning_table", x: 26, y: 4, w: 5, h: 2, layer: "object", block: true, station: "planner" },
  { type: "desk_docs", x: 34, y: 4, w: 3, h: 1, layer: "object", block: true, station: "spec" },
  { type: "bookshelf", x: 37, y: 6, w: 2, h: 2, layer: "object", block: true },
  { type: "plant", x: 22, y: 1, w: 1, h: 1, layer: "object", block: true },
  // Development
  { type: "code_desk", x: 2, y: 11, w: 10, h: 1, layer: "object", block: true, station: "worker" },
  { type: "build_station", x: 13, y: 14, w: 3, h: 1, layer: "object", block: true, station: "build" },
  { type: "coffee_machine", x: 16, y: 9, w: 1, h: 1, layer: "object", block: true },
  { type: "plant", x: 1, y: 9, w: 1, h: 1, layer: "object", block: true },
  { type: "window", x: 4, y: 8, w: 3, h: 1, layer: "wall" },
  { type: "pixel_poster", x: 9, y: 8, w: 2, h: 1, layer: "wall" },
  // QA
  { type: "qa_console", x: 24, y: 11, w: 8, h: 1, layer: "object", block: true, station: "verifier" },
  { type: "test_desk", x: 34, y: 11, w: 3, h: 1, layer: "object", block: true, station: "check" },
  { type: "review_desk", x: 34, y: 14, w: 3, h: 1, layer: "object", block: true, station: "review" },
  { type: "server_rack", x: 38, y: 9, w: 1, h: 2, layer: "object", block: true },
  { type: "quality_board", x: 25, y: 8, w: 4, h: 1, layer: "wall", station: "verifier" },
  { type: "plant", x: 22, y: 15, w: 1, h: 1, layer: "object", block: true },
  // Design & Research
  { type: "arch_board", x: 2, y: 16, w: 5, h: 1, layer: "wall", station: "arch" },
  { type: "desk_map", x: 9, y: 20, w: 3, h: 1, layer: "object", block: true, station: "survey" },
  { type: "drawing_table", x: 14, y: 19, w: 3, h: 1, layer: "object", block: true, station: "ui" },
  { type: "shelves", x: 12, y: 22, w: 3, h: 1, layer: "object", block: true },
  { type: "plant", x: 1, y: 22, w: 1, h: 1, layer: "object", block: true },
  // Lounge
  { type: "cli_desk", x: 23, y: 19, w: 5, h: 1, layer: "object", block: true, station: "cli" },
  { type: "couch", x: 30, y: 22, w: 4, h: 1, layer: "object", block: true },
  { type: "coffee_machine", x: 38, y: 17, w: 1, h: 1, layer: "object", block: true },
  { type: "robot", x: 37, y: 22, w: 1, h: 1, layer: "object", block: true },
  { type: "plant", x: 22, y: 22, w: 1, h: 1, layer: "object", block: true },
  { type: "window", x: 29, y: 16, w: 4, h: 1, layer: "wall" },
  { type: "lounge_sign", x: 34, y: 16, w: 3, h: 1, layer: "wall" },
];

// roleSeat: where the role character works; providerSeats: adjacent seats for provider instances (in fill order).
// dir = facing while working. Seats sit directly above a desk so the desk overlaps the legs (y-sort).
export const STATIONS = {
  orchestrator: { label: "COMMAND CENTER", zone: "management", roleSeat: { x: 8, y: 3, dir: "down" }, providerSeats: [{ x: 9, y: 3, dir: "down" }, { x: 10, y: 3, dir: "down" }, { x: 7, y: 3, dir: "down" }] },
  pm: { label: "PROJECT BOARD", zone: "management", roleSeat: { x: 14, y: 4, dir: "down" }, providerSeats: [] },
  planner: { label: "WHITEBOARD", zone: "planning", roleSeat: { x: 27, y: 1, dir: "up" }, providerSeats: [{ x: 28, y: 1, dir: "up" }, { x: 29, y: 1, dir: "up" }, { x: 26, y: 1, dir: "up" }, { x: 30, y: 1, dir: "up" }] },
  spec: { label: "REQUIREMENT DESK", zone: "planning", roleSeat: { x: 35, y: 3, dir: "down" }, providerSeats: [] },
  worker: { label: "CODING DESK", zone: "development", roleSeat: { x: 5, y: 10, dir: "down" }, providerSeats: [{ x: 6, y: 10, dir: "down" }, { x: 7, y: 10, dir: "down" }, { x: 4, y: 10, dir: "down" }, { x: 8, y: 10, dir: "down" }, { x: 3, y: 10, dir: "down" }, { x: 9, y: 10, dir: "down" }] },
  build: { label: "BUILD STATION", zone: "development", roleSeat: { x: 14, y: 13, dir: "down" }, providerSeats: [] },
  verifier: { label: "QA CONSOLE", zone: "qa", roleSeat: { x: 27, y: 10, dir: "down" }, providerSeats: [{ x: 28, y: 10, dir: "down" }, { x: 29, y: 10, dir: "down" }, { x: 26, y: 10, dir: "down" }, { x: 30, y: 10, dir: "down" }, { x: 25, y: 10, dir: "down" }] },
  check: { label: "TEST DESK", zone: "qa", roleSeat: { x: 35, y: 10, dir: "down" }, providerSeats: [] },
  review: { label: "REVIEW DESK", zone: "qa", roleSeat: { x: 35, y: 13, dir: "down" }, providerSeats: [] },
  arch: { label: "ARCHITECTURE BOARD", zone: "design", roleSeat: { x: 4, y: 17, dir: "up" }, providerSeats: [] },
  survey: { label: "RESEARCH DESK", zone: "design", roleSeat: { x: 10, y: 19, dir: "down" }, providerSeats: [] },
  ui: { label: "DESIGN STUDIO", zone: "design", roleSeat: { x: 15, y: 18, dir: "down" }, providerSeats: [] },
  // ROLE UNKNOWN sessions: provider works here, no role character joins.
  cli: { label: "GENERAL CLI DESK", zone: "lounge", roleSeat: null, providerSeats: [{ x: 24, y: 18, dir: "down" }, { x: 26, y: 18, dir: "down" }, { x: 23, y: 18, dir: "down" }, { x: 25, y: 18, dir: "down" }, { x: 27, y: 18, dir: "down" }] },
};

// Role character homes = their own station seat; idle wandering stays inside the home zone.
export const ROLE_HOME = Object.fromEntries(
  ["orchestrator", "pm", "planner", "spec", "worker", "build", "verifier", "check", "review", "arch", "survey", "ui"]
    .map((r) => [r, STATIONS[r].zone]),
);

export const PROVIDER_HOME = {
  claude: { x: 31, y: 19 },
  codex: { x: 33, y: 19 },
  agy: { x: 35, y: 19 },
};

// Spot by the lounge door where an aggregated "×N ACTIVE" badge stands when seats overflow.
export const OVERFLOW_SPOT = { x: 29, y: 20 };

export const IDLE_POINTS = {
  management: [[4, 3], [5, 6], [11, 6], [12, 2], [15, 7], [3, 2], [10, 1]],
  planning: [[24, 6], [32, 6], [33, 2], [29, 7], [23, 3], [37, 3], [31, 3]],
  development: [[3, 14], [8, 14], [12, 9], [15, 11], [10, 13], [16, 10], [5, 13]],
  qa: [[23, 14], [28, 14], [32, 13], [31, 9], [24, 9], [37, 13], [29, 13]],
  design: [[2, 20], [6, 20], [12, 18], [16, 21], [7, 18], [3, 18], [9, 22]],
  lounge: [[29, 18], [34, 21], [36, 20], [30, 20], [32, 21], [37, 19], [35, 18], [28, 21]],
};

// What a decorative idle stop is "about" — engine picks an animation; these never imply real work.
export const IDLE_ACTIONS = ["stand", "drink", "read", "look", "think"];

function buildGrid() {
  const floor = Array.from({ length: ROWS }, () => Array(COLS).fill("wall"));
  for (const z of Object.values(ZONES)) {
    for (let y = z.y; y < z.y + z.h; y++) for (let x = z.x; x < z.x + z.w; x++) floor[y][x] = z.floor;
  }
  for (const [x, y] of DOORS) floor[y][x] = "door";
  const blocked = floor.map((row) => row.map((k) => k === "wall"));
  for (const f of FURNITURE) {
    if (!f.block) continue;
    for (let y = f.y; y < f.y + f.h; y++) for (let x = f.x; x < f.x + f.w; x++) blocked[y][x] = true;
  }
  return { floor, blocked };
}

const GRID = buildGrid();
export const FLOOR = GRID.floor;
export const BLOCKED = GRID.blocked;

export function isWalkable(x, y) {
  return x >= 0 && y >= 0 && x < COLS && y < ROWS && !BLOCKED[y][x];
}

export function zoneAt(x, y) {
  for (const [id, z] of Object.entries(ZONES)) {
    if (x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h) return id;
  }
  return null;
}

// 4-neighbour A*. `avoid` (Set of "x,y") lets callers route around parked characters; the goal itself is always allowed.
export function findPath(from, to, avoid = null) {
  if (!isWalkable(to.x, to.y)) return null;
  const key = (x, y) => y * COLS + x;
  const start = key(from.x, from.y);
  const goal = key(to.x, to.y);
  if (start === goal) return [];
  const h = (x, y) => Math.abs(x - to.x) + Math.abs(y - to.y);
  const g = new Map([[start, 0]]);
  const came = new Map();
  const open = [{ k: start, x: from.x, y: from.y, f: h(from.x, from.y) }];
  const closed = new Set();
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
    const cur = open.splice(bi, 1)[0];
    if (cur.k === goal) {
      const path = [];
      let k = goal;
      while (k !== start) { path.push({ x: k % COLS, y: Math.floor(k / COLS) }); k = came.get(k); }
      return path.reverse();
    }
    if (closed.has(cur.k)) continue;
    closed.add(cur.k);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const nk = key(nx, ny);
      if (!isWalkable(nx, ny) || closed.has(nk)) continue;
      const soft = avoid && nk !== goal && avoid.has(`${nx},${ny}`) ? 6 : 0;
      const ng = g.get(cur.k) + 1 + soft;
      if (ng < (g.get(nk) ?? Infinity)) {
        g.set(nk, ng);
        came.set(nk, cur.k);
        open.push({ k: nk, x: nx, y: ny, f: ng + h(nx, ny) });
      }
    }
  }
  return null;
}

export function allSeats() {
  const out = [];
  for (const [id, s] of Object.entries(STATIONS)) {
    if (s.roleSeat) out.push({ station: id, kind: "role", ...s.roleSeat });
    s.providerSeats.forEach((p, i) => out.push({ station: id, kind: "provider", index: i, ...p }));
  }
  return out;
}
