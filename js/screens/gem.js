import { say } from "../ui/dialogue.js";
import { el, esc, pad2 } from "../ui/dom.js";
import { hud, setBars } from "../ui/hud.js";
import { sfx } from "../audio/sfx.js";
import { GEMS, byId } from "../data/gems.js";
import * as store from "../core/store.js";
import { p, isOpen } from "../core/progress.js";
import { go, later, onLeave, redirect } from "../core/router.js";
import * as geo from "../hunt/geo.js";

export function gemScreen(id) {
  const g = byId(id);
  if (!g || !isOpen(g)) return redirect("#/map");

  const screen = el(`
    <section class="screen gem" aria-label="Gem ${g.n} riddle">
      <div class="screen__body">
        <p class="gem__kicker pixel" data-act="${g.act}">GEM ${pad2(g.n)}/${GEMS.length}</p>
        <div class="scroll">
          ${
            g.stub
              ? `<p class="scroll__text">Ray is still writing this riddle. Check back soon!</p>`
              : `<p class="scroll__text">${g.riddle.map((l) => `<span>${esc(l)}</span>`).join("")}</p>`
          }
        </div>
        <div class="hints" aria-live="polite"></div>
        <div class="gem__actions">
          ${g.stub ? "" : `<button class="btn btn--gold" type="button" data-act="hint">HINT</button>`}
          <button class="btn btn--big" type="button" data-act="found" ${g.stub ? "disabled" : ""}>I FOUND IT!</button>
          <button class="btn btn--blue" type="button" data-act="map">MAP</button>
        </div>
      </div>
    </section>
  `);
  screen.prepend(hud(g));

  // Revealed hints are saved so they're still there after a trip to the camera.
  let hintsShown = 0;
  const hints = screen.querySelector(".hints");
  const hintBtn = screen.querySelector("[data-act=hint]");
  const showHint = () => {
    hints.appendChild(
      el(`<p class="hint px-box"><span class="pixel">HINT ${hintsShown + 1}</span> ${esc(g.hints[hintsShown])}</p>`)
    );
    hintsShown++;
    hintBtn.textContent = hintsShown < g.hints.length ? "BIGGER HINT" : "NO MORE HINTS";
    hintBtn.disabled = hintsShown >= g.hints.length;
  };
  if (hintBtn) {
    const saved = Math.min(p().hints?.[g.id] || 0, g.hints.length);
    while (hintsShown < saved) showHint();
  }
  hintBtn?.addEventListener("click", () => {
    if (hintsShown >= g.hints.length) return;
    sfx.select();
    showHint();
    store.update((s) => {
      s.hints = { ...s.hints, [g.id]: hintsShown };
    });
  });
  screen.querySelector("[data-act=found]").addEventListener("click", () => {
    sfx.select();
    go(`#/proof/${g.id}`);
  });
  screen.querySelector("[data-act=map]").addEventListener("click", () => go("#/map"));

  const startBars = () => {
    onLeave(geo.watch(g.geo, ({ bars }) => setBars(screen, bars), () => setBars(screen, null)));
  };

  later(screen, async () => {
    if (!screen.isConnected || g.stub) return;
    if (!p().tips?.gem) {
      await say([
        "Every gem starts with one of my riddles. Read it, then go find the place.",
        "Stuck? Tap HINT. Tap it again if you're really stuck. I won't tell.",
        "When you're standing there, hit I FOUND IT!",
      ]);
      if (!screen.isConnected) return;
      await store.update((s) => {
        s.tips = { ...s.tips, gem: true };
      });
    }
    if (g.geo && geo.supported()) {
      if (geo.choice() === "yes") return startBars();
      if (geo.choice() === null) {
        const yes = await say(
          [
            "One more thing. If you let me see where you are, I'll show signal bars up top.",
            "More bars means you're getting warmer. That's all I use it for. Deal?",
          ],
          {
            choices: [
              { label: "SURE", value: true },
              { label: "NO THANKS", value: false, primary: false },
            ],
          }
        );
        geo.setChoice(yes ? "yes" : "no");
        if (yes && screen.isConnected) startBars();
      }
    }
  }, 300);

  return screen;
}
