// WebAudio square-wave blips. No audio files.

const KEY = "hg.sound";
let ctx = null;
let on = readPref();

function readPref() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

const unlockListeners = [];

// Must run inside a user gesture (any tap) to unlock audio on phones.
export function unlock() {
  const first = !ctx;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  if (first) unlockListeners.forEach((fn) => fn(ctx));
}

// The shared AudioContext (null until the first tap). Music uses it too.
export const audio = () => ctx;
export const onUnlock = (fn) => unlockListeners.push(fn);

export function isOn() {
  return on;
}

export function setOn(value) {
  on = value;
  try {
    localStorage.setItem(KEY, value ? "on" : "off");
  } catch {}
}

function tone(freq, start, dur, vol = 0.06, type = "square") {
  if (!ctx || !on) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.setValueAtTime(0, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  tick: () => tone(880, 0, 0.03, 0.04),
  blip: () => tone(1320, 0, 0.02, 0.025),
  select: () => {
    tone(660, 0, 0.05);
    tone(990, 0.05, 0.07);
  },
  error: () => {
    tone(220, 0, 0.1);
    tone(165, 0.1, 0.16);
  },
  // ITEM GET arpeggio: C E G C' then a held E'.
  itemGet: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.08));
    tone(1319, 0.32, 0.36);
  },
  fanfare: () => {
    const notes = [392, 392, 392, 523, 0, 659, 784];
    notes.forEach((f, i) => f && tone(f, i * 0.12, 0.11));
    tone(1047, notes.length * 0.12, 0.6);
  },
};
