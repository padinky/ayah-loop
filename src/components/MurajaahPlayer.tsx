import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  CheckCircle,
  Volume2,
  User,
} from "lucide-react";
import type { Ayah } from "@/store/quranStore";
import type { Reciter } from "@/store/quranStore";

interface MurajaahPlayerProps {
  playlist: Ayah[];
  currentIndex: number;
  sessionLoop: number;
  sessionLoops: number;
  isPlaying: boolean;
  isCompleted: boolean;
  selectedReciter: Reciter | null;
  canAdvance: boolean;
  onIndexChange: (index: number) => void;
  onSessionLoopChange: (loop: number) => void;
  onPlayingChange: (playing: boolean) => void;
  onCompleted: () => void;
  onRestart: () => void;
}

export function MurajaahPlayer({
  playlist,
  currentIndex,
  sessionLoop,
  sessionLoops,
  isPlaying,
  isCompleted,
  selectedReciter,
  canAdvance,
  onIndexChange,
  onSessionLoopChange,
  onPlayingChange,
  onCompleted,
  onRestart,
}: MurajaahPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentAyah = playlist[currentIndex];

  useEffect(() => {
    if (!isPlaying || !currentAyah?.audio || !audioRef.current) return;
    const el = audioRef.current;
    if (el.src !== currentAyah.audio) {
      el.src = currentAyah.audio;
      el.currentTime = 0;
    }
    void el.play().catch(() => onPlayingChange(false));
  }, [isPlaying, currentAyah?.audio, currentIndex]);

  const handleAudioEnd = () => {
    if (currentIndex < playlist.length - 1) {
      onIndexChange(currentIndex + 1);
      return;
    }
    if (sessionLoop + 1 < sessionLoops) {
      onSessionLoopChange(sessionLoop + 1);
      onIndexChange(0);
      return;
    }
    onPlayingChange(false);
    onCompleted();
  };

  const handlePlay = () => {
    if (!currentAyah?.audio) return;
    onPlayingChange(true);
  };

  const handlePause = () => {
    audioRef.current?.pause();
    onPlayingChange(false);
  };

  const skipBack = () => {
    if (currentIndex > 0) onIndexChange(currentIndex - 1);
  };

  const skipForward = () => {
    if (!canAdvance) return;
    if (currentIndex < playlist.length - 1) {
      onIndexChange(currentIndex + 1);
      return;
    }
    if (sessionLoop + 1 < sessionLoops) {
      onSessionLoopChange(sessionLoop + 1);
      onIndexChange(0);
    }
  };

  if (playlist.length === 0) {
    return (
      <Card className="w-full shadow-peaceful">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Playlist belum siap.</p>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card className="w-full shadow-peaceful">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5 text-islamic-gold" />
            Murajaah selesai
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Alhamdulillah! Anda telah menyelesaikan sesi murajaah.
          </p>
          <Button onClick={onRestart} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Mulai lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progress =
    playlist.length > 0 ? ((currentIndex + 1) / playlist.length) * 100 : 0;

  return (
    <Card className="w-full shadow-peaceful">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Volume2 className="h-5 w-5" />
          Pemutar Murajaah
        </CardTitle>
        {selectedReciter ? (
          <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
            <User className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Qari:</p>
              <p className="text-xs text-muted-foreground">
                {selectedReciter.englishName}
              </p>
            </div>
          </div>
        ) : null}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Ayat {currentIndex + 1} dari {playlist.length}
            </span>
            <Badge variant="outline">
              Sesi: {sessionLoop + 1}/{sessionLoops}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={skipBack}
            disabled={currentIndex === 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          {isPlaying ? (
            <Button
              size="lg"
              onClick={handlePause}
              className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary-glow"
            >
              <Pause className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handlePlay}
              disabled={!currentAyah?.audio}
              className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary-glow"
            >
              <Play className="h-5 w-5 ml-1" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={skipForward}
            disabled={
              !canAdvance &&
              currentIndex >= playlist.length - 1 &&
              sessionLoop + 1 >= sessionLoops
            }
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        <audio
          ref={audioRef}
          onEnded={handleAudioEnd}
          onError={() => onPlayingChange(false)}
          preload="metadata"
          className="hidden"
        />
        {!canAdvance && currentIndex >= playlist.length - 1 ? (
          <p className="text-xs text-center text-muted-foreground">
            Memuat surah berikutnya…
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
