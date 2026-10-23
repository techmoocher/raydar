const KEY = "hg.geo";

export function distance(a, b) {
  const R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// 0 bars beyond 400 m, 4 bars inside the gem's radius.
export function bars(meters, radius) {
  if (meters <= radius) return 4;
  if (meters > 400) return 0;
  const t = (meters - radius) / (400 - radius);
  return Math.max(1, 3 - Math.floor(t * 3));
}

export function barsText(n) {
  const glyphs = ["▂", "▄", "▆", "█"];
  return glyphs.map((g, i) => (i < n ? g : `<span class="off">${g}</span>`)).join("");
}

export function choice() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setChoice(v) {
  try {
    localStorage.setItem(KEY, v);
  } catch {}
}

export const supported = () => "geolocation" in navigator;

// "granted", "denied" or "prompt"; null when the browser won't say.
export async function permission() {
  try {
    return (await navigator.permissions.query({ name: "geolocation" })).state;
  } catch {
    return null;
  }
}

// Inside the stop's radius, allowing for some GPS error (capped so it can't cover campus).
export const isHere = (pos, geo) => distance(pos, geo) <= geo.r + Math.min(pos.acc || 0, 50);

// Returns a stop function.
export function watch(geo, onUpdate, onError) {
  if (!geo || !supported()) return () => {};
  const id = navigator.geolocation.watchPosition(
    (pos) => {
      const meters = distance({ lat: pos.coords.latitude, lng: pos.coords.longitude }, geo);
      onUpdate({ meters, bars: bars(meters, geo.r) });
    },
    (err) => onError?.(err),
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
  );
  return () => navigator.geolocation.clearWatch(id);
}

export function here() {
  return new Promise((res, rej) => {
    if (!supported()) return rej(new Error("unsupported"));
    navigator.geolocation.getCurrentPosition(
      (p) => res({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }),
      rej,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}
