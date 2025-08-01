import { useEffect, useRef } from "react";
import { Ayah } from "../store/quranStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2 } from "lucide-react";

interface AyahDisplayProps {
  ayah: Ayah;
  isActive: boolean;
  isPlaying: boolean;
  currentRepeat?: number;
  totalRepeats?: number;
}

export const AyahDisplay = ({ 
  ayah, 
  isActive, 
  isPlaying, 
  currentRepeat = 0, 
  totalRepeats = 1 
}: AyahDisplayProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [isActive]);

  return (
    <Card 
      ref={cardRef}
      className={`transition-all duration-300 ${
        isActive 
          ? 'ring-2 ring-primary shadow-peaceful bg-gradient-to-br from-islamic-green-light/20 to-card' 
          : 'shadow-sm'
      }`}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Badge 
            variant={isActive ? "default" : "secondary"}
            className="text-sm font-medium"
          >
            Ayat {ayah.numberInSurah}
          </Badge>
          
          {isActive && (
            <div className="flex items-center gap-2">
              {isPlaying && (
                <div className="flex items-center gap-1 text-primary">
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">Memutar</span>
                </div>
              )}
              {totalRepeats > 1 && (
                <Badge variant="outline" className="text-xs">
                  {currentRepeat + 1}/{totalRepeats}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className={`arabic-text text-2xl leading-relaxed ${
            isActive ? 'text-quran' : 'text-quran/80'
          }`}>
            {ayah.text}
          </div>
          
          {ayah.translation && (
            <div className={`translation-text ${
              isActive ? 'text-translation' : 'text-translation/70'
            }`}>
              {ayah.translation}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};