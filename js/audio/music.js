// Chiptune sequencer: pulse lead, triangle bass, noise drums.

import { audio, onUnlock } from "./sfx.js";

// 16 steps per bar. Lead: note ("E5"), "-" hold, "." rest. Drums: k s h.

export const TRACKS = {
  title: {
    name: "RAYDAR",
    bpm: 132,
    roots: ["C3", "A2", "F2", "G2", "C3", "A2", "F2", "G2"],
    bass: "pump",
    drums: "k . h . s . h . k . h k s . h .",
    lead: [
      "E5 - G5 - C6 - - - B5 - G5 - E5 - - -",
      "A5 - - - G5 - E5 - C5 - - - E5 - - -",
      "F5 - A5 - C6 - A5 - G5 - F5 - E5 - D5 -",
      "D5 - - - G4 - B4 - D5 - - - . . . .",
      "E5 - G5 - C6 - - - D6 - C6 - B5 - G5 -",
      "A5 - - - C6 - B5 - A5 - G5 - E5 - - -",
      "F5 - - - A5 - - - G5 - - - F5 - E5 -",
      "D5 - - - B4 - D5 - C5 - - - - - . .",
    ],
  },
  overworld: {
    name: "CAMPUS WALK",
    bpm: 116,
    roots: ["G2", "E2", "C3", "D3", "G2", "E2", "C3", "D3"],
    bass: "walk",
    drums: "k . h . . . h . k . h . . . h .",
    lead: [
      "B4 - D5 - G5 - D5 - B4 - D5 - G5 - - -",
      "G5 - F#5 - E5 - D5 - E5 - - - B4 - - -",
      "C5 - E5 - G5 - E5 - A5 - G5 - E5 - C5 -",
      "D5 - - - F#5 - A5 - D5 - - - . . . .",
      "B5 - - - A5 - G5 - D5 - - - B4 - D5 -",
      "E5 - G5 - B5 - A5 - G5 - - - E5 - - -",
      "C5 - D5 - E5 - G5 - A5 - G5 - E5 - D5 -",
      "D5 - F#5 - A5 - F#5 - G5 - - - - - . .",
    ],
  },
  riddle: {
    name: "RIDDLE ME THIS",
    bpm: 96,
    roots: ["A2", "F2", "D2", "E2", "A2", "F2", "D2", "E2"],
    bass: "half",
    drums: "h . . . . . . . h . . . . . . .",
    lead: [
      "A4 - - - C5 - - - E5 - - - D5 - C5 -",
      "A4 - - - - - - - . . . . . . . .",
      "D5 - - - F5 - - - A5 - - - G5 - F5 -",
      "E5 - - - - - - - G#4 - - - B4 - - -",
      "C5 - B4 - A4 - - - E5 - - - C5 - - -",
      "F5 - E5 - D5 - C5 - A4 - - - - - - -",
      "D5 - - - A4 - - - F5 - - - E5 - D5 -",
      "E5 - - - - - - - . . . . . . . .",
    ],
  },
};

export const TRACK_IDS = Object.keys(TRACKS);

const SEMI = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };

function freq(note) {
  const m = /^([A-G])(#|b)?(\d)$/.exec(note);
  if (!m) return null;
  const n = SEMI[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + (Number(m[3]) - 4) * 12;
  return 440 * 2 ** (n / 12);
}

const transpose = (note, octaves) => note.replace(/\d$/, (d) => String(Number(d) + octaves));

const BASS = {
  pump: (r) => [r, ".", transpose(r, 1), ".", r, ".", transpose(r, 1), ".", r, ".", transpose(r, 1), ".", r, ".", transpose(r, 1), "."],
  walk: (r) => [r, "-", ".", ".", transpose(r, 1), "-", ".", ".", r, "-", ".", ".", transpose(r, 1), "-", ".", "."],
  half: (r) => [r, "-", "-", "-", "-", "-", "-", "-", r, "-", "-", "-", "-", "-", "-", "."],
};

function events(tokens) {
  const out = [];
  tokens.forEach((t, i) => {
    if (t === "-" || t === ".") return;
    let len = 1;
    while (tokens[i + len] === "-") len++;
    out.push({ step: i, len, f: freq(t) });
  });
  return out;
}

const compiled = {};
function compile(id) {
  if (compiled[id]) return compiled[id];
  const t = TRACKS[id];
  const lead = t.lead.flatMap((bar) => bar.split(/\s+/));
  const bass = t.roots.flatMap((r) => BASS[t.bass](r));
  const drumBar = t.drums.split(/\s+/);
  const steps = t.lead.length * 16;
  if (lead.length !== steps || bass.length !== steps || drumBar.length !== 16) {
    console.warn(`music: track ${id} has a bar that isn't 16 steps`);
  }
  const drums = [];
  for (let i = 0; i < steps; i++) if (drumBar[i % 16] !== ".") drums.push({ step: i, kind: drumBar[i % 16] });
  return (compiled[id] = {
    steps,
    stepDur: 60 / t.bpm / 4,
    lead: events(lead),
    bass: events(bass),
    drums,
  });
}

const VOLUME_LEVELS = [0, 0.05, 0.1, 0.16, 0.24];
const KEY = "hg.music";

let ctx = null;
let musicGain = null;
let pulse = null;
let noise = null;
let current = null;
let wanted = null; // played once audio unlocks
let prefs = loadPrefs();
const listeners = new Set();

function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { on: p.on !== false, level: Number.isInteger(p.level) ? p.level : 2 };
  } catch {
    return { on: true, level: 2 };
  }
}

function savePrefs() {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {}
  listeners.forEach((fn) => fn(state()));
}

function setup(c) {
  ctx = c;
  musicGain = ctx.createGain();
  musicGain.gain.value = VOLUME_LEVELS[prefs.level];
  musicGain.connect(ctx.destination);

  // 25% duty pulse wave.
  const n = 32;
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let k = 1; k < n; k++) real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
  pulse = ctx.createPeriodicWave(real, imag);

  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });

  if (wanted && prefs.on) start(wanted);
}

onUnlock(setup);
if (audio()) setup(audio());

function note(bus, f, t, dur, { wave, vol }) {
  if (!f) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  if (wave === "pulse") osc.setPeriodicWave(pulse);
  else osc.type = wave;
  osc.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.setTargetAtTime(vol * 0.6, t + 0.02, 0.08);
  g.gain.setTargetAtTime(0, t + dur * 0.92, 0.015);
  osc.connect(g).connect(bus);
  osc.start(t);
  osc.stop(t + dur + 0.1);
}

function drum(bus, kind, t) {
  if (kind === "k") {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.1);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g).connect(bus);
    osc.start(t);
    osc.stop(t + 0.13);
    return;
  }
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  const g = ctx.createGain();
  const snare = kind === "s";
  filter.type = snare ? "bandpass" : "highpass";
  filter.frequency.value = snare ? 1800 : 7000;
  const len = snare ? 0.12 : 0.03;
  g.gain.setValueAtTime(snare ? 0.35 : 0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + len);
  src.connect(filter).connect(g).connect(bus);
  src.start(t, Math.random() * 0.5);
  src.stop(t + len + 0.01);
}

function start(id) {
  const song = compile(id);
  stopCurrent();
  const bus = ctx.createGain();
  bus.gain.value = 0;
  bus.gain.setTargetAtTime(1, ctx.currentTime, 0.05);
  bus.connect(musicGain);
  const playing = { id, bus, step: 0, nextTime: ctx.currentTime + 0.08, timer: null };

  const byStep = (list) => {
    const m = new Map();
    list.forEach((e) => m.set(e.step, [...(m.get(e.step) || []), e]));
    return m;
  };
  const lead = byStep(song.lead);
  const bass = byStep(song.bass);
  const drums = byStep(song.drums);

  const tick = () => {
    while (playing.nextTime < ctx.currentTime + 0.15) {
      const t = playing.nextTime;
      const i = playing.step;
      lead.get(i)?.forEach((e) => note(bus, e.f, t, e.len * song.stepDur, { wave: "pulse", vol: 0.5 }));
      bass.get(i)?.forEach((e) => note(bus, e.f, t, e.len * song.stepDur, { wave: "triangle", vol: 0.9 }));
      drums.get(i)?.forEach((e) => drum(bus, e.kind, t));
      playing.nextTime += song.stepDur;
      playing.step = (i + 1) % song.steps;
    }
  };
  tick();
  playing.timer = setInterval(tick, 25);
  current = playing;
  listeners.forEach((fn) => fn(state()));
}

function stopCurrent() {
  if (!current) return;
  const { bus, timer } = current;
  clearInterval(timer);
  bus.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
  setTimeout(() => bus.disconnect(), 600);
  current = null;
}

export function state() {
  const id = current?.id || wanted;
  return {
    on: prefs.on,
    playing: Boolean(current),
    level: prefs.level,
    levels: VOLUME_LEVELS.length - 1,
    track: id,
    name: id ? TRACKS[id].name : "",
  };
}

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function play(id) {
  wanted = id;
  if (!ctx || !prefs.on) return listeners.forEach((fn) => fn(state()));
  if (current?.id === id) return;
  start(id);
}

export function toggle() {
  prefs.on = !prefs.on;
  if (!prefs.on) stopCurrent();
  else if (ctx && wanted) start(wanted);
  savePrefs();
}

export function skip(dir) {
  const ids = TRACK_IDS;
  const from = ids.indexOf(current?.id || wanted || ids[0]);
  wanted = ids[(from + dir + ids.length) % ids.length];
  if (!prefs.on) prefs.on = true;
  if (ctx) start(wanted);
  savePrefs();
}

export function setLevel(level) {
  prefs.level = Math.max(0, Math.min(VOLUME_LEVELS.length - 1, level));
  if (musicGain) musicGain.gain.setTargetAtTime(VOLUME_LEVELS[prefs.level], ctx.currentTime, 0.03);
  savePrefs();
}

export function duck(seconds = 1.5) {
  if (!musicGain) return;
  const t = ctx.currentTime;
  const v = VOLUME_LEVELS[prefs.level];
  musicGain.gain.cancelScheduledValues(t);
  musicGain.gain.setTargetAtTime(v * 0.15, t, 0.02);
  musicGain.gain.setTargetAtTime(v, t + seconds, 0.2);
}
