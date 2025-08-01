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
            <span>Please select a Surah first</span>
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
            <span>Please select at least one Ayah to memorize</span>
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
          <h3 className="font-semibold text-primary">Ready to Start Memorization</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><strong>Surah:</strong> {selectedSurah.englishName}</p>
            <p><strong>Selected Ayahs:</strong> {totalAyahs} ayah{totalAyahs !== 1 ? 's' : ''}</p>
            <p><strong>Individual repeats:</strong> {totalIndividualRepeats} total plays</p>
            <p><strong>Range repeats:</strong> {totalRangeRepeats} time{totalRangeRepeats !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        <Button 
          onClick={handleStart}
          className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300 shadow-elegant"
          disabled={!canStart}
        >
          <Play className="h-5 w-5 mr-2" />
          Start Memorization
        </Button>
      </CardContent>
    </Card>
  );
};