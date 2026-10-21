// Router + screen state machine. Hash routes keep GitHub Pages from 404ing.

import { ray, gem as gemSprite, lock } from "./sprites.js";
import { say, close as closeDialogue } from "./dialogue.js";
import { sfx, unlock as unlockAudio, isOn as soundOn, setOn as setSound } from "./sfx.js";
import { GEMS, ACTS, byId } from "./data/gems.js";
import * as store from "./store.js";
import * as proof from "./proof.js";
import * as geo from "./geo.js";
import { loadImage, toKeepsake } from "./photo.js";

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

// The first gem in route order that isn't found yet.
const currentGem = () => GEMS.find((g) => !isFound(g.id)) || null;

// A gem is open if it's found or it's the current one.
const isOpen = (g) => isFound(g.id) || currentGem()?.id === g.id;

function worldOf(g) {
  return (g || currentGem() || GEMS[GEMS.length - 1]).act;
}

// Run fn `ms` after the screen is actually on the page (after the wipe).
function later(screen, fn, ms = 0) {
  (screen._enter ??= []).push(() => setTimeout(fn, reducedMotion() ? 0 : ms));
}

// Cleanup to run when the player leaves the current screen.
let leaveHooks = [];
const onLeave = (fn) => leaveHooks.push(fn);

export function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

// 4-frame checkerboard wipe, then swap the screen underneath.
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

function starfield(count = 48) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 100);
    const y = Math.floor(Math.random() * 100);
    const cls = [Math.random() < 0.4 ? "dim" : "", Math.random() < 0.25 ? "tw" : ""].join(" ");
    const delay = (Math.random() * 1.6).toFixed(1);
    s += `<i class="${cls}" style="left:${x}%;top:${y}%;animation-delay:-${delay}s"></i>`;
  }
  return `<div class="stars" aria-hidden="true">${s}</div>`;
}

// HUD: WORLD 1 · GEMS 01/12 · ▂▄▆█ · ♪
function hud(g) {
  const bar = el(`
    <header class="hud">
      <span>WORLD ${worldOf(g)}</span>
      <span class="hud__sep" aria-hidden="true">·</span>
      <span>GEMS ${pad2(foundCount())}/${GEMS.length}</span>
      <span class="hud__bars" hidden aria-label="Signal"></span>
      <button class="hud__sound" type="button" aria-label="Sound" aria-pressed="${soundOn()}">♪</button>
    </header>
  `);
  const btn = bar.querySelector(".hud__sound");
  btn.addEventListener("click", () => {
    unlockAudio();
    setSound(!soundOn());
    btn.setAttribute("aria-pressed", soundOn());
    sfx.tick();
  });
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
        <span class="title__hidden">HIDDEN</span>
        <span class="title__gems">GEMS</span>
      </h1>
      <p class="title__sub">RAY BUCKNELL'S HUNT</p>
      <div class="title__art">
        <div class="bob">${ray(120)}</div>
        <div class="spin">${gemSprite(40)}</div>
      </div>
      <div class="title__actions">
        ${
          saved
            ? `<button class="btn btn--big" type="button" data-act="continue">CONTINUE</button>
               <button class="btn btn--big btn--blue" type="button" data-act="new">NEW GAME</button>`
            : `<button class="press-start blink" type="button" data-act="start">PRESS START</button>`
        }
      </div>
      <p class="title__copy">© 1846 RAY BUCKNELL</p>
    </section>
  `);

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

  // Long-press the logo to wipe the save (for testers).
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
          <div class="walker is-walking">${ray(96)}</div>
        </div>
        <div class="name-slot"></div>
      </div>
    </section>
  `);

  later(screen, async () => {
    if (!screen.isConnected) return;
    screen.querySelector(".walker").classList.remove("is-walking");
    await say([
      { text: "HEY! Over here! Name's Ray. Ray Bucknell." },
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
        <button class="btn btn--big" type="submit">OK!</button>
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
    await say([
      { text: `${name}! Great name. I'll remember it.`, mood: "proud" },
      { text: "Our first gem is close. Real close. Let's look at the map." },
    ]);
    if (!screen.isConnected) return;
    // A card scanned with the phone's camera before the player had a save.
    const scanned = Object.keys(p().verified)[0];
    pendingDeepLink = null;
    go(scanned ? `#/proof/${scanned}` : "#/map");
  });
}

// ---------- map ----------

const ROW = 104;
const BANNER = 64;
const XS = [50, 74, 50, 26]; // zig-zag positions in %

function mapScreen() {
  const cur = currentGem();
  const screen = el(`
    <section class="screen map" aria-label="Map">
      ${starfield(36)}
    </section>
  `);
  screen.prepend(hud(cur));

  // Lay out banners and nodes top to bottom, then draw the path behind them.
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
      world.appendChild(el(`<h2 class="map__banner" style="top:${it.y}px">${esc(label)}</h2>`));
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
    if (current) {
      node.appendChild(el(`<span class="node__ray bob" aria-hidden="true">${ray(44)}</span>`));
    }
    node.addEventListener("click", () => {
      sfx.select();
      go(found ? "#/book" : `#/gem/${g.id}`);
    });
    world.appendChild(node);
  });

  const body = el(`<div class="map__body"></div>`);
  body.appendChild(world);
  body.insertAdjacentHTML("beforeend", saveNote());
  screen.appendChild(body);

  const dock = el(`
    <nav class="dock">
      <button class="btn btn--blue" type="button" data-act="book">RAY'S BOOK</button>
      <button class="btn btn--blue" type="button" data-act="title">TITLE</button>
    </nav>
  `);
  dock.querySelector("[data-act=book]").addEventListener("click", () => go("#/book"));
  dock.querySelector("[data-act=title]").addEventListener("click", () => go("#/title"));
  screen.appendChild(dock);

  // Bring the current node into view once it's on the page.
  later(screen, () => {
    screen.querySelector(".node--current")?.scrollIntoView({ block: "center", behavior: "instant" });
  });

  if (!p().tips?.map && cur) {
    later(screen, async () => {
      if (!screen.isConnected) return;
      await say([
        "This is my map of campus. Twelve gems, one path.",
        "The blinking spot is where we're headed. Tap it when you're ready.",
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
        <p class="gem__kicker pixel">GEM ${pad2(g.n)}/${GEMS.length}</p>
        <div class="scroll">
          ${
            g.stub
              ? `<p class="scroll__text">Ray is still writing this riddle. Check back soon!</p>`
              : `<p class="scroll__text">${g.riddle.map((l) => `<span>${esc(l)}</span>`).join("")}</p>`
          }
        </div>
        <div class="hints" aria-live="polite"></div>
        <div class="gem__actions">
          ${g.stub ? "" : `<button class="btn btn--blue" type="button" data-act="hint">HINT</button>`}
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

  // GPS bars, only with Ray's explanation first and only if the gem has coords.
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
        <p class="gem__kicker pixel">GEM ${pad2(g.n)} · ${esc(g.name)}</p>
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
          <button class="btn btn--big" type="submit">UNLOCK</button>
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

function getScreen(id) {
  const g = byId(id);
  if (!g || !isFound(g.id)) return redirect("#/map");
  const next = currentGem();

  const screen = el(`
    <section class="screen get" aria-label="Item get">
      ${starfield(40)}
      <div class="flash" aria-hidden="true"></div>
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

  later(screen, () => sfx.itemGet(), 150);

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
        <div class="gem__actions">
          <button class="btn btn--big" type="button" data-act="map">BACK TO MAP</button>
        </div>
      </div>
    </section>
  `);
  screen.prepend(hud());
  const grid = screen.querySelector(".book__grid");

  GEMS.forEach((g) => {
    const f = p().found[g.id];
    const fig = el(`
      <figure class="polaroid ${f ? "" : "polaroid--empty"}">
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
  app.replaceChildren(); // detach first so pending dialogue continuations bail out
  closeDialogue();
  app.appendChild(screen);
  window.scrollTo(0, 0);
  screen._enter?.forEach((fn) => fn());
}

window.addEventListener("hashchange", render);
store.init().then(render);
