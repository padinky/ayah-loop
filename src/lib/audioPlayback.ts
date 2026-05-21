/** Tiny silent WAV — primes `<audio>` for later play() on iOS/Android (must run inside a user gesture). */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

const GESTURE_WINDOW_MS = 5000;

let lastGestureAt = 0;

/** Call synchronously from click/touch handlers before async round loads. */
export function noteAudioUserGesture(el: HTMLAudioElement | null): void {
  lastGestureAt = Date.now();
  if (el) unlockAudioElement(el);
}

export function hadRecentAudioGesture(): boolean {
  return Date.now() - lastGestureAt < GESTURE_WINDOW_MS;
}

export function unlockAudioElement(el: HTMLAudioElement): void {
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  const saved = el.src;
  el.volume = 0.001;
  el.src = SILENT_WAV;
  void el.play().then(
    () => {
      el.pause();
      el.currentTime = 0;
      el.volume = 1;
      if (saved) el.src = saved;
      else el.removeAttribute("src");
    },
    () => {
      el.volume = 1;
      if (saved) el.src = saved;
    }
  );
}

export function playAudioUrl(el: HTMLAudioElement, url: string): Promise<void> {
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  el.pause();
  el.src = url;
  el.currentTime = 0;
  el.load();
  return el.play();
}

/**
 * Autoplay prompt audio when round changes. Returns cleanup.
 * `onBlocked` runs if autoplay fails (common on mobile without a recent gesture).
 */
export function attachPromptAutoplay(
  el: HTMLAudioElement,
  url: string,
  onBlocked: () => void
): () => void {
  el.pause();
  el.src = url;
  el.currentTime = 0;
  el.load();

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    el.removeEventListener("canplaythrough", tryPlay);
    el.removeEventListener("canplay", tryPlay);
  };

  const tryPlay = () => {
    void playAudioUrl(el, url)
      .then(() => cleanup())
      .catch(() => {
        if (hadRecentAudioGesture()) {
          window.setTimeout(() => {
            void playAudioUrl(el, url)
              .then(() => cleanup())
              .catch(() => {
                cleanup();
                onBlocked();
              });
          }, 120);
        } else {
          cleanup();
          onBlocked();
        }
      });
  };

  if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    tryPlay();
  } else {
    el.addEventListener("canplaythrough", tryPlay, { once: true });
    el.addEventListener("canplay", tryPlay, { once: true });
  }

  return cleanup;
}
