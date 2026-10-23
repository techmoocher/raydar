// Carnegie Building: move the stack of books (Tower of Hanoi, four books).

import { el } from "../ui/dom.js";
import { sfx } from "../audio/sfx.js";
import { button } from "./kit.js";

const BOOKS = 4;
const LIMIT = 25;
const PILES = ["OLD", "CART", "NEW"];

export default {
  title: "MOVING DAY",
  how: "Tap a pile to lift its top book, then tap where it goes. Never stack a big book on a smaller one.",
  intro: [
    "When the new library opened, every book in this building had to move.",
    "Shift the whole stack from *OLD* to *NEW*, one book at a time.| Big books never go on smaller ones.| ~You get 25 moves.~",
  ],
  win: "All moved in, and not one spine cracked.",
  lose: "Out of moves, and the stack's still stuck.| Try again?",

  mount(stage, { win, lose, status }) {
    const piles = [[...Array(BOOKS)].map((_, i) => BOOKS - i), [], []];
    let held = null;
    let moves = 0;
    let note = "";

    const board = el(`<div class="mg-books"></div>`);
    const cols = PILES.map((name, i) => {
      const b = button("mg-pile");
      b.addEventListener("click", () => tap(i));
      board.append(b);
      return b;
    });

    function tap(i) {
      note = "";
      if (held === null) {
        if (!piles[i].length) return;
        held = i;
        sfx.tick();
      } else if (held === i) {
        held = null;
      } else {
        const book = piles[held].at(-1);
        const under = piles[i].at(-1);
        if (under && under < book) {
          sfx.error();
          note = " · TOO BIG";
          held = null;
          return render();
        }
        piles[i].push(piles[held].pop());
        held = null;
        moves++;
        sfx.tick();
      }
      render();
      if (piles[2].length === BOOKS) return win();
      if (moves >= LIMIT) return lose();
    }

    function render() {
      cols.forEach((b, i) => {
        b.innerHTML = `
          <span class="mg-pile__stack">
            ${piles[i]
              .map((size, k) => {
                const up = held === i && k === piles[i].length - 1;
                return `<span class="mg-book mg-book--${size} ${up ? "is-up" : ""}" style="width:${25 + size * 17}%"></span>`;
              })
              .join("")}
          </span>
          <span class="mg-pile__name pixel">${PILES[i]}</span>
        `;
        b.classList.toggle("is-held", held === i);
        b.setAttribute("aria-label", `${PILES[i]} pile, ${piles[i].length} books${held === i ? ", top book lifted" : ""}`);
      });
      status(`MOVES ${moves}/${LIMIT}${note}`);
    }

    stage.append(board);
    render();
  },
};
