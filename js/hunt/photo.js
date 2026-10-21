export async function loadImage(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {}
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const sizeOf = (img) => ({
  w: img.naturalWidth || img.width,
  h: img.naturalHeight || img.height,
});

export function toCanvas(img, max, crop) {
  const { w, h } = sizeOf(img);
  const c = crop || { x: 0, y: 0, w, h };
  const scale = Math.min(1, max / Math.max(c.w, c.h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(c.w * scale);
  canvas.height = Math.round(c.h * scale);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function toKeepsake(img) {
  const canvas = toCanvas(img, 1280);
  return new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.82));
}
