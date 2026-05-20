import type { Surah } from "@/store/quranStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export interface SurahMultiSelectProps {
  surahs: Surah[];
  filteredSurahs: Surah[];
  selectedNumbers: number[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggle: (surahNumber: number) => void;
  onClear: () => void;
  isSurahDisabled?: (surah: Surah) => boolean;
  disabledHint?: (surah: Surah) => string | undefined;
  title?: string;
}

export function SurahMultiSelect({
  surahs,
  filteredSurahs,
  selectedNumbers,
  searchTerm,
  onSearchChange,
  onToggle,
  onClear,
  isSurahDisabled,
  disabledHint,
  title = "Pilih satu atau lebih surah",
}: SurahMultiSelectProps) {
  return (
    <Card className="shadow-peaceful border-2 border-dashed border-primary/25 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="font-semibold uppercase tracking-wider text-[10px]"
          >
            Persiapan
          </Badge>
          <CardTitle className="flex items-center gap-2 text-primary text-lg">
            <BookOpen className="h-5 w-5" />
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <span className="text-sm text-muted-foreground">
            Terpilih: {selectedNumbers.length} surah
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={selectedNumbers.length === 0}
          >
            Hapus pilihan
          </Button>
        </div>
        <Input
          placeholder="Cari surah..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <ScrollArea className="h-[50vh] rounded-md border">
          <div className="p-3 space-y-1">
            {filteredSurahs.map((s) => {
              const checked = selectedNumbers.includes(s.number);
              const disabled = isSurahDisabled?.(s) ?? false;
              const hint = disabled ? disabledHint?.(s) : undefined;
              return (
                <label
                  key={s.number}
                  className={`flex items-start gap-3 rounded-lg border border-transparent px-3 py-2 hover:bg-muted/50 ${
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={() => {
                      if (!disabled) onToggle(s.number);
                    }}
                    className="mt-1"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="font-medium text-sm">
                      {s.number}. {s.englishName}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {s.numberOfAyahs} ayat
                      {hint ? ` — ${hint}` : ""}
                    </span>
                    <span className="block arabic-text text-base text-right">
                      {s.name}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </ScrollArea>
        {surahs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Daftar surah belum tersedia.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
