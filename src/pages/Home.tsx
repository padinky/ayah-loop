import { useEffect, useState, useRef } from "react";
import { useQuranStore, type Surah } from "../store/quranStore";
import { quranApi } from "../services/quranApi";
import { SurahSelector } from "../components/SurahSelector";
import { AyahSelector } from "../components/AyahSelector";
import { RangeRepeatControl } from "../components/RangeRepeatControl";
import { ReciterSelector } from "../components/ReciterSelector";
import { MobileWizard } from "../components/MobileWizard";
import { StartButton } from "../components/StartButton";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MENGHAFAL_INSTRUCTIONS_KEY = "ayah-loop-hide-menghafal-instructions";

/** Menghafal — pilih ayat dan ulang dengan audio (route `/`) */
const Menghafal = () => {
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { selectedSurah, selectedReciter, setSessionMode, setAyahs, resetMemorization } =
    useQuranStore();
  const { toast } = useToast();
  const rangeRepeatRef = useRef<HTMLDivElement>(null);
  const reciterSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionMode("quran");
    resetMemorization();
  }, [setSessionMode, resetMemorization]);

  useEffect(() => {
    try {
      const hidden = localStorage.getItem(MENGHAFAL_INSTRUCTIONS_KEY);
      setShowInstructions(hidden !== "1");
    } catch {
      setShowInstructions(true);
    }
  }, []);

  const dismissInstructions = () => {
    setShowInstructions(false);
    try {
      localStorage.setItem(MENGHAFAL_INSTRUCTIONS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const reloadAyahsWithNewReciter = async () => {
      if (selectedSurah && selectedReciter) {
        setLoading(true);
        try {
          const ayahsData = await quranApi.getCombinedSurahData(
            selectedSurah.number,
            selectedReciter.identifier
          );
          setAyahs(ayahsData);
        } catch (error) {
          console.error("Error reloading ayahs with new reciter:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    reloadAyahsWithNewReciter();
  }, [selectedReciter, selectedSurah, setAyahs]);

  const handleSurahSelect = async (surah: Surah) => {
    useQuranStore.getState().setSelectedSurah(surah);
    useQuranStore.setState({
      selectedAyahs: [],
      repeatConfig: { ayahs: {}, range: 1 },
    });
    setLoading(true);
    try {
      const ayahsData = await quranApi.getCombinedSurahData(
        surah.number,
        selectedReciter?.identifier
      );
      setAyahs(ayahsData);
      toast({
        title: "Surah Berhasil Dimuat",
        description: `${surah.englishName} dengan ${ayahsData.length} ayat siap untuk dipilih.`,
      });

      setTimeout(() => {
        if (window.innerWidth < 1024 && reciterSelectorRef.current) {
          reciterSelectorRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error loading surah:", error);
      toast({
        title: "Gagal Memuat Surah",
        description: "Gagal memuat ayat. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Menghafal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pilih surah dan ayat, atur pengulangan, lalu mulai sesi hafalan
        </p>
      </div>

      {showInstructions && (
        <Alert className="bg-secondary/40 border-secondary/60 p-3 pr-10 relative">
          <button
            type="button"
            aria-label="Sembunyikan petunjuk"
            className="absolute right-2 top-2 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            onClick={dismissInstructions}
          >
            <X className="h-4 w-4" />
          </button>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-muted-foreground text-sm">
            Pilih surah dan ayat yang ingin dihafal, atur jumlah pengulangan, lalu mulai.
            Semoga Allah mudahkan.
          </AlertDescription>
        </Alert>
      )}

      <div className="lg:hidden">
        <MobileWizard />
      </div>

      <div className="hidden lg:grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <SurahSelector onSurahSelect={handleSurahSelect} />
          <div ref={reciterSelectorRef}>
            <ReciterSelector />
          </div>
          {selectedSurah && (
            <div ref={rangeRepeatRef}>
              <RangeRepeatControl />
            </div>
          )}
        </div>

        <div className="space-y-6">
          {loading ? (
            <Card className="shadow-peaceful">
              <CardContent className="p-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <p className="text-muted-foreground">Memuat ayat...</p>
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
  );
};

export default Menghafal;
