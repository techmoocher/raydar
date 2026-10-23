import { rayRun, gem as gemSprite } from "../ui/sprites.js";
import { say } from "../ui/dialogue.js";
import { el, esc, pad2, reducedMotion } from "../ui/dom.js";
import { meadow } from "../ui/scenery.js";
import { hud, saveNote, locationNote } from "../ui/hud.js";
import { sfx } from "../audio/sfx.js";
import { GEMS, ACTS } from "../data/gems.js";
import * as store from "../core/store.js";
import { p, isFound, currentGem, lastFound } from "../core/progress.js";
import { go, later } from "../core/router.js";

const ROW = 104;
const BANNER = 64;
const XS = [50, 74, 50, 26]; // node x positions, %

export function mapScreen() {
  const cur = currentGem();
  const screen = el(`
    <section class="screen map" aria-label="Map">
      ${meadow(48)}
    </section>
  `);
  screen.prepend(hud(cur));

  let y = 16;
  let lastAct = null;
  const items = [];
  GEMS.forEach((g, i) => {
    if (g.act !== lastAct) {
      items.push({ type: "banner", act: g.act, y });
      y += BANNER;
      lastAct = g.act;
    }
    const x = XS[i % XS.length];
    items.push({ type: "node", g, x, y });
    y += ROW;
  });
  const height = y + 24;

  // No trail through every gem: the order is free. Only Ray's hop to his pick is drawn.
  const world = el(`<div class="map__world" style="height:${height}px"></div>`);

  items.forEach((it) => {
    if (it.type === "banner") {
      const label = it.act === 4 ? ACTS[4] : `ARC ${it.act}: ${ACTS[it.act]}`;
      world.appendChild(el(`<h2 class="map__banner" data-act="${it.act}" style="top:${it.y}px">${esc(label)}</h2>`));
      return;
    }
    const { g } = it;
    const found = isFound(g.id);
    const current = cur?.id === g.id;
    const state = found ? "found" : current ? "current" : "open";
    const label = found ? g.name : "???";
    const node = el(`
      <button class="node node--${state}" type="button" style="left:${it.x}%;top:${it.y}px"
        aria-label="Gem ${g.n}${found ? `: ${esc(g.name)}, found` : current ? ", Ray's pick for next" : ", riddle"}">
        <span class="node__pad">${found ? gemSprite(28) : `<span class="node__n">${pad2(g.n)}</span>`}</span>
        <span class="node__label">${esc(label)}</span>
      </button>
    `);
    node.addEventListener("click", () => {
      sfx.select();
      go(found ? "#/book" : `#/gem/${g.id}`);
    });
    world.appendChild(node);
  });

  const nodes = items.filter((it) => it.type === "node");
  const target = nodes.find((it) => it.g.id === cur?.id) || nodes[nodes.length - 1];
  const start = nodes.find((it) => it.g.id === lastFound()?.id) || target;
  if (start !== target) {
    world.prepend(
      el(`
        <svg class="map__path" viewBox="0 0 100 ${height}" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="${start.x},${start.y + 28} ${target.x},${target.y + 28}" />
        </svg>
      `)
    );
  }
  const spot = (it) => ({ left: `calc(${it.x}% - 82px)`, top: `${it.y + 10}px` });
  const runner = el(`<div class="runner" aria-hidden="true">${rayRun(44)}</div>`);
  Object.assign(runner.style, spot(start));
  if (target.x < start.x) runner.classList.add("is-left");
  world.appendChild(runner);
  later(screen, () => {
    if (start === target) return;
    runner.classList.add("is-running");
    requestAnimationFrame(() => Object.assign(runner.style, spot(target)));
    setTimeout(() => runner.classList.remove("is-running", "is-left"), reducedMotion() ? 0 : 1300);
  }, 250);

  const body = el(`<div class="map__body"></div>`);
  body.appendChild(world);
  body.insertAdjacentHTML("beforeend", saveNote());
  locationNote(body);
  screen.appendChild(body);

  const dock = el(`
    <nav class="dock">
      ${
        cur
          ? `<button class="btn btn--big dock__go" type="button" data-act="go">
               <span class="dock__go-n">RAY'S PICK · GEM ${pad2(cur.n)}/${GEMS.length}</span>
               <span>READ RAY'S RIDDLE</span>
             </button>`
          : ""
      }
      <div class="dock__row">
        <button class="btn btn--blue" type="button" data-act="book">RAY'S BOOK</button>
        <button class="btn btn--blue" type="button" data-act="title">TITLE</button>
      </div>
    </nav>
  `);
  dock.querySelector("[data-act=go]")?.addEventListener("click", () => {
    sfx.select();
    go(`#/gem/${cur.id}`);
  });
  dock.querySelector("[data-act=book]").addEventListener("click", () => go("#/book"));
  dock.querySelector("[data-act=title]").addEventListener("click", () => go("#/title"));
  screen.appendChild(dock);

  later(screen, () => {
    screen.querySelector(".node--current")?.scrollIntoView({ block: "center", behavior: "instant" });
  });

  if (!p().tips?.map && cur) {
    later(screen, async () => {
      if (!screen.isConnected) return;
      await say([
        "This is my map.| Twelve gems, all over campus.",
        "The orange spot is my pick for next.| Where is it, exactly?| ~That's the fun part.~",
        "No set route, though.| Tap any gem, in any order.",
        "Or tap *READ RAY'S RIDDLE* for mine.",
      ]);
      store.update((s) => {
        s.tips = { ...s.tips, map: true };
      });
    }, 300);
  }
  return screen;
}
