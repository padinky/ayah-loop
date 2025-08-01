import { useQuranStore } from "../store/quranStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileText, Repeat } from "lucide-react";

export const AyahSelector = () => {
  const { 
    ayahs, 
    selectedAyahs, 
    repeatConfig, 
    toggleAyahSelection, 
    setAyahRepeat 
  } = useQuranStore();

  if (ayahs.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Please select a Surah first to choose Ayahs
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-peaceful">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" />
          Select Ayahs for Memorization
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose the ayahs you want to memorize and set how many times each should repeat
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-3 p-4">
            {ayahs.map((ayah) => {
              const isSelected = selectedAyahs.includes(ayah.numberInSurah);
              const repeatCount = repeatConfig.ayahs[ayah.numberInSurah] || 1;

              return (
                <div key={ayah.numberInSurah} className="space-y-3">
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-primary bg-islamic-green-light' 
                      : 'border-border bg-card hover:border-muted-foreground'
                  }`}>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`ayah-${ayah.numberInSurah}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleAyahSelection(ayah.numberInSurah)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label 
                            htmlFor={`ayah-${ayah.numberInSurah}`}
                            className="font-semibold cursor-pointer"
                          >
                            Ayah {ayah.numberInSurah}
                          </Label>
                        </div>
                        
                        <div className="arabic-text text-xl leading-relaxed">
                          {ayah.text}
                        </div>
                        
                        {ayah.translation && (
                          <div className="translation-text text-sm">
                            {ayah.translation}
                          </div>
                        )}
                        
                        {isSelected && (
                          <div className="flex items-center gap-2 pt-2">
                            <Repeat className="h-4 w-4 text-islamic-gold" />
                            <Label 
                              htmlFor={`repeat-${ayah.numberInSurah}`}
                              className="text-sm font-medium"
                            >
                              Repeat:
                            </Label>
                            <Input
                              id={`repeat-${ayah.numberInSurah}`}
                              type="number"
                              min="1"
                              max="100"
                              value={repeatCount}
                              onChange={(e) => setAyahRepeat(
                                ayah.numberInSurah, 
                                parseInt(e.target.value) || 1
                              )}
                              className="w-20 h-8"
                            />
                            <span className="text-sm text-muted-foreground">times</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {ayah.numberInSurah < ayahs.length && (
                    <Separator className="my-2" />
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};