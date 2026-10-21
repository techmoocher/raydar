// Ray's book: the player's photo page.

import { say, close as closeDialogue } from "../ui/dialogue.js";
import { el, esc, pad2, reducedMotion } from "../ui/dom.js";
import { hud } from "../ui/hud.js";
import { emailForm } from "../ui/email-form.js";
import { sfx } from "../audio/sfx.js";
import { GEMS } from "../data/gems.js";
import * as store from "../core/store.js";
import { p, foundCount } from "../core/progress.js";
import { go, trackUrl } from "../core/router.js";
import { renderPage, savePage } from "../book/page.js";
import { emailOn, sendPage } from "../book/email.js";

function stamp(iso) {
  const d = new Date(iso);
  return d
    .toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })
    .toUpperCase();
}

export function bookScreen() {
  const name = p().name || "PLAYER";
  const screen = el(`
    <section class="screen book" aria-label="Ray's book">
      <div class="screen__body">
        <h1 class="book__title pixel">RAY'S BOOK</h1>
        <p class="book__sub">${esc(name)}'s page · ${pad2(foundCount())}/${GEMS.length} gems</p>
        ${foundCount() ? `<p class="book__tip">Tap a photo to read Ray's card again.</p>` : ""}
        <div class="email-slot"></div>
        <div class="book__grid"></div>
      </div>
      <nav class="dock book__actions">
        <button class="btn btn--big" type="button" data-act="email">EMAIL MY PAGE</button>
        <div class="dock__row">
          <button class="btn btn--blue" type="button" data-act="save">SAVE PAGE</button>
          <button class="btn btn--blue" type="button" data-act="map">MAP</button>
        </div>
      </nav>
    </section>
  `);
  screen.prepend(hud());
  const grid = screen.querySelector(".book__grid");

  GEMS.forEach((g) => {
    const f = p().found[g.id];
    const fig = el(`
      <figure class="polaroid ${f ? "" : "polaroid--empty"}" data-tape="${g.n % 5}">
        <div class="polaroid__frame">${f ? "" : `<span class="pixel">?</span>`}</div>
        <figcaption>
          <span class="pixel">${pad2(g.n)} ${f ? esc(g.name) : "???"}</span>
          ${f ? `<span>${esc(stamp(f.at))}</span>` : ""}
        </figcaption>
      </figure>
    `);
    if (!f) {
      grid.appendChild(fig);
      return;
    }
    const open = el(`<button class="polaroid-btn" type="button" aria-label="Read Ray's card for ${esc(g.name)}"></button>`);
    open.appendChild(fig);
    open.addEventListener("click", () => {
      sfx.select();
      say([...g.memory, { text: `${g.cardBack} — Ray`, mood: "proud", name: "CARD BACK" }]);
    });
    grid.appendChild(open);
    store.getPhoto(g.id).then((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      trackUrl(url);
      const img = new Image();
      img.alt = `Photo at ${g.name}`;
      img.src = url;
      fig.querySelector(".polaroid__frame").appendChild(img);
    });
  });

  screen.querySelector("[data-act=map]").addEventListener("click", () => go("#/map"));

  const actions = screen.querySelectorAll(".book__actions .btn");
  const busy = (on) => actions.forEach((b) => (b.disabled = on));
  const emailSlot = screen.querySelector(".email-slot");

  async function savePicture(blob) {
    const how = await savePage(blob || (await renderPage()));
    if (how === "downloaded") say("Saved! Your page is in your downloads.");
  }

  screen.querySelector("[data-act=save]").addEventListener("click", async () => {
    sfx.select();
    busy(true);
    say("Putting your page together...");
    try {
      await savePicture();
    } finally {
      busy(false);
    }
  });

  screen.querySelector("[data-act=email]").addEventListener("click", async () => {
    sfx.select();
    if (!emailOn()) {
      busy(true);
      await say("Email isn't set up yet, so I'll save your page as a picture instead.");
      try {
        await savePicture();
      } finally {
        busy(false);
      }
      return;
    }

    let to = p().email;
    if (to) {
      const pick = await say(`Send your page to ${to}?`, {
        choices: [
          { label: "SEND", value: "send" },
          { label: "CHANGE", value: "change", primary: false },
        ],
      });
      if (!screen.isConnected || !pick) return;
      if (pick === "change") to = null;
    }
    if (!to) {
      closeDialogue();
      const asked = emailForm(emailSlot, { skipLabel: "CANCEL" });
      emailSlot.scrollIntoView({ block: "center", behavior: reducedMotion() ? "instant" : "smooth" });
      to = await asked;
      if (!to || !screen.isConnected) return;
    }

    busy(true);
    say("Hitting send...");
    try {
      const blob = await renderPage();
      const result = await sendPage(blob);
      if (!screen.isConnected) return;
      if (result.ok) {
        sfx.itemGet();
        say({ text: `Sent to ${to}! Not in your inbox? Check spam. Filters get weird about bison.`, mood: "proud" });
        return;
      }
      sfx.error();
      const why =
        result.error === "rate"
          ? "I've already sent that address a few pages today. Give my hooves a rest and try later."
          : result.error === "invalid"
            ? "That address didn't go through. Double-check it?"
            : "That didn't send. Campus Wi-Fi strikes again.";
      const fallback = await say(`${why} Want your page as a picture instead?`, {
        choices: [
          { label: "SAVE PAGE", value: true },
          { label: "NO THANKS", value: false, primary: false },
        ],
      });
      if (fallback && screen.isConnected) await savePicture(blob);
    } finally {
      busy(false);
    }
  });

  return screen;
}
