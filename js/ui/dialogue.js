// Typewriter dialogue box: tap to finish a line, tap again to advance.
//
// Lines can carry a little stage direction:
//   |        a beat (short pause)
//   *word*   emphasis: highlighted, typed a touch slower
//   ~aside~  an aside: dimmer, slower, a lower voice
//   ^word^   shaky (a word or two at most)
//   \*       a literal mark; wrap player-typed text in lit()
// Punctuation adds its own pauses, so most lines need no marks at all.

import { ray } from "./sprites.js";
import { sfx } from "../audio/sfx.js";

const CPS = 40;
const BEAT = 320;
const MARKS = { "*": "em", "~": "aside", "^": "shake" };
const STYLE = {
  em: { slow: 1.2, pitch: 1568 },
  aside: { slow: 1.4, pitch: 990 },
  shake: { slow: 1.5, pitch: 880 },
};
const MOOD = {
  wistful: { speed: 0.8, pitch: 1175 },
  spooky: { speed: 0.75, pitch: 880 },
};
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Pause after a character, in ms, judged by what comes next.
function pauseAfter(ch, next) {
  if (ch === "." && next === ".") return 160;
  if (next && !/\s/.test(next)) return 0;
  if (ch === ",") return 140;
  if (ch === ";" || ch === ":" || ch === "—") return 200;
  if (ch === "." || ch === "!" || ch === "?") return 280;
  if (ch === "…") return 360;
  return 0;
}

// Player-typed text (names, emails) goes through this so it's shown as-is.
export const lit = (s) => String(s).replace(/[|*~^\\]/g, "\\$&");

// Turns a marked-up line into styled characters with timings.
function parse(text) {
  const chars = [];
  const on = { em: false, aside: false, shake: false };
  let beat = 0;
  for (let i = 0; i < text.length; i++) {
    let ch = text[i];
    if (ch === "\\" && i + 1 < text.length) ch = text[++i];
    else if (ch === "|") {
      if (chars.length) chars[chars.length - 1].beat += BEAT;
      else beat += BEAT;
      continue;
    } else if (MARKS[ch]) {
      on[MARKS[ch]] = !on[MARKS[ch]];
      continue;
    }
    const style = Object.keys(on).filter((k) => on[k]).pop() || null;
    chars.push({ ch, style, beat: 0 });
  }
  chars.forEach((c, i) => (c.pause = pauseAfter(c.ch, chars[i + 1]?.ch) + c.beat));
  return { chars, lead: beat };
}

export const plain = (text) => parse(text).chars.map((c) => c.ch).join("");

// Builds hidden character spans so the line's layout never jumps.
function render(target, chars) {
  target.replaceChildren();
  let group = null;
  let groupStyle;
  const spans = chars.map((c) => {
    if (c.style !== groupStyle || !group) {
      groupStyle = c.style;
      group = c.style ? document.createElement("span") : target;
      if (c.style) {
        group.className = c.style;
        target.appendChild(group);
      }
    }
    const s = document.createElement("span");
    s.className = "ch";
    s.textContent = c.ch;
    group.appendChild(s);
    return s;
  });
  return spans;
}

let current = null;

// lines: string | {text, mood, name, speed} | an array of them.
// opts.choices: [{label, value, primary}]; resolves with the chosen value.
export function say(lines, opts = {}) {
  close();
  const list = (Array.isArray(lines) ? lines : [lines]).map((l) =>
    typeof l === "string" ? { text: l } : l
  );

  const box = document.createElement("div");
  box.className = "dialogue px-box";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-live", "polite");
  box.innerHTML = `
    <div class="dialogue__portrait"></div>
    <div class="dialogue__body">
      <p class="dialogue__name">${opts.name || "RAY BUCKNELL"}</p>
      <p class="dialogue__text" aria-hidden="true"></p>
      <p class="dialogue__sr sr-only"></p>
    </div>
    <span class="dialogue__more" aria-hidden="true">▼</span>
    <div class="dialogue__choices"></div>
  `;
  document.body.appendChild(box);

  const portrait = box.querySelector(".dialogue__portrait");
  const nameEl = box.querySelector(".dialogue__name");
  const textEl = box.querySelector(".dialogue__text");
  const srEl = box.querySelector(".dialogue__sr");
  const choicesEl = box.querySelector(".dialogue__choices");

  return new Promise((resolve) => {
    let i = -1;
    let timer = null;
    let typing = false;
    let spans = [];

    const finishLine = () => {
      clearTimeout(timer);
      typing = false;
      spans.forEach((s) => s.classList.add("is-on"));
      const last = i === list.length - 1;
      if (last && opts.choices?.length) {
        box.classList.remove("is-done");
        showChoices();
      } else {
        box.classList.add("is-done");
      }
    };

    const showChoices = () => {
      choicesEl.innerHTML = "";
      opts.choices.forEach((c, n) => {
        const b = document.createElement("button");
        b.className = c.primary === false ? "btn btn--blue" : "btn";
        b.textContent = c.label;
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          sfx.select();
          done(c.value);
        });
        choicesEl.appendChild(b);
        if (n === 0) b.focus({ preventScroll: true });
      });
    };

    const next = () => {
      i++;
      if (i >= list.length) return done(undefined);
      const line = list[i];
      const mood = line.mood || opts.mood || "happy";
      const voice = MOOD[mood] || {};
      const speed = line.speed || opts.speed || voice.speed || 1;
      const { chars, lead } = parse(line.text);
      nameEl.textContent = line.name || opts.name || "RAY BUCKNELL";
      portrait.innerHTML = ray(64, mood);
      srEl.textContent = chars.map((c) => c.ch).join("");
      spans = render(textEl, chars);
      box.classList.remove("is-done");
      choicesEl.innerHTML = "";

      if (reducedMotion()) {
        finishLine();
        return;
      }
      typing = true;
      let n = 0;
      let voiced = 0;
      const step = () => {
        if (n >= chars.length) return finishLine();
        const c = chars[n];
        spans[n].classList.add("is-on");
        if (!/\s/.test(c.ch) && voiced++ % 3 === 0) {
          sfx.blip(STYLE[c.style]?.pitch || voice.pitch);
        }
        n++;
        if (n >= chars.length) return finishLine();
        const slow = STYLE[c.style]?.slow || 1;
        timer = setTimeout(step, (1000 / CPS) * slow / speed + c.pause / speed);
      };
      timer = setTimeout(step, lead);
    };

    const advance = () => {
      if (choicesEl.childElementCount) return;
      if (typing) return finishLine();
      sfx.tick();
      next();
    };

    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (e.target instanceof HTMLButtonElement && box.contains(e.target)) return;
        if (e.target instanceof HTMLInputElement) return;
        e.preventDefault();
        advance();
      }
    };

    const done = (value) => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      box.remove();
      if (current === handle) current = null;
      resolve(value);
    };

    const handle = { close: () => done(undefined) };
    current = handle;

    box.addEventListener("click", advance);
    document.addEventListener("keydown", onKey);
    next();
  });
}

export function close() {
  current?.close();
}
