import * as music from "../audio/music.js";
import { sfx, unlock, isOn as sfxOn, setOn as setSfx } from "../audio/sfx.js";
import { icon } from "./sprites.js";

let panel = null;

function bars(level, max) {
  return Array.from({ length: max }, (_, i) =>
    `<span class="vol__bar ${i < level ? "is-on" : ""}" style="height:${6 + i * 5}px"></span>`
  ).join("");
}

function build() {
  const el = document.createElement("div");
  el.className = "sound-panel px-box";
  el.id = "sound-panel";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", "Sound settings");
  el.hidden = true;
  el.innerHTML = `
    <div class="sound-panel__head">
      <p class="pixel">SOUND</p>
      <button class="sound-panel__close pixel" type="button" aria-label="Close">X</button>
    </div>
    <p class="sound-panel__label pixel">NOW PLAYING</p>
    <p class="sound-panel__track"><span class="note" aria-hidden="true">♫</span> <span class="track-name"></span></p>
    <div class="sound-panel__transport">
      <button class="btn btn--blue" type="button" data-act="prev" aria-label="Previous track">${icon("prev")}</button>
      <button class="btn" type="button" data-act="toggle" aria-label="Play music"></button>
      <button class="btn btn--blue" type="button" data-act="next" aria-label="Next track">${icon("next")}</button>
    </div>
    <div class="sound-panel__row">
      <p class="pixel">MUSIC</p>
      <div class="vol">
        <button class="btn btn--blue btn--icon" type="button" data-act="down" aria-label="Music quieter">${icon("minus")}</button>
        <span class="vol__bars" role="meter" aria-label="Music volume" aria-valuemin="0"></span>
        <button class="btn btn--blue btn--icon" type="button" data-act="up" aria-label="Music louder">${icon("plus")}</button>
      </div>
    </div>
    <div class="sound-panel__row">
      <p class="pixel">SOUND FX</p>
      <button class="btn btn--blue sfx-toggle" type="button" data-act="sfx" aria-pressed="true"></button>
    </div>
  `;
  document.body.appendChild(el);

  const on = (act, fn) =>
    el.querySelector(`[data-act=${act}]`).addEventListener("click", (e) => {
      e.stopPropagation();
      unlock();
      fn();
      sfx.tick();
    });
  on("toggle", () => music.toggle());
  on("prev", () => music.skip(-1));
  on("next", () => music.skip(1));
  on("down", () => music.setLevel(music.state().level - 1));
  on("up", () => music.setLevel(music.state().level + 1));
  on("sfx", () => {
    setSfx(!sfxOn());
    render(music.state());
  });
  el.querySelector(".sound-panel__close").addEventListener("click", close);
  el.addEventListener("click", (e) => e.stopPropagation());

  music.subscribe(render);
  render(music.state());
  return el;
}

function render(st) {
  if (!panel) return;
  const playing = st.on;
  const toggle = panel.querySelector("[data-act=toggle]");
  toggle.innerHTML = icon(playing ? "pause" : "play");
  toggle.setAttribute("aria-label", playing ? "Pause music" : "Play music");
  panel.querySelector(".track-name").textContent = playing ? st.name : "MUSIC OFF";
  panel.querySelector(".note").classList.toggle("bob", playing && st.playing);
  const meter = panel.querySelector(".vol__bars");
  meter.innerHTML = bars(st.level, st.levels);
  meter.setAttribute("aria-valuemax", st.levels);
  meter.setAttribute("aria-valuenow", st.level);
  panel.querySelector("[data-act=down]").disabled = st.level <= 0;
  panel.querySelector("[data-act=up]").disabled = st.level >= st.levels;
  const fx = panel.querySelector("[data-act=sfx]");
  fx.textContent = sfxOn() ? "ON" : "OFF";
  fx.setAttribute("aria-pressed", sfxOn());
  document.querySelectorAll(".sound-btn").forEach((b) => {
    b.classList.toggle("is-muted", !playing);
  });
}

function onKey(e) {
  if (e.key === "Escape") close();
}

// Panel clicks stop propagating, so this only sees outside clicks.
const onOutside = () => close();

export function open(from) {
  panel ??= build();
  panel.hidden = false;
  render(music.state());
  from?.setAttribute("aria-expanded", "true");
  panel.querySelector("[data-act=toggle]").focus({ preventScroll: true });
  setTimeout(() => document.addEventListener("click", onOutside));
  document.addEventListener("keydown", onKey);
}

export function close() {
  if (!panel || panel.hidden) return;
  panel.hidden = true;
  document.removeEventListener("keydown", onKey);
  document.removeEventListener("click", onOutside);
  document.querySelectorAll(".sound-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
}

export function soundButton(extraClass = "") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `sound-btn ${extraClass}`;
  b.setAttribute("aria-label", "Sound settings");
  b.setAttribute("aria-controls", "sound-panel");
  b.setAttribute("aria-expanded", "false");
  b.textContent = "♪";
  b.classList.toggle("is-muted", !music.state().on);
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    unlock();
    sfx.tick();
    if (panel && !panel.hidden) close();
    else open(b);
  });
  return b;
}
