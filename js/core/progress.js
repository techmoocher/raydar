// Read-only views of the player's progress.

import * as store from "./store.js";
import { GEMS } from "../data/gems.js";
import { pad2 } from "../ui/dom.js";

export const p = () => store.get();
export const foundCount = () => Object.keys(p().found).length;
export const isFound = (id) => Boolean(p().found[id]);

export const currentGem = () => GEMS.find((g) => !isFound(g.id)) || null;

export const isOpen = (g) => isFound(g.id) || currentGem()?.id === g.id;

// A gem's name is the answer, so it stays hidden until the gem is found.
export const gemLabel = (g) => (isFound(g.id) ? g.name : `gem ${pad2(g.n)}`);

export function worldOf(g) {
  return (g || currentGem() || GEMS[GEMS.length - 1]).act;
}

// A card scanned before the player has a save waits here until they do.
let deepLink = null;
export const pendingDeepLink = () => deepLink;
export const setPendingDeepLink = (id) => (deepLink = id);
