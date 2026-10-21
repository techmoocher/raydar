// EMAIL MY PAGE: send the collage + results to the Apps Script mailer, which
// builds the HTML email itself. We only send structured data and one JPEG.

import { EMAIL_ENDPOINT } from "./config.js";
import { GEMS } from "./data/gems.js";
import * as store from "./store.js";
import { stamp } from "./report.js";

export const emailOn = () => Boolean(EMAIL_ENDPOINT);

export const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim());

function toBase64(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

// Resolves to { ok: true } or { ok: false, error: "rate" | "invalid" | "network" | "server" }.
export async function sendPage(pageBlob) {
  const p = store.get();
  const payload = {
    v: 1,
    to: p.email.trim(),
    name: p.name,
    total: GEMS.length,
    gems: GEMS.map((g) => ({
      n: g.n,
      name: g.name,
      found: Boolean(p.found[g.id]),
      at: p.found[g.id] ? stamp(p.found[g.id].at) : "",
    })),
    image: await toBase64(pageBlob),
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  try {
    // A text/plain body keeps this a "simple" request: no CORS preflight,
    // which Apps Script web apps can't answer.
    const res = await fetch(EMAIL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
      redirect: "follow",
    });
    const data = await res.json().catch(() => null);
    if (data?.ok) return { ok: true };
    return { ok: false, error: data?.error || "server" };
  } catch {
    return { ok: false, error: "network" };
  } finally {
    clearTimeout(timer);
  }
}
