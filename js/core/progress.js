// Read-only views of the player's progress.

import * as store from "./store.js";
import { GEMS } from "../data/gems.js";
import { pad2 } from "../ui/dom.js";

export const p = () => store.get();
export const foundCount = () => Object.keys(p().found).length;
export const isFound = (id) => Boolean(p().found[id]);

// The gem found most recently, in any order.
export function lastFound() {
  const found = p().found;
  return GEMS.filter((g) => found[g.id]).sort((a, b) => (found[a.id].at < found[b.id].at ? -1 : 1)).pop() || null;
}

// The trail is only Ray's suggestion: the next unfound gem after the last
// one found, wrapping around. Players can go to any gem in any order.
export function currentGem() {
  const from = GEMS.indexOf(lastFound()) + 1;
  const ahead = [...GEMS.slice(from), ...GEMS.slice(0, from)];
  return ahead.find((g) => !isFound(g.id)) || null;
}

export const gemLabel = (g) => (isFound(g.id) ? g.name : `gem ${pad2(g.n)}`);

export function worldOf(g) {
  return (g || currentGem() || GEMS[GEMS.length - 1]).act;
}

let deepLink = null;
export const pendingDeepLink = () => deepLink;
export const setPendingDeepLink = (id) => (deepLink = id);
