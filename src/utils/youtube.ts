const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export const extractYouTubeVideoId = (rawUrl: string): string | null => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (!YOUTUBE_HOSTS.has(url.hostname)) {
      return null;
    }

    if (url.hostname.includes("youtu.be")) {
      const shortId = url.pathname.replace("/", "").split("/")[0];
      return VIDEO_ID_PATTERN.test(shortId) ? shortId : null;
    }

    const fromQuery = url.searchParams.get("v");
    if (fromQuery && VIDEO_ID_PATTERN.test(fromQuery)) {
      return fromQuery;
    }

    const pathSegments = url.pathname.split("/").filter(Boolean);
    const embedIndex = pathSegments.findIndex((segment) => segment === "embed" || segment === "shorts");
    if (embedIndex >= 0 && pathSegments[embedIndex + 1]) {
      const id = pathSegments[embedIndex + 1];
      return VIDEO_ID_PATTERN.test(id) ? id : null;
    }
  } catch {
    return null;
  }

  return null;
};

export const buildYouTubeEmbedUrl = (videoId: string, autoplay = false): string => {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
    origin: window.location.origin,
  });

  if (autoplay) {
    params.set("autoplay", "1");
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};
