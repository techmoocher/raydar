import { ray } from "../ui/sprites.js";
import { say } from "../ui/dialogue.js";
import { el, pad2 } from "../ui/dom.js";
import { hud } from "../ui/hud.js";
import { sfx } from "../audio/sfx.js";
import { GEMS, byId } from "../data/gems.js";
import * as store from "../core/store.js";
import { p, isFound, isOpen, gemLabel } from "../core/progress.js";
import { go, later, redirect } from "../core/router.js";
import * as card from "../hunt/card.js";
import * as geo from "../hunt/geo.js";
import { loadImage, toKeepsake } from "../hunt/photo.js";

export function proofScreen(id) {
  const g = byId(id);
  if (!g || g.stub) return redirect("#/map");
  if (isFound(g.id)) return redirect(`#/get/${g.id}`);
  if (!isOpen(g) && !p().verified[g.id]) return redirect("#/map");

  let missing = false;
  let photo = null; // { img, url }
  let wrongCodes = 0;

  const screen = el(`
    <section class="screen proof" aria-label="Prove it">
      <div class="screen__body">
        <p class="gem__kicker pixel" data-act="${g.act}">GEM ${pad2(g.n)}/${GEMS.length} · PROVE IT</p>
        <div class="viewfinder" aria-live="polite">
          <div class="viewfinder__empty">
            <span class="viewfinder__card">${ray(48)}<span class="pixel">RAY'S CARD</span></span>
            <span class="viewfinder__hint">Hold the card up with the gem behind it.</span>
          </div>
        </div>
        <label class="btn btn--big camera">
          <input type="file" accept="image/*" capture="environment" class="sr-only">
          <span>SNAP PHOTO</span>
        </label>
        <div class="code-slot"></div>
        <div class="proof__extra">
          <button class="btn btn--blue" type="button" data-act="missing">CAN'T FIND RAY'S CARD?</button>
          <button class="btn btn--blue" type="button" data-act="back">BACK</button>
        </div>
      </div>
    </section>
  `);
  screen.prepend(hud(g));
  card.preload();

  const finder = screen.querySelector(".viewfinder");
  const input = screen.querySelector("input[type=file]");
  const cameraLabel = screen.querySelector(".camera span");
  const codeSlot = screen.querySelector(".code-slot");

  const verified = () => Boolean(p().verified[g.id]);

  screen.querySelector("[data-act=back]").addEventListener("click", () => go(`#/gem/${g.id}`));

  screen.querySelector("[data-act=missing]").addEventListener("click", async () => {
    sfx.select();
    missing = true;
    if (g.geo) {
      await say([
        { text: "Somebody walked off with my card? Rude.", mood: "spooky" },
        "No problem. Snap a photo of the gem itself and I'll check you're standing there.",
      ]);
    } else {
      await say([
        { text: "Somebody walked off with my card? Rude.", mood: "spooky" },
        `Here's my biggest hint: ${g.hints[g.hints.length - 1]}`,
        "If you're standing there, snap a photo of it and I'll take your word for it.",
      ]);
    }
    if (photo && screen.isConnected) await unlockMissing();
  });

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    finder.innerHTML = `<p class="pixel scanning blink">DEVELOPING...</p>`;
    let img;
    try {
      img = await loadImage(file);
    } catch {
      finder.innerHTML = `<p class="viewfinder__hint">That photo didn't load. Try again?</p>`;
      sfx.error();
      return;
    }
    if (photo) URL.revokeObjectURL(photo.url);
    photo = { img, url: URL.createObjectURL(file) };
    finder.innerHTML = `<img class="viewfinder__img" src="${photo.url}" alt="Your photo"><p class="pixel scanning blink">READING CARD...</p>`;
    cameraLabel.textContent = "RETAKE PHOTO";

    if (verified()) return unlock("qr");
    if (missing) return unlockMissing();

    let text = null;
    try {
      text = await card.scan(img);
    } catch {}
    if (!screen.isConnected) return;
    finder.querySelector(".scanning")?.remove();

    const hit = card.parseFound(text);
    if (hit && hit.id === g.id && card.tokenOk(hit.id, hit.token)) return unlock("qr");
    if (hit && card.tokenOk(hit.id, hit.token)) {
      sfx.error();
      const other = byId(hit.id);
      say(
        isFound(other.id)
          ? `Ha! That's my card for ${other.name}. You've already got that one.`
          : `Ha! That's my card for ${gemLabel(other)}. Remember this spot, you'll be back. This gem's card is somewhere else.`
      );
      return;
    }
    sfx.error();
    await say("Ray's handwriting is smudged. Type the word under the code.");
    if (screen.isConnected) showCodeForm();
  });

  function showCodeForm() {
    if (codeSlot.firstChild) {
      codeSlot.querySelector("input").focus();
      return;
    }
    codeSlot.appendChild(
      el(`
        <form class="code-form px-box" autocomplete="off">
          <label for="code" class="pixel">THE WORD UNDER THE CODE</label>
          <input id="code" class="px-input" maxlength="16" autocapitalize="characters"
            spellcheck="false" enterkeyhint="go" placeholder="CODE">
          <button class="btn btn--big btn--green" type="submit">UNLOCK</button>
        </form>
      `)
    );
    const form = codeSlot.querySelector("form");
    const field = form.querySelector("input");
    field.focus({ preventScroll: false });
    field.addEventListener("input", () => sfx.blip());
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const typed = field.value;
      if (!typed.trim()) return;
      if (card.codeOk(g, typed)) return unlock("code");
      sfx.error();
      wrongCodes++;
      field.classList.remove("is-wrong");
      void field.offsetWidth; // restart the shake
      field.classList.add("is-wrong");
      const owner = card.codeOwner(typed, GEMS);
      if (owner && owner.id !== g.id) {
        say(`That's the word from my ${gemLabel(owner)} card. Wrong gem, right idea!`);
      } else if (wrongCodes >= 3) {
        say("Still not it. It's one word, printed big under the square code. Spelling counts, spaces don't.");
      } else {
        say("Hmm, that's not it. Check the word under the code.");
      }
    });
  }

  async function unlockMissing() {
    if (g.geo) {
      try {
        const pos = await geo.here();
        if (geo.distance(pos, g.geo) <= g.geo.r + Math.min(pos.acc || 0, 50)) return unlock("gps");
        sfx.error();
        say("My map says you're not quite there yet. Get a little closer and snap again.");
      } catch {
        sfx.error();
        say("I can't tell where you are. Type the word under the code if you find the card.");
        showCodeForm();
      }
      return;
    }
    unlock("photo");
  }

  async function unlock(method) {
    const blob = await toKeepsake(photo.img);
    await store.savePhoto(g.id, blob);
    await store.update((s) => {
      s.found[g.id] = { at: new Date().toISOString(), method };
      delete s.verified[g.id];
    });
    go(`#/get/${g.id}`);
  }

  later(screen, () => {
    if (!screen.isConnected) return;
    say(
      verified()
        ? "My card checks out! Now snap a photo of it in front of the gem. That's your memory for the book."
        : [
            "Hold my card up in front of it and snap a photo.",
            "Get the gem in the background. That photo goes in your page of my book.",
          ]
    );
  }, 300);

  return screen;
}
