import { useEffect, useState } from "react";
import { useQuranStore, Surah } from "../store/quranStore";
import { quranApi } from "../services/quranApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Book } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SurahSelectorProps {
  onSurahSelect: (surah: Surah) => void;
}

export const SurahSelector = ({ onSurahSelect }: SurahSelectorProps) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedSurah } = useQuranStore();

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoading(true);
        const surahData = await quranApi.getSurahs();
        setSurahs(surahData);
        setFilteredSurahs(surahData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Surahs');
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  useEffect(() => {
    const filtered = surahs.filter(surah =>
      surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.name.includes(searchTerm) ||
      surah.number.toString().includes(searchTerm)
    );
    setFilteredSurahs(filtered);
  }, [searchTerm, surahs]);

  if (loading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-destructive text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-peaceful">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Book className="h-5 w-5" />
          Select Surah
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Surah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-2 p-4">
            {filteredSurahs.map((surah) => (
              <Button
                key={surah.number}
                onClick={() => onSurahSelect(surah)}
                variant={selectedSurah?.number === surah.number ? "default" : "ghost"}
                className="w-full justify-start p-4 h-auto text-left group hover:bg-islamic-green-light hover:text-primary transition-all"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm bg-muted px-2 py-1 rounded">
                        {surah.number}
                      </span>
                      <span className="font-medium">{surah.englishName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs
                    </div>
                  </div>
                  <div className="arabic-text text-lg font-normal text-right">
                    {surah.name}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};