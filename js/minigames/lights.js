// Hunt Hall: Lights Out. A tap flips a window and its neighbours.

import { el } from "../ui/dom.js";
import { sfx } from "../audio/sfx.js";
import { around, button, shuffle } from "./kit.js";

const N = 3;

export default {
  title: "LIGHTS OUT",
  how: "Tap a window to flip it and the windows beside it. Make every window dark.",
  intro: [
    "Lights keep flicking on in here.| Nobody's touching them.| ~Nobody alive, anyway.~",
    "Tap a window and it flips, along with the ones right next to it.| Get them *all* dark.",
  ],
  win: "Lights out.| ~Whoever's in there can finally get some sleep.~",
  lose: "",

  mount(stage, { win, status }) {
    const lit = Array(N * N).fill(false);
    const press = (i) => [i, ...around(i, N, N)].forEach((j) => (lit[j] = !lit[j]));
    // Pressing distinct windows from all-dark never cancels out on 3×3.
    shuffle([...lit.keys()]).slice(0, 4).forEach(press);

    let moves = 0;
    const grid = el(`<div class="mg-grid mg-lights" style="--cols:${N}"></div>`);
    const cells = lit.map((_, i) => {
      const b = button("mg-cell mg-window");
      b.addEventListener("click", () => {
        press(i);
        moves++;
        sfx.tick();
        render();
        if (lit.every((on) => !on)) win();
      });
      grid.append(b);
      return b;
    });
    const render = () => {
      cells.forEach((b, i) => {
        b.classList.toggle("is-lit", lit[i]);
        b.setAttribute("aria-label", `Window ${i + 1}, ${lit[i] ? "lit" : "dark"}`);
      });
      status(`MOVES ${moves} · LIT ${lit.filter(Boolean).length}`);
    };
    stage.append(grid);
    render();
  },
};
