// Mathewson Gates: find the catcher's mitt in three pitches.
// A miss leaves an arrow pointing toward the mitt.

import { el } from "../ui/dom.js";
import { sfx } from "../audio/sfx.js";
import { mini } from "../ui/sprites.js";
import { button, rand } from "./kit.js";

const N = 5;
const PITCHES = 3;
// [sprite, quarter turns] for each (row step, column step).
const ARROWS = {
  "-1,0": ["up", 0], "-1,1": ["upright", 0], "0,1": ["up", 1], "1,1": ["upright", 1],
  "1,0": ["up", 2], "1,-1": ["upright", 2], "0,-1": ["up", 3], "-1,-1": ["upright", 3],
};
const WORDS = {
  "-1,0": "higher", "-1,1": "higher and right", "0,1": "right", "1,1": "lower and right",
  "1,0": "lower", "1,-1": "lower and left", "0,-1": "left", "-1,-1": "higher and left",
};

export default {
  title: "STRIKE ZONE",
  how: "Tap a square to pitch. A miss shows an arrow toward the catcher's mitt. Three pitches to find it.",
  intro: [
    "One more before the finish line.| The catcher's mitt is hiding somewhere in this zone.",
    "Throw a pitch. If you miss, I'll point you toward the mitt.| ~Three pitches. Make them count.~",
  ],
  win: "Right in the mitt.| ~Somebody call the scouts.~",
  lose: "",

  mount(stage, { win, lose, status }) {
    const mitt = rand(N * N);
    const thrown = new Map(); // cell -> arrow key, or "hit"

    const grid = el(`<div class="mg-grid mg-zone" style="--cols:${N}"></div>`);
    const cells = [...Array(N * N).keys()].map((i) => {
      const b = button("mg-cell mg-plate");
      b.addEventListener("click", () => pitch(i));
      grid.append(b);
      return b;
    });

    function pitch(i) {
      if (thrown.has(i)) return;
      if (i === mitt) {
        thrown.set(i, "hit");
        sfx.select();
        render();
        return win();
      }
      const key = `${Math.sign(Math.floor(mitt / N) - Math.floor(i / N))},${Math.sign((mitt % N) - (i % N))}`;
      thrown.set(i, key);
      sfx.tick();
      render();
      if (thrown.size >= PITCHES) {
        cells[mitt].classList.add("is-mitt");
        cells[mitt].innerHTML = mini("mitt", 26);
        lose("Three wild pitches.| The mitt was right there.| Try again?");
      }
    }

    function render() {
      cells.forEach((b, i) => {
        const t = thrown.get(i);
        b.classList.toggle("is-thrown", Boolean(t));
        if (t === "hit") {
          b.innerHTML = mini("ball", 24);
          b.setAttribute("aria-label", "Strike");
        } else if (t) {
          const [name, turns] = ARROWS[t];
          b.innerHTML = `<span class="mg-turn" style="--turns:${turns}">${mini(name, 20)}</span>`;
          b.setAttribute("aria-label", `Missed. Mitt is ${WORDS[t]}`);
        } else {
          b.innerHTML = "";
          b.setAttribute("aria-label", `Row ${Math.floor(i / N) + 1}, column ${(i % N) + 1}`);
        }
      });
      status(`PITCHES LEFT ${PITCHES - thrown.size}`);
    }

    stage.append(grid);
    render();
  },
};
