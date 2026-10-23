// Falls back to memory when IndexedDB is unavailable.

import * as idb from "../../vendor/idb-keyval-6.2.1.js";

const PROGRESS = "progress";
const photoKey = (id) => `photo:${id}`;

const memory = new Map();
let backend = idb;
export let persistent = true;

const memoryBackend = {
  get: async (k) => memory.get(k),
  set: async (k, v) => void memory.set(k, v),
  del: async (k) => void memory.delete(k),
  clear: async () => memory.clear(),
};

const blank = () => ({
  name: "",
  email: "",
  emailAsked: false,
  found: {}, // id -> { at, method }
  verified: {}, // id -> true after a card deep link
  hints: {}, // id -> how many hints the player has revealed
  bonus: {}, // id -> true once the bonus hint is unlocked
  seenIntro: false,
});

let progress = blank();

export async function init() {
  try {
    if (!("indexedDB" in window)) throw new Error("no idb");
    progress = { ...blank(), ...((await idb.get(PROGRESS)) || {}) };
  } catch {
    backend = memoryBackend;
    persistent = false;
  }
  try {
    await navigator.storage?.persist?.();
  } catch {}
  return progress;
}

export const get = () => progress;

export const hasSave = () => Boolean(progress.name);

export async function update(fn) {
  fn(progress);
  try {
    await backend.set(PROGRESS, progress);
  } catch {
    backend = memoryBackend;
    persistent = false;
  }
  return progress;
}

export async function savePhoto(id, blob) {
  try {
    await backend.set(photoKey(id), blob);
  } catch {
    backend = memoryBackend;
    persistent = false;
    await backend.set(photoKey(id), blob);
  }
}

export async function getPhoto(id) {
  try {
    return (await backend.get(photoKey(id))) || null;
  } catch {
    return null;
  }
}

export async function reset() {
  progress = blank();
  try {
    await backend.clear();
  } catch {}
  memory.clear();
}
