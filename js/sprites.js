// Pixel sprites drawn from character grids into crisp SVG.
// PLACEHOLDER: Ray is a simple half-body bison (white horns, dark head and
// beard, light woolly hump) until the owner's sprites exist. Swap these for
// <img src="assets/sprites/ray-*.png"> later.

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
  D: "var(--fur-dk)",
  F: "var(--fur)",
  L: "var(--fur-hi)",
  w: "var(--horn)",
};

// Left half of Ray's bust (24x24). Each row is mirrored to make the right.
// Horns on the top corners, round woolly head, shoulders sloping out, and the
// body cut off at the bottom of the frame.
const RAY_HALF = [
  "............",
  "..k.........", // horn tips point up...
  "..kwk.......",
  "..kwk...kkkk",
  "..kwwk.kLLLL", // ...from the top corners of a woolly crown
  "...kwwkLLFLL",
  "....kkLLLFLF",
  "....kFFFFFFF",
  "...kDFkkFFFF", // eyes (rows 8-9 swap per mood)
  "...kDFkpFFFF",
  "...kDFFFFFFF",
  "...kDDFFFFFF",
  "..kLkDDDDDDD", // dark muzzle; the hump starts beside the jaw
  ".kLLLkDDkkDD",
  "kLLLLLkDDDDD",
  "kLLFLLLkDDDD", // beard narrows down the chest
  "kLFFFLLLkDDD",
  "kFFFFFFLLkDD",
  "kFFDFFFFFkDD",
  "kFFFFFDFFFkD",
  "kFDFFFFFFFFk",
  "kFFFFFDFFFFF",
  "kFFFFFFFFFFF",
  "kFDFFFFFDFFF",
];

const RAY_EYES = {
  happy: ["...kDFkkFFFF", "...kDFkpFFFF"],
  spooky: ["...kDkppkFFF", "...kDkpkkFFF"],
  proud: ["...kDFFFFFFF", "...kDFkkFFFF"],
  wistful: ["...kDkkFFFFF", "...kDFkpFFFF"],
};

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
    // Merge horizontal runs of one color into a single rect.
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

export function ray(size = 64, mood = "happy") {
  const eyes = RAY_EYES[mood] || RAY_EYES.happy;
  const half = [...RAY_HALF.slice(0, 8), ...eyes, ...RAY_HALF.slice(10)];
  return gridToSvg(half.map(mirror), size, `Ray, ${mood}`);
}

export function gem(size = 40) {
  return gridToSvg(GEM, size, "Gem");
}

export function lock(size = 32) {
  return gridToSvg(LOCK, size, "Locked");
}

// Paint a sprite onto a canvas (for the collage). px = screen pixels per sprite pixel.
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
  const eyes = RAY_EYES[mood] || RAY_EYES.happy;
  const half = [...RAY_HALF.slice(0, 8), ...eyes, ...RAY_HALF.slice(10)];
  return paintRows(ctx, half.map(mirror), x, y, px);
}

export function paintGem(ctx, x, y, px) {
  return paintRows(ctx, GEM, x, y, px);
}

// 9x7 control icons for the sound panel, drawn in ink.
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

export function icon(name, size = 18) {
  return gridToSvg(ICONS[name], size, "");
}
