import { useQuranStore } from "../store/quranStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Repeat, Plus, X, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
export const AyahSelector = () => {
  const {
    ayahs,
    selectedAyahs,
    repeatConfig,
    toggleAyahSelection,
    selectAllAyahs,
    setAyahRepeat,
    selectedSurah
  } = useQuranStore();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedAyahsToAdd, setSelectedAyahsToAdd] = useState<number[]>([]);
  const [tempRepeatValues, setTempRepeatValues] = useState<{
    [key: number]: string;
  }>({});
  if (ayahs.length === 0) {
    return <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Silakan pilih Surah terlebih dahulu untuk memilih Ayat
          </p>
        </CardContent>
      </Card>;
  }
  const handleAddAyahs = () => {
    if (selectedAyahsToAdd.length) {
      selectedAyahsToAdd.forEach(ayahNumber => {
        if (!selectedAyahs.includes(ayahNumber)) {
          toggleAyahSelection(ayahNumber);
          setAyahRepeat(ayahNumber, 1);
        }
      });
      setSelectedAyahsToAdd([]);
      setIsPickerOpen(false);
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
  return <Card className="w-full shadow-peaceful">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" />
          Pilih Ayat untuk Dihafal
        </CardTitle>
        <p className="mt-2 flex items-start gap-2 rounded-md bg-primary/5 border border-primary/20 p-3 text-sm text-foreground shadow-peaceful">
          <span aria-hidden="true"><Sparkles className="h-4 w-4 text-primary mt-0.5" /></span>
          <span>
            Tambahkan ayat satu per satu atau pilh semua ayat sebelum memulai proses hafalan, dan atur pengulangan setiap ayat yang terpilih.
          </span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            {selectedSurah && <div className="flex items-center gap-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <span className="text-muted-foreground">Surah Terpilih:</span>
                  <span>{selectedSurah.number}. {selectedSurah.englishName}</span>
                  
                </span>
              </div>}
          </div>
        </div>

        {/* Add New Ayah Section */}
        <div className="space-y-3">
          <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="truncate">{selectedAyahsToAdd.length > 0 ? `Dipilih ${selectedAyahsToAdd.length} ayat` : "Klik disini untuk pilih ayat"}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 z-50 bg-popover">
              <div className="p-3 border-b flex items-center justify-between">
                <span className="text-sm font-medium">Pilih Ayat</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (availableAyahs.length === 0) {
                      if (selectedAyahs.length > 0) {
                        // Clear all selected ayahs
                        selectedAyahs.forEach((n) => toggleAyahSelection(n))
                        setSelectedAyahsToAdd([])
                      }
                      return
                    }
                    const allSelected = availableAyahs.every((a) =>
                      selectedAyahsToAdd.includes(a.numberInSurah)
                    )
                    setSelectedAyahsToAdd(
                      allSelected ? [] : availableAyahs.map((a) => a.numberInSurah)
                    )
                  }}
                  disabled={availableAyahs.length === 0 && selectedAyahs.length === 0}
                >
                  {availableAyahs.length === 0
                    ? "Hapus Semua"
                    : availableAyahs.every((a) =>
                        selectedAyahsToAdd.includes(a.numberInSurah)
                      )
                    ? "Hapus Semua"
                    : "Pilih Semua"}
                </Button>
              </div>
              <ScrollArea className="max-h-48 overflow-y-auto">
                <div className="py-1">
                  {availableAyahs.map(ayah => {
                  const n = ayah.numberInSurah;
                  const checked = selectedAyahsToAdd.includes(n);
                  return <div key={n} className="flex items-center gap-2 px-3 py-2">
                        <Checkbox id={`ayah-${n}`} checked={checked} onCheckedChange={v => {
                      const val = !!v;
                      setSelectedAyahsToAdd(prev => val ? [...prev, n] : prev.filter(x => x !== n));
                    }} />
                        <label htmlFor={`ayah-${n}`} className="text-sm cursor-pointer">
                          Ayat {n}
                        </label>
                      </div>;
                })}
                  {availableAyahs.length === 0 && <div className="px-3 py-4 text-sm text-muted-foreground">Semua ayat sudah dipilih</div>}
                </div>
              </ScrollArea>
              <div className="p-3 border-t">
                <Button className="w-full" onClick={handleAddAyahs} disabled={selectedAyahsToAdd.length === 0}>
                  <Plus className="h-4 w-4 mr-1" /> Tambah
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Selected Ayahs List */}
        {selectedAyahs.length > 0 && <div className="space-y-3">
            <Label className="text-sm font-medium">Ayat Terpilih ({selectedAyahs.length})</Label>
            <ScrollArea className="w-full" style={{
          height: '500px'
        }}>
              <div className="space-y-3 pr-3">
                 {selectedAyahs.map(ayahNumber => {
              const repeatCount = repeatConfig.ayahs[ayahNumber] || 1;
              const displayValue = tempRepeatValues[ayahNumber] !== undefined ? tempRepeatValues[ayahNumber] : repeatCount.toString();
              return <div key={ayahNumber} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="font-semibold">
                              Ayat {ayahNumber}
                            </Label>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveAyah(ayahNumber)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="arabic-text text-lg leading-relaxed text-muted-foreground">
                            {getAyahPreview(ayahNumber)}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Repeat className="h-4 w-4 text-islamic-gold" />
                            <Label htmlFor={`repeat-${ayahNumber}`} className="text-sm font-medium">
                              Ulangi:
                            </Label>
                            <Input id={`repeat-${ayahNumber}`} type="number" min="1" max="100" value={displayValue} onChange={e => {
                        const value = e.target.value;
                        setTempRepeatValues(prev => ({
                          ...prev,
                          [ayahNumber]: value
                        }));
                      }} onBlur={e => {
                        const value = e.target.value;
                        const numValue = parseInt(value);
                        const finalValue = isNaN(numValue) || numValue < 1 ? 1 : numValue;
                        setAyahRepeat(ayahNumber, finalValue);
                        setTempRepeatValues(prev => {
                          const newTemp = {
                            ...prev
                          };
                          delete newTemp[ayahNumber];
                          return newTemp;
                        });
                      }} className="w-20 h-8" />
                            <span className="text-sm text-muted-foreground">kali</span>
                          </div>
                        </div>
                      </div>
                    </div>;
            })}
              </div>
            </ScrollArea>
          </div>}

        {selectedAyahs.length === 0 && <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada ayat yang dipilih</p>
            <p className="text-sm">Gunakan dropdown di atas untuk menambah ayat yang akan dihafal</p>
          </div>}
      </CardContent>
    </Card>;
};