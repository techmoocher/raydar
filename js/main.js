// Entry point: routes, audio unlock, boot.

import { unlock as unlockAudio } from "./audio/sfx.js";
import * as store from "./core/store.js";
import { redirect, start } from "./core/router.js";
import { titleScreen } from "./screens/title.js";
import { callScreen } from "./screens/call.js";
import { introScreen } from "./screens/intro.js";
import { mapScreen } from "./screens/map.js";
import { gemScreen } from "./screens/gem.js";
import { bonusScreen } from "./screens/bonus.js";
import { proofScreen } from "./screens/proof.js";
import { getScreen } from "./screens/get.js";
import { bookScreen } from "./screens/book.js";
import { foundRoute } from "./screens/found.js";

const needsSave = (fn) => (...args) => (store.hasSave() ? fn(...args) : redirect("#/title"));

const routes = [
  [/^#?\/?$/, titleScreen],
  [/^#\/title$/, titleScreen],
  [/^#\/call$/, callScreen],
  [/^#\/intro$/, introScreen],
  [/^#\/map$/, needsSave(mapScreen)],
  [/^#\/gem\/([a-z]+)$/, needsSave(gemScreen)],
  [/^#\/bonus\/([a-z]+)$/, needsSave(bonusScreen)],
  [/^#\/proof\/([a-z]+)$/, needsSave(proofScreen)],
  [/^#\/get\/([a-z]+)$/, needsSave(getScreen)],
  [/^#\/book$/, needsSave(bookScreen)],
  [/^#\/found\/([a-z]+)\/([a-z0-9]+)$/, foundRoute],
];

// Phones only allow audio after a user gesture.
const firstTap = () => {
  unlockAudio();
  ["click", "touchend", "keydown"].forEach((e) => document.removeEventListener(e, firstTap, true));
};
["click", "touchend", "keydown"].forEach((e) => document.addEventListener(e, firstTap, true));

store.init().then(() => start(routes));
