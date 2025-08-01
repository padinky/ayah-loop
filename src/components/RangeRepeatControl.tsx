import { useState } from "react";
import { useQuranStore } from "../store/quranStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Info } from "lucide-react";

export const RangeRepeatControl = () => {
  const { repeatConfig, setRangeRepeat, selectedSurah } = useQuranStore();
  const [tempRangeValue, setTempRangeValue] = useState<string | null>(null);

  if (!selectedSurah) {
    return null;
  }

  return (
    <Card className="w-full shadow-peaceful">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <RotateCcw className="h-5 w-5" />
          Kontrol Pengulangan Sesi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <Info className="h-5 w-5 text-islamic-gold flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            Setelah menyelesaikan semua ayat terpilih dengan pengulangan individualnya, 
            seluruh urutan akan diulang sebanyak ini.
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Label htmlFor="range-repeat" className="font-medium">
            Ulangi seluruh urutan:
          </Label>
          <Input
            id="range-repeat"
            type="number"
            min="1"
            max="100"
            value={tempRangeValue !== null ? tempRangeValue : repeatConfig.range.toString()}
            onChange={(e) => {
              setTempRangeValue(e.target.value);
            }}
            onBlur={(e) => {
              const value = e.target.value;
              const numValue = parseInt(value);
              const finalValue = isNaN(numValue) || numValue < 1 ? 1 : numValue;
              setRangeRepeat(finalValue);
              setTempRangeValue(null);
            }}
            className="w-24 h-10"
          />
          <span className="text-sm text-muted-foreground">kali</span>
        </div>
        
        <div className="text-sm text-muted-foreground bg-islamic-green-light/20 p-3 rounded-lg">
          <strong>Total pemutaran:</strong> Setiap ayat akan diputar sesuai jumlah pengulangan individualnya, 
          kemudian seluruh pilihan akan diulang {repeatConfig.range} kali.
        </div>
      </CardContent>
    </Card>
  );
};