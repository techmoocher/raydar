import { GEMS } from "./data/gems.js";
import * as store from "./store.js";
import { loadImage } from "./photo.js";
import { paintRay, paintGem } from "./sprites.js";

const W = 1080;
const H = 1920;
const PIXEL = '"Press Start 2P", monospace';
const TEXT = '"VT323", monospace';

const pad2 = (n) => String(n).padStart(2, "0");

function palette() {
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(`--${n}`).trim();
  return {
    night: v("night"), blue: v("blue"), blueHi: v("blue-hi"), orange: v("orange"),
    orangeHi: v("orange-hi"), paper: v("paper"), ink: v("ink"), gem: v("gem"),
    gold: v("gold"), cherry: v("cherry"), leaf: v("leaf"), plum: v("plum"), stone: v("stone"),
  };
}

export function stamp(iso) {
  return new Date(iso)
    .toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    .toUpperCase();
}

// Seeded so the stars are the same every time.
function stars(ctx, c) {
  let seed = 1846;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const clear = (x, y) => (x > 220 && x < 860 && (y < 270 || y > H - 110));
  for (let i = 0; i < 90; i++) {
    const color = rnd() < 0.4 ? c.blueHi : c.paper;
    const s = rnd() < 0.2 ? 8 : 4;
    const x = Math.floor((rnd() * W) / 4) * 4;
    const y = Math.floor((rnd() * H) / 4) * 4;
    if (clear(x, y)) continue;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, s, s);
  }
}

function centerText(ctx, text, y, font, color, shadow) {
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  if (shadow) {
    ctx.fillStyle = shadow;
    ctx.fillText(text, W / 2 + 6, y + 6);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, W / 2, y);
}

// Like object-fit: cover.
function cover(ctx, img, x, y, w, h) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const s = Math.max(w / iw, h / ih);
  const sw = w / s;
  const sh = h / s;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
}

function fitText(ctx, text, maxW, size, family) {
  let s = size;
  ctx.font = `${s}px ${family}`;
  while (ctx.measureText(text).width > maxW && s > 8) {
    s -= 1;
    ctx.font = `${s}px ${family}`;
  }
}

export async function renderPage() {
  await Promise.all([document.fonts.load(`20px ${PIXEL}`), document.fonts.load(`20px ${TEXT}`)]);
  const p = store.get();
  const c = palette();
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  ctx.fillStyle = c.night;
  ctx.fillRect(0, 0, W, H);
  stars(ctx, c);

  paintRay(ctx, 48, 56, 6, Object.keys(p.found).length === GEMS.length ? "proud" : "happy");
  paintGem(ctx, W - 48 - 80, 92, 8);
  centerText(ctx, "HIDDEN", 52, `52px ${PIXEL}`, c.paper, c.blueHi);
  centerText(ctx, "GEMS", 120, `64px ${PIXEL}`, c.orange, c.ink);
  const who = `${(p.name || "PLAYER").toUpperCase()}'S PAGE IN RAY'S BOOK`;
  ctx.font = `22px ${PIXEL}`;
  fitText(ctx, who, W - 96, 22, PIXEL);
  ctx.textAlign = "center";
  ctx.fillStyle = c.gem;
  ctx.fillText(who, W / 2, 222);

  const cols = 3;
  const margin = 48;
  const gap = 24;
  const cellW = (W - margin * 2 - gap * (cols - 1)) / cols;
  const padP = 14;
  const photo = cellW - padP * 2;
  const capH = 64;
  const cellH = padP + photo + capH;
  const top = 290;

  const photos = await Promise.all(
    GEMS.map(async (g) => {
      if (!p.found[g.id]) return null;
      const blob = await store.getPhoto(g.id);
      return blob ? loadImage(blob).catch(() => null) : null;
    })
  );

  GEMS.forEach((g, i) => {
    const f = p.found[g.id];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = margin + col * (cellW + gap);
    const y = top + row * (cellH + gap);
    ctx.save();
    ctx.translate(x + cellW / 2, y + cellH / 2);
    ctx.rotate(((i % 2 ? 1 : -1) * 1.5 * Math.PI) / 180);
    ctx.translate(-cellW / 2, -cellH / 2);

    if (f) {
      ctx.fillStyle = c.blueHi;
      ctx.fillRect(8, 8, cellW, cellH);
      ctx.fillStyle = c.ink;
      ctx.fillRect(-4, -4, cellW + 8, cellH + 8);
      ctx.fillStyle = c.paper;
      ctx.fillRect(0, 0, cellW, cellH);
      ctx.fillStyle = c.ink;
      ctx.fillRect(padP, padP, photo, photo);
      if (photos[i]) cover(ctx, photos[i], padP, padP, photo, photo);
      const tape = [c.gold, c.cherry, c.leaf, c.plum, c.gem][g.n % 5];
      ctx.fillStyle = c.ink;
      ctx.fillRect(cellW / 2 - 46, -16, 92, 30);
      ctx.fillStyle = tape;
      ctx.fillRect(cellW / 2 - 42, -12, 84, 22);
    } else {
      ctx.strokeStyle = c.stone;
      ctx.lineWidth = 6;
      ctx.setLineDash([18, 12]);
      ctx.strokeRect(3, 3, cellW - 6, cellH - 6);
      ctx.setLineDash([]);
      ctx.font = `48px ${PIXEL}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = c.stone;
      ctx.fillText("?", padP + photo / 2, padP + photo / 2);
    }

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const label = `${pad2(g.n)} ${f ? g.name.toUpperCase() : "???"}`;
    fitText(ctx, label, photo, 14, PIXEL);
    ctx.fillStyle = f ? c.ink : c.stone;
    ctx.fillText(label, padP, padP + photo + 12);
    if (f) {
      ctx.font = `26px ${TEXT}`;
      ctx.fillStyle = c.blue;
      ctx.fillText(stamp(f.at), padP, padP + photo + 34);
    }
    ctx.restore();
  });

  const n = Object.keys(p.found).length;
  centerText(ctx, `GEMS ${pad2(n)}/${GEMS.length}`, H - 92, `24px ${PIXEL}`, c.orange, c.ink);
  centerText(ctx, "RAYDAR", H - 48, `14px ${PIXEL}`, c.gem);

  return new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.82));
}

export function pageFileName() {
  const name = (store.get().name || "player").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `rays-book-${name}.jpg`;
}

export async function savePage(blob) {
  const file = new File([blob], pageFileName(), { type: "image/jpeg" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "My page in Ray's book" });
      return "shared";
    } catch (e) {
      if (e?.name === "AbortError") return "cancelled";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return "downloaded";
}
