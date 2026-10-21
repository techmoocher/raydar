// Read-only views of the player's progress.

import * as store from "./store.js";
import { GEMS } from "../data/gems.js";
import { pad2 } from "../ui/dom.js";

export const p = () => store.get();
export const foundCount = () => Object.keys(p().found).length;
export const isFound = (id) => Boolean(p().found[id]);

export const currentGem = () => GEMS.find((g) => !isFound(g.id)) || null;

export const isOpen = (g) => isFound(g.id) || currentGem()?.id === g.id;

export const gemLabel = (g) => (isFound(g.id) ? g.name : `gem ${pad2(g.n)}`);

export function worldOf(g) {
  return (g || currentGem() || GEMS[GEMS.length - 1]).act;
}

let deepLink = null;
export const pendingDeepLink = () => deepLink;
export const setPendingDeepLink = (id) => (deepLink = id);
