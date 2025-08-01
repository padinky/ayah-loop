import { useEffect, useRef, useState } from "react";
import { useQuranStore } from "../store/quranStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  RotateCcw,
  CheckCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AudioPlayer = () => {
  const {
    ayahs,
    selectedAyahs,
    repeatConfig,
    currentAyah,
    isPlaying,
    currentRepeat,
    rangeRepeat,
    setCurrentAyah,
    setIsPlaying,
    incrementCurrentRepeat,
    incrementRangeRepeat,
    resetMemorization,
    resetCurrentRepeat
  } = useQuranStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const selectedAyahsData = ayahs.filter(ayah => 
    selectedAyahs.includes(ayah.numberInSurah)
  );

  useEffect(() => {
    if (selectedAyahsData.length > 0 && currentAyah === null) {
      setCurrentAyah(selectedAyahsData[0].numberInSurah);
      setCurrentAyahIndex(0);
    }
  }, [selectedAyahsData, currentAyah, setCurrentAyah]);

  const currentAyahData = selectedAyahsData[currentAyahIndex];
  const currentAyahRepeats = currentAyahData ? (repeatConfig.ayahs[currentAyahData.numberInSurah] || 1) : 1;

  const handlePlay = () => {
    if (audioRef.current && currentAyahData?.audio) {
      audioRef.current.src = currentAyahData.audio;
      audioRef.current.play();
      setIsPlaying(true);
      setCurrentAyah(currentAyahData.numberInSurah);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const moveToNextAyah = () => {
    if (currentAyahIndex < selectedAyahsData.length - 1) {
      const nextIndex = currentAyahIndex + 1;
      setCurrentAyahIndex(nextIndex);
      setCurrentAyah(selectedAyahsData[nextIndex].numberInSurah);
      return true;
    }
    return false;
  };

  const moveToPreviousAyah = () => {
    if (currentAyahIndex > 0) {
      const prevIndex = currentAyahIndex - 1;
      setCurrentAyahIndex(prevIndex);
      setCurrentAyah(selectedAyahsData[prevIndex].numberInSurah);
      incrementCurrentRepeat();
    }
  };

  const handleAudioEnd = () => {
    if (currentRepeat + 1 < currentAyahRepeats) {
      // Repeat current ayah
      incrementCurrentRepeat();
      setTimeout(() => {
        if (audioRef.current && currentAyahData?.audio) {
          audioRef.current.play();
        }
      }, 500);
    } else {
      // Move to next ayah or complete range
      if (!moveToNextAyah()) {
        // End of ayahs, check range repeat
        if (rangeRepeat + 1 < repeatConfig.range) {
          incrementRangeRepeat();
          setCurrentAyahIndex(0);
          setCurrentAyah(selectedAyahsData[0].numberInSurah);
          resetCurrentRepeat(); // Reset only current repeat counter when starting new range
          setTimeout(() => {
            if (audioRef.current && selectedAyahsData[0]?.audio) {
              audioRef.current.src = selectedAyahsData[0].audio;
              audioRef.current.play();
            }
          }, 500);
        } else {
          // Completely finished
          setIsPlaying(false);
          setIsCompleted(true);
        }
      } else {
        // Reset current repeat counter when moving to next ayah
        resetCurrentRepeat();
        // Auto-play next ayah
        setTimeout(() => {
          if (audioRef.current && selectedAyahsData[currentAyahIndex + 1]?.audio) {
            audioRef.current.src = selectedAyahsData[currentAyahIndex + 1].audio;
            audioRef.current.play();
          }
        }, 500);
      }
    }
  };

  const handleRestart = () => {
    resetMemorization();
    setCurrentAyahIndex(0);
    setIsCompleted(false);
    if (selectedAyahsData.length > 0) {
      setCurrentAyah(selectedAyahsData[0].numberInSurah);
    }
  };

  if (selectedAyahsData.length === 0) {
    return (
      <Card className="w-full shadow-peaceful">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No ayahs selected for memorization
          </p>
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
            Memorization Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Alhamdulillahi rabbil aamiin! You have completed memorizing the selected ayahs.
          </p>
          <Button onClick={handleRestart} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Start Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalAyahs = selectedAyahsData.length;
  const progressPercentage = ((currentAyahIndex) / totalAyahs) * 100;

  return (
    <Card className="w-full shadow-peaceful">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Volume2 className="h-5 w-5" />
          Audio Player
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Ayah {currentAyahIndex + 1} of {totalAyahs}
            </span>
            <div className="flex gap-2">
              <Badge variant="outline">
                Range: {rangeRepeat + 1}/{repeatConfig.range}
              </Badge>
              {currentAyahData && (
                <Badge variant="outline">
                  Repeat: {currentRepeat + 1}/{currentAyahRepeats}
                </Badge>
              )}
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
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
              className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary-glow"
              disabled={!currentAyahData?.audio}
            >
              <Play className="h-5 w-5 ml-1" />
            </Button>
          )}
        </div>

        <audio
          ref={audioRef}
          onEnded={handleAudioEnd}
          onError={() => {
            console.error('Audio failed to load');
            setIsPlaying(false);
          }}
          preload="metadata"
        />
      </CardContent>
    </Card>
  );
};