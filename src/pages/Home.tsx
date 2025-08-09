import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuranStore } from "../store/quranStore";
import { quranApi } from "../services/quranApi";
import { SurahSelector } from "../components/SurahSelector";
import { AyahSelector } from "../components/AyahSelector";
import { RangeRepeatControl } from "../components/RangeRepeatControl";
import { ReciterSelector } from "../components/ReciterSelector";
import { StartButton } from "../components/StartButton";
import { ThemeToggle } from "../components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const {
    selectedSurah,
    selectedReciter,
    setAyahs,
    resetMemorization
  } = useQuranStore();
  const {
    toast
  } = useToast();
  const rangeRepeatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    resetMemorization();
  }, [resetMemorization]);
  const handleSurahSelect = async (surah: any) => {
    // Reset selections when changing surah
    useQuranStore.getState().setSelectedSurah(surah);
    useQuranStore.setState({
      selectedAyahs: [],
      repeatConfig: {
        ayahs: {},
        range: 1
      }
    });
    setLoading(true);
    try {
      const ayahsData = await quranApi.getCombinedSurahData(surah.number, selectedReciter?.identifier);
      setAyahs(ayahsData);
      toast({
        title: "Surah Berhasil Dimuat",
        description: `${surah.englishName} dengan ${ayahsData.length} ayat siap untuk dipilih.`
      });

      // Scroll to range repeat section on mobile
      setTimeout(() => {
        if (window.innerWidth < 1024 && rangeRepeatRef.current) {
          rangeRepeatRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error loading surah:', error);
      toast({
        title: "Gagal Memuat Surah",
        description: "Gagal memuat ayat. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-islamic-green-light/10 to-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Assalamu'alaykum, Penghafal Al-Qur'an!
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">Aplikasi Ini Membantu Mengulang Hafalan Anda</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => navigate('/about')} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Tentang</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Instruction Banner */}
        {showInstructions && (
          <Alert className="mb-8 bg-secondary/40 border-secondary/60 p-3 sm:p-4 pr-10 rounded-md shadow-peaceful relative">
            <button
              aria-label="Hide instructions"
              className="absolute right-2 top-2 z-10 p-2 -m-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 active:bg-foreground/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 touch-manipulation"
              onClick={() => setShowInstructions(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-muted-foreground text-sm sm:text-base">
              Pilih surah, pilih ayat yang ingin Anda hafal, atur preferensi pengulangan, dan mulai perjalanan spiritual Anda dengan panduan hafalan audio. Semoga Allah mudahkan untuk Anda. Aamiin.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <SurahSelector onSurahSelect={handleSurahSelect} />
            <ReciterSelector />
            
            {selectedSurah && <div ref={rangeRepeatRef}>
                <RangeRepeatControl />
              </div>}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {loading ? <Card className="shadow-peaceful">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Memuat ayat...</p>
                  </div>
                </CardContent>
              </Card> : <AyahSelector />}
            
            <StartButton />
          </div>
        </div>
      </div>
    </div>;
};
export default Home;