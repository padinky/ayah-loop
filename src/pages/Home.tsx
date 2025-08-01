import { useEffect, useState } from "react";
import { useQuranStore } from "../store/quranStore";
import { quranApi } from "../services/quranApi";
import { SurahSelector } from "../components/SurahSelector";
import { AyahSelector } from "../components/AyahSelector";
import { RangeRepeatControl } from "../components/RangeRepeatControl";
import { StartButton } from "../components/StartButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const { selectedSurah, setAyahs, resetMemorization } = useQuranStore();
  const { toast } = useToast();

  useEffect(() => {
    resetMemorization();
  }, [resetMemorization]);

  const handleSurahSelect = async (surah: any) => {
    useQuranStore.getState().setSelectedSurah(surah);
    setLoading(true);
    
    try {
      const ayahsData = await quranApi.getCombinedSurahData(surah.number);
      setAyahs(ayahsData);
      toast({
        title: "Surah Loaded Successfully",
        description: `${surah.englishName} with ${ayahsData.length} ayahs is ready for selection.`,
      });
    } catch (error) {
      console.error('Error loading surah:', error);
      toast({
        title: "Error Loading Surah",
        description: "Failed to load ayahs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-islamic-green-light/10 to-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Quran Memorizer
              </h1>
              <p className="text-muted-foreground">
                Begin your beautiful journey of memorizing the Holy Quran
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Welcome Card */}
        <Card className="mb-8 shadow-peaceful bg-gradient-to-r from-card to-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Heart className="h-5 w-5 text-islamic-gold" />
              Welcome to Your Memorization Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Select a Surah, choose the ayahs you wish to memorize, set your repeat preferences, 
              and begin your spiritual journey with audio-guided memorization. 
              May Allah make it easy for you. Ameen.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <SurahSelector onSurahSelect={handleSurahSelect} />
            
            {selectedSurah && (
              <RangeRepeatControl />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {loading ? (
              <Card className="shadow-peaceful">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading ayahs...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <AyahSelector />
            )}
            
            <StartButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;