import { useQuranStore } from "../store/quranStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Repeat, Plus, X } from "lucide-react";
import { useState } from "react";

export const AyahSelector = () => {
  const { 
    ayahs, 
    selectedAyahs, 
    repeatConfig, 
    toggleAyahSelection, 
    setAyahRepeat 
  } = useQuranStore();
  
  const [selectedAyahToAdd, setSelectedAyahToAdd] = useState<string>("");

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

  const handleAddAyah = () => {
    if (selectedAyahToAdd) {
      const ayahNumber = parseInt(selectedAyahToAdd);
      if (!selectedAyahs.includes(ayahNumber)) {
        toggleAyahSelection(ayahNumber);
        setAyahRepeat(ayahNumber, 1);
      }
      setSelectedAyahToAdd("");
    }
  };

  const handleRemoveAyah = (ayahNumber: number) => {
    toggleAyahSelection(ayahNumber);
  };

  const getAyahPreview = (ayahNumber: number) => {
    const ayah = ayahs.find(a => a.numberInSurah === ayahNumber);
    if (!ayah) return "";
    
    // Show first 50 characters of Arabic text
    const preview = ayah.text.length > 50 ? ayah.text.substring(0, 50) + "..." : ayah.text;
    return preview;
  };

  // Filter out already selected ayahs from dropdown
  const availableAyahs = ayahs.filter(ayah => !selectedAyahs.includes(ayah.numberInSurah));

  return (
    <Card className="w-full shadow-peaceful">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" />
          Select Ayahs for Memorization
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add ayahs one by one and set how many times each should repeat
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Ayah Section */}
        <div className="flex gap-2">
          <Select value={selectedAyahToAdd} onValueChange={setSelectedAyahToAdd}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Choose an ayah to add..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {availableAyahs.map((ayah) => (
                <SelectItem key={ayah.numberInSurah} value={ayah.numberInSurah.toString()}>
                  Ayah {ayah.numberInSurah}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAddAyah} 
            disabled={!selectedAyahToAdd}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Selected Ayahs List */}
        {selectedAyahs.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Selected Ayahs ({selectedAyahs.length})</Label>
            <ScrollArea className="max-h-80">
              <div className="space-y-3 pr-3">
                {selectedAyahs.map((ayahNumber) => {
                  const repeatCount = repeatConfig.ayahs[ayahNumber] || 1;
                  
                  return (
                    <div 
                      key={ayahNumber} 
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="font-semibold">
                              Ayah {ayahNumber}
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAyah(ayahNumber)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="arabic-text text-lg leading-relaxed text-muted-foreground">
                            {getAyahPreview(ayahNumber)}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Repeat className="h-4 w-4 text-islamic-gold" />
                            <Label 
                              htmlFor={`repeat-${ayahNumber}`}
                              className="text-sm font-medium"
                            >
                              Repeat:
                            </Label>
                            <Input
                              id={`repeat-${ayahNumber}`}
                              type="number"
                              min="1"
                              max="100"
                              value={repeatCount}
                              onChange={(e) => setAyahRepeat(
                                ayahNumber, 
                                parseInt(e.target.value) || 1
                              )}
                              className="w-20 h-8"
                            />
                            <span className="text-sm text-muted-foreground">times</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {selectedAyahs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No ayahs selected yet</p>
            <p className="text-sm">Use the dropdown above to add ayahs for memorization</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};