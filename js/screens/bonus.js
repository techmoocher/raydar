// A stop's minigame. Winning it unlocks that stop's bonus hint.

import { say, lit } from "../ui/dialogue.js";
import { el, esc, pad2 } from "../ui/dom.js";
import { hud } from "../ui/hud.js";
import { sfx } from "../audio/sfx.js";
import * as music from "../audio/music.js";
import { GEMS, byId } from "../data/gems.js";
import { GAMES } from "../minigames/index.js";
import * as store from "../core/store.js";
import { p, isOpen } from "../core/progress.js";
import { go, later, onLeave, redirect } from "../core/router.js";

export function bonusScreen(id) {
  const g = byId(id);
  const game = GAMES[g?.game];
  if (!g || !isOpen(g)) return redirect("#/map");
  if (g.stub || !game || p().bonus?.[g.id]) return redirect(`#/gem/${g.id}`);

  const screen = el(`
    <section class="screen bonus" aria-label="Bonus hint game">
      <div class="screen__body">
        <p class="gem__kicker pixel" data-act="${g.act}">GEM ${pad2(g.n)}/${GEMS.length} · BONUS</p>
        <h1 class="bonus__title pixel">${esc(game.title)}</h1>
        <p class="bonus__how">${esc(game.how)}</p>
        <div class="mg"></div>
        <p class="bonus__status pixel" aria-live="polite"></p>
        <div class="bonus__actions">
          <button class="btn btn--blue" type="button" data-act="restart">RESTART</button>
          <button class="btn btn--blue" type="button" data-act="back">BACK</button>
        </div>
      </div>
    </section>
  `);
  screen.prepend(hud(g));

  const stage = screen.querySelector(".mg");
  const statusEl = screen.querySelector(".bonus__status");
  let cleanup = null;
  let over = false;

  const start = () => {
    cleanup?.();
    over = false;
    stage.classList.remove("is-over");
    stage.replaceChildren();
    statusEl.textContent = "";
    cleanup = game.mount(stage, { win, lose, status: (t) => (statusEl.textContent = t) }) || null;
  };

  const end = () => {
    if (over) return false;
    over = true;
    stage.classList.add("is-over");
    return true;
  };

  async function win() {
    if (!end()) return;
    music.duck(2.2);
    sfx.itemGet();
    await store.update((s) => {
      s.bonus = { ...s.bonus, [g.id]: true };
    });
    if (!screen.isConnected) return;
    await say([
      { text: game.win, mood: "proud" },
      { text: `Here's my bonus hint:| ${lit(g.bonusHint)}`, mood: "proud" },
    ]);
    if (screen.isConnected) go(`#/gem/${g.id}`);
  }

  async function lose(line) {
    if (!end()) return;
    sfx.error();
    const again = await say(line || game.lose, {
      choices: [
        { label: "TRY AGAIN", value: true },
        { label: "BACK", value: false, primary: false },
      ],
    });
    if (!screen.isConnected) return;
    if (again) start();
    else if (again === false) go(`#/gem/${g.id}`);
  }

  screen.querySelector("[data-act=restart]").addEventListener("click", () => {
    sfx.select();
    start();
  });
  screen.querySelector("[data-act=back]").addEventListener("click", () => go(`#/gem/${g.id}`));
  onLeave(() => cleanup?.());

  start();
  later(screen, async () => {
    if (!screen.isConnected) return;
    const seen = p().tips?.games || {};
    if (seen[g.game]) return;
    await say([
      ...(Object.keys(seen).length ? [] : ["Bonus hints aren't free.| Beat my little game and it's yours."]),
      ...game.intro,
    ]);
    store.update((s) => {
      s.tips = { ...s.tips, games: { ...s.tips?.games, [g.game]: true } };
    });
  }, 300);

  return screen;
}
