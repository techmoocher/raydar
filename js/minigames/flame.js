// Malesardi Quad: pass the flame through every spot in one unbroken line.
// The board is built from a real path, so it always has a solution.

import { el } from "../ui/dom.js";
import { sfx } from "../audio/sfx.js";
import { mini } from "../ui/sprites.js";
import { around, button, rand, shuffle } from "./kit.js";

const COLS = 4;
const ROWS = 5;
const OPEN = 18; // the other two spots are blocked

function makePath() {
  for (;;) {
    let budget = 5000;
    const path = [rand(COLS * ROWS)];
    const used = new Set(path);
    const grow = () => {
      if (path.length === OPEN) return true;
      if (--budget < 0) return false;
      for (const n of shuffle(around(path.at(-1), COLS, ROWS).filter((i) => !used.has(i)))) {
        path.push(n);
        used.add(n);
        if (grow()) return true;
        path.pop();
        used.delete(n);
      }
      return false;
    };
    if (grow()) return path;
  }
}

export default {
  title: "PASS THE FLAME",
  how: "Start at the lit spot. Tap a neighbor to pass the flame on. Light every spot in one line. Tap the newest flame to step back.",
  intro: [
    "At convocation, the flame gets passed hand to hand, one person at a time.",
    "Start from the lit one and pass it to a neighbor.| Light every spot in one unbroken line.| ~Tap the newest flame to step back.~",
  ],
  win: "Every flame lit.| ~That's a whole class, right there.~",
  lose: "",

  mount(stage, { win, status }) {
    const path = makePath();
    const open = new Set(path);
    const lit = [path[0]];

    const grid = el(`<div class="mg-grid mg-flame" style="--cols:${COLS}"></div>`);
    const cells = [...Array(COLS * ROWS).keys()].map((i) => {
      const b = button("mg-cell mg-spot");
      if (!open.has(i)) {
        b.disabled = true;
        b.classList.add("is-block");
        b.setAttribute("aria-label", "Blocked");
      }
      b.addEventListener("click", () => tap(i));
      grid.append(b);
      return b;
    });

    function tap(i) {
      const head = lit.at(-1);
      if (i === head && lit.length > 1) {
        lit.pop();
        sfx.tick();
      } else if (!lit.includes(i) && around(head, COLS, ROWS).includes(i)) {
        lit.push(i);
        sfx.tick();
      } else {
        return;
      }
      render();
      if (lit.length === OPEN) win();
    }

    function render() {
      const head = lit.at(-1);
      const stuck = !around(head, COLS, ROWS).some((i) => open.has(i) && !lit.includes(i));
      cells.forEach((b, i) => {
        if (!open.has(i)) return;
        const on = lit.includes(i);
        b.innerHTML = mini(on ? "flame" : "wick", 26);
        b.classList.toggle("is-lit", on);
        b.classList.toggle("is-head", i === head);
        b.setAttribute("aria-label", `Row ${Math.floor(i / COLS) + 1}, column ${(i % COLS) + 1}, ${i === head ? "newest flame" : on ? "lit" : "unlit"}`);
      });
      status(`LIT ${lit.length}/${OPEN}${stuck && lit.length < OPEN ? " · STUCK: STEP BACK" : ""}`);
    }

    stage.append(grid);
    render();
  },
};
