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
    // Reset selections when changing surah
    useQuranStore.getState().setSelectedSurah(surah);
    useQuranStore.setState({ 
      selectedAyahs: [], 
      repeatConfig: { ayahs: {}, range: 1 } 
    });
    setLoading(true);
    
    try {
      const ayahsData = await quranApi.getCombinedSurahData(surah.number);
      setAyahs(ayahsData);
      toast({
        title: "Surah Berhasil Dimuat",
        description: `${surah.englishName} dengan ${ayahsData.length} ayat siap untuk dipilih.`,
      });
    } catch (error) {
      console.error('Error loading surah:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-islamic-green-light/10 to-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Assalamu'alaykum, Penghafal Al-Qur'an!
              </h1>
              <p className="text-muted-foreground">
                Mulai perjalanan indah Anda menghafal Al-Qur'an
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
              Selamat Datang di Perjalanan Menghafal Anda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Pilih surah, pilih ayat yang ingin Anda hafal, atur preferensi pengulangan, 
              dan mulai perjalanan spiritual Anda dengan panduan hafalan audio. 
              Semoga Allah mudahkan untuk Anda. Aamiin.
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
    </div>
  );
};

export default Home;