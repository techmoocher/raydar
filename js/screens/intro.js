import { rayFull } from "../ui/sprites.js";
import { say, lit } from "../ui/dialogue.js";
import { el } from "../ui/dom.js";
import { starfield } from "../ui/scenery.js";
import { offerEmail } from "../ui/email-form.js";
import { sfx } from "../audio/sfx.js";
import * as store from "../core/store.js";
import { p, setPendingDeepLink } from "../core/progress.js";
import { go, later } from "../core/router.js";
import { emailOn } from "../book/email.js";
import { SKIP_GPS } from "../config.js";
import * as geo from "../hunt/geo.js";

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
      { text: "Oh, you actually picked up!| Nobody answers unknown numbers anymore." },
      { text: "I'm Ray.| Ray Bucknell.| ~And yes, like the school. Long story.~" },
      { text: "I've been on this hill longer than most of the bricks, so I know a few of its secrets." },
      { text: "I picked *twelve* spots around campus that I never want anyone to forget." },
      { text: "Find them, snap a photo at each one,| and you'll earn a page in my book." },
      { text: "I left a card at each one, too.| ~If nobody's walked off with it.~" },
      { text: "So...| who am I talking to?" },
    ]);
    if (!screen.isConnected) return;
    askName(screen);
  }, 1500);

  return screen;
}

// Every check-in needs location, so warn up front and ask while there's time to fix it.
async function askLocation() {
  if (!geo.supported()) {
    await say("One problem:| this browser can't share your location.| Try Safari or Chrome, or you can't check in at stops.");
    return;
  }
  await say([
    "One more thing.| I check you in at every stop with your phone's location.",
    "No location, no gems.| ~Bison rules. I don't make them.~| Okay, I do.",
  ]);
  if (SKIP_GPS || (await geo.permission()) === "granted") return;
  const yes = await say("Want to switch it on now, so it's ready?", {
    choices: [
      { label: "TURN IT ON", value: true },
      { label: "LATER", value: false, primary: false },
    ],
  });
  if (!yes) {
    await say("Okay.| Just keep it on when you get there.");
    return;
  }
  try {
    await geo.here();
    await say("Got it.| ~I only look when you check in, or for signal bars.~");
  } catch (err) {
    await say(
      err?.code === 1
        ? "Looks like it's blocked for this site.| The map will show you how to turn it on."
        : "Location's on, but I can't get a fix yet.| It'll work better outside."
    );
  }
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
    await say({ text: `${lit(name)}.| Love it.| ~Saving you in my contacts.~`, mood: "proud" });
    if (!screen.isConnected) return;
    if (emailOn() && !p().emailAsked) {
      await offerEmail(slot);
      if (!screen.isConnected) return;
    }
    await askLocation();
    if (!screen.isConnected) return;
    await say("Okay.| The first gem is close.| ~Like, really close.~| Let's check the map.");
    if (!screen.isConnected) return;
    const scanned = Object.keys(p().verified)[0];
    setPendingDeepLink(null);
    go(scanned ? `#/proof/${scanned}` : "#/map");
  });
}
