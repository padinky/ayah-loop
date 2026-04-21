import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuranStore } from "../store/quranStore";
import { buildYouTubeEmbedUrl } from "../utils/youtube";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, RotateCcw, SkipForward, Youtube } from "lucide-react";

declare global {
  interface YouTubePlayer {
    playVideo: () => void;
    loadVideoById: (videoId: string) => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    destroy: () => void;
  }

  interface YouTubePlayerEvent {
    data: number;
  }

  interface Window {
    YT?: {
      Player: new (target: HTMLElement, options: unknown) => YouTubePlayer;
      PlayerState: {
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiReady: Promise<void> | null = null;

const ensureYouTubeApi = (): Promise<void> => {
  if (youtubeApiReady) return youtubeApiReady;

  youtubeApiReady = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
  });

  return youtubeApiReady;
};

export const YouTubeLoopPlayer = () => {
  const {
    youtubeLinks,
    youtubeSessionLoops,
    currentLinkIndex,
    currentLinkLoop,
    currentSessionLoop,
    setCurrentLinkIndex,
    setCurrentLinkLoop,
    setCurrentSessionLoop,
    resetYouTubeSession,
  } = useQuranStore();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const playerInstanceRef = useRef<YouTubePlayer | null>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const linkIndexRef = useRef(currentLinkIndex);
  const linkLoopRef = useRef(currentLinkLoop);
  const sessionLoopRef = useRef(currentSessionLoop);
  const linksRef = useRef(youtubeLinks);
  const sessionLoopsRef = useRef(youtubeSessionLoops);

  const currentLink = youtubeLinks[currentLinkIndex];
  const progressValue = useMemo(() => {
    if (youtubeSessionLoops <= 0) return 0;
    return (currentSessionLoop / youtubeSessionLoops) * 100;
  }, [currentSessionLoop, youtubeSessionLoops]);

  useEffect(() => {
    const activeLink = youtubeLinks[currentLinkIndex];
    if (!activeLink) {
      setVideoTitle("");
      return;
    }

    let isCancelled = false;
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      activeLink.url
    )}&format=json`;

    fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch title");
        }
        return response.json();
      })
      .then((data: { title?: string }) => {
        if (!isCancelled) {
          setVideoTitle(data.title || "");
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setVideoTitle("");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentLinkIndex, youtubeLinks]);

  useEffect(() => {
    linkIndexRef.current = currentLinkIndex;
    linkLoopRef.current = currentLinkLoop;
    sessionLoopRef.current = currentSessionLoop;
    linksRef.current = youtubeLinks;
    sessionLoopsRef.current = youtubeSessionLoops;
  }, [currentLinkIndex, currentLinkLoop, currentSessionLoop, youtubeLinks, youtubeSessionLoops]);

  const moveNext = useCallback(() => {
    const links = linksRef.current;
    const linkIndex = linkIndexRef.current;
    const linkLoop = linkLoopRef.current;
    const sessionLoop = sessionLoopRef.current;
    const sessionLoops = sessionLoopsRef.current;
    const link = links[linkIndex];
    if (!link) return;

    const hasMoreLoopsForCurrentLink = linkLoop + 1 < Math.max(1, link.loopCount);
    if (hasMoreLoopsForCurrentLink) {
      setCurrentLinkLoop(linkLoop + 1);
      playerInstanceRef.current?.seekTo(0, true);
      playerInstanceRef.current?.playVideo();
      return;
    }

    const hasNextLink = linkIndex + 1 < links.length;
    if (hasNextLink) {
      const nextIndex = linkIndex + 1;
      setCurrentLinkIndex(nextIndex);
      setCurrentLinkLoop(0);
      playerInstanceRef.current?.loadVideoById(links[nextIndex].videoId);
      return;
    }

    const hasMoreSessionLoops = sessionLoop + 1 < Math.max(1, sessionLoops);
    if (hasMoreSessionLoops) {
      const nextSessionLoop = sessionLoop + 1;
      setCurrentSessionLoop(nextSessionLoop);
      setCurrentLinkIndex(0);
      setCurrentLinkLoop(0);
      playerInstanceRef.current?.loadVideoById(links[0].videoId);
      return;
    }

    setIsCompleted(true);
  }, [setCurrentLinkIndex, setCurrentLinkLoop, setCurrentSessionLoop]);

  useEffect(() => {
    if (!currentLink || !iframeContainerRef.current) return;

    let isMounted = true;
    setIsReady(false);

    ensureYouTubeApi().then(() => {
      if (!isMounted || !iframeContainerRef.current || !window.YT?.Player) return;

      if (playerInstanceRef.current?.destroy) {
        playerInstanceRef.current.destroy();
      }

      playerInstanceRef.current = new window.YT.Player(iframeContainerRef.current, {
        videoId: currentLink.videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          autoplay: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            setIsReady(true);
            playerInstanceRef.current?.playVideo();
          },
          onStateChange: (event: YouTubePlayerEvent) => {
            if (window.YT && event.data === window.YT.PlayerState.ENDED) {
              moveNext();
            }
          },
        },
      });
    });

    return () => {
      isMounted = false;
      if (playerInstanceRef.current?.destroy) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
    };
  }, [currentLink?.videoId, moveNext]);

  if (!currentLink) {
    return (
      <Card className="shadow-peaceful">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Tidak ada link YouTube untuk diputar.</p>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card className="shadow-peaceful">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5 text-islamic-gold" />
            Sesi YouTube Selesai
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Alhamdulillah, semua link sudah diputar sesuai target loop sesi.
          </p>
          <Button
            onClick={() => {
              setIsCompleted(false);
              resetYouTubeSession();
            }}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Mulai Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-peaceful">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Youtube className="h-5 w-5" />
          {videoTitle || "Pemutar YouTube"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            Link: {currentLinkIndex + 1}/{youtubeLinks.length}
          </Badge>
          <Badge variant="outline">
            Loop link: {currentLinkLoop + 1}/{Math.max(1, currentLink.loopCount)}
          </Badge>
          <Badge variant="outline">
            Sesi: {currentSessionLoop + 1}/{Math.max(1, youtubeSessionLoops)}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground">
          Progress sesi: {Math.round(progressValue)}%
        </div>

        <div className="w-full overflow-hidden rounded-md border bg-black">
          <div ref={iframeContainerRef} className="w-full aspect-video" />
        </div>

        {!isReady && (
          <p className="text-xs text-muted-foreground">Menyiapkan pemutar YouTube...</p>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={moveNext}>
            <SkipForward className="h-4 w-4 mr-1" />
            Lewati Link
          </Button>
        </div>

        <a className="text-xs text-muted-foreground hover:underline" href={buildYouTubeEmbedUrl(currentLink.videoId)} target="_blank" rel="noreferrer">
          Buka embed URL saat ini
        </a>
      </CardContent>
    </Card>
  );
};
