// Pixel sprites drawn from character grids into crisp SVG.
// PLACEHOLDER: Ray is a simple bison head (brown fur, black horns, Bucknell
// scarf) until the owner's sprites exist. Swap these for
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
  D: "var(--fur-dk)",
  F: "var(--fur)",
  L: "var(--fur-hi)",
};

// Left half of Ray's head (24x20). Each row is mirrored to make the right.
const RAY_HALF = [
  "............",
  "........kkkk",
  ".p.....kLLLL",
  ".kk..kLLFLLF",
  "..kkkLFFLFFL",
  "...kkDFFFFFF",
  "...kDDFFFFFF",
  "..kDDDFFFFFF",
  ".kDDDFkkFFFF", // eyes (rows 8-9 swap per mood)
  ".kDDDFkpFFFF",
  ".kDDDDFFFFFF",
  "..kDDDFFFFFF",
  "...kDDDDDDDD",
  "....kDDkkDDD",
  "....kDDDDDDD",
  "...kooooOooo",
  "...kbbbbbbbb",
  "...kooooooDD",
  "....kkkkk.DD",
  "..........kD",
];

const RAY_EYES = {
  happy: [".kDDDFkkFFFF", ".kDDDFkpFFFF"],
  spooky: [".kDDDkppkFFF", ".kDDDkpkkFFF"],
  proud: [".kDDDFFFFFFF", ".kDDDFkkFFFF"],
  wistful: [".kDDDkkFFFFF", ".kDDDFkpFFFF"],
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
  "..kBBBBk..",
  "..kB..Bk..",
  ".kkkkkkkk.",
  ".kBBBBBBk.",
  ".kBBkkBBk.",
  ".kBBkkBBk.",
  ".kBBBBBBk.",
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
