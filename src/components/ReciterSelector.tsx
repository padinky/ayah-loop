import { useEffect, useState } from "react";
import { useQuranStore, Reciter } from "../store/quranStore";
import { quranApi } from "../services/quranApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, RotateCcw, User } from "lucide-react";

export const ReciterSelector = ({ showResetButton = false }: { showResetButton?: boolean }) => {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tempSelectedReciter, setTempSelectedReciter] = useState<string>("");
  const { selectedReciter, setSelectedReciter, resetMemorization, selectedSurah, setAyahs } = useQuranStore();

  useEffect(() => {
    const fetchReciters = async () => {
      try {
        setLoading(true);
        const reciterData = await quranApi.getReciters();
        setReciters(reciterData);
        // Set temp selected to current reciter when available
        if (selectedReciter) {
          setTempSelectedReciter(selectedReciter.identifier);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Reciters');
      } finally {
        setLoading(false);
      }
    };

    fetchReciters();
  }, [selectedReciter]);

  const handleReciterChange = (value: string) => {
    setTempSelectedReciter(value);
  };

  const handleResetAndRestart = async () => {
    const newReciter = reciters.find(r => r.identifier === tempSelectedReciter);
    if (newReciter && selectedSurah) {
      setSelectedReciter(newReciter);
      // Reload audio with new reciter
      try {
        const ayahsData = await quranApi.getCombinedSurahData(selectedSurah.number, newReciter.identifier);
        setAyahs(ayahsData);
      } catch (error) {
        console.error('Error reloading audio:', error);
      }
    }
    resetMemorization();
  };

  if (loading) {
    return (
      <Card className="w-full shadow-peaceful">
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-peaceful">
        <CardContent className="p-6">
          <p className="text-destructive text-center text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-peaceful">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Volume2 className="h-5 w-5" />
          Pilih Qari
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showResetButton && selectedReciter && (
          <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
            <User className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Qari Saat Ini:</p>
              <p className="text-xs text-muted-foreground">{selectedReciter.englishName}</p>
            </div>
          </div>
        )}
        
        <Select
          value={tempSelectedReciter}
          onValueChange={handleReciterChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih Qari..." />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            {reciters.map((reciter) => (
              <SelectItem key={reciter.identifier} value={reciter.identifier}>
                {reciter.englishName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {showResetButton && (
          <Button
            onClick={handleResetAndRestart}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Ganti Qari dan Ulang Dari Awal
          </Button>
        )}
      </CardContent>
    </Card>
  );
};