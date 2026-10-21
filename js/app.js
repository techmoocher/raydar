// Hash router and screens.

import { ray, rayFull, rayRun, hall, gem as gemSprite, lock, icon } from "./sprites.js";
import { say, close as closeDialogue } from "./dialogue.js";
import { sfx, unlock as unlockAudio } from "./sfx.js";
import * as music from "./music.js";
import { soundButton, close as closeSoundPanel } from "./sound-panel.js";
import { GEMS, ACTS, byId } from "./data/gems.js";
import * as store from "./store.js";
import * as proof from "./proof.js";
import * as geo from "./geo.js";
import { loadImage, toKeepsake } from "./photo.js";
import { renderPage, savePage } from "./report.js";
import { emailOn, validEmail, sendPage } from "./email.js";

const app = document.getElementById("app");
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- helpers ----------

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

const pad2 = (n) => String(n).padStart(2, "0");
const p = () => store.get();
const foundCount = () => Object.keys(p().found).length;
const isFound = (id) => Boolean(p().found[id]);

const currentGem = () => GEMS.find((g) => !isFound(g.id)) || null;

const isOpen = (g) => isFound(g.id) || currentGem()?.id === g.id;

function worldOf(g) {
  return (g || currentGem() || GEMS[GEMS.length - 1]).act;
}

// Runs after the screen is on the page (after the wipe).
function later(screen, fn, ms = 0) {
  (screen._enter ??= []).push(() => setTimeout(fn, reducedMotion() ? 0 : ms));
}

let leaveHooks = [];
const onLeave = (fn) => leaveHooks.push(fn);

export function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

function wipe() {
  if (reducedMotion()) return Promise.resolve();
  const w = document.createElement("div");
  w.className = "wipe";
  w.innerHTML = "<span></span>".repeat(8 * 14);
  document.body.appendChild(w);
  requestAnimationFrame(() => w.classList.add("is-in"));
  return new Promise((res) =>
    setTimeout(() => {
      res();
      setTimeout(() => w.remove(), 60);
    }, 480)
  );
}

// Stars stay in the side margins and top strip, never behind text.
function starfield(count = 24) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const edge = Math.random();
    const x = edge < 0.4 ? Math.random() * 9 : edge < 0.8 ? 91 + Math.random() * 8 : Math.random() * 100;
    const y = edge < 0.8 ? Math.random() * 70 : Math.random() * 7;
    const cls = Math.random() < 0.55 ? "dim" : Math.random() < 0.5 ? "gold" : "";
    s += `<i class="${cls}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%"></i>`;
  }
  return `<div class="stars" aria-hidden="true">${s}</div>`;
}

function meadow(count = 40) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 96);
    const y = Math.floor(Math.random() * 100);
    const r = Math.random();
    const cls = r < 0.12 ? "flower flower--gold" : r < 0.22 ? "flower flower--cherry" : "tuft";
    s += `<i class="${cls}" style="left:${x}%;top:${y}%"></i>`;
  }
  return `<div class="meadow" aria-hidden="true">${s}</div>`;
}

function ground() {
  return `
    <div class="ground" aria-hidden="true">
      <i class="flower flower--gold" style="left:12%"></i>
      <i class="flower flower--cherry" style="left:22%"></i>
      <i class="flower flower--gold" style="left:78%"></i>
      <i class="flower flower--cherry" style="left:88%"></i>
    </div>`;
}

function hud(g) {
  const bar = el(`
    <header class="hud" data-act="${worldOf(g)}">
      <span class="hud__world">WORLD ${worldOf(g)}</span>
      <span class="hud__gems" aria-label="${foundCount()} of ${GEMS.length} gems found">${gemSprite(16)}${pad2(foundCount())}/${GEMS.length}</span>
      <span class="hud__bars" hidden aria-label="Signal"></span>
    </header>
  `);
  bar.appendChild(soundButton("hud__sound"));
  return bar;
}

function setBars(screen, n) {
  const b = screen.querySelector(".hud__bars");
  if (!b) return;
  b.hidden = n == null;
  if (n != null) {
    b.innerHTML = geo.barsText(n);
    b.setAttribute("aria-label", `Signal ${n} of 4`);
  }
}

function saveNote() {
  return store.persistent
    ? ""
    : `<p class="note">Heads up: this browser won't keep your progress if you close the tab.</p>`;
}

// ---------- title ----------

function titleScreen() {
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

  on("start", () => go("#/intro"));
  on("continue", () => go("#/map"));
  on("new", async () => {
    const ok = await say("Start over? Your photos and progress will be erased.", {
      choices: [
        { label: "ERASE", value: true },
        { label: "KEEP", value: false, primary: false },
      ],
    });
    if (!ok) return;
    await store.reset();
    go("#/intro");
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
      say("Save wiped. Fresh start!");
    }, 1200);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((e) => logo.addEventListener(e, cancel));
  logo.addEventListener("contextmenu", (e) => e.preventDefault());

  if (pendingDeepLink && !saved) {
    later(screen, () => say("Hey, that's one of my cards! Press start and I'll explain."), 300);
  }
  return screen;
}

// ---------- intro ----------

function introScreen() {
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
    pendingDeepLink = null;
    go(scanned ? `#/proof/${scanned}` : "#/map");
  });
}

// ---------- email ----------

// Resolves with the saved address, or null if skipped.
function emailForm(slot, { skipLabel = "SKIP" } = {}) {
  slot.replaceChildren(
    el(`
      <form class="name-form email-form px-box" autocomplete="on" novalidate>
        <label for="player-email">WHERE SHOULD RAY SEND IT?</label>
        <input id="player-email" class="px-input px-input--email" type="email" name="email"
          autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false"
          enterkeyhint="done" maxlength="254" placeholder="you@bucknell.edu" value="${esc(p().email)}">
        <p class="fineprint">Only used to send you your page. Never stored or shared.</p>
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
        say("Hmm, that address looks off. Something like you@bucknell.edu?");
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

async function offerEmail(slot) {
  const yes = await say("Want me to mail you your page of my book? Photos, times, the works. Totally optional.", {
    choices: [
      { label: "SURE", value: true },
      { label: "NO THANKS", value: false, primary: false },
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
      await say("Got it. Whenever you want it, hit EMAIL MY PAGE in my book.");
      return;
    }
  }
  await say("No problem. My book's always open if you change your mind.");
}

// ---------- map ----------

const ROW = 104;
const BANNER = 64;
const XS = [50, 74, 50, 26]; // node x positions, %

function mapScreen() {
  const cur = currentGem();
  const screen = el(`
    <section class="screen map" aria-label="Map">
      ${meadow(48)}
    </section>
  `);
  screen.prepend(hud(cur));

  let y = 16;
  let lastAct = null;
  const items = [];
  const points = [];
  GEMS.forEach((g, i) => {
    if (g.act !== lastAct) {
      items.push({ type: "banner", act: g.act, y });
      y += BANNER;
      lastAct = g.act;
    }
    const x = XS[i % XS.length];
    items.push({ type: "node", g, x, y });
    points.push([x, y + 28]);
    y += ROW;
  });
  const height = y + 24;

  const path = points.map(([x, py]) => `${x},${py}`).join(" ");
  const world = el(`
    <div class="map__world" style="height:${height}px">
      <svg class="map__path" viewBox="0 0 100 ${height}" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="${path}" />
      </svg>
    </div>
  `);

  items.forEach((it) => {
    if (it.type === "banner") {
      const label = it.act === 4 ? ACTS[4] : `WORLD ${it.act}: ${ACTS[it.act]}`;
      world.appendChild(el(`<h2 class="map__banner" data-act="${it.act}" style="top:${it.y}px">${esc(label)}</h2>`));
      return;
    }
    const { g } = it;
    const found = isFound(g.id);
    const current = cur?.id === g.id;
    const state = found ? "found" : current ? "current" : "locked";
    const label = found || current ? g.name : "???";
    const node = el(`
      <button class="node node--${state}" type="button" style="left:${it.x}%;top:${it.y}px"
        aria-label="Gem ${g.n}: ${esc(label)}${found ? ", found" : current ? ", next" : ", locked"}"
        ${state === "locked" ? "disabled" : ""}>
        <span class="node__pad">${found ? gemSprite(28) : current ? `<span class="node__n">${pad2(g.n)}</span>` : lock(24)}</span>
        <span class="node__label">${esc(label)}</span>
      </button>
    `);
    node.addEventListener("click", () => {
      sfx.select();
      go(found ? "#/book" : `#/gem/${g.id}`);
    });
    world.appendChild(node);
  });

  const nodes = items.filter((it) => it.type === "node");
  const target = nodes.find((it) => it.g.id === cur?.id) || nodes[nodes.length - 1];
  const start = nodes[nodes.indexOf(target) - 1] || target;
  const spot = (it) => ({ left: `calc(${it.x}% - 76px)`, top: `${it.y + 10}px` });
  const runner = el(`<div class="runner" aria-hidden="true">${rayRun(44)}</div>`);
  Object.assign(runner.style, spot(start));
  if (target.x < start.x) runner.classList.add("is-left");
  world.appendChild(runner);
  later(screen, () => {
    if (start === target) return;
    runner.classList.add("is-running");
    requestAnimationFrame(() => Object.assign(runner.style, spot(target)));
    setTimeout(() => runner.classList.remove("is-running", "is-left"), reducedMotion() ? 0 : 1300);
  }, 250);

  const body = el(`<div class="map__body"></div>`);
  body.appendChild(world);
  body.insertAdjacentHTML("beforeend", saveNote());
  screen.appendChild(body);

  const dock = el(`
    <nav class="dock">
      ${
        cur
          ? `<button class="btn btn--big dock__go" type="button" data-act="go">
               <span class="dock__go-n">GEM ${pad2(cur.n)}</span>
               <span>GO: ${esc(cur.name)}</span>
             </button>`
          : ""
      }
      <div class="dock__row">
        <button class="btn btn--blue" type="button" data-act="book">RAY'S BOOK</button>
        <button class="btn btn--blue" type="button" data-act="title">TITLE</button>
      </div>
    </nav>
  `);
  dock.querySelector("[data-act=go]")?.addEventListener("click", () => {
    sfx.select();
    go(`#/gem/${cur.id}`);
  });
  dock.querySelector("[data-act=book]").addEventListener("click", () => go("#/book"));
  dock.querySelector("[data-act=title]").addEventListener("click", () => go("#/title"));
  screen.appendChild(dock);

  later(screen, () => {
    screen.querySelector(".node--current")?.scrollIntoView({ block: "center", behavior: "instant" });
  });

  if (!p().tips?.map && cur) {
    later(screen, async () => {
      if (!screen.isConnected) return;
      await say([
        "This is my map of campus. Twelve gems, one path.",
        "The orange spot is where we're headed. Tap GO when you're ready.",
      ]);
      store.update((s) => {
        s.tips = { ...s.tips, map: true };
      });
    }, 300);
  }
  return screen;
}

// ---------- gem (riddle) ----------

function gemScreen(id) {
  const g = byId(id);
  if (!g || !isOpen(g)) return redirect("#/map");

  const screen = el(`
    <section class="screen gem" aria-label="${esc(g.name)}">
      <div class="screen__body">
        <p class="gem__kicker pixel" data-act="${g.act}">GEM ${pad2(g.n)}/${GEMS.length}</p>
        <div class="scroll">
          ${
            g.stub
              ? `<p class="scroll__text">Ray is still writing this riddle. Check back soon!</p>`
              : `<p class="scroll__text">${g.riddle.map((l) => `<span>${esc(l)}</span>`).join("")}</p>`
          }
        </div>
        <div class="hints" aria-live="polite"></div>
        <div class="gem__actions">
          ${g.stub ? "" : `<button class="btn btn--gold" type="button" data-act="hint">HINT</button>`}
          <button class="btn btn--big" type="button" data-act="found" ${g.stub ? "disabled" : ""}>I FOUND IT!</button>
          <button class="btn btn--blue" type="button" data-act="map">MAP</button>
        </div>
      </div>
    </section>
  `);
  screen.prepend(hud(g));

  let hintsShown = 0;
  const hints = screen.querySelector(".hints");
  const hintBtn = screen.querySelector("[data-act=hint]");
  hintBtn?.addEventListener("click", () => {
    if (hintsShown >= g.hints.length) return;
    sfx.select();
    hints.appendChild(
      el(`<p class="hint px-box"><span class="pixel">HINT ${hintsShown + 1}</span> ${esc(g.hints[hintsShown])}</p>`)
    );
    hintsShown++;
    hintBtn.textContent = hintsShown < g.hints.length ? "BIGGER HINT" : "NO MORE HINTS";
    hintBtn.disabled = hintsShown >= g.hints.length;
  });
  screen.querySelector("[data-act=found]").addEventListener("click", () => {
    sfx.select();
    go(`#/proof/${g.id}`);
  });
  screen.querySelector("[data-act=map]").addEventListener("click", () => go("#/map"));

  const startBars = () => {
    onLeave(geo.watch(g.geo, ({ bars }) => setBars(screen, bars), () => setBars(screen, null)));
  };

  later(screen, async () => {
    if (!screen.isConnected || g.stub) return;
    if (!p().tips?.gem) {
      await say([
        "Every gem starts with one of my riddles. Read it, then go find the place.",
        "Stuck? Tap HINT. Tap it again if you're really stuck. I won't tell.",
        "When you're standing there, hit I FOUND IT!",
      ]);
      if (!screen.isConnected) return;
      await store.update((s) => {
        s.tips = { ...s.tips, gem: true };
      });
    }
    if (g.geo && geo.supported()) {
      if (geo.choice() === "yes") return startBars();
      if (geo.choice() === null) {
        const yes = await say(
          [
            "One more thing. If you let me see where you are, I'll show signal bars up top.",
            "More bars means you're getting warmer. That's all I use it for. Deal?",
          ],
          {
            choices: [
              { label: "SURE", value: true },
              { label: "NO THANKS", value: false, primary: false },
            ],
          }
        );
        geo.setChoice(yes ? "yes" : "no");
        if (yes && screen.isConnected) startBars();
      }
    }
  }, 300);

  return screen;
}

// ---------- proof ----------

function proofScreen(id) {
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
        <p class="gem__kicker pixel" data-act="${g.act}">GEM ${pad2(g.n)} · ${esc(g.name)}</p>
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
  proof.preload();

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
      text = await proof.scan(img);
    } catch {}
    if (!screen.isConnected) return;
    finder.querySelector(".scanning")?.remove();

    const hit = proof.parseFound(text);
    if (hit && hit.id === g.id && proof.tokenOk(hit.id, hit.token)) return unlock("qr");
    if (hit && proof.tokenOk(hit.id, hit.token)) {
      sfx.error();
      const other = byId(hit.id);
      say(`Ha! That's my card for ${other.name}. This gem's card is somewhere else.`);
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
      if (proof.codeOk(g, typed)) return unlock("code");
      sfx.error();
      wrongCodes++;
      field.classList.remove("is-wrong");
      void field.offsetWidth; // restart the shake
      field.classList.add("is-wrong");
      const owner = proof.codeOwner(typed, GEMS);
      if (owner && owner.id !== g.id) {
        say(`That's the word from my ${owner.name} card. Wrong gem, right idea!`);
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

// ---------- ITEM GET ----------

const CONFETTI = ["gold", "cherry", "leaf", "plum", "gem", "orange", "paper"];
function confetti(count = 36) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 100);
    const delay = (Math.random() * 0.6).toFixed(2);
    const dur = (1.4 + Math.random() * 1.2).toFixed(2);
    const size = Math.random() < 0.3 ? 12 : 8;
    s += `<i style="left:${x}%;width:${size}px;height:${size}px;background:var(--${CONFETTI[i % CONFETTI.length]});animation-delay:${delay}s;animation-duration:${dur}s"></i>`;
  }
  return `<div class="confetti" aria-hidden="true">${s}</div>`;
}

function getScreen(id) {
  const g = byId(id);
  if (!g || !isFound(g.id)) return redirect("#/map");
  const next = currentGem();

  const screen = el(`
    <section class="screen get" aria-label="Item get">
      ${starfield(40)}
      <div class="flash" aria-hidden="true"></div>
      ${confetti()}
      <div class="get__stage">
        <div class="get__gem"><div class="spin">${gemSprite(96)}</div></div>
        <p class="get__label pixel">YOU FOUND:</p>
        <h1 class="get__name pixel">${esc(g.name)}!</h1>
        <figure class="polaroid get__photo" hidden>
          <img alt="Your photo at ${esc(g.name)}">
          <figcaption class="pixel">GEM ${pad2(g.n)}</figcaption>
        </figure>
      </div>
    </section>
  `);

  store.getPhoto(g.id).then((blob) => {
    if (!blob) return;
    const fig = screen.querySelector(".get__photo");
    const url = URL.createObjectURL(blob);
    fig.querySelector("img").src = url;
    trackUrl(url);
    fig.hidden = false;
  });

  later(screen, () => {
    music.duck(2.2);
    sfx.itemGet();
  }, 150);

  later(screen, async () => {
    if (!screen.isConnected) return;
    await say(g.memory);
    if (!screen.isConnected) return;
    if (g.bonus) {
      await say(`BONUS SCROLL! ${g.bonus}`, { name: "SCROLL" });
      if (!screen.isConnected) return;
    }
    await say({ text: `${g.cardBack} — Ray`, mood: "proud" }, { name: "CARD BACK" });
    if (!screen.isConnected) return;
    const where = await say(
      next ? `Gem ${next.n} is unlocked. Onward!` : "That's all twelve. You did it!",
      {
        choices: [
          { label: "MAP", value: "#/map" },
          { label: "RAY'S BOOK", value: "#/book", primary: false },
        ],
      }
    );
    if (where) go(where);
  }, 2200);

  return screen;
}

// ---------- Ray's book (photo page) ----------

let liveUrls = [];
const trackUrl = (u) => liveUrls.push(u);
function releaseUrls() {
  liveUrls.forEach((u) => URL.revokeObjectURL(u));
  liveUrls = [];
}

function stamp(iso) {
  const d = new Date(iso);
  return d
    .toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })
    .toUpperCase();
}

function bookScreen() {
  const name = p().name || "PLAYER";
  const screen = el(`
    <section class="screen book" aria-label="Ray's book">
      <div class="screen__body">
        <h1 class="book__title pixel">RAY'S BOOK</h1>
        <p class="book__sub">${esc(name)}'s page · ${pad2(foundCount())}/${GEMS.length} gems</p>
        <div class="book__grid"></div>
        <div class="email-slot"></div>
        <div class="gem__actions book__actions">
          <button class="btn btn--big" type="button" data-act="email">EMAIL MY PAGE</button>
          <button class="btn btn--blue" type="button" data-act="save">SAVE PAGE</button>
          <button class="btn btn--blue" type="button" data-act="map">MAP</button>
        </div>
      </div>
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
    grid.appendChild(fig);
    if (f) {
      store.getPhoto(g.id).then((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        trackUrl(url);
        const img = new Image();
        img.alt = `Photo at ${g.name}`;
        img.src = url;
        fig.querySelector(".polaroid__frame").appendChild(img);
      });
    }
  });

  screen.querySelector("[data-act=map]").addEventListener("click", () => go("#/map"));

  const actions = screen.querySelectorAll(".book__actions .btn");
  const busy = (on) => actions.forEach((b) => (b.disabled = on));
  const emailSlot = screen.querySelector(".email-slot");

  async function savePicture(blob) {
    const how = await savePage(blob || (await renderPage()));
    if (how === "downloaded") say("Saved your page as a picture. Check your downloads!");
  }

  screen.querySelector("[data-act=save]").addEventListener("click", async () => {
    sfx.select();
    busy(true);
    say("Developing your page...");
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
      await say("My mail truck isn't running yet. I'll save your page as a picture instead.");
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
      to = await emailForm(emailSlot, { skipLabel: "CANCEL" });
      if (!to || !screen.isConnected) return;
    }

    busy(true);
    say("Licking the stamp...");
    try {
      const blob = await renderPage();
      const result = await sendPage(blob);
      if (!screen.isConnected) return;
      if (result.ok) {
        sfx.itemGet();
        say({ text: `Sent to ${to}! Check your inbox, and the spam folder. Mail carriers hate bison.`, mood: "proud" });
        return;
      }
      sfx.error();
      const why =
        result.error === "rate"
          ? "I've already mailed that address a few times today. Give my hooves a rest and try later."
          : result.error === "invalid"
            ? "The post office didn't like that address. Double-check it?"
            : "The mail truck's stuck in the mud.";
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

// ---------- deep link from a card's QR ----------

let pendingDeepLink = null;

function foundRoute(id, token) {
  if (!proof.tokenOk(id, token)) return redirect("#/title");
  store.update((s) => {
    if (!s.found[id]) s.verified[id] = true;
  });
  if (!store.hasSave()) {
    pendingDeepLink = id;
    return redirect("#/title");
  }
  return redirect(isFound(id) ? "#/book" : `#/proof/${id}`);
}

// ---------- router ----------

let redirecting = null;
function redirect(hash) {
  redirecting = hash;
  return null;
}

const needsSave = (fn) => (...args) => (store.hasSave() ? fn(...args) : redirect("#/title"));

const routes = [
  [/^#?\/?$/, titleScreen],
  [/^#\/title$/, titleScreen],
  [/^#\/intro$/, introScreen],
  [/^#\/map$/, needsSave(mapScreen)],
  [/^#\/gem\/([a-z]+)$/, needsSave(gemScreen)],
  [/^#\/proof\/([a-z]+)$/, needsSave(proofScreen)],
  [/^#\/get\/([a-z]+)$/, needsSave(getScreen)],
  [/^#\/book$/, needsSave(bookScreen)],
  [/^#\/found\/([a-z]+)\/([a-z0-9]+)$/, foundRoute],
];

let first = true;

const SCREEN_MUSIC = {
  title: "title",
  intro: "title",
  map: "overworld",
  gem: "riddle",
  proof: "riddle",
  get: "overworld",
  book: "overworld",
};

async function render() {
  const hash = location.hash || "#/";
  leaveHooks.forEach((fn) => fn());
  leaveHooks = [];
  releaseUrls();
  let screen = null;
  redirecting = null;
  const route = routes.find(([re]) => re.test(hash));
  if (route) {
    const args = hash.match(route[0]).slice(1);
    screen = route[1](...args);
  } else {
    redirecting = "#/title";
  }
  if (redirecting) {
    history.replaceState(null, "", redirecting);
    return render();
  }

  if (!first) await wipe();
  first = false;
  app.replaceChildren(); // detach first so pending dialogue callbacks bail out
  closeDialogue();
  closeSoundPanel();
  app.appendChild(screen);
  window.scrollTo(0, 0);
  music.play(SCREEN_MUSIC[location.hash.split("/")[1] || "title"] || "overworld");
  screen._enter?.forEach((fn) => fn());
}

window.addEventListener("hashchange", render);

// Phones only allow audio after a user gesture.
const firstTap = () => {
  unlockAudio();
  ["click", "touchend", "keydown"].forEach((e) => document.removeEventListener(e, firstTap, true));
};
["click", "touchend", "keydown"].forEach((e) => document.addEventListener(e, firstTap, true));

store.init().then(render);
