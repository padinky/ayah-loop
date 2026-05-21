import { useNavigate } from "react-router-dom";
import { useQuranStore } from "../store/quranStore";
import { Button } from "@/components/ui/button";
import { Play, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const StartButton = () => {
  const navigate = useNavigate();
  const { sessionMode, selectedSurah, selectedAyahs, repeatConfig, selectedReciter, youtubeLinks, youtubeSessionLoops } = useQuranStore();

  const canStart = sessionMode === "quran" ? Boolean(selectedSurah && selectedAyahs.length > 0) : youtubeLinks.length > 0;

  const handleStart = () => {
    if (canStart) {
      navigate('/memorize');
    }
  };

  if (sessionMode === "youtube") {
    const totalLinkLoops = youtubeLinks.reduce((sum, link) => sum + Math.max(1, link.loopCount), 0);
    return (
      <Card className="w-full shadow-peaceful">
        <CardContent className="p-6 space-y-4">
          {youtubeLinks.length === 0 ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <span>Tambahkan minimal satu link YouTube untuk memulai</span>
            </div>
          ) : (
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>Mode:</strong> YouTube Loop</p>
              <p><strong>Jumlah Link:</strong> {youtubeLinks.length}</p>
              <p><strong>Total loop per sesi:</strong> {totalLinkLoops} putar</p>
              <p><strong>Loop sesi:</strong> {youtubeSessionLoops} kali</p>
            </div>
          )}
          <Button
            onClick={handleStart}
            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300 shadow-elegant"
            disabled={!canStart}
          >
            <Play className="h-5 w-5 mr-2" />
            Mulai Murajaah YouTube
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!selectedSurah) {
    return (
      <Card className="w-full shadow-peaceful">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <span>Silakan pilih Surah terlebih dahulu</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedAyahs.length === 0) {
    return (
      <Card className="w-full shadow-peaceful">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <span>Silakan pilih setidaknya satu Ayat untuk dihafal</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAyahs = selectedAyahs.length;
  const totalIndividualRepeats = selectedAyahs.reduce(
    (sum, ayahNum) => sum + (repeatConfig.ayahs[ayahNum] || 1), 
    0
  );
  const totalRangeRepeats = repeatConfig.range;

  return (
    <Card className="w-full shadow-peaceful">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">Siap Memulai Hafalan</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><strong>Surah:</strong> {selectedSurah.englishName}</p>
            <p><strong>Qari:</strong> {selectedReciter?.englishName || 'Belum dipilih'}</p>
            <p><strong>Ayat Terpilih:</strong> {totalAyahs} ayat</p>
            <p><strong>Pengulangan individual:</strong> {totalIndividualRepeats} total putar</p>
            <p><strong>Pengulangan sesi:</strong> {totalRangeRepeats} kali</p>
          </div>
        </div>
        
        <Button 
          onClick={handleStart}
          className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300 shadow-elegant"
          disabled={!canStart}
        >
          <Play className="h-5 w-5 mr-2" />
          Mulai Hafalan
        </Button>
      </CardContent>
    </Card>
  );
};