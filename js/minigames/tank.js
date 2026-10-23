// Bucknell Hall: pour gas cans until the tank reads exactly $50K.

import { el } from "../ui/dom.js";
import { sfx } from "../audio/sfx.js";

const CANS = [7, 12, 15];
const GOAL = 50;
const MAX = 5;

export default {
  title: "FILL THE TANK",
  how: "Pour in exactly $50K. Five cans at most, and going over spills it.",
  intro: [
    "This school was running on fumes once.| Somebody had to fill the tank.",
    "Get it to *$50K* exactly, using five cans or fewer.| ~No take-backs.~",
  ],
  win: "Fifty thousand on the nose.| ~That's how you save a university.~",
  lose: "Not quite.| Want another go?",

  mount(stage, { win, lose, status }) {
    let total = 0;
    const poured = [];
    stage.append(
      el(`
        <div class="mg-tank">
          <div class="mg-tank__gauge" aria-hidden="true">${"<span></span>".repeat(GOAL / 5)}</div>
          <p class="mg-tank__total pixel"></p>
          <p class="mg-tank__log"></p>
          <div class="mg-tank__cans">
            ${CANS.map((v) => `<button class="btn btn--gold" type="button" data-v="${v}">+$${v}K</button>`).join("")}
          </div>
        </div>
      `)
    );
    const segs = stage.querySelectorAll(".mg-tank__gauge span");
    const render = () => {
      segs.forEach((s, i) => s.classList.toggle("is-on", total >= (i + 1) * 5));
      stage.querySelector(".mg-tank__total").textContent = `$${total}K / $${GOAL}K`;
      stage.querySelector(".mg-tank__log").textContent = poured.length
        ? poured.map((v) => `$${v}K`).join(" + ")
        : "Empty tank.";
      status(`CANS LEFT ${MAX - poured.length}`);
    };
    stage.querySelectorAll("[data-v]").forEach((b) =>
      b.addEventListener("click", () => {
        const v = Number(b.dataset.v);
        poured.push(v);
        total += v;
        sfx.tick();
        render();
        if (total === GOAL) return win();
        if (total > GOAL) return lose(`$${total}K.| That's a spill.| Try a different mix?`);
        if (poured.length >= MAX) return lose(`Out of cans at $${total}K.| ~So close.~ Try again?`);
      })
    );
    render();
  },
};
