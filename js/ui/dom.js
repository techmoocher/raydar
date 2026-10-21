// DOM helpers shared by every screen.

export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

export const pad2 = (n) => String(n).padStart(2, "0");
