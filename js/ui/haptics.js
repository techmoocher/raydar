// Vibration for phones and tablets. Desktops (and iOS, which has no Vibration API) stay still.

export function isHandheld() {
  if (navigator.userAgentData?.mobile) return true;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod|Mobile|Tablet|Silk|Kindle/i.test(ua)) return true;
  // iPadOS 13+ reports itself as a Mac.
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true;
  return window.matchMedia("(pointer: coarse) and (hover: none)").matches;
}

const canBuzz = () => "vibrate" in navigator && isHandheld();

export function buzz(pattern) {
  if (!canBuzz()) return;
  try {
    navigator.vibrate(pattern);
  } catch {}
}

export const stopBuzz = () => buzz(0);
