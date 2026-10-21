// Proof: decode the QR on Ray's card from a photo, or check a typed code.

import { toCanvas, sizeOf } from "./photo.js";
import { byId } from "./data/gems.js";

let jsQRReady = null;

// jsQR ships as UMD, so load it as a classic script the first time it's needed.
function loadJsQR() {
  if (window.jsQR) return Promise.resolve(window.jsQR);
  jsQRReady ??= new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = new URL("../vendor/jsQR-1.4.0.js", import.meta.url).href;
    s.onload = () => res(window.jsQR);
    s.onerror = rej;
    document.head.appendChild(s);
  });
  return jsQRReady;
}

export const preload = () => loadJsQR().catch(() => {});

// A card held up in front of a building is small in the frame, so try the
// full photo at 1600px, then the center crop, then the whole thing at 1000px.
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
    await new Promise((r) => setTimeout(r)); // let the "scanning" frame paint
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

const norm = (s) => String(s).toUpperCase().replace(/[^A-Z]/g, "");

export const codeOk = (gem, typed) => norm(typed) === norm(gem.code);

// Which gem's code is this, if any? Lets Ray say "that's the wrong card."
export const codeOwner = (typed, gems) => gems.find((g) => norm(g.code) === norm(typed));

export function cardUrl(gem, base = location.origin + location.pathname) {
  return `${base}#/found/${gem.id}/${gem.token}`;
}
