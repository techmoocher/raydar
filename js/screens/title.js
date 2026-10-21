import { rayFull, hall, icon } from "../ui/sprites.js";
import { say } from "../ui/dialogue.js";
import { soundButton } from "../ui/sound-panel.js";
import { el } from "../ui/dom.js";
import { starfield, ground } from "../ui/scenery.js";
import { sfx, unlock as unlockAudio } from "../audio/sfx.js";
import * as store from "../core/store.js";
import { pendingDeepLink } from "../core/progress.js";
import { go, later } from "../core/router.js";

export function titleScreen() {
  const saved = store.hasSave();
  const screen = el(`
    <section class="screen title" aria-label="Title screen">
      ${starfield()}
      <h1 class="title__logo">
        <span class="title__hidden">RAY</span>
        <span class="title__gems">DAR</span>
      </h1>
      <p class="title__sub">RAY BUCKNELL'S<br>SCAVENGER HUNT</p>
      <div class="title__actions">
        ${
          saved
            ? `<button class="btn btn--big" type="button" data-act="continue">CONTINUE</button>
               <button class="btn btn--blue" type="button" data-act="new">NEW GAME</button>`
            : `<button class="btn btn--big press-start" type="button" data-act="start">START <span class="press-start__arrow" aria-hidden="true">${icon("play", 14)}</span></button>`
        }
      </div>
      ${ground()}
      <div class="title__hall" aria-hidden="true">${hall(192)}</div>
      <div class="title__ray bob" aria-hidden="true">${rayFull(84)}</div>
    </section>
  `);
  screen.appendChild(soundButton("title__sound"));

  const on = (act, fn) =>
    screen.querySelector(`[data-act=${act}]`)?.addEventListener("click", () => {
      unlockAudio();
      sfx.select();
      fn();
    });

  on("start", () => go("#/call"));
  on("continue", () => go("#/map"));
  on("new", async () => {
    const ok = await say("Start over? This wipes your photos and progress.", {
      choices: [
        { label: "ERASE", value: true },
        { label: "KEEP", value: false, primary: false },
      ],
    });
    if (!ok) return;
    await store.reset();
    go("#/call");
  });

  // Long-press the logo to wipe the save.
  const logo = screen.querySelector(".title__logo");
  let timer = null;
  const cancel = () => clearTimeout(timer);
  logo.addEventListener("pointerdown", () => {
    timer = setTimeout(async () => {
      unlockAudio();
      sfx.error();
      await store.reset();
      go("#/title");
      say("Save wiped. Clean slate!");
    }, 1200);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((e) => logo.addEventListener(e, cancel));
  logo.addEventListener("contextmenu", (e) => e.preventDefault());

  if (pendingDeepLink() && !saved) {
    later(screen, () => say("Ooh, you found one of my cards! Hit START and I'll fill you in."), 300);
  }
  return screen;
}
