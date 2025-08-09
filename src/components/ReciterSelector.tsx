import { useEffect, useState } from "react";
import { useQuranStore, Reciter } from "../store/quranStore";
import { quranApi } from "../services/quranApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Volume2, RotateCcw } from "lucide-react";

export const ReciterSelector = ({ showResetButton = false }: { showResetButton?: boolean }) => {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedReciter, setSelectedReciter, resetMemorization } = useQuranStore();

  useEffect(() => {
    const fetchReciters = async () => {
      try {
        setLoading(true);
        const reciterData = await quranApi.getReciters();
        setReciters(reciterData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Reciters');
      } finally {
        setLoading(false);
      }
    };

    fetchReciters();
  }, []);

  const handleReciterChange = (value: string) => {
    const reciter = reciters.find(r => r.identifier === value);
    if (reciter) {
      setSelectedReciter(reciter);
    }
  };

  const handleResetAndRestart = () => {
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
        <Select
          value={selectedReciter?.identifier || ""}
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