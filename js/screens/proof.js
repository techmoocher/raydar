import { ray } from "../ui/sprites.js";
import { say, lit } from "../ui/dialogue.js";
import { el, esc, pad2 } from "../ui/dom.js";
import { hud } from "../ui/hud.js";
import { sfx } from "../audio/sfx.js";
import { GEMS, byId } from "../data/gems.js";
import * as store from "../core/store.js";
import { p, isFound, isOpen, gemLabel } from "../core/progress.js";
import { go, later, redirect } from "../core/router.js";
import { SKIP_GPS } from "../config.js";
import * as card from "../hunt/card.js";
import * as geo from "../hunt/geo.js";
import { loadImage, toKeepsake } from "../hunt/photo.js";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const BLOCKED_HELP = `
  <b>iPhone:</b> Settings → Privacy &amp; Security → Location Services → Safari Websites → While Using the App.<br>
  <b>Android:</b> tap the icon left of the address bar → Permissions → Location → Allow.<br>
  Then come back and tap <b>TRY AGAIN</b>.`;

// Three steps: check in by GPS, photo with the sign, then Ray's password.
// Ray's card is optional: a QR in the photo (or a card link) skips the password.
export function proofScreen(id) {
  const g = byId(id);
  if (!g || g.stub) return redirect("#/map");
  if (isFound(g.id)) return redirect(`#/get/${g.id}`);
  if (!isOpen(g) && !p().verified[g.id]) return redirect("#/map");

  let photo = null; // { img, url }
  let cluesShown = 0;
  const clues = g.clues || [];

  const screen = el(`
    <section class="screen proof" aria-label="Prove it">
      <div class="screen__body">
        <p class="gem__kicker pixel" data-act="${g.act}">GEM ${pad2(g.n)}/${GEMS.length} · PROVE IT</p>
        <div class="checkin px-box" aria-live="polite">
          <p class="checkin__label pixel">CHECK IN</p>
          <p class="checkin__msg">Ray needs to see that you're really there.</p>
          <button class="btn btn--big btn--green" type="button" data-act="where">CHECK MY LOCATION</button>
        </div>
        <div class="proof__shoot" hidden>
          <div class="viewfinder" aria-live="polite">
            <div class="viewfinder__empty">
              <span class="viewfinder__card">${ray(48)}<span class="pixel">SAY CHEESE</span></span>
              <span class="viewfinder__hint">${esc(g.photo || "Get the sign with the building's name in the shot.")}</span>
            </div>
          </div>
          <label class="btn btn--big camera">
            <input type="file" accept="image/*" capture="environment" class="sr-only">
            <span>SNAP PHOTO</span>
          </label>
          <div class="code-slot"></div>
        </div>
        <div class="proof__extra">
          <button class="btn btn--blue" type="button" data-act="back">BACK</button>
        </div>
      </div>
    </section>
  `);
  screen.prepend(hud(g));
  card.preload();

  const checkin = screen.querySelector(".checkin");
  const checkMsg = screen.querySelector(".checkin__msg");
  const whereBtn = screen.querySelector("[data-act=where]");
  const shoot = screen.querySelector(".proof__shoot");
  const finder = screen.querySelector(".viewfinder");
  const input = screen.querySelector("input[type=file]");
  const cameraLabel = screen.querySelector(".camera span");
  const codeSlot = screen.querySelector(".code-slot");

  const verified = () => Boolean(p().verified[g.id]);

  screen.querySelector("[data-act=back]").addEventListener("click", () => go(`#/gem/${g.id}`));

  // ---------- Step 1: GPS ----------

  const blocked = (html, line) => {
    sfx.error();
    checkMsg.innerHTML = html;
    whereBtn.textContent = "TRY AGAIN";
    whereBtn.disabled = false;
    if (line) say(line);
  };

  async function checkIn() {
    whereBtn.disabled = true;
    whereBtn.textContent = "CHECKING...";
    if (SKIP_GPS) return arrived("Location check skipped for testing (<code>?nogps</code>).");
    if (!g.geo) {
      console.error(`Gem "${g.id}" has no geo, so nobody can check in there.`);
      return blocked("This stop isn't on Ray's map yet.", "Huh.| This stop isn't on my map yet.| ~Tell whoever runs this hunt.~");
    }
    if (!geo.supported()) {
      return blocked("This browser can't share your location. Try Safari or Chrome.", "I can't see where you are in this browser.| Try Safari or Chrome?");
    }
    let pos;
    try {
      pos = await geo.here();
    } catch (err) {
      if (!screen.isConnected) return;
      if (err?.code === 1) {
        return blocked(
          `Location is blocked for this site. ${BLOCKED_HELP}`,
          "I need your location for this part.| It never leaves your phone, promise."
        );
      }
      return blocked(
        "Couldn't get a fix. Step outside or near a window, then try again.",
        "My map's a little foggy right now.| Try again by a window or outside."
      );
    }
    if (!screen.isConnected) return;
    if (geo.isHere(pos, g.geo)) return arrived();
    const off = Math.round(geo.distance(pos, g.geo) - g.geo.r);
    blocked(
      `About ${off} m away${pos.acc > 50 ? ", but your signal is fuzzy. A window helps" : ""}.`,
      "My map says you're not quite there yet.| Get a little closer and try again."
    );
  }

  function arrived(note = "You're here.") {
    sfx.select();
    checkin.classList.add("is-done");
    checkMsg.innerHTML = note;
    whereBtn.remove();
    shoot.hidden = false;
    say(
      verified()
        ? "You're here, and my card checks out!| Now get a photo with the sign. That one's for the book."
        : [
            "Yep, you're here.| Now snap a photo with the sign in it.",
            "That photo goes on your page in my book,| so make it a good one.",
          ]
    );
  }

  whereBtn.addEventListener("click", () => {
    sfx.select();
    checkIn();
  });

  // ---------- Step 2: photo (and a QR, if there's one in it) ----------

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
    finder.innerHTML = `<img class="viewfinder__img" src="${photo.url}" alt="Your photo">`;
    cameraLabel.textContent = "RETAKE PHOTO";
    input.disabled = true;

    // The QR scan runs while Ray looks the photo over.
    const scanning = verified() ? Promise.resolve(null) : card.scan(img).catch(() => null);
    await inspect();
    const text = await scanning;
    input.disabled = false;
    if (!screen.isConnected) return;
    if (verified()) return unlock("qr");

    const hit = card.parseFound(text);
    if (hit && hit.id === g.id && card.tokenOk(hit.id, hit.token)) return unlock("qr");
    if (hit && card.tokenOk(hit.id, hit.token)) {
      sfx.error();
      const other = byId(hit.id);
      await say(
        isFound(other.id)
          ? `Ha, that's my card for ${lit(other.name)}.| You already have that one!`
          : `Wait...| that's my card for ${lit(gemLabel(other))}. Wrong stop!| Remember this place, though. You'll be back.`
      );
    } else if (!codeSlot.firstChild) {
      await say([
        "Nice shot.| Now for my password.",
        "Every stop has one, hiding in plain sight.| ~Look at the place, not your phone.~",
      ]);
    }
    if (screen.isConnected) showCodeForm();
  });

  // Ray's once-over is just for show: nothing reads the photo except the QR scan.
  async function inspect() {
    const panel = el(`
      <div class="inspect" aria-live="polite">
        <p class="inspect__title pixel"><span class="inspect__ray" aria-hidden="true">${ray(32, "happy")}</span>RAY'S ONCE-OVER</p>
        <ul class="inspect__list pixel"></ul>
      </div>
    `);
    finder.appendChild(panel);
    const list = panel.querySelector(".inspect__list");
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const verdicts = [
      ["FRAMING", pick(["BOLD", "CINEMATIC", "TILTED. ON PURPOSE?"])],
      ["LIGHTING", pick(["MOODY", "ARTSY", "VERY OUTDOORS"])],
      ["VIBES", pick(["IMMACULATE", "BISON-APPROVED", "ELITE"])],
    ];
    for (const [what, verdict] of verdicts) {
      await wait(450);
      if (!screen.isConnected) return;
      sfx.blip();
      list.appendChild(el(`<li><span>${what}</span><span>${verdict}</span></li>`));
    }
    await wait(500);
    if (!screen.isConnected) return;
    sfx.select();
    finder.appendChild(el(`<span class="inspect__stamp pixel" aria-label="Approved">APPROVED</span>`));
    await wait(900);
    panel.remove();
  }

  // ---------- Step 3: Ray's password ----------

  function showCodeForm() {
    if (codeSlot.firstChild) {
      codeSlot.querySelector("input").focus();
      return;
    }
    codeSlot.appendChild(
      el(`
        <div>
          <form class="code-form px-box" autocomplete="off">
            <label for="code" class="pixel">RAY'S PASSWORD</label>
            <input id="code" class="px-input" maxlength="16" autocapitalize="characters"
              spellcheck="false" enterkeyhint="go" placeholder="PASSWORD">
            <div class="code-form__actions">
              <button class="btn btn--big btn--green" type="submit">UNLOCK</button>
              ${clues.length ? `<button class="btn btn--gold" type="button" data-act="clue">CLUE</button>` : ""}
            </div>
          </form>
          <div class="clues" aria-live="polite"></div>
        </div>
      `)
    );
    const form = codeSlot.querySelector("form");
    const field = form.querySelector("input");
    const clueBtn = form.querySelector("[data-act=clue]");
    field.focus({ preventScroll: false });
    field.addEventListener("input", () => sfx.blip());

    clueBtn?.addEventListener("click", () => {
      if (cluesShown >= clues.length) return;
      sfx.select();
      codeSlot.querySelector(".clues").appendChild(
        el(`<p class="hint px-box"><span class="pixel">CLUE ${cluesShown + 1}</span> ${esc(clues[cluesShown])}</p>`)
      );
      cluesShown++;
      clueBtn.textContent = cluesShown < clues.length ? "BIGGER CLUE" : "NO MORE CLUES";
      clueBtn.disabled = cluesShown >= clues.length;
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const typed = field.value;
      if (!typed.trim()) return;
      if (card.codeOk(g, typed)) return unlock("code");
      sfx.error();
      field.classList.remove("is-wrong");
      void field.offsetWidth; // restart the shake
      field.classList.add("is-wrong");
      const owner = card.codeOwner(typed, GEMS);
      if (owner && owner.id !== g.id) {
        say(`That's my password for ${lit(gemLabel(owner))}.| Wrong stop, right idea!`);
      } else if (clues.length && cluesShown < clues.length) {
        say("Not quite.| Stuck? Tap *CLUE*.");
      } else {
        say("Still not it.| Look around one more time. Spaces don't count.");
      }
    });
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

  later(screen, async () => {
    if (!screen.isConnected) return;
    // Already allowed? Skip the tap and check right away.
    if (SKIP_GPS || (await geo.permission()) === "granted") return checkIn();
    if (screen.isConnected) say("First things first.| Let me check that you're really there.");
  }, 300);

  return screen;
}
