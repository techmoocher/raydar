// Top bar: arc, gem count, signal bars and the sound button.

import { gem as gemSprite } from "./sprites.js";
import { soundButton } from "./sound-panel.js";
import { el, pad2 } from "./dom.js";
import { GEMS } from "../data/gems.js";
import * as store from "../core/store.js";
import { foundCount, worldOf } from "../core/progress.js";
import * as geo from "../hunt/geo.js";

export function hud(g) {
  const bar = el(`
    <header class="hud" data-act="${worldOf(g)}">
      <span class="hud__world">ARC ${worldOf(g)}</span>
      <span class="hud__gems" aria-label="${foundCount()} of ${GEMS.length} gems found">${gemSprite(16)}${pad2(foundCount())}/${GEMS.length}</span>
      <span class="hud__bars" hidden aria-label="Signal"></span>
    </header>
  `);
  bar.appendChild(soundButton("hud__sound"));
  return bar;
}

export function setBars(screen, n) {
  const b = screen.querySelector(".hud__bars");
  if (!b) return;
  b.hidden = n == null;
  if (n != null) {
    b.innerHTML = geo.barsText(n);
    b.setAttribute("aria-label", `Signal ${n} of 4`);
  }
}

// How to unblock location, shown wherever it's off.
export const LOCATION_HELP = `
  <b>iPhone:</b> Settings → Privacy &amp; Security → Location Services → Safari Websites → While Using the App.<br>
  <b>Android:</b> tap the icon left of the address bar → Permissions → Location → Allow.`;

// Adds a warning to `target` once we know location is blocked or missing.
export async function locationNote(target) {
  const state = geo.supported() ? await geo.permission() : "unsupported";
  if (state === "denied") {
    target.insertAdjacentHTML(
      "afterbegin",
      `<p class="note">Location is off, and you need it to check in at each stop.<br>${LOCATION_HELP}</p>`
    );
  } else if (state === "unsupported") {
    target.insertAdjacentHTML(
      "afterbegin",
      `<p class="note">This browser can't share your location, so you can't check in at stops. Try Safari or Chrome.</p>`
    );
  }
}

export function saveNote() {
  return store.persistent
    ? ""
    : `<p class="note">Heads up: this browser won't keep your progress if you close the tab.</p>`;
}
