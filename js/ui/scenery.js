// Decorative backdrops: stars, meadow, ground, confetti.

// Stars stay in the side margins and top strip, never behind text.
export function starfield(count = 24) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const edge = Math.random();
    const x = edge < 0.4 ? Math.random() * 9 : edge < 0.8 ? 91 + Math.random() * 8 : Math.random() * 100;
    const y = edge < 0.8 ? Math.random() * 70 : Math.random() * 7;
    const cls = Math.random() < 0.55 ? "dim" : Math.random() < 0.5 ? "gold" : "";
    s += `<i class="${cls}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%"></i>`;
  }
  return `<div class="stars" aria-hidden="true">${s}</div>`;
}

export function meadow(count = 40) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 96);
    const y = Math.floor(Math.random() * 100);
    const r = Math.random();
    const cls = r < 0.12 ? "flower flower--gold" : r < 0.22 ? "flower flower--cherry" : "tuft";
    s += `<i class="${cls}" style="left:${x}%;top:${y}%"></i>`;
  }
  return `<div class="meadow" aria-hidden="true">${s}</div>`;
}

export function ground() {
  return `
    <div class="ground" aria-hidden="true">
      <i class="flower flower--gold" style="left:12%"></i>
      <i class="flower flower--cherry" style="left:22%"></i>
      <i class="flower flower--gold" style="left:78%"></i>
      <i class="flower flower--cherry" style="left:88%"></i>
    </div>`;
}

const CONFETTI = ["gold", "cherry", "leaf", "plum", "gem", "orange", "paper"];
export function confetti(count = 36) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 100);
    const delay = (Math.random() * 0.6).toFixed(2);
    const dur = (1.4 + Math.random() * 1.2).toFixed(2);
    const size = Math.random() < 0.3 ? 12 : 8;
    s += `<i style="left:${x}%;width:${size}px;height:${size}px;background:var(--${CONFETTI[i % CONFETTI.length]});animation-delay:${delay}s;animation-duration:${dur}s"></i>`;
  }
  return `<div class="confetti" aria-hidden="true">${s}</div>`;
}
