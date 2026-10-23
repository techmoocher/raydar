// The Cells: crack a three-number lock with right/close clues (Mastermind).

import { el } from "../ui/dom.js";
import { sfx } from "../audio/sfx.js";
import { button, rand } from "./kit.js";

const SLOTS = 3;
const DIGITS = 4;
const TRIES = 6;

function score(guess, code) {
  const right = guess.filter((d, i) => d === code[i]).length;
  let common = 0;
  for (let d = 1; d <= DIGITS; d++) {
    common += Math.min(guess.filter((x) => x === d).length, code.filter((x) => x === d).length);
  }
  return { right, close: common - right };
}

export default {
  title: "CRACK THE CARREL",
  how: "Tap the wheels to set three numbers (1–4), then TRY. Orange square: right number, right spot. White square: right number, wrong spot.",
  intro: [
    "Somebody locked themselves in a study room during finals and forgot the code.",
    "Three numbers, each 1 to 4.| *Orange* means right number, right spot. *White* means right number, wrong spot.| ~Six tries.~",
  ],
  win: "Click.| You're out.| ~Time off for good behavior.~",
  lose: "",

  mount(stage, { win, lose, status }) {
    const code = Array.from({ length: SLOTS }, () => 1 + rand(DIGITS));
    const guess = Array(SLOTS).fill(1);
    const tries = [];

    const board = el(`
      <div class="mg-lock">
        <div class="mg-lock__wheels"></div>
        <button class="btn btn--green mg-lock__try" type="button">TRY</button>
        <ol class="mg-lock__log"></ol>
      </div>
    `);
    const wheels = guess.map((_, i) => {
      const b = button("mg-cell mg-wheel pixel");
      b.addEventListener("click", () => {
        guess[i] = (guess[i] % DIGITS) + 1;
        sfx.tick();
        render();
      });
      board.querySelector(".mg-lock__wheels").append(b);
      return b;
    });
    board.querySelector(".mg-lock__try").addEventListener("click", () => {
      const { right, close } = score(guess, code);
      tries.push({ digits: [...guess], right, close });
      sfx.select();
      render();
      if (right === SLOTS) return win();
      if (tries.length >= TRIES) {
        return lose(`Still locked. The code was ${code.join(" ")}.| New lock, new code. Try again?`);
      }
    });

    const render = () => {
      wheels.forEach((b, i) => {
        b.textContent = guess[i];
        b.setAttribute("aria-label", `Wheel ${i + 1}: ${guess[i]}`);
      });
      board.querySelector(".mg-lock__log").innerHTML = tries
        .map(
          (t) => `
            <li>
              <span class="pixel">${t.digits.join(" ")}</span>
              <span class="mg-lock__pegs" aria-hidden="true">${'<i class="is-right"></i>'.repeat(t.right)}${'<i class="is-close"></i>'.repeat(t.close)}${"<i></i>".repeat(SLOTS - t.right - t.close)}</span>
              <span class="sr-only">${t.right} right, ${t.close} close</span>
            </li>`
        )
        .join("");
      status(`TRIES ${tries.length}/${TRIES}`);
    };
    stage.append(board);
    render();
  },
};
