import { useNavigate } from "react-router-dom";
import { useQuranStore } from "../store/quranStore";
import { Button } from "@/components/ui/button";
import { Play, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const StartButton = () => {
  const navigate = useNavigate();
  const { selectedSurah, selectedAyahs, repeatConfig } = useQuranStore();

  const canStart = selectedSurah && selectedAyahs.length > 0;

  const handleStart = () => {
    if (canStart) {
      navigate('/memorize');
    }
  };

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
            <p><strong>Ayat Terpilih:</strong> {totalAyahs} ayat</p>
            <p><strong>Pengulangan individual:</strong> {totalIndividualRepeats} total putar</p>
            <p><strong>Pengulangan rentang:</strong> {totalRangeRepeats} kali</p>
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