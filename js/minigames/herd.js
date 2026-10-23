// Bucky (KLARC): push the runaway calf into his pen (one-box Sokoban).
// The level was checked with a solver: 20 moves, 8 pushes at best.

import { el } from "../ui/dom.js";
import { sfx } from "../audio/sfx.js";
import { rayRun, mini, icon } from "../ui/sprites.js";
import { button } from "./kit.js";

// # wall, . pen, C calf, P Ray
const LEVEL = [
  " #  .",
  "     ",
  "  # #",
  "   CP",
  "   # ",
];
const ROWS = LEVEL.length;
const COLS = LEVEL[0].length;
const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const KEYS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };

const find = (ch) => {
  const r = LEVEL.findIndex((row) => row.includes(ch));
  return [r, LEVEL[r].indexOf(ch)];
};

export default {
  title: "ROUND UP",
  how: "Walk with the arrows or tap a square next to Ray. Push the calf into the gold pen. You can push, but you can't pull.",
  intro: [
    "One of the herd's calves ran off again.| ~He does this.~",
    "Push him into the *gold pen*.| You can push, but you can't pull, so stay out of the corners.",
  ],
  win: "Home safe.| ~Somebody get this kid a leash.~",
  lose: "He's wedged in a corner.| ~Classic calf move.~ Try again?",

  mount(stage, { win, lose, status }) {
    let me = find("P");
    let calf = find("C");
    const pen = find(".");
    let moves = 0;

    const wall = (r, c) => r < 0 || r >= ROWS || c < 0 || c >= COLS || LEVEL[r][c] === "#";
    const at = (a, r, c) => a[0] === r && a[1] === c;
    const cornered = ([r, c]) => (wall(r - 1, c) || wall(r + 1, c)) && (wall(r, c - 1) || wall(r, c + 1));

    const board = el(`
      <div class="mg-herd">
        <div class="mg-grid mg-yard" style="--cols:${COLS}"></div>
        <div class="mg-dpad">
          ${Object.keys(DIRS)
            .map((d) => `<button class="btn btn--blue mg-dpad__${d}" type="button" data-dir="${d}" aria-label="Move ${d}"><span class="mg-turn--${d}">${icon("play", 14)}</span></button>`)
            .join("")}
        </div>
      </div>
    `);
    const yard = board.querySelector(".mg-yard");
    const cells = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const b = button(`mg-cell mg-ground ${LEVEL[r][c] === "#" ? "is-wall" : ""}`);
        b.addEventListener("click", () => {
          const d = Object.keys(DIRS).find((k) => at([me[0] + DIRS[k][0], me[1] + DIRS[k][1]], r, c));
          if (d) step(d);
        });
        yard.append(b);
        cells.push(b);
      }
    }
    board.querySelectorAll("[data-dir]").forEach((b) => b.addEventListener("click", () => step(b.dataset.dir)));

    function step(d) {
      const [dr, dc] = DIRS[d];
      const next = [me[0] + dr, me[1] + dc];
      if (wall(...next)) return sfx.error();
      if (at(calf, ...next)) {
        const pushed = [calf[0] + dr, calf[1] + dc];
        if (wall(...pushed)) return sfx.error();
        calf = pushed;
      }
      me = next;
      moves++;
      sfx.tick();
      render();
      if (at(calf, ...pen)) return win();
      if (cornered(calf)) return lose();
    }

    function render() {
      cells.forEach((b, i) => {
        const r = Math.floor(i / COLS);
        const c = i % COLS;
        const isPen = at(pen, r, c);
        b.classList.toggle("is-pen", isPen);
        b.innerHTML = at(me, r, c) ? rayRun(30) : at(calf, r, c) ? mini("calf", 30) : "";
        const what = at(me, r, c) ? "Ray" : at(calf, r, c) ? "calf" : LEVEL[r][c] === "#" ? "wall" : isPen ? "pen" : "grass";
        b.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}: ${what}`);
      });
      status(`MOVES ${moves}`);
    }

    const onKey = (e) => {
      if (!KEYS[e.key] || !stage.isConnected || stage.classList.contains("is-over")) return;
      e.preventDefault();
      step(KEYS[e.key]);
    };
    document.addEventListener("keydown", onKey);

    stage.append(board);
    render();
    return () => document.removeEventListener("keydown", onKey);
  },
};
