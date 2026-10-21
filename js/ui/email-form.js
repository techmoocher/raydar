import { say, close as closeDialogue } from "./dialogue.js";
import { el, esc } from "./dom.js";
import { sfx } from "../audio/sfx.js";
import * as store from "../core/store.js";
import { p } from "../core/progress.js";
import { validEmail } from "../book/email.js";

// Resolves with the saved address, or null if skipped.
export function emailForm(slot, { skipLabel = "SKIP" } = {}) {
  slot.replaceChildren(
    el(`
      <form class="name-form email-form px-box" autocomplete="on" novalidate>
        <label for="player-email">WHERE SHOULD RAY SEND IT?</label>
        <input id="player-email" class="px-input px-input--email" type="email" name="email"
          autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false"
          enterkeyhint="done" maxlength="254" placeholder="you@bucknell.edu" value="${esc(p().email)}">
        <p class="fineprint">Only used to send you your page. Kept on this phone, never shared.</p>
        <div class="form-row">
          <button class="btn btn--blue" type="button" data-act="skip">${skipLabel}</button>
          <button class="btn btn--green" type="submit">SAVE</button>
        </div>
      </form>
    `)
  );
  const form = slot.querySelector("form");
  const input = form.querySelector("input");
  input.focus({ preventScroll: true });
  input.addEventListener("input", () => sfx.blip());
  return new Promise((resolve) => {
    form.querySelector("[data-act=skip]").addEventListener("click", () => {
      sfx.tick();
      slot.replaceChildren();
      resolve(null);
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!validEmail(email)) {
        sfx.error();
        say("Hmm.| That doesn't look like an email. Something like you@bucknell.edu?");
        input.focus();
        return;
      }
      await store.update((s) => {
        s.email = email;
      });
      sfx.select();
      slot.replaceChildren();
      resolve(email);
    });
  });
}

export async function offerEmail(slot) {
  const yes = await say("Want me to email you your page, too?| Photos, timestamps, the whole thing. No pressure.", {
    choices: [
      { label: "SURE", value: true },
      { label: "NOT NOW", value: false, primary: false },
    ],
  });
  await store.update((s) => {
    s.emailAsked = true;
  });
  if (!slot.isConnected) return;
  if (yes) {
    closeDialogue();
    const email = await emailForm(slot);
    if (!slot.isConnected) return;
    if (email) {
      await say("Done.| Whenever you want it, tap *EMAIL MY PAGE* in my book.");
      return;
    }
  }
  await say("All good.| If you change your mind, it's in my book.");
}
