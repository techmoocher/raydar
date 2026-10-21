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
      { text: "Oh! You picked up. Nobody answers unknown numbers anymore." },
      { text: "I'm Ray. Ray Bucknell. Yes, like the school. That's a story for later." },
      { text: "I've been on this hill longer than most of the bricks, and I've hidden twelve of my cards around campus." },
      { text: "Each one marks a spot I don't want anyone to forget. Find them, snap a photo at each, and you get a page in my book." },
      { text: "But first, who am I talking to?" },
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
        <label for="player-name">WHO'S ON THE LINE?</label>
        <input id="player-name" class="px-input" maxlength="12" enterkeyhint="done"
          autocapitalize="characters" spellcheck="false" placeholder="YOUR NAME" required>
        <button class="btn btn--big btn--green" type="submit">THAT'S ME</button>
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
    await say({ text: `${name}. Love it. Saving you in my contacts.`, mood: "proud" });
    if (!screen.isConnected) return;
    if (emailOn() && !p().emailAsked) {
      await offerEmail(slot);
      if (!screen.isConnected) return;
    }
    await say("Okay. The first gem is close. Like, really close. Let's check the map.");
    if (!screen.isConnected) return;
    const scanned = Object.keys(p().verified)[0];
    setPendingDeepLink(null);
    go(scanned ? `#/proof/${scanned}` : "#/map");
  });
}
