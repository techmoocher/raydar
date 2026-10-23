// Old Art Building: turn pipes until the creek runs from the left side to the right.

import { el } from "../ui/dom.js";
import { sfx } from "../audio/sfx.js";
import { button, rand } from "./kit.js";

const ROWS = 4;
const COLS = 4;
const N = 1;
const E = 2;
const S = 4;
const W = 8;
const turn = (m) => ((m << 1) | (m >> 3)) & 15;
const ARMS = { [N]: [2, 0], [E]: [4, 2], [S]: [2, 4], [W]: [0, 2] };

function pipeSvg(m) {
  const arms = [N, E, S, W]
    .filter((d) => m & d)
    .map((d) => `<rect x="${ARMS[d][0]}" y="${ARMS[d][1]}" width="2" height="2"/>`)
    .join("");
  return `<svg class="sprite" viewBox="0 0 6 6" aria-hidden="true"><rect x="2" y="2" width="2" height="2"/>${arms}</svg>`;
}

// A path that never doubles back: in each column it runs up or down, then east.
function layout() {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  const rIn = rand(ROWS);
  let r = rIn;
  for (let c = 0; c < COLS; c++) {
    const to = rand(ROWS);
    if (to === r) {
      grid[r][c] = W | E;
    } else {
      const d = to > r ? 1 : -1;
      grid[r][c] = W | (d > 0 ? S : N);
      for (let rr = r + d; rr !== to; rr += d) grid[rr][c] = N | S;
      grid[to][c] = (d > 0 ? N : S) | E;
    }
    r = to;
  }
  for (const row of grid) {
    row.forEach((m, c) => {
      if (!m) row[c] = Math.random() < 0.5 ? N | S : N | E;
    });
  }
  return { grid, rIn, rOut: r };
}

// Follows the water from the inlet. Returns the wet cells and whether it reached the outlet.
function flow(grid, rIn, rOut) {
  const wet = new Set();
  let r = rIn;
  let c = 0;
  let from = W;
  for (let steps = 0; steps <= ROWS * COLS; steps++) {
    const m = grid[r][c];
    if (!(m & from)) break;
    wet.add(r * COLS + c);
    const out = m & ~from;
    if (out === E && c === COLS - 1) return { wet, done: r === rOut };
    if (out === N) [r, from] = [r - 1, S];
    else if (out === S) [r, from] = [r + 1, N];
    else if (out === E) [c, from] = [c + 1, W];
    else [c, from] = [c - 1, E];
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break;
  }
  return { wet, done: false };
}

export default {
  title: "CREEK PIPES",
  how: "Tap a pipe to turn it. Connect the water on the left to the drain on the right.",
  intro: [
    "There's a whole creek running under this building.| Once, it backed up and turned the place into a dam.",
    "Tap the pipes to turn them, and get the water from the left side to the right.| ~Keep it flowing this time.~",
  ],
  win: "Flowing like it should.| ~No dam today.~",
  lose: "",

  mount(stage, { win, status }) {
    const { grid, rIn, rOut } = layout();
    do {
      grid.forEach((row) => row.forEach((m, c) => {
        for (let k = rand(4); k > 0; k--) row[c] = turn(row[c]);
      }));
    } while (flow(grid, rIn, rOut).done);

    let turns = 0;
    const board = el(`<div class="mg-grid mg-pipes" style="--cols:${COLS + 2}"></div>`);
    const cells = [];
    for (let r = 0; r < ROWS; r++) {
      board.append(el(`<span class="mg-pipes__end ${r === rIn ? "is-water" : ""}" aria-hidden="true"></span>`));
      for (let c = 0; c < COLS; c++) {
        const b = button("mg-cell mg-pipe");
        b.addEventListener("click", () => {
          grid[r][c] = turn(grid[r][c]);
          turns++;
          sfx.tick();
          if (render()) win();
        });
        board.append(b);
        cells.push(b);
      }
      board.append(el(`<span class="mg-pipes__end ${r === rOut ? "is-drain" : ""}" aria-hidden="true"></span>`));
    }
    const render = () => {
      const { wet, done } = flow(grid, rIn, rOut);
      cells.forEach((b, i) => {
        const r = Math.floor(i / COLS);
        const c = i % COLS;
        b.innerHTML = pipeSvg(grid[r][c]);
        b.classList.toggle("is-wet", wet.has(i));
        b.setAttribute("aria-label", `Pipe, row ${r + 1}, column ${c + 1}${wet.has(i) ? ", has water" : ""}`);
      });
      status(`TURNS ${turns} · WET ${wet.size}`);
      return done;
    };
    stage.append(board);
    render();
  },
};
