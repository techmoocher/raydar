// Roberts Hall: a 3×3 sliding puzzle. Put the record boxes back in order.

import { el } from "../ui/dom.js";
import { sfx } from "../audio/sfx.js";
import { around, button, rand } from "./kit.js";

const N = 3;
const SCRAMBLE = 16;

const solved = (tiles) => tiles.every((t, i) => t === (i + 1) % (N * N));

export default {
  title: "SAVE THE RECORDS",
  how: "Slide a box into the gap next to it. Get them back in order, 1 to 8.",
  intro: [
    "August 1932.| A fire took the middle of this building, and the university's records went with it.",
    "Slide the boxes back in order, *1* through *8*.| ~Mind the gap.~",
  ],
  win: "Every record back on the shelf.| ~The fire doesn't get the last word.~",
  lose: "",

  mount(stage, { win, status }) {
    const tiles = [...Array(N * N).keys()].map((i) => (i + 1) % (N * N));
    let gap = N * N - 1;
    do {
      let prev = -1;
      for (let k = 0; k < SCRAMBLE; k++) {
        const opts = around(gap, N, N).filter((i) => i !== prev);
        const pick = opts[rand(opts.length)];
        [tiles[gap], tiles[pick]] = [tiles[pick], tiles[gap]];
        prev = gap;
        gap = pick;
      }
    } while (solved(tiles));

    let moves = 0;
    const grid = el(`<div class="mg-grid mg-records" style="--cols:${N}"></div>`);
    const cells = tiles.map((_, i) => {
      const b = button("mg-cell mg-box");
      b.addEventListener("click", () => {
        if (!around(gap, N, N).includes(i)) return;
        [tiles[gap], tiles[i]] = [tiles[i], tiles[gap]];
        gap = i;
        moves++;
        sfx.tick();
        render();
        if (solved(tiles)) win();
      });
      grid.append(b);
      return b;
    });
    const render = () => {
      cells.forEach((b, i) => {
        const t = tiles[i];
        b.textContent = t || "";
        b.classList.toggle("is-gap", !t);
        b.classList.toggle("is-home", t === i + 1);
        b.setAttribute("aria-label", t ? `Box ${t}` : "Gap");
      });
      status(`MOVES ${moves}`);
    };
    stage.append(grid);
    render();
  },
};
