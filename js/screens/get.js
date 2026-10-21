import { gem as gemSprite } from "../ui/sprites.js";
import { say } from "../ui/dialogue.js";
import { el, esc, pad2 } from "../ui/dom.js";
import { starfield, confetti } from "../ui/scenery.js";
import { sfx } from "../audio/sfx.js";
import * as music from "../audio/music.js";
import { byId } from "../data/gems.js";
import * as store from "../core/store.js";
import { isFound, currentGem } from "../core/progress.js";
import { go, later, redirect, trackUrl } from "../core/router.js";

export function getScreen(id) {
  const g = byId(id);
  if (!g || !isFound(g.id)) return redirect("#/map");
  const next = currentGem();

  const screen = el(`
    <section class="screen get" aria-label="Item get">
      ${starfield(40)}
      <div class="flash" aria-hidden="true"></div>
      ${confetti()}
      <div class="get__stage">
        <div class="get__gem"><div class="spin">${gemSprite(96)}</div></div>
        <p class="get__label pixel">YOU FOUND:</p>
        <h1 class="get__name pixel">${esc(g.name)}!</h1>
        <figure class="polaroid get__photo" hidden>
          <img alt="Your photo at ${esc(g.name)}">
          <figcaption class="pixel">GEM ${pad2(g.n)}</figcaption>
        </figure>
      </div>
    </section>
  `);

  store.getPhoto(g.id).then((blob) => {
    if (!blob) return;
    const fig = screen.querySelector(".get__photo");
    const url = URL.createObjectURL(blob);
    fig.querySelector("img").src = url;
    trackUrl(url);
    fig.hidden = false;
  });

  later(screen, () => {
    music.duck(2.2);
    sfx.itemGet();
  }, 150);

  later(screen, async () => {
    if (!screen.isConnected) return;
    await say(g.memory);
    if (!screen.isConnected) return;
    if (g.bonus) {
      await say(g.bonus, { name: "BONUS FACT" });
      if (!screen.isConnected) return;
    }
    await say({ text: `${g.cardBack} — Ray`, mood: "proud" }, { name: "CARD BACK" });
    if (!screen.isConnected) return;
    const where = await say(
      next ? `Gem ${next.n} unlocked. Let's keep going!` : "That's all twelve. You actually did it!",
      {
        choices: [
          { label: "MAP", value: "#/map" },
          { label: "RAY'S BOOK", value: "#/book", primary: false },
        ],
      }
    );
    if (where) go(where);
  }, 2200);

  return screen;
}
