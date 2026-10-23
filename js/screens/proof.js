import { ray } from "../ui/sprites.js";
import { say, lit } from "../ui/dialogue.js";
import { el, esc, pad2 } from "../ui/dom.js";
import { hud, LOCATION_HELP } from "../ui/hud.js";
import { sfx } from "../audio/sfx.js";
import { GEMS, byId } from "../data/gems.js";
import * as store from "../core/store.js";
import { p, isFound, gemLabel } from "../core/progress.js";
import { go, later, onLeave, redirect } from "../core/router.js";
import { SKIP_GPS } from "../config.js";
import * as card from "../hunt/card.js";
import * as geo from "../hunt/geo.js";
import { loadImage, toKeepsake } from "../hunt/photo.js";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const BLOCKED_HELP = `${LOCATION_HELP}<br>Then come back and tap <b>TRY AGAIN</b>.`;

// Three steps, in order:
//   1. Check in by GPS (always).
//   2. Prove it: scan Ray's card live, or enter the number. Stops without a
//      number (code: null) skip this step; a card link counts as a scan.
//   3. A photo for the book. It's a keepsake and isn't checked.
export function proofScreen(id) {
  const g = byId(id);
  if (!g || g.stub) return redirect("#/map");
  if (isFound(g.id)) return redirect(`#/get/${g.id}`);

  let method = null; // how the stop was proven: "qr", "code" or "gps"
  let photo = null; // { img }
  let cluesShown = 0;
  let stopScan = null;
  const clues = g.clues || [];
  const warned = new Set(); // cards Ray already commented on during a live scan

  const screen = el(`
    <section class="screen proof" aria-label="Prove it">
      <div class="screen__body">
        <p class="gem__kicker pixel" data-act="${g.act}">GEM ${pad2(g.n)}/${GEMS.length} · PROVE IT</p>
        <div class="step step--where px-box" aria-live="polite">
          <p class="step__label pixel">CHECK IN</p>
          <p class="step__msg">Ray needs to see that you're really there.</p>
          <button class="btn btn--big btn--green" type="button" data-act="where">CHECK MY LOCATION</button>
        </div>
        <div class="step step--prove px-box" aria-live="polite" hidden>
          <p class="step__label pixel">RAY'S CARD</p>
          <p class="step__msg">Scan Ray's card if it's here. Can't find it? Enter the number instead.</p>
          <div class="scanner" hidden>
            <video class="scanner__video" playsinline muted></video>
            <span class="scanner__frame" aria-hidden="true"></span>
          </div>
          <div class="step__actions">
            <button class="btn btn--big btn--green" type="button" data-act="scan">SCAN RAY'S CARD</button>
            <label class="btn btn--blue camera" data-act="snap-card" hidden>
              <input type="file" accept="image/*" capture="environment" class="sr-only">
              <span>SNAP THE CARD</span>
            </label>
            <button class="btn btn--blue" type="button" data-act="number">ENTER THE NUMBER</button>
          </div>
          <div class="code-slot"></div>
        </div>
        <div class="step step--photo" hidden>
          <p class="step__label pixel">PHOTO FOR THE BOOK</p>
          <div class="viewfinder" aria-live="polite">
            <div class="viewfinder__empty">
              <span class="viewfinder__card">${ray(48)}<span class="pixel">SAY CHEESE</span></span>
              <span class="viewfinder__hint">${esc(g.photo || "Get the sign with the building's name in the shot.")}</span>
            </div>
          </div>
          <label class="btn btn--big camera" data-act="snap-photo">
            <input type="file" accept="image/*" capture="environment" class="sr-only">
            <span>SNAP PHOTO</span>
          </label>
        </div>
        <div class="proof__extra">
          <button class="btn btn--blue" type="button" data-act="back">BACK</button>
        </div>
      </div>
    </section>
  `);
  screen.prepend(hud(g));
  card.preload();
  onLeave(() => stopScan?.());

  const $ = (sel) => screen.querySelector(sel);
  const where = $(".step--where");
  const whereMsg = where.querySelector(".step__msg");
  const whereBtn = $("[data-act=where]");
  const prove = $(".step--prove");
  const proveMsg = prove.querySelector(".step__msg");
  const scanner = $(".scanner");
  const video = $(".scanner__video");
  const scanBtn = $("[data-act=scan]");
  const snapCard = $("[data-act=snap-card]");
  const codeSlot = $(".code-slot");
  const shoot = $(".step--photo");
  const finder = $(".viewfinder");
  const photoInput = $("[data-act=snap-photo] input");
  const photoLabel = $("[data-act=snap-photo] span");

  const verified = () => Boolean(p().verified[g.id]);
  const done = (step, html) => {
    step.classList.add("is-done");
    step.querySelector(".step__msg").innerHTML = html;
  };

  $("[data-act=back]").addEventListener("click", () => go(`#/gem/${g.id}`));

  // ---------- Step 1: GPS ----------

  const blocked = (html, line) => {
    sfx.error();
    whereMsg.innerHTML = html;
    whereBtn.textContent = "TRY AGAIN";
    whereBtn.disabled = false;
    if (line) say(line);
  };

  async function checkIn() {
    whereBtn.disabled = true;
    whereBtn.textContent = "CHECKING...";
    if (SKIP_GPS) return arrived("Location check skipped for testing (<code>?nogps</code>).");
    if (!g.geo) {
      console.error(`Gem ${g.n} has no geo, so nobody can check in there.`);
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
    const meters = Math.round(geo.distance(pos, g.geo));
    if (geo.isHere(pos, g.geo)) return arrived(`You're here: about ${meters} m from the spot.`);
    // Any order is fine: standing at a different stop? Offer to switch to it.
    const there = GEMS.find((o) => o.geo && !o.stub && !isFound(o.id) && geo.isHere(pos, o.geo));
    if (there) {
      blocked(`You're at ${esc(gemLabel(there))}, not this one.`);
      const yes = await say(`Wait...| you're standing at ${lit(gemLabel(there))}, not this one.| Want to do that gem instead?`, {
        choices: [
          { label: "SWITCH", value: true },
          { label: "NO, STAY", value: false, primary: false },
        ],
      });
      if (yes && screen.isConnected) go(`#/proof/${there.id}`);
      return;
    }
    blocked(
      `Not there yet: about ${Math.max(1, meters - g.geo.r)} m away${pos.acc > 50 ? ", and your signal is fuzzy. A window helps" : ""}.`,
      "My map says you're not quite there yet.| Get a little closer and try again."
    );
  }

  function arrived(note) {
    sfx.select();
    done(where, note);
    whereBtn.remove();
    if (verified()) {
      // The card was already read: from its link, or scanned at another stop.
      method = "qr";
      prove.hidden = false;
      done(prove, "Card already checked.");
      prove.querySelector(".step__actions").remove();
      return toPhoto("You're here, and my card checks out!| Now get a photo with the building. That one's for the book.");
    }
    if (!card.hasCode(g)) {
      method = "gps";
      return toPhoto([
        "Yep, you're here.| That's all the proof I need at this one.",
        "Now snap a photo with the place in it.| That one's for the book.",
      ]);
    }
    prove.hidden = false;
    say([
      "Yep, you're here.| Now show me my card.",
      "Can't find it? Somebody might've walked off with it.| Then tap *ENTER THE NUMBER*.",
    ]);
  }

  whereBtn.addEventListener("click", () => {
    sfx.select();
    checkIn();
  });

  // ---------- Step 2: Ray's card or the number ----------

  // Returns true when the text is this stop's card.
  function readCard(text) {
    const hit = card.parseFound(text);
    if (hit && hit.id === g.id && card.tokenOk(hit.id, hit.token)) return true;
    const key = hit ? hit.id : text;
    if (warned.has(key)) return false;
    warned.add(key);
    sfx.error();
    if (hit && card.tokenOk(hit.id, hit.token)) {
      const other = byId(hit.id);
      // Any order is fine, so the card still counts when they get to its stop.
      if (!isFound(other.id)) {
        store.update((s) => {
          s.verified[other.id] = true;
        });
      }
      say(
        isFound(other.id)
          ? `Ha, that's my card for ${lit(other.name)}.| You already have that one!`
          : `Wait...| that's my card for ${lit(gemLabel(other))}, not this one.| I'll remember it for that stop.`
      );
    } else {
      say("That's not one of my cards.| Look for the one with my face on it.");
    }
    return false;
  }

  function endScan() {
    stopScan?.();
    stopScan = null;
    scanner.hidden = true;
    scanBtn.textContent = "SCAN RAY'S CARD";
  }

  scanBtn.addEventListener("click", async () => {
    sfx.select();
    if (stopScan) return endScan();
    if (!card.liveSupported()) return cameraBlocked();
    scanner.hidden = false;
    scanBtn.textContent = "STOP SCANNING";
    proveMsg.textContent = "Point the camera at the square code on Ray's card.";
    try {
      stopScan = await card.startLive(video, (text) => {
        if (readCard(text)) proved("qr", "Card checked.");
      });
      if (!screen.isConnected) endScan();
    } catch {
      endScan();
      cameraBlocked();
    }
  });

  function cameraBlocked() {
    sfx.error();
    snapCard.hidden = false;
    proveMsg.textContent = "The camera won't open live here. Snap a photo of the card instead, or enter the number.";
    say("I can't open the camera live.| Snap a photo of my card instead.");
  }

  // Fallback when live video is blocked: one photo of the card.
  snapCard.querySelector("input").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    proveMsg.textContent = "Reading the card...";
    let text = null;
    try {
      text = await card.scan(await loadImage(file));
    } catch {}
    if (!screen.isConnected) return;
    if (text && readCard(text)) return proved("qr", "Card checked.");
    if (!text) {
      sfx.error();
      say("Hmm, I can't make out the code in that one.| Get closer, or enter the number.");
    }
    proveMsg.textContent = "Try another photo of the card, or enter the number.";
  });

  $("[data-act=number]").addEventListener("click", () => {
    sfx.select();
    endScan();
    showCodeForm();
  });

  function showCodeForm() {
    if (codeSlot.firstChild) {
      codeSlot.querySelector("input").focus();
      return;
    }
    codeSlot.appendChild(
      el(`
        <div>
          <form class="code-form" autocomplete="off">
            <label for="code" class="pixel">RAY'S NUMBER</label>
            <input id="code" class="px-input" maxlength="16" inputmode="numeric"
              spellcheck="false" enterkeyhint="go" placeholder="NUMBER">
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

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const typed = field.value;
      if (!typed.trim()) return;
      if (card.codeOk(g, typed)) return proved("code", "Number checks out.");
      sfx.error();
      field.classList.remove("is-wrong");
      void field.offsetWidth; // restart the shake
      field.classList.add("is-wrong");
      const owner = card.codeOwner(typed, GEMS);
      if (owner && owner.id !== g.id) {
        say(`That's my number for ${lit(gemLabel(owner))}.| Wrong stop, right idea!`);
      } else if (clues.length && cluesShown < clues.length) {
        say("Not quite.| Stuck? Tap *CLUE*.");
      } else {
        say("Still not it.| Look around one more time. Spaces don't count.");
      }
    });
  }

  function proved(how, note) {
    if (method) return;
    method = how;
    endScan();
    sfx.select();
    done(prove, note);
    prove.querySelector(".step__actions").remove();
    codeSlot.remove();
    toPhoto("That's the one.| Now get a photo with the building. That one's for the book.");
  }

  // ---------- Step 3: the photo for the book ----------

  function toPhoto(line) {
    shoot.hidden = false;
    shoot.scrollIntoView({ behavior: "smooth", block: "start" });
    say(line);
  }

  photoInput.addEventListener("change", async () => {
    const file = photoInput.files?.[0];
    photoInput.value = "";
    if (!file || !method) return;
    finder.innerHTML = `<p class="pixel scanning blink">DEVELOPING...</p>`;
    let img;
    try {
      img = await loadImage(file);
    } catch {
      finder.innerHTML = `<p class="viewfinder__hint">That photo didn't load. Try again?</p>`;
      sfx.error();
      return;
    }
    photo = { img };
    const url = URL.createObjectURL(file);
    finder.innerHTML = `<img class="viewfinder__img" src="${url}" alt="Your photo">`;
    photoLabel.textContent = "RETAKE PHOTO";
    photoInput.disabled = true;
    await inspect();
    URL.revokeObjectURL(url);
    if (screen.isConnected) unlock();
  });

  // Ray's once-over is just for fun: nothing reads or checks the photo.
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
      ["VIBES", pick(["IMMACULATE", "LEGENDARY", "ELITE"])],
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
    finder.appendChild(el(`<span class="inspect__stamp pixel">FOR THE BOOK</span>`));
    await wait(900);
    panel.remove();
  }

  async function unlock() {
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
