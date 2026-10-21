import { caller, icon } from "../ui/sprites.js";
import { el } from "../ui/dom.js";
import { starfield } from "../ui/scenery.js";
import { buzz, stopBuzz } from "../ui/haptics.js";
import { sfx } from "../audio/sfx.js";
import { go, later, onLeave } from "../core/router.js";

const RING_EVERY = 3000;
const VIBRATE = [450, 200, 450];

export function callScreen() {
  const screen = el(`
    <section class="screen call" aria-label="Incoming call">
      ${starfield(20)}
      <p class="call__label">INCOMING CALL<span class="call__dots" aria-hidden="true">...</span></p>
      <div class="call__avatar" aria-hidden="true">${caller(96)}</div>
      <h1 class="call__name">UNKNOWN</h1>
      <p class="call__sub">Lewisburg, PA</p>
      <div class="call__answer">
        <div class="slide">
          <span class="slide__hint" aria-hidden="true">SLIDE TO ANSWER <span class="blink">${icon("play", 10)}</span></span>
          <button class="slide__knob" type="button" aria-label="Answer call">${icon("phone", 36)}</button>
        </div>
      </div>
    </section>
  `);

  let timer = null;
  const ring = () => {
    sfx.ring();
    buzz(VIBRATE);
  };
  const hangUp = () => {
    clearInterval(timer);
    timer = null;
    stopBuzz();
  };
  later(screen, () => {
    if (!screen.isConnected) return;
    ring();
    timer = setInterval(ring, RING_EVERY);
  });
  onLeave(hangUp);

  slideToAnswer(screen.querySelector(".slide"), () => {
    hangUp();
    sfx.select();
    screen.classList.add("is-answered");
    screen.querySelector(".call__label").textContent = "CONNECTED";
    setTimeout(() => go("#/intro"), 700);
  });

  return screen;
}

// Drag the knob past 85% of the track to answer. Keyboard users press it.
function slideToAnswer(track, onAnswer) {
  const knob = track.querySelector(".slide__knob");
  let startX = 0;
  let x = 0;
  let max = 0;
  let dragging = false;
  let done = false;

  const set = (px) => {
    x = px;
    track.style.setProperty("--x", `${px}px`);
    track.style.setProperty("--p", max ? (px / max).toFixed(3) : 0);
  };
  const answer = () => {
    done = true;
    max = track.clientWidth - knob.offsetWidth - knob.offsetLeft * 2;
    set(max);
    track.classList.add("is-done");
    onAnswer();
  };

  knob.addEventListener("pointerdown", (e) => {
    if (done) return;
    dragging = true;
    max = track.clientWidth - knob.offsetWidth - knob.offsetLeft * 2;
    startX = e.clientX - x;
    knob.setPointerCapture(e.pointerId);
    track.classList.add("is-dragging");
  });
  knob.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const px = Math.max(0, Math.min(max, e.clientX - startX));
    set(Math.round(px / 4) * 4); // snap to the pixel grid
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    if (x >= max * 0.85) answer();
    else set(0);
  };
  knob.addEventListener("pointerup", release);
  knob.addEventListener("pointercancel", release);
  // detail is 0 for Enter/Space; mouse taps still have to slide.
  knob.addEventListener("click", (e) => {
    if (e.detail === 0 && !done) answer();
  });
}
