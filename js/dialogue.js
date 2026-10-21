// Typewriter text boxes pinned to the bottom of the screen.
// Tap once to finish the line, again to advance. A blinking ▼ means "more."

import { ray } from "./sprites.js";
import { sfx } from "./sfx.js";

const CPS = 40;
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let current = null;

// lines: string | {text, mood} | array of either.
// opts.choices: [{label, value, primary}] shown after the last line; the
// promise resolves with the chosen value (or undefined with no choices).
// opts.name: speaker label, default "RAY".
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
      <p class="dialogue__name">${opts.name || "RAY"}</p>
      <p class="dialogue__text"></p>
    </div>
    <span class="dialogue__more" aria-hidden="true">▼</span>
    <div class="dialogue__choices"></div>
  `;
  document.body.appendChild(box);

  const portrait = box.querySelector(".dialogue__portrait");
  const textEl = box.querySelector(".dialogue__text");
  const choicesEl = box.querySelector(".dialogue__choices");

  return new Promise((resolve) => {
    let i = -1;
    let timer = null;
    let typing = false;
    let full = "";

    const finishLine = () => {
      clearInterval(timer);
      typing = false;
      textEl.textContent = full;
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
      full = line.text;
      portrait.innerHTML = ray(64, line.mood || opts.mood || "happy");
      box.classList.remove("is-done");
      choicesEl.innerHTML = "";

      if (reducedMotion()) {
        finishLine();
        return;
      }
      let n = 0;
      typing = true;
      textEl.textContent = "";
      timer = setInterval(() => {
        n++;
        textEl.textContent = full.slice(0, n);
        if (n % 3 === 0 && full[n - 1] !== " ") sfx.blip();
        if (n >= full.length) finishLine();
      }, 1000 / CPS);
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
      clearInterval(timer);
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
