import { rayFull } from "../ui/sprites.js";
import { say } from "../ui/dialogue.js";
import { el } from "../ui/dom.js";
import { starfield } from "../ui/scenery.js";
import { offerEmail } from "../ui/email-form.js";
import { sfx } from "../audio/sfx.js";
import * as store from "../core/store.js";
import { p, setPendingDeepLink } from "../core/progress.js";
import { go, later } from "../core/router.js";
import { emailOn } from "../book/email.js";

export function introScreen() {
  const screen = el(`
    <section class="screen intro" aria-label="Meet Ray">
      ${starfield(24)}
      <div class="screen__body">
        <div class="stage" aria-hidden="true">
          <div class="walker is-walking">${rayFull(84)}</div>
        </div>
        <div class="name-slot"></div>
      </div>
    </section>
  `);

  later(screen, async () => {
    if (!screen.isConnected) return;
    screen.querySelector(".walker").classList.remove("is-walking");
    await say([
      { text: "HEY! Over here!\nHi, my name's Ray. Ray Bucknell." },
      { text: "I've been on this hill longer than most of the bricks." },
      { text: "I hid twelve of my cards around campus. Each one marks a gem: a spot I never want anyone to forget." },
      { text: "Find them with me, snap a photo at each one, and we'll fill a page of my book together." },
      { text: "First things first..." },
    ]);
    if (!screen.isConnected) return;
    askName(screen);
  }, 1500);

  return screen;
}

function askName(screen) {
  const slot = screen.querySelector(".name-slot");
  slot.replaceChildren(
    el(`
      <form class="name-form px-box" autocomplete="off">
        <label for="player-name">WHAT'S YOUR NAME, PLAYER?</label>
        <input id="player-name" class="px-input" maxlength="12" enterkeyhint="done"
          autocapitalize="characters" spellcheck="false" placeholder="YOUR NAME" required>
        <button class="btn btn--big btn--green" type="submit">OK!</button>
      </form>
    `)
  );
  const form = slot.querySelector("form");
  const input = form.querySelector("input");
  input.focus({ preventScroll: true });
  input.addEventListener("input", () => sfx.blip());
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = input.value.trim().toUpperCase();
    if (!name) {
      sfx.error();
      return;
    }
    await store.update((s) => {
      s.name = name;
    });
    sfx.select();
    slot.replaceChildren();
    await say({ text: `${name}... What a great name!`, mood: "proud" });
    if (!screen.isConnected) return;
    if (emailOn() && !p().emailAsked) {
      await offerEmail(slot);
      if (!screen.isConnected) return;
    }
    await say("Our first gem is close. Real close. Let's look at the map.");
    if (!screen.isConnected) return;
    const scanned = Object.keys(p().verified)[0];
    setPendingDeepLink(null);
    go(scanned ? `#/proof/${scanned}` : "#/map");
  });
}
