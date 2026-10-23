// Full-screen gate on the location-based screens until location is on.

import { el } from "./dom.js";
import { ray } from "./sprites.js";
import { LOCATION_HELP } from "./hud.js";
import { sfx } from "../audio/sfx.js";
import { SKIP_GPS } from "../config.js";
import * as geo from "../hunt/geo.js";

let gate = null;
let wanted = false;
let watching = false;

function close() {
  gate?.remove();
  gate = null;
}

// Lift the gate on its own when the player allows location in another tab or Settings.
async function watch() {
  if (watching) return;
  watching = true;
  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    status.addEventListener("change", () => guardLocation(wanted));
  } catch {}
}

async function tryLocation(state) {
  try {
    await geo.here();
    sfx.select();
    close();
  } catch (err) {
    sfx.error();
    if (err?.code === 1) return show("denied", "Still blocked. If you just changed it, reload the page.");
    if ((await geo.permission()) === "granted") return close();
    show(state, "Couldn't get a fix. Step outside or near a window, then try again.");
  }
}

function show(state, note = "") {
  close();
  const help = {
    unsupported: "This browser can't share your location. Open Raydar in Safari or Chrome.",
    denied: `Location is blocked for this site.<br>${LOCATION_HELP}`,
    prompt: "",
  }[state];
  const action = { denied: "I TURNED IT ON", prompt: "TURN ON LOCATION" }[state];
  gate = el(`
    <div class="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <div class="gate__box px-box">
        <div class="gate__ray" aria-hidden="true">${ray(64, "spooky")}</div>
        <h2 id="gate-title" class="gate__title pixel">LOCATION IS OFF</h2>
        <p class="gate__text">Ray checks you in at every stop with your phone's location. Turn it on to keep playing.</p>
        ${help ? `<p class="gate__help">${help}</p>` : ""}
        ${note ? `<p class="gate__note">${note}</p>` : ""}
        ${action ? `<button class="btn btn--big btn--green" type="button" data-act="on">${action}</button>` : ""}
        <button class="btn btn--blue" type="button" data-act="book">RAY'S BOOK</button>
      </div>
    </div>
  `);
  gate.dataset.state = state;
  const on = gate.querySelector("[data-act=on]");
  on?.addEventListener("click", () => {
    on.disabled = true;
    on.textContent = "CHECKING...";
    tryLocation(state);
  });
  gate.querySelector("[data-act=book]").addEventListener("click", () => {
    location.hash = "#/book";
  });
  document.body.appendChild(gate);
  (on || gate.querySelector("[data-act=book]")).focus({ preventScroll: true });
}

// Called on every screen change; `on` says whether this screen needs location.
export async function guardLocation(on) {
  wanted = on;
  if (!on || SKIP_GPS) return close();
  watch();
  const state = geo.supported() ? await geo.permission() : "unsupported";
  if (!wanted) return;
  // null: the browser won't say, so leave it to the check-in screen.
  if (state === "granted" || state === null) return close();
  if (gate?.dataset.state !== state) show(state);
}
