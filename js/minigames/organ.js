// Rooke Chapel: listen to the organ, then play the tune back (Simon).

import { el } from "../ui/dom.js";
import { sfx } from "../audio/sfx.js";
import { button, rand } from "./kit.js";

const NOTES = [392, 523, 659, 784];
const ROUNDS = [2, 3, 4, 5];
const BEAT = 560;
const HOLD = 360;

export default {
  title: "PIPE ORGAN",
  how: "Tap LISTEN, then play the tune back on the pipes. Each round adds a note. Get through five notes.",
  intro: [
    "This organ has 3,288 pipes.| Relax, I'll only make you play four.",
    "Tap *LISTEN*, then play the tune back. Every round adds a note.| ~Five notes and you're done.~",
  ],
  win: "Bravo!| ~I teared up a little. Don't tell anyone.~",
  lose: "Sour note.| ~The organ forgives you.~ Try again?",

  mount(stage, { win, lose, status }) {
    const tune = Array.from({ length: ROUNDS.at(-1) }, () => rand(NOTES.length));
    let round = 0;
    let pos = 0;
    let playing = false;
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    const board = el(`
      <div class="mg-organ">
        <div class="mg-organ__pipes"></div>
        <button class="btn btn--gold mg-organ__listen" type="button">LISTEN</button>
      </div>
    `);
    const pipes = NOTES.map((_, i) => {
      const b = button(`mg-pipe-key mg-pipe-key--${i}`, "", `Pipe ${i + 1}`);
      b.addEventListener("click", () => press(i));
      board.querySelector(".mg-organ__pipes").append(b);
      return b;
    });
    const listen = board.querySelector(".mg-organ__listen");
    listen.addEventListener("click", () => play());

    const sound = (i) => {
      sfx.note(NOTES[i], HOLD / 1000);
      pipes[i].classList.add("is-on");
      later(() => pipes[i].classList.remove("is-on"), HOLD);
    };

    function play() {
      if (playing) return;
      playing = true;
      pos = 0;
      listen.disabled = true;
      status(`ROUND ${round + 1}/${ROUNDS.length} · LISTEN`);
      for (let k = 0; k < ROUNDS[round]; k++) later(() => sound(tune[k]), k * BEAT);
      later(() => {
        playing = false;
        listen.disabled = false;
        listen.textContent = "REPLAY";
        status(`ROUND ${round + 1}/${ROUNDS.length} · YOUR TURN`);
      }, ROUNDS[round] * BEAT);
    }

    function press(i) {
      if (playing || listen.textContent === "LISTEN") return;
      sound(i);
      if (i !== tune[pos]) return lose();
      pos++;
      if (pos < ROUNDS[round]) return;
      round++;
      if (round === ROUNDS.length) return win();
      status(`ROUND ${round + 1}/${ROUNDS.length} · NICE`);
      playing = true;
      later(() => {
        playing = false;
        play();
      }, 900);
    }

    stage.append(board);
    status(`ROUND 1/${ROUNDS.length} · TAP LISTEN`);
    return () => timers.forEach(clearTimeout);
  },
};
