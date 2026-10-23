import { toCanvas, sizeOf } from "./photo.js";
import { byId } from "../data/gems.js";

let jsQRReady = null;

// jsQR is UMD, so it loads as a classic script.
function loadJsQR() {
  if (window.jsQR) return Promise.resolve(window.jsQR);
  jsQRReady ??= new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = new URL("../../vendor/jsQR-1.4.0.js", import.meta.url).href;
    s.onload = () => res(window.jsQR);
    s.onerror = rej;
    document.head.appendChild(s);
  });
  return jsQRReady;
}

export const preload = () => loadJsQR().catch(() => {});

// The card is small in the frame: try full, center crop, then smaller.
export async function scan(img) {
  const jsQR = await loadJsQR();
  const { w, h } = sizeOf(img);
  const center = { x: w * 0.2, y: h * 0.2, w: w * 0.6, h: h * 0.6 };
  const passes = [
    [1600, null],
    [1600, center],
    [1000, null],
  ];
  for (const [max, crop] of passes) {
    const canvas = toCanvas(img, max, crop);
    const ctx = canvas.getContext("2d");
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hit = jsQR(data, canvas.width, canvas.height, { inversionAttempts: "attemptBoth" });
    if (hit?.data) return hit.data;
    await new Promise((r) => setTimeout(r)); // let the UI paint
  }
  return null;
}

// Cards encode https://<site>/#/found/<id>/<token>.
export function parseFound(text) {
  const m = /#\/found\/([a-z]+)\/([a-z0-9]+)/i.exec(text || "");
  return m ? { id: m[1].toLowerCase(), token: m[2].toLowerCase() } : null;
}

export function tokenOk(id, token) {
  const gem = byId(id);
  return Boolean(gem?.token) && gem.token === String(token).toLowerCase();
}

// Passwords are years on the building, so digits count; spaces and punctuation don't.
const norm = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, "");

// A stop can accept more than one password when several years are on show.
const answers = (gem) => [].concat(gem.code || []).map(norm).filter(Boolean);

export const codeOk = (gem, typed) => Boolean(norm(typed)) && answers(gem).includes(norm(typed));

export const codeOwner = (typed, gems) => gems.find((g) => codeOk(g, typed));

export function cardUrl(gem, base = location.origin + location.pathname) {
  return `${base}#/found/${gem.id}/${gem.token}`;
}
