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
    selectAllAyahs,
    setAyahRepeat 
  } = useQuranStore();
  
  const [selectedAyahToAdd, setSelectedAyahToAdd] = useState<string>("");
  const [tempRepeatValues, setTempRepeatValues] = useState<{[key: number]: string}>({});

  if (ayahs.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Silakan pilih Surah terlebih dahulu untuk memilih Ayat
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
          Pilih Ayat untuk Dihafal
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tambahkan ayat satu per satu dan atur berapa kali setiap ayat harus diulang. Setelah selesai, scroll ke bawah dan klik "Mulai Hafalan"
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Select All Button */}
        <div className="flex justify-end">
          <Button 
            onClick={selectAllAyahs}
            variant="outline" 
            className="shrink-0"
            disabled={selectedAyahs.length === ayahs.length}
          >
            <FileText className="h-4 w-4 mr-2" />
            Pilih Semua Ayat
          </Button>
        </div>

        {/* Add New Ayah Section */}
        <div className="space-y-3">
          <Select value={selectedAyahToAdd} onValueChange={setSelectedAyahToAdd}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih ayat untuk ditambahkan..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {availableAyahs.map((ayah) => (
                <SelectItem key={ayah.numberInSurah} value={ayah.numberInSurah.toString()}>
                  Ayat {ayah.numberInSurah}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAddAyah} 
            disabled={!selectedAyahToAdd}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-1" />
            Tambah
          </Button>
        </div>

        {/* Selected Ayahs List */}
        {selectedAyahs.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Ayat Terpilih ({selectedAyahs.length})</Label>
            <ScrollArea className="w-full" style={{ height: '500px' }}>
              <div className="space-y-3 pr-3">
                 {selectedAyahs.map((ayahNumber) => {
                   const repeatCount = repeatConfig.ayahs[ayahNumber] || 1;
                   const displayValue = tempRepeatValues[ayahNumber] !== undefined ? tempRepeatValues[ayahNumber] : repeatCount.toString();
                  
                  return (
                    <div 
                      key={ayahNumber} 
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="font-semibold">
                              Ayat {ayahNumber}
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
                              Ulangi:
                            </Label>
                            <Input
                              id={`repeat-${ayahNumber}`}
                              type="number"
                              min="1"
                              max="100"
                              value={displayValue}
                              onChange={(e) => {
                                const value = e.target.value;
                                setTempRepeatValues(prev => ({
                                  ...prev,
                                  [ayahNumber]: value
                                }));
                              }}
                              onBlur={(e) => {
                                const value = e.target.value;
                                const numValue = parseInt(value);
                                const finalValue = isNaN(numValue) || numValue < 1 ? 1 : numValue;
                                setAyahRepeat(ayahNumber, finalValue);
                                setTempRepeatValues(prev => {
                                  const newTemp = { ...prev };
                                  delete newTemp[ayahNumber];
                                  return newTemp;
                                });
                              }}
                              className="w-20 h-8"
                            />
                            <span className="text-sm text-muted-foreground">kali</span>
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
            <p>Belum ada ayat yang dipilih</p>
            <p className="text-sm">Gunakan dropdown di atas untuk menambah ayat yang akan dihafal</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};