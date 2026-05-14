import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Info,
  Lightbulb,
  RotateCcw,
  Shuffle,
  SkipForward,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { quranApi } from "@/services/quranApi";
import { useQuranStore, type Ayah, type Surah } from "@/store/quranStore";
import { useSambungAyatStore } from "@/store/sambungAyatStore";
import {
  buildAyahMap,
  eligibleSurahNumbers,
  pickRandomRound,
} from "@/lib/sambungAyatRound";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReciterSelector } from "@/components/ReciterSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const NEXT_AYAH_HINT_PREFIX_LENGTH = 16;

type NextAyahHintResult =
  | { kind: "empty" }
  | { kind: "tooShort" }
  | { kind: "partial"; preview: string };

/**
 * Builds hint text that never equals the full next ayah: at least one grapheme
 * stays hidden when the ayah has more than one unit (Unicode code points here).
 */
function nextAyahTextHint(text: string, maxGraphemes: number): NextAyahHintResult {
  const chars = [...text];
  const len = chars.length;
  if (len === 0) return { kind: "empty" };
  if (len === 1) return { kind: "tooShort" };
  const visible = Math.min(maxGraphemes, len - 1);
  return {
    kind: "partial",
    preview: `${chars.slice(0, visible).join("")} …`,
  };
}

function surahLabel(meta: Surah | undefined) {
  if (!meta) return "";
  return `${meta.number}. ${meta.englishName}`;
}

const SambungAyat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const selectedReciter = useQuranStore((s) => s.selectedReciter);
  const reciterId = selectedReciter?.identifier ?? "ar.alafasy";

  const {
    selectedSurahNumbers,
    round,
    revealed,
    toggleSurah,
    clearSelection,
    setRound,
    setRevealed,
    resetRoundUi,
  } = useSambungAyatStore();

  const [practiceStarted, setPracticeStarted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hintDialogOpen, setHintDialogOpen] = useState(false);
  const [showDisclaimerAlert, setShowDisclaimerAlert] = useState(true);
  const [showCaraMain, setShowCaraMain] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const answerAudioRef = useRef<HTMLAudioElement | null>(null);
  /** `new Audio()` started from the click that opens the dialog — keeps browser autoplay rules satisfied */
  const answerAutoplayRef = useRef<HTMLAudioElement | null>(null);
  const prevReciterId = useRef(reciterId);

  const roundKey = useMemo(
    () =>
      round != null
        ? `${round.surahNumber}:${round.promptNumberInSurah}`
        : null,
    [round]
  );

  const { data: surahsMeta = [], isLoading: surahsLoading, isError: surahsError } =
    useQuery({
      queryKey: ["surahs"],
      queryFn: () => quranApi.getSurahs(),
      staleTime: 1000 * 60 * 60 * 24,
    });

  const surahQueries = useQueries({
    queries: selectedSurahNumbers.map((num) => ({
      queryKey: ["sambungAyat", "surah", num, reciterId] as const,
      queryFn: () => quranApi.getCombinedSurahData(num, reciterId),
      enabled: practiceStarted && selectedSurahNumbers.length > 0,
    })),
  });

  const filteredSurahs = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return surahsMeta;
    return surahsMeta.filter(
      (s) =>
        s.englishName.toLowerCase().includes(t) ||
        s.name.includes(searchTerm.trim()) ||
        String(s.number).includes(t)
    );
  }, [searchTerm, surahsMeta]);

  const eligibleSelected = useMemo(
    () => eligibleSurahNumbers(selectedSurahNumbers, surahsMeta),
    [selectedSurahNumbers, surahsMeta]
  );

  const ayahsBySurah = useMemo(() => {
    const out: Record<number, Ayah[]> = {};
    selectedSurahNumbers.forEach((num, idx) => {
      const q = surahQueries[idx];
      if (q?.data) out[num] = q.data;
    });
    return out;
  }, [selectedSurahNumbers, surahQueries]);

  const allQueriesDone =
    !practiceStarted ||
    (surahQueries.length > 0 &&
      surahQueries.every((q) => !q.isPending && !q.isFetching));

  const anyQueryError = surahQueries.some((q) => q.isError);
  const allQueriesSuccess =
    practiceStarted &&
    surahQueries.length > 0 &&
    surahQueries.every((q) => q.isSuccess);

  const startPractice = useCallback(() => {
    if (eligibleSelected.length === 0) {
      toast({
        title: "Pilihan belum valid",
        description:
          "Pilih minimal satu surah yang memiliki lebih dari satu ayat (contoh: Al-Kawthar hanya satu ayat, tidak dipakai di mode ini).",
        variant: "destructive",
      });
      return;
    }
    setShowCaraMain(true);
    resetRoundUi();
    setPracticeStarted(true);
  }, [eligibleSelected.length, resetRoundUi, toast]);

  useEffect(() => {
    if (!practiceStarted || round) return;
    if (!allQueriesSuccess) return;
    const r = pickRandomRound(selectedSurahNumbers, surahsMeta);
    if (r) setRound(r);
  }, [
    practiceStarted,
    round,
    allQueriesSuccess,
    selectedSurahNumbers,
    surahsMeta,
    setRound,
  ]);

  useEffect(() => {
    if (!practiceStarted) {
      prevReciterId.current = reciterId;
      return;
    }
    if (prevReciterId.current !== reciterId) {
      prevReciterId.current = reciterId;
      setRevealed(false);
      resetRoundUi();
    }
  }, [reciterId, practiceStarted, resetRoundUi, setRevealed]);

  const metaByNumber = useMemo(() => {
    const m = new Map<number, Surah>();
    for (const s of surahsMeta) m.set(s.number, s);
    return m;
  }, [surahsMeta]);

  const currentMeta = round ? metaByNumber.get(round.surahNumber) : undefined;
  const promptAyah = useMemo(() => {
    if (!round) return undefined;
    const list = ayahsBySurah[round.surahNumber];
    if (!list) return undefined;
    return buildAyahMap(list).get(round.promptNumberInSurah);
  }, [round, ayahsBySurah]);

  const nextAyah = useMemo(() => {
    if (!round) return undefined;
    const list = ayahsBySurah[round.surahNumber];
    if (!list) return undefined;
    return buildAyahMap(list).get(round.promptNumberInSurah + 1);
  }, [round, ayahsBySurah]);

  useEffect(() => {
    setHintDialogOpen(false);
  }, [roundKey]);

  useEffect(() => {
    if (!roundKey || !promptAyah?.audio || !audioRef.current) return;
    const el = audioRef.current;
    el.src = promptAyah.audio;
    el.currentTime = 0;
    const play = () => {
      void el.play().catch(() => {
        /* autoplay often blocked until gesture; user can tap Ulangi audio */
      });
    };
    if (el.readyState >= 2) {
      play();
    } else {
      el.addEventListener("canplay", play, { once: true });
    }
    return () => {
      el.removeEventListener("canplay", play);
    };
  }, [roundKey, promptAyah?.audio]);

  useLayoutEffect(() => {
    if (!revealed || !nextAyah?.audio || !answerAudioRef.current) return;
    const el = answerAudioRef.current;
    el.pause();
    el.src = nextAyah.audio;
    el.currentTime = 0;
  }, [revealed, roundKey, nextAyah?.audio]);

  const nextRound = useCallback(() => {
    const r = pickRandomRound(selectedSurahNumbers, surahsMeta);
    if (r) setRound(r);
    else {
      toast({
        title: "Tidak ada ronde tersedia",
        description: "Periksa pilihan surah Anda.",
        variant: "destructive",
      });
    }
  }, [selectedSurahNumbers, surahsMeta, setRound, toast]);

  const skipToNextQuestion = useCallback(() => {
    answerAutoplayRef.current?.pause();
    answerAutoplayRef.current = null;
    answerAudioRef.current?.pause();
    setHintDialogOpen(false);
    nextRound();
  }, [nextRound]);

  const backToSetup = () => {
    setPracticeStarted(false);
    resetRoundUi();
  };

  const playPromptAudio = useCallback(() => {
    const url = promptAyah?.audio;
    if (!url || !audioRef.current) return;
    const el = audioRef.current;
    el.pause();
    el.src = url;
    el.currentTime = 0;
    void el.play().catch(() => {
      toast({
        title: "Audio tidak bisa diputar",
        description: "Periksa koneksi atau coba qari lain.",
        variant: "destructive",
      });
    });
  }, [promptAyah?.audio, toast]);

  const playAnswerAudio = useCallback(() => {
    const url = nextAyah?.audio;
    if (!url) return;
    answerAutoplayRef.current?.pause();
    answerAutoplayRef.current = null;
    const el = answerAudioRef.current;
    if (el) {
      el.pause();
      el.src = url;
      el.currentTime = 0;
      void el.play().catch(() => {
        toast({
          title: "Audio tidak bisa diputar",
          description: "Periksa koneksi atau coba qari lain.",
          variant: "destructive",
        });
      });
    } else {
      void new Audio(url).play().catch(() => {
        toast({
          title: "Audio tidak bisa diputar",
          description: "Periksa koneksi atau coba qari lain.",
          variant: "destructive",
        });
      });
    }
  }, [nextAyah?.audio, toast]);

  const openAnswerDialog = useCallback(() => {
    setHintDialogOpen(false);
    const url = nextAyah?.audio;
    if (url) {
      answerAutoplayRef.current?.pause();
      const a = new Audio(url);
      answerAutoplayRef.current = a;
      void a.play().catch(() => {
        toast({
          title: "Audio tidak bisa diputar",
          description: "Periksa koneksi atau coba qari lain.",
          variant: "destructive",
        });
      });
    }
    setRevealed(true);
  }, [nextAyah?.audio, setRevealed, toast]);

  if (surahsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-islamic-green-light/10 to-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (surahsError || surahsMeta.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-islamic-green-light/10 to-background p-6">
        <Card className="max-w-md mx-auto shadow-peaceful">
          <CardContent className="p-6 space-y-4">
            <p className="text-destructive">Gagal memuat daftar surah.</p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Kembali ke beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-500",
        practiceStarted
          ? "bg-gradient-to-b from-amber-500/18 via-primary/[0.12] to-background dark:from-amber-950/40 dark:via-primary/20 dark:to-background"
          : "bg-gradient-to-br from-background via-islamic-green-light/10 to-background"
      )}
    >
      <div
        className={cn(
          "pointer-events-none fixed inset-0 -z-10 opacity-40 dark:opacity-25",
          practiceStarted &&
            "bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.35),transparent)]"
        )}
        aria-hidden
      />
      <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild className="h-10 w-10">
              <Link to="/" aria-label="Beranda">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center shadow-lg",
                  practiceStarted
                    ? "bg-gradient-to-br from-islamic-gold to-amber-600 text-amber-950"
                    : "bg-gradient-to-br from-primary to-primary-glow text-white"
                )}
              >
                {practiceStarted ? (
                  <Target className="h-5 w-5" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary">
                  #SambungAyat
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {practiceStarted
                    ? "Mode kuis — sambung ayat berikutnya dalam satu surah"
                    : "Latihan sambung ayat berikutnya dalam satu surah"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ThemeToggle />
          </div>
        </div>

        {showDisclaimerAlert && (
          <Alert
            className={cn(
              "relative p-3 pr-10 shadow-peaceful sm:p-4",
              practiceStarted
                ? "border-2 border-islamic-gold/30 bg-gradient-to-r from-amber-500/10 to-primary/5"
                : "border-primary/20 bg-primary/5"
            )}
          >
            <button
              type="button"
              aria-label="Sembunyikan penjelasan"
              className="absolute right-2 top-2 z-10 p-2 -m-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 active:bg-foreground/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 touch-manipulation"
              onClick={() => setShowDisclaimerAlert(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm text-muted-foreground">
              Aplikasi tidak bisa menilai hafalan Anda. Gunakan hint atau jawaban
              untuk membandingkan dengan hafalan, atau lanjut ke soal berikutnya jika
              sudah yakin.
            </AlertDescription>
          </Alert>
        )}

        {!practiceStarted ? (
          <>
            <Card className="shadow-peaceful border-2 border-dashed border-primary/25 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="font-semibold uppercase tracking-wider text-[10px]">
                    Persiapan
                  </Badge>
                  <CardTitle className="flex items-center gap-2 text-primary text-lg">
                    <BookOpen className="h-5 w-5" />
                    Pilih satu atau lebih surah
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <span className="text-sm text-muted-foreground">
                    Terpilih: {selectedSurahNumbers.length} surah
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    disabled={selectedSurahNumbers.length === 0}
                  >
                    Hapus pilihan
                  </Button>
                </div>
                <Input
                  placeholder="Cari surah..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <ScrollArea className="h-[50vh] rounded-md border">
                  <div className="p-3 space-y-1">
                    {filteredSurahs.map((s) => {
                      const checked = selectedSurahNumbers.includes(s.number);
                      const disabled = s.numberOfAyahs < 2;
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
                              if (!disabled) toggleSurah(s.number);
                            }}
                            className="mt-1"
                          />
                          <span className="flex-1 min-w-0">
                            <span className="font-medium text-sm">
                              {s.number}. {s.englishName}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {s.numberOfAyahs} ayat
                              {disabled ? " — tidak dipakai di mode ini" : ""}
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
              </CardContent>
            </Card>

            <ReciterSelector showResetButton={false} />

            <Button
              className="w-full h-14 text-lg font-bold tracking-tight bg-gradient-to-r from-islamic-gold via-amber-400 to-islamic-gold text-amber-950 shadow-[0_0_24px_hsl(var(--islamic-gold)/0.35)] hover:brightness-105 hover:shadow-[0_0_32px_hsl(var(--islamic-gold)/0.45)] border-2 border-amber-200/80"
              onClick={startPractice}
              disabled={eligibleSelected.length === 0}
            >
              <Shuffle className="h-5 w-5 mr-2" />
              Mulai Latihan #SambungAyat
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={backToSetup}
                className="border-2 font-medium"
              >
                Ubah surah / qari
              </Button>
            </div>

            {anyQueryError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Sebagian surah gagal dimuat. Coba lagi atau ubah qari.
                </AlertDescription>
              </Alert>
            )}

            {!allQueriesSuccess && (
              <Card className="border-2 border-primary/20 shadow-[0_12px_40px_-10px_hsl(var(--primary)/0.2)]">
                <CardContent className="p-8 flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-islamic-gold border-t-transparent" />
                  <p className="text-muted-foreground text-sm font-medium">
                    {allQueriesDone
                      ? "Menyiapkan soal..."
                      : "Memuat ayat pilihan..."}
                  </p>
                </CardContent>
              </Card>
            )}

            {allQueriesSuccess && round && currentMeta && promptAyah && (
              <>
              <div className="relative">
                <div
                  className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-islamic-gold/50 via-primary/40 to-islamic-gold/50 opacity-75 blur-sm dark:opacity-50"
                  aria-hidden
                />
                <Card className="relative overflow-hidden rounded-2xl border-2 border-primary/35 bg-card shadow-[0_24px_60px_-16px_hsl(var(--primary)/0.35)]">
                  <div
                    className="h-1.5 w-full bg-gradient-to-r from-islamic-gold via-primary to-islamic-gold"
                    aria-hidden
                  />
                  <CardHeader className="space-y-4 pb-2 pt-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500 font-bold uppercase tracking-widest text-[10px] shadow-sm">
                            Soal
                          </Badge>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Sambung ayat berikutnya
                          </span>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-primary leading-tight">
                          {surahLabel(currentMeta)}
                        </CardTitle>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div
                          className="rounded-xl border-2 border-primary/25 bg-gradient-to-br from-muted/80 to-background px-4 py-2 text-center shadow-inner min-w-[5.5rem]"
                          title="Nomor ayat dalam surah ini yang menjadi teks soal (ayat yang tampil di kartu). Yang harus Anda sambungkan adalah ayat berikutnya setelah ini."
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Ayat soal
                          </p>
                          <p className="text-2xl font-black tabular-nums text-primary leading-none">
                            {round.promptNumberInSurah}
                          </p>
                        </div>
                      </div>
                    </div>
                    {showCaraMain && (
                      <div className="relative rounded-lg border border-border/60 bg-muted/50 px-3 py-2 pr-10 sm:px-4 sm:py-3 sm:pr-11">
                        <button
                          type="button"
                          aria-label="Sembunyikan cara main"
                          className="absolute right-1.5 top-1.5 z-10 p-2 -m-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 active:bg-foreground/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 touch-manipulation"
                          onClick={() => setShowCaraMain(false)}
                        >
                          <X className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Cara main: </span>
                          Audio soal diputar otomatis jika tersedia. Satu baris berisi{" "}
                          <span className="font-medium text-foreground">Ulangi audio</span> (jika ada) dan{" "}
                          <span className="font-medium text-foreground">Tampilkan Hint</span>. Di bawahnya:{" "}
                          <span className="font-medium text-foreground">Tampilkan Jawaban</span> membuka teks
                          ayat berikutnya di jendela untuk dibandingkan;{" "}
                          <span className="font-medium text-foreground">Soal berikutnya</span> langsung ke soal
                          baru tanpa membuka jawaban bila Anda sudah yakin.
                        </p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6 px-4 pb-8 sm:px-6">
                    <audio ref={audioRef} className="hidden" preload="metadata" />

                    <div
                      className={cn(
                        "rounded-2xl border-2 p-5 sm:p-8 shadow-inner transition-all",
                        revealed
                          ? "border-muted bg-muted/20"
                          : "border-primary/30 bg-gradient-to-b from-card via-card to-primary/[0.06] ring-2 ring-islamic-gold/20"
                      )}
                    >
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
                        Teks petunjuk
                      </p>
                      <p className="arabic-text text-2xl sm:text-4xl leading-relaxed text-right font-medium">
                        {promptAyah.text}
                      </p>
                      {promptAyah.translation ? (
                        <p className="mt-4 text-sm text-muted-foreground border-t border-dashed pt-4">
                          {promptAyah.translation}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {promptAyah.audio ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={playPromptAudio}
                          className="border font-semibold"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Ulangi audio
                        </Button>
                      ) : null}
                      {!revealed ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-2 border-dashed border-islamic-gold/50 bg-islamic-gold/5 font-semibold hover:bg-islamic-gold/10"
                          disabled={!nextAyah?.text}
                          onClick={() => setHintDialogOpen(true)}
                        >
                          <Lightbulb className="h-4 w-4 mr-2 text-islamic-gold shrink-0" />
                          Tampilkan Hint
                        </Button>
                      ) : null}
                    </div>

                    {!revealed ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <Button
                          type="button"
                          size="lg"
                          className="h-14 text-base font-bold uppercase tracking-wide bg-gradient-to-r from-primary via-primary to-primary-glow shadow-lg hover:opacity-95"
                          onClick={openAnswerDialog}
                        >
                          Tampilkan Jawaban
                        </Button>
                        <Button
                          type="button"
                          size="lg"
                          variant="outline"
                          className="h-14 border-2 font-bold text-muted-foreground hover:text-foreground"
                          onClick={skipToNextQuestion}
                        >
                          <SkipForward className="h-5 w-5 mr-2 shrink-0" />
                          Soal berikutnya
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              <Dialog
                open={hintDialogOpen}
                onOpenChange={setHintDialogOpen}
              >
                <DialogContent className="max-h-[90dvh] max-w-lg gap-0 overflow-hidden p-0 sm:max-w-xl">
                  <div className="max-h-[90dvh] overflow-y-auto p-6 sm:p-8">
                    <DialogHeader className="space-y-2 text-left">
                      <div className="flex flex-wrap items-center gap-2 pr-8">
                        <Badge className="border border-amber-500/40 bg-amber-500/15 text-amber-950 dark:text-amber-100 font-bold uppercase tracking-widest text-[10px]">
                          Hint
                        </Badge>
                        <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">
                          Potongan awal ayat berikutnya
                        </DialogTitle>
                      </div>
                      <DialogDescription className="text-left">
                        Hanya sebagian awal teks Arab — minimal satu bagian disembunyikan agar tidak sama dengan ayat lengkap. Tutup jendela ini lalu lanjutkan hafalan Anda.
                      </DialogDescription>
                    </DialogHeader>
                    {(() => {
                      if (!nextAyah?.text) {
                        return (
                          <p className="mt-6 text-sm text-muted-foreground">
                            Hint tidak tersedia untuk soal ini.
                          </p>
                        );
                      }
                      const hint = nextAyahTextHint(
                        nextAyah.text,
                        NEXT_AYAH_HINT_PREFIX_LENGTH
                      );
                      if (hint.kind === "empty") {
                        return (
                          <p className="mt-6 text-sm text-muted-foreground">
                            Hint tidak tersedia untuk soal ini.
                          </p>
                        );
                      }
                      if (hint.kind === "tooShort") {
                        return (
                          <p className="mt-6 text-sm leading-relaxed text-muted-foreground rounded-xl border border-amber-500/25 bg-amber-500/5 p-5">
                            Ayat berikutnya terlalu pendek untuk petunjuk potongan: menampilkan
                            sebagian saja akan sama dengan ayat utuh. Lanjutkan dari hafalan
                            Anda, atau ketuk tombol di bawah untuk ayat lengkap.
                          </p>
                        );
                      }
                      return (
                        <p className="mt-6 arabic-text text-2xl sm:text-3xl leading-relaxed text-right font-medium rounded-xl border-2 border-amber-500/25 bg-amber-500/5 p-5">
                          {hint.preview}
                        </p>
                      );
                    })()}
                    {nextAyah ? (
                      <div className="mt-6 space-y-2">
                        <Button
                          type="button"
                          size="lg"
                          className="w-full h-12 text-base font-bold uppercase tracking-wide bg-gradient-to-r from-primary via-primary to-primary-glow shadow-lg hover:opacity-95"
                          onClick={openAnswerDialog}
                        >
                          Tampilkan Jawaban
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full h-10 text-sm font-semibold text-muted-foreground border border-dashed border-muted-foreground/30"
                          onClick={() => {
                            setHintDialogOpen(false);
                            skipToNextQuestion();
                          }}
                        >
                          <SkipForward className="h-4 w-4 mr-2 shrink-0" />
                          Soal berikutnya (tanpa buka jawaban)
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={revealed}
                onOpenChange={(open) => {
                  if (!open) {
                    answerAutoplayRef.current?.pause();
                    answerAutoplayRef.current = null;
                    answerAudioRef.current?.pause();
                    setHintDialogOpen(false);
                    setRevealed(false);
                  }
                }}
              >
                <DialogContent className="max-h-[90dvh] max-w-lg gap-0 overflow-hidden p-0 sm:max-w-xl">
                  <div className="max-h-[90dvh] overflow-y-auto p-6 sm:p-8">
                    <audio ref={answerAudioRef} className="hidden" preload="metadata" />
                    <DialogHeader className="space-y-2 text-left">
                      <div className="flex flex-wrap items-center gap-2 pr-8">
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 font-bold uppercase tracking-widest text-[10px]">
                          Jawaban
                        </Badge>
                        <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">
                          Ayat berikutnya
                        </DialogTitle>
                      </div>
                      <DialogDescription className="text-left">
                        {surahLabel(currentMeta)} — bandingkan dengan hafalan Anda. Audio ayat ini diputar otomatis bila tersedia; gunakan &quot;Ulangi audio&quot; jika perlu.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 space-y-4">
                      {nextAyah ? (
                        <>
                          <p className="arabic-text text-2xl sm:text-3xl leading-relaxed text-right font-medium">
                            {nextAyah.text}
                          </p>
                          {nextAyah.translation ? (
                            <p className="text-sm text-muted-foreground border-t border-dashed pt-4">
                              {nextAyah.translation}
                            </p>
                          ) : null}
                          {nextAyah.audio ? (
                            <div className="pt-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="border font-semibold"
                                onClick={playAnswerAudio}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Ulangi audio
                              </Button>
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <p className="text-destructive text-sm font-medium">
                          Data ayat berikutnya tidak ditemukan.
                        </p>
                      )}

                      <div className="pt-2">
                        <Button
                          type="button"
                          size="lg"
                          variant="secondary"
                          className="w-full h-12 font-bold"
                          onClick={skipToNextQuestion}
                        >
                          <SkipForward className="h-5 w-5 mr-2" />
                          Soal berikutnya
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SambungAyat;
