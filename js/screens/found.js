// Deep link from a card's QR, opened by the phone's own camera app.

import * as store from "../core/store.js";
import { isFound, setPendingDeepLink } from "../core/progress.js";
import { redirect } from "../core/router.js";
import * as card from "../hunt/card.js";

export function foundRoute(id, token) {
  if (!card.tokenOk(id, token)) return redirect("#/title");
  store.update((s) => {
    if (!s.found[id]) s.verified[id] = true;
  });
  if (!store.hasSave()) {
    setPendingDeepLink(id);
    return redirect("#/title");
  }
  return redirect(isFound(id) ? "#/book" : `#/proof/${id}`);
}
