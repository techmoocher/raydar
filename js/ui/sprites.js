// Pixel sprites as character grids, rendered to SVG. Placeholders for now.

const COLORS = {
  k: "var(--ink)",
  b: "var(--blue)",
  B: "var(--blue-hi)",
  o: "var(--orange)",
  O: "var(--orange-hi)",
  p: "var(--paper)",
  g: "var(--gem)",
  n: "var(--night)",
  y: "var(--gold)",
  r: "var(--cherry)",
  e: "var(--leaf)",
  E: "var(--leaf-dk)",
  u: "var(--plum)",
  s: "var(--stone)",
  R: "var(--brick)",
  D: "var(--fur-dk)",
  F: "var(--fur)",
  L: "var(--fur-hi)",
  w: "var(--horn)",
};

// Front views are left halves, mirrored.
const RAY_HALF = [
  "............",
  "......kkkkkk",
  ".k..kLLFLLLL",
  ".kwkLLFLLFLL",
  ".kwwkLLLFLLL",
  "..kwwkLLLLLF",
  "..kwwwkFFFFF",
  "...kkkDFFFFF",
  "...kDLkkLFFF", // rows 8-9: eyes, swapped per mood
  "...kDLkpLFFF",
  "...kDFFFFkkk",
  "...kDFFFkkkk",
  "..kDDFFFkkkk",
  "..kDDFFFFkkk",
  "..kDDDFFFFkr",
  "..kkDDDDDDDD",
  ".kFFkDDDDDDD",
  "kFFFkowwDDDD",
  "kFFFkowwwbDD",
  "kFFFkowwwwbb",
  "kFFFkowwwwww",
  "kFFFkowwwwbb",
  "kFFFkowwwwbw",
  "kFFFkowwwwbw",
];

const RAY_LEGS = [
  "kFFFkowwwwbw",
  ".kLLkowwwwbb",
  ".kLLkooooooo",
  "..kkkwwwwwww",
  "....kowwwwww",
  "....kowwwwwk",
  "....kooooook",
  ".....kFFFFk.",
  ".....kFFFFk.",
  ".....kFFFFk.",
  ".....kDDDDk.",
  "....kkkkkkk.",
  "....kkkkkkk.",
];

const RAY_EYES = {
  happy: ["...kDLkkLFFF", "...kDLkpLFFF"],
  spooky: ["...kDkppkFFF", "...kDkpkkFFF"],
  proud: ["...kDLLLLFFF", "...kDkkkkFFF"],
  wistful: ["...kDkkLFFFF", "...kDLkpLFFF"],
};

const RUN_BODY = [
  "...............kw...",
  ".......kkkkk...kwk..",
  ".....kkLLLLLkk.kLLk.",
  "....kLLLLLLLLLkkLLLk",
  "...kFLLLLLLLLLLFFFFk",
  "..kFFFkowwwwwokFkpFk",
  ".kFFFFkowwwwwokFFFkk",
  ".kFFFFkowwwwwokFFkkk",
  "..kFFFkowwwwwokDDkkk",
  "...kFFkoooooookDDDk.",
];
const RUN_FRAMES = [
  [
    ...RUN_BODY,
    "..kFk.kFk...kDk.kDk.",
    ".kFk...kFk..kDk..kDk",
    ".kk.....kk..kk....kk",
    "....................",
  ],
  [
    "....................",
    ...RUN_BODY,
    "...kFkkFk...kDkkDk..",
    "...kFkkFk...kDkkDk..",
    "...kkkkkk...kkkkkk..",
  ],
];

const mirror = (half) => half + [...half].reverse().join("");

const GEM = [
  "..kkkkkk..",
  ".kpggggBk.",
  "kppgggggBk",
  "kkkkkkkkkk",
  ".kgggggBk.",
  "..kggggk..",
  "...kgBk...",
  "....kk....",
];

const HALL = [
  "................................................................",
  "................................................................",
  "...............................kkoooooo.........................",
  "...............................kkoooo...........................",
  "...............................kkoo.............................",
  "...............................kk...............................",
  "...............................kk...............................",
  "...............................kk...............................",
  "..............................kssk..............................",
  ".............................kssssk.............................",
  "............................kssssssk............................",
  "............................kkkkkkkk............................",
  "............................kpkkkkpk............................",
  "............................kpkkpkpk............................",
  "............................kpkppkpk............................",
  "............................kpkkkkpk............................",
  "............................kkkkkkkk............................",
  "............................kkksskkk............................",
  ".....kkkkk...............kkksssssssskkk................kkkkk....",
  "......kRk.............kkksssssssssssssskkk..............kRk.....",
  "......kRk..........kssssssssssssssssssssssssk...........kRk.....",
  "......kRk.........kkkkkkkkkkkkkkkkkkkkkkkkkkkk..........kRk.....",
  "......kkk...........kRRRRRRRRRkppkRRRRRRRRRk............kkk.....",
  "..kkkkkkkkkkkkkkkkkkkRRRRRRRRkppppkRRRRRRRRkkkkkkkkkkkkkkkkkkk..",
  "..kpppppppppppppppppkRoRRRRokppooppkRoRRRRRkpppppppppppppppppk..",
  "..kkkkkkkkkkkkkkkkkkkRppppRkppppppppkRppppRkkkkkkkkkkkkkkkkkkk..",
  "...kkkkkkkkkkkkkkkkkkRppypkppppppppppkppypRkkkkkkkkkkkkkkkkkk...",
  "...kRRRRRRRRRRRRRRRkkRppppkkkkkkkkkkkkppppRkkRRRRRRRRRRRRRRRk...",
  "...kRoRRRRoRRRRoRRRkkRpyyppppppppppppppyypRkkRoRRRRoRRRRoRRRk...",
  "...kRppppRppppRppppkkRpyypkkkkkkkkkkkkpyypRkkRppppRppppRppppk...",
  "...kRppypRpBbpRppypkkRppppRpnpnnnnpnpoppppRkkRppypRppypRpBbpk...",
  "...kRppppRppppRppppkkRRRRRRpnpnnnnpnpRRRRRRkkRppppRppppRppppk...",
  "...kRpyypRpbbpRpyypkkRRRRRRpnpnnnnpnpRRRRRRkkRpyypRpyypRpbbpk...",
  "...kRpyypRpbbpRpyypkkRRRoRRpnppppppnpRRoRRRkkRpyypRpyypRpbbpk...",
  "...kRppppRppppRppppkkRppppRpnpnyynpnpRppppRkkRppppRppppRppppk...",
  "...kRRRRRRRRRRRRRRRkkRppypRpnpnkknpnpRppypRkkRRRRRRRRRRRRRRRk...",
  "...kRRRRRRRRRRRRRRRkkRppppRpnpnkknpnpoppppRkkRRRRRRRRRRRRRRRk...",
  "...kRppppRppppRppppkkRpyypRpnpnkknpnpRpyypRkkRppppRppppRppppk...",
  "...kRpBbpRppypRppypkkRpyypRpnpnkknpnpRpyypRkkRppypRpBbpRppypk...",
  "...kRppppRppppRppppkkRppppRpnpnkknpnpRppppRkkRppppRppppRppppk...",
  "...kRpbbpRpyypRpyypkkRRRRRRpnpnkknpnpRRRRRRkkRpyypRpbbpRpyypk...",
  "..kkRpbbpRpyypkkkkpkkRRRRRRpnpnkknpnpRRRRRRkkRkkkkRpbbpRpyypkk..",
  "..eeRppppRppppeeeepkkRoRRRRpnpnkknpnpoRRRRRkkReeeeRppppRppppee..",
  ".eeeeRRoRRRRoeeeeeekkRRRRRRRssssssssRRRRRRRkkeeeeeeRRoRRRRoeeee.",
  "eeeeeeRRRRRReeeeeeeekRRRRRppppppppppppRRRRRkeeeeeeeeRRRRRReeeeee",
  "eEeeEeRRRRRReEeeEeeekRRRssssssssssssssssRRRkeEeeEeeeRRRRRReEeeEe",
  "eeeeeekkkkkkeeeeeeeekkppppppppppppppppppppkkeeeeeeeekkkkkkeeeeee",
  "................................................................",
];

const LOCK = [
  "...kkkk...",
  "..k....k..",
  "..k....k..",
  ".kkkkkkkk.",
  ".kkkkkkkk.",
  ".kkkppkkk.",
  ".kkkppkkk.",
  ".kkkkkkkk.",
  ".kkkkkkkk.",
];

function gridToSvg(rows, size, label) {
  const w = rows[0].length;
  const h = rows.length;
  let rects = "";
  rows.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      const c = row[x];
      let run = 1;
      while (x + run < w && row[x + run] === c) run++;
      if (COLORS[c]) {
        rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${COLORS[c]}"/>`;
      }
      x += run;
    }
  });
  const height = Math.round((size * h) / w);
  const a11y = label ? `role="img" aria-label="${label}"` : `aria-hidden="true"`;
  return `<svg class="sprite" viewBox="0 0 ${w} ${h}" width="${size}" height="${height}" ${a11y} xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}

export const MOODS = Object.keys(RAY_EYES);

function bustRows(mood) {
  const eyes = RAY_EYES[mood] || RAY_EYES.happy;
  return [...RAY_HALF.slice(0, 8), ...eyes, ...RAY_HALF.slice(10)];
}

export function ray(size = 64, mood = "happy") {
  return gridToSvg(bustRows(mood).map(mirror), size, `Ray, ${mood}`);
}

export function rayFull(size = 72, mood = "happy") {
  return gridToSvg([...bustRows(mood), ...RAY_LEGS].map(mirror), size, `Ray, ${mood}`);
}

export function rayRun(size = 40) {
  return `<span class="run" role="img" aria-label="Ray">${RUN_FRAMES.map((f) => gridToSvg(f, size, "")).join("")}</span>`;
}

export function gem(size = 40) {
  return gridToSvg(GEM, size, "Gem");
}


export function hall(size = 192) {
  return gridToSvg(HALL, size, "");
}

export function lock(size = 32) {
  return gridToSvg(LOCK, size, "Locked");
}

// px: canvas pixels per sprite pixel.
function paintRows(ctx, rows, x, y, px) {
  const css = getComputedStyle(document.documentElement);
  const fill = {};
  rows.forEach((row, ry) => {
    [...row].forEach((c, rx) => {
      if (!COLORS[c]) return;
      fill[c] ??= css.getPropertyValue(COLORS[c].slice(4, -1)).trim();
      ctx.fillStyle = fill[c];
      ctx.fillRect(x + rx * px, y + ry * px, px, px);
    });
  });
  return { w: rows[0].length * px, h: rows.length * px };
}

export function paintRay(ctx, x, y, px, mood = "happy") {
  return paintRows(ctx, bustRows(mood).map(mirror), x, y, px);
}

export function paintGem(ctx, x, y, px) {
  return paintRows(ctx, GEM, x, y, px);
}

const ICONS = {
  play: [
    "..k......",
    "..kkk....",
    "..kkkkk..",
    "..kkkkkkk",
    "..kkkkk..",
    "..kkk....",
    "..k......",
  ],
  pause: [
    "..kk.kk..",
    "..kk.kk..",
    "..kk.kk..",
    "..kk.kk..",
    "..kk.kk..",
    "..kk.kk..",
    "..kk.kk..",
  ],
  next: [
    "k...k...k",
    "kk..kk..k",
    "kkk.kkk.k",
    "kkkkkkkkk",
    "kkk.kkk.k",
    "kk..kk..k",
    "k...k...k",
  ],
  minus: [
    ".........",
    ".........",
    ".........",
    ".kkkkkkk.",
    ".........",
    ".........",
    ".........",
  ],
  plus: [
    "....k....",
    "....k....",
    "....k....",
    ".kkkkkkk.",
    "....k....",
    "....k....",
    "....k....",
  ],
};
ICONS.prev = ICONS.next.map((r) => [...r].reverse().join(""));
ICONS.phone = [
  "kkk......",
  "kkk......",
  "kkk......",
  ".kk......",
  ".kkk.....",
  "..kkk....",
  "...kkkkkk",
  "....kkkkk",
  "......kkk",
];

// Mystery caller: a silhouette with a question mark for a face.
const CALLER = [
  "................",
  "......BBBB......",
  "....BBBBBBBB....",
  "...BBBppppBBB...",
  "...BBppBBppBB...",
  "...BBBBBBppBB...",
  "...BBBBBppBBB...",
  "....BBBppBBB....",
  "....BBBBBBBB....",
  ".....BBppBB.....",
  "......BBBB......",
  "......BBBB......",
  "...BBBBBBBBBB...",
  "..BBBBBBBBBBBB..",
  ".BBBBBBBBBBBBBB.",
  ".BBBBBBBBBBBBBB.",
];

export function caller(size = 96) {
  return gridToSvg(CALLER, size, "Unknown caller");
}

export function icon(name, size = 18) {
  return gridToSvg(ICONS[name], size, "");
}

// Small pieces for the bonus-hint games.
const MINI = {
  calf: [
    "w......w",
    ".wFFFFw.",
    "FFFFFFFF",
    "FkFFFFkF",
    "FFFLLFFF",
    ".FFDDFF.",
    "..F..F..",
  ],
  flame: [
    "..o...",
    "..oo..",
    ".oyo..",
    ".oyyo.",
    ".oypo.",
    "..kk..",
    ".pppp.",
    ".pppp.",
    ".pppp.",
    ".pppp.",
  ],
  wick: [
    "......",
    "......",
    "......",
    "......",
    "......",
    "..kk..",
    ".pppp.",
    ".pppp.",
    ".pppp.",
    ".pppp.",
  ],
  ball: [
    "..kkk..",
    ".kprpk.",
    "kprpprk",
    "kpppppk",
    "kprpprk",
    ".kprpk.",
    "..kkk..",
  ],
  mitt: [
    ".DDDD...",
    "DFFFFD..",
    "DFLLFFD.",
    "DFLLLFFD",
    "DFLLLFFD",
    "DFFFFFFD",
    ".DFFFFD.",
    "..DDDD..",
  ],
  up: [
    "..p..",
    ".ppp.",
    "p.p.p",
    "..p..",
    "..p..",
  ],
  upright: [
    ".pppp",
    "...pp",
    "..p.p",
    ".p..p",
    "p....",
  ],
};

export function mini(name, size = 24) {
  return gridToSvg(MINI[name], size, "");
}
