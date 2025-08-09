import { useEffect, useState } from "react";
import { useQuranStore, Reciter } from "../store/quranStore";
import { quranApi } from "../services/quranApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2 } from "lucide-react";

export const ReciterSelector = () => {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedReciter, setSelectedReciter } = useQuranStore();

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
      <CardContent>
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
                <div className="flex items-center justify-between w-full">
                  <span>{reciter.englishName}</span>
                  <span className="text-sm text-muted-foreground arabic-text">
                    {reciter.name}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};