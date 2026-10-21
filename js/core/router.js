// Hash router: screen wipes, redirects, enter/leave hooks and screen music.

import { close as closeDialogue } from "../ui/dialogue.js";
import { close as closeSoundPanel } from "../ui/sound-panel.js";
import * as music from "../audio/music.js";
import { reducedMotion } from "../ui/dom.js";

const app = document.getElementById("app");

// Runs after the screen is on the page (after the wipe).
export function later(screen, fn, ms = 0) {
  (screen._enter ??= []).push(() => setTimeout(fn, reducedMotion() ? 0 : ms));
}

let leaveHooks = [];
export const onLeave = (fn) => leaveHooks.push(fn);

export function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

function wipe() {
  if (reducedMotion()) return Promise.resolve();
  const w = document.createElement("div");
  w.className = "wipe";
  w.innerHTML = "<span></span>".repeat(8 * 14);
  document.body.appendChild(w);
  requestAnimationFrame(() => w.classList.add("is-in"));
  return new Promise((res) =>
    setTimeout(() => {
      res();
      setTimeout(() => w.remove(), 60);
    }, 480)
  );
}

let liveUrls = [];
export const trackUrl = (u) => liveUrls.push(u);
function releaseUrls() {
  liveUrls.forEach((u) => URL.revokeObjectURL(u));
  liveUrls = [];
}

let redirecting = null;
export function redirect(hash) {
  redirecting = hash;
  return null;
}

let first = true;
let routes = [];

const SCREEN_MUSIC = {
  title: "title",
  intro: "title",
  map: "overworld",
  gem: "riddle",
  proof: "riddle",
  get: "overworld",
  book: "overworld",
};

async function render() {
  const hash = location.hash || "#/";
  leaveHooks.forEach((fn) => fn());
  leaveHooks = [];
  releaseUrls();
  let screen = null;
  redirecting = null;
  const route = routes.find(([re]) => re.test(hash));
  if (route) {
    const args = hash.match(route[0]).slice(1);
    screen = route[1](...args);
  } else {
    redirecting = "#/title";
  }
  if (redirecting) {
    history.replaceState(null, "", redirecting);
    return render();
  }

  if (!first) await wipe();
  first = false;
  app.replaceChildren(); // detach first so pending dialogue callbacks bail out
  closeDialogue();
  closeSoundPanel();
  app.appendChild(screen);
  window.scrollTo(0, 0);
  music.play(SCREEN_MUSIC[location.hash.split("/")[1] || "title"] || "overworld");
  screen._enter?.forEach((fn) => fn());
}

// routes: [[regex, handler]]; a handler returns a screen or calls redirect().
export function start(table) {
  routes = table;
  window.addEventListener("hashchange", render);
  return render();
}
