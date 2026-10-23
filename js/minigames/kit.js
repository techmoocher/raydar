// Small helpers shared by the bonus-hint games.

export const rand = (n) => Math.floor(Math.random() * n);

export function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

export function button(className, html = "", label = "") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = className;
  b.innerHTML = html;
  if (label) b.setAttribute("aria-label", label);
  return b;
}

// Orthogonal neighbours of cell i on a cols × rows board.
export function around(i, cols, rows) {
  const r = Math.floor(i / cols);
  const c = i % cols;
  const out = [];
  if (r > 0) out.push(i - cols);
  if (r < rows - 1) out.push(i + cols);
  if (c > 0) out.push(i - 1);
  if (c < cols - 1) out.push(i + 1);
  return out;
}
