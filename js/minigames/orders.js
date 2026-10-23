// The Flyson: memory match. Clear six orders in 14 moves or fewer.

import { el } from "../ui/dom.js";
import { sfx } from "../audio/sfx.js";
import { button, shuffle } from "./kit.js";

const ITEMS = ["TOTS", "COFFEE", "LATTE", "SALSA", "CHEESE", "COCOA"];
const LIMIT = 14;
const PEEK = 800;

export default {
  title: "MIDNIGHT ORDERS",
  how: "Flip two cards to find a matching pair. Clear all six orders in 14 moves or fewer.",
  intro: [
    "Midnight rush.| Six orders, and the tickets got scrambled.",
    "Flip two cards at a time to find a match.| Clear the counter in *14* moves or fewer.",
  ],
  win: "Order up!| ~The line actually moved for once.~",
  lose: "The truck's closing up.| Want to take the rush again?",

  mount(stage, { win, lose, status }) {
    const deck = shuffle([...ITEMS, ...ITEMS]);
    const matched = new Set();
    let open = [];
    let moves = 0;
    let timer = null;

    const grid = el(`<div class="mg-grid mg-orders" style="--cols:4"></div>`);
    const cards = deck.map((_, i) => {
      const b = button("mg-cell mg-card pixel");
      b.addEventListener("click", () => flip(i));
      grid.append(b);
      return b;
    });

    function flip(i) {
      if (timer || matched.has(i) || open.includes(i)) return;
      open.push(i);
      sfx.tick();
      if (open.length < 2) return render();
      moves++;
      const [a, b] = open;
      if (deck[a] === deck[b]) {
        matched.add(a).add(b);
        open = [];
        sfx.select();
        render();
        if (matched.size === deck.length) return win();
        if (moves >= LIMIT) return lose();
        return;
      }
      render();
      timer = setTimeout(() => {
        timer = null;
        open = [];
        render();
        if (moves >= LIMIT) lose();
      }, PEEK);
    }

    function render() {
      cards.forEach((b, i) => {
        const up = matched.has(i) || open.includes(i);
        b.textContent = up ? deck[i] : "?";
        b.classList.toggle("is-up", up);
        b.classList.toggle("is-done", matched.has(i));
        b.setAttribute("aria-label", up ? deck[i] : `Card ${i + 1}, face down`);
      });
      status(`MOVES ${moves}/${LIMIT} · PAIRS ${matched.size / 2}/${ITEMS.length}`);
    }

    stage.append(grid);
    render();
    return () => clearTimeout(timer);
  },
};
