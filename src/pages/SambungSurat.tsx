import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSambungPromptAudio } from "@/hooks/useSambungPromptAudio";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Info,
  RotateCcw,
  SkipForward,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { quranApi } from "@/services/quranApi";
import { useQuranStore, type Ayah, type Surah } from "@/store/quranStore";
import { useSambungSuratStore } from "@/store/sambungSuratStore";
import {
  eligibleSurahNumbers,
  pickRandomRound,
} from "@/lib/sambungSuratRound";
import { buildAyahMap } from "@/lib/ayahMap";
import { ReciterSelector } from "@/components/ReciterSelector";
import { StartLatihanButton } from "@/components/StartLatihanButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SurahMultiSelect } from "@/components/SurahMultiSelect";
import { SURAH_STALE_TIME } from "@/lib/surahQueryKeys";
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

function surahLabel(meta: Surah | undefined) {
  if (!meta) return "";
  return `${meta.number}. ${meta.englishName}`;
}

const SambungSurat = () => {
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
  } = useSambungSuratStore();

  const [practiceStarted, setPracticeStarted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
        ? `${round.promptSurahNumber}:${round.answerSurahNumber}`
        : null,
    [round]
  );

  const { data: surahsMeta = [], isLoading: surahsLoading, isError: surahsError } =
    useQuery({
      queryKey: ["surahs"],
      queryFn: () => quranApi.getSurahs(),
      staleTime: 1000 * 60 * 60 * 24,
    });

  const roundDataQuery = useQuery({
    queryKey: round
      ? ([
          "surah",
          "combined",
          "sambungSurat",
          round.promptSurahNumber,
          round.answerSurahNumber,
          reciterId,
        ] as const)
      : (["surah", "combined", "sambungSurat", "idle"] as const),
    queryFn: async () => {
      const prompt = await quranApi.getCombinedSurahData(
        round!.promptSurahNumber,
        reciterId
      );
      const answer = await quranApi.getCombinedSurahData(
        round!.answerSurahNumber,
        reciterId
      );
      return { prompt, answer };
    },
    enabled: practiceStarted && round != null,
    staleTime: SURAH_STALE_TIME,
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

  const roundData = roundDataQuery.data;
  const roundLoading = roundDataQuery.isPending || roundDataQuery.isFetching;
  const roundError = roundDataQuery.isError;
  const roundReady = roundDataQuery.isSuccess && roundData != null;

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

  const promptMeta = round ? metaByNumber.get(round.promptSurahNumber) : undefined;
  const answerMeta = round ? metaByNumber.get(round.answerSurahNumber) : undefined;

  const promptAyah = useMemo(() => {
    if (!round || !roundData || !promptMeta) return undefined;
    return buildAyahMap(roundData.prompt).get(promptMeta.numberOfAyahs);
  }, [round, roundData, promptMeta]);

  const nextAyah = useMemo(() => {
    if (!round || !roundData) return undefined;
    return buildAyahMap(roundData.answer).get(1);
  }, [round, roundData]);

  const { noteGesture, playPrompt, promptAudioBlocked } = useSambungPromptAudio(
    audioRef,
    roundKey,
    promptAyah?.audio
  );

  const startPractice = useCallback(() => {
    if (eligibleSelected.length === 0) {
      toast({
        title: "Pilihan belum valid",
        description:
          "Pilih minimal satu surah yang bukan An-Nas (114), karena soal membutuhkan surah berikutnya dalam urutan Mushaf.",
        variant: "destructive",
      });
      return;
    }
    noteGesture();
    setShowCaraMain(true);
    resetRoundUi();
    const r = pickRandomRound(selectedSurahNumbers, surahsMeta);
    if (r) setRound(r);
    setPracticeStarted(true);
  }, [
    eligibleSelected.length,
    noteGesture,
    resetRoundUi,
    selectedSurahNumbers,
    surahsMeta,
    setRound,
    toast,
  ]);

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
    noteGesture();
    answerAutoplayRef.current?.pause();
    answerAutoplayRef.current = null;
    answerAudioRef.current?.pause();
    nextRound();
  }, [nextRound, noteGesture]);

  const backToSetup = () => {
    setPracticeStarted(false);
    resetRoundUi();
  };

  const playPromptAudio = useCallback(() => {
    const url = promptAyah?.audio;
    if (!url) return;
    noteGesture();
    void playPrompt(url).then((ok) => {
      if (!ok) {
        toast({
          title: "Audio tidak bisa diputar",
          description: "Periksa koneksi atau coba qari lain.",
          variant: "destructive",
        });
      }
    });
  }, [noteGesture, playPrompt, promptAyah?.audio, toast]);

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
    noteGesture();
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
  }, [nextAyah?.audio, noteGesture, setRevealed, toast]);

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
            <Button variant="outline" onClick={() => navigate("/latihan")}>
              Kembali ke Latihan
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
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="h-10 w-10">
            <Link to="/latihan" aria-label="Kembali ke Latihan">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={cn(
                "h-10 w-10 shrink-0 rounded-full flex items-center justify-center shadow-lg",
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
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                #SambungSurat
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {practiceStarted
                  ? "Mode kuis — sambung awal surah berikutnya setelah akhir surah"
                  : "Latihan sambung awal surah berikutnya setelah akhir surah"}
              </p>
            </div>
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
              Aplikasi tidak bisa menilai hafalan Anda. Gunakan jawaban untuk
              membandingkan dengan hafalan, atau lanjut ke soal berikutnya jika sudah yakin.
            </AlertDescription>
          </Alert>
        )}

        {!practiceStarted ? (
          <>
            <SurahMultiSelect
              surahs={surahsMeta}
              filteredSurahs={filteredSurahs}
              selectedNumbers={selectedSurahNumbers}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onToggle={toggleSurah}
              onClear={clearSelection}
              isSurahDisabled={(s) => s.number >= 114}
              disabledHint={() => "tidak ada surah berikutnya (An-Nas)"}
            />

            <ReciterSelector showResetButton={false} />

            <StartLatihanButton
              onClick={startPractice}
              disabled={eligibleSelected.length === 0}
            >
              Mulai #SambungSurat
            </StartLatihanButton>
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

            {roundError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Gagal memuat ayat. Terlalu banyak permintaan? Tunggu sebentar lalu coba
                  lagi, atau ubah qari.
                </AlertDescription>
              </Alert>
            )}

            {round && (roundLoading || !roundReady) && (
              <Card className="border-2 border-primary/20 shadow-[0_12px_40px_-10px_hsl(var(--primary)/0.2)]">
                <CardContent className="p-8 flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-islamic-gold border-t-transparent" />
                  <p className="text-muted-foreground text-sm font-medium text-center">
                    Memuat ayat… (mohon tunggu, menghindari batas server)
                  </p>
                </CardContent>
              </Card>
            )}

            {roundReady && round && promptMeta && answerMeta && promptAyah && (
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
                            Akhir surah → awal surah berikutnya
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div
                          className="rounded-xl border-2 border-primary/25 bg-gradient-to-br from-muted/80 to-background px-4 py-2 text-center shadow-inner min-w-[5.5rem]"
                          title="Ayat terakhir surah ini menjadi soal. Jawaban: ayat pertama surah berikutnya dalam urutan Mushaf."
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Akhir surah
                          </p>
                          <p className="text-2xl font-black tabular-nums text-primary leading-none">
                            {promptMeta.numberOfAyahs}
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
                          Audio soal diputar otomatis jika tersedia. Gunakan{" "}
                          <span className="font-medium text-foreground">Ulangi audio</span> bila perlu.{" "}
                          <span className="font-medium text-foreground">Tampilkan Jawaban</span> membuka ayat
                          pertama surah berikutnya;{" "}
                          <span className="font-medium text-foreground">Soal berikutnya</span> langsung ke soal
                          baru tanpa membuka jawaban bila Anda sudah yakin.
                        </p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6 px-4 pb-8 sm:px-6">
                    <audio
                      ref={audioRef}
                      className="hidden"
                      preload="auto"
                      playsInline
                    />

                    {promptAudioBlocked && promptAyah.audio ? (
                      <Alert className="border-amber-500/40 bg-amber-500/10">
                        <AlertDescription className="text-sm">
                          Audio soal tidak diputar otomatis di perangkat ini. Ketuk{" "}
                          <span className="font-semibold text-foreground">Ulangi audio</span>.
                        </AlertDescription>
                      </Alert>
                    ) : null}

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
                          className={cn(
                            "border font-semibold",
                            promptAudioBlocked && "ring-2 ring-amber-500 animate-pulse"
                          )}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Ulangi audio
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
                open={revealed}
                onOpenChange={(open) => {
                  if (!open) {
                    answerAutoplayRef.current?.pause();
                    answerAutoplayRef.current = null;
                    answerAudioRef.current?.pause();
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
                          Awal surah berikutnya
                        </DialogTitle>
                      </div>
                      <DialogDescription className="text-left">
                        {surahLabel(answerMeta)} — ayat 1. Bandingkan dengan hafalan Anda. Audio diputar otomatis bila tersedia; gunakan &quot;Ulangi audio&quot; jika perlu.
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

export default SambungSurat;
