import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuranStore } from "../store/quranStore";
import { AyahDisplay } from "../components/AyahDisplay";
import { AudioPlayer } from "../components/AudioPlayer";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, BookOpen, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Memorize = () => {
  const navigate = useNavigate();
  const { 
    selectedSurah, 
    ayahs, 
    selectedAyahs, 
    currentAyah, 
    isPlaying, 
    repeatConfig 
  } = useQuranStore();

  useEffect(() => {
    if (!selectedSurah || selectedAyahs.length === 0) {
      navigate('/');
    }
  }, [selectedSurah, selectedAyahs, navigate]);

  if (!selectedSurah || selectedAyahs.length === 0) {
    return null;
  }

  const selectedAyahsData = ayahs.filter(ayah => 
    selectedAyahs.includes(ayah.numberInSurah)
  );

  const currentAyahData = selectedAyahsData.find(ayah => 
    ayah.numberInSurah === currentAyah
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-islamic-green-light/10 to-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/')}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  {selectedSurah.englishName}
                </h1>
                <p className="text-sm text-muted-foreground arabic-text text-lg">
                  {selectedSurah.name}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-islamic-gold" />
              <Badge variant="outline">
                {selectedAyahs.length} Ayah{selectedAyahs.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Audio Player - Fixed position */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <AudioPlayer />
            </div>
          </div>

          {/* Ayahs Display */}
          <div className="lg:col-span-2">
            <Card className="shadow-peaceful">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-primary">Ayahs for Memorization</span>
                  {currentAyahData && (
                    <Badge className="bg-gradient-to-r from-primary to-primary-glow">
                      Currently: Ayah {currentAyahData.numberInSurah}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[70vh]">
                  <div className="space-y-4 p-6">
                    {selectedAyahsData.map((ayah) => {
                      const isActive = currentAyah === ayah.numberInSurah;
                      const ayahRepeats = repeatConfig.ayahs[ayah.numberInSurah] || 1;
                      
                      return (
                        <AyahDisplay
                          key={ayah.numberInSurah}
                          ayah={ayah}
                          isActive={isActive}
                          isPlaying={isActive && isPlaying}
                          totalRepeats={ayahRepeats}
                        />
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            "And We have certainly made the Quran easy for remembrance, so is there any who will remember?" 
            <span className="block mt-1 text-xs">— Quran 54:17</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Memorize;