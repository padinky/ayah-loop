import { useQuranStore } from "../store/quranStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Info } from "lucide-react";

export const RangeRepeatControl = () => {
  const { repeatConfig, setRangeRepeat, selectedAyahs } = useQuranStore();

  if (selectedAyahs.length === 0) {
    return null;
  }

  return (
    <Card className="w-full shadow-peaceful">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <RotateCcw className="h-5 w-5" />
          Range Repeat Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <Info className="h-5 w-5 text-islamic-gold flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            After completing all selected ayahs with their individual repeats, 
            the entire sequence will repeat this many times.
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Label htmlFor="range-repeat" className="font-medium">
            Repeat entire sequence:
          </Label>
          <Input
            id="range-repeat"
            type="number"
            min="1"
            max="100"
            value={repeatConfig.range}
            onChange={(e) => setRangeRepeat(parseInt(e.target.value) || 1)}
            className="w-24 h-10"
          />
          <span className="text-sm text-muted-foreground">times</span>
        </div>
        
        <div className="text-sm text-muted-foreground bg-islamic-green-light/20 p-3 rounded-lg">
          <strong>Total playback:</strong> Each ayah will play according to its individual repeat count, 
          then the entire selection will repeat {repeatConfig.range} time{repeatConfig.range !== 1 ? 's' : ''}.
        </div>
      </CardContent>
    </Card>
  );
};