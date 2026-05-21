import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Headphones,
  Info,
  Play,
  X,
} from "lucide-react";
import { quranApi } from "@/services/quranApi";
import { useQuranStore, type Ayah, type Surah } from "@/store/quranStore";
import { useMurajaahStore } from "@/store/murajaahStore";
import {
  buildMurajaahPlaylist,
  sortedSelectedSurahs,
  surahNumberAtPlaylistIndex,
} from "@/lib/murajaahPlaylist";
import { queryClient } from "@/lib/queryClient";
import { combinedSurahQueryKey, SURAH_STALE_TIME } from "@/lib/surahQueryKeys";
import { ReciterSelector } from "@/components/ReciterSelector";
import { SurahMultiSelect } from "@/components/SurahMultiSelect";
import { MurajaahPlayer } from "@/components/MurajaahPlayer";
import { AyahDisplay } from "@/components/AyahDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function surahLabel(meta: Surah | undefined) {
  if (!meta) return "";
  return `${meta.number}. ${meta.englishName}`;
}

const Murajaah = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const selectedReciter = useQuranStore((s) => s.selectedReciter);
  const reciterId = selectedReciter?.identifier ?? "ar.alafasy";

  const {
    selectedSurahNumbers,
    sessionLoops,
    sessionStarted,
    currentAyahIndex,
    currentSessionLoop,
    isPlaying,
    isCompleted,
    toggleSurah,
    clearSelection,
    setSessionLoops,
    setSessionStarted,
    setCurrentAyahIndex,
    setCurrentSessionLoop,
    setIsPlaying,
    setIsCompleted,
    resetSession,
  } = useMurajaahStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [ayahsBySurah, setAyahsBySurah] = useState<Record<number, Ayah[]>>({});
  const [loadDone, setLoadDone] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [showDisclaimerAlert, setShowDisclaimerAlert] = useState(true);

  const { data: surahsMeta = [], isLoading: surahsLoading, isError: surahsError } =
    useQuery({
      queryKey: ["surahs"],
      queryFn: () => quranApi.getSurahs(),
      staleTime: SURAH_STALE_TIME,
    });

  const sortedSelected = useMemo(
    () => sortedSelectedSurahs(selectedSurahNumbers),
    [selectedSurahNumbers]
  );

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

  const metaByNumber = useMemo(() => {
    const m = new Map<number, Surah>();
    for (const s of surahsMeta) m.set(s.number, s);
    return m;
  }, [surahsMeta]);

  const playlist = useMemo(
    () => buildMurajaahPlaylist(sortedSelected, ayahsBySurah),
    [sortedSelected, ayahsBySurah]
  );

  const allSurahsLoaded =
    sessionStarted &&
    sortedSelected.length > 0 &&
    sortedSelected.every((n) => ayahsBySurah[n]?.length);

  const canAdvance =
    currentAyahIndex < playlist.length - 1 || allSurahsLoaded;

  useEffect(() => {
    if (!sessionStarted || sortedSelected.length === 0) return;

    let cancelled = false;
    (async () => {
      for (let i = 0; i < sortedSelected.length; i++) {
        if (cancelled) return;
        const num = sortedSelected[i]!;
        try {
          const data = await queryClient.fetchQuery({
            queryKey: combinedSurahQueryKey(num, reciterId),
            queryFn: () => quranApi.getCombinedSurahData(num, reciterId),
            staleTime: SURAH_STALE_TIME,
          });
          if (cancelled) return;
          setAyahsBySurah((prev) => ({ ...prev, [num]: data }));
          setLoadDone(i + 1);
        } catch {
          if (!cancelled) {
            setLoadError(true);
            toast({
              title: "Gagal memuat surah",
              description:
                "Terlalu banyak permintaan? Tunggu sebentar lalu coba lagi, atau pilih lebih sedikit surah.",
              variant: "destructive",
            });
          }
          break;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionStarted, reciterId, sortedSelected.join(","), toast]);

  const startSession = useCallback(() => {
    if (selectedSurahNumbers.length === 0) {
      toast({
        title: "Belum ada surah",
        description: "Pilih minimal satu surah untuk murajaah.",
        variant: "destructive",
      });
      return;
    }
    if (selectedSurahNumbers.length > 15) {
      toast({
        title: "Banyak surah dipilih",
        description: "Muat ayat akan lebih lama. Pertimbangkan memilih lebih sedikit surah.",
      });
    }
    resetSession();
    setAyahsBySurah({});
    setLoadDone(0);
    setLoadError(false);
    setSessionStarted(true);
  }, [selectedSurahNumbers.length, resetSession, setSessionStarted, toast]);

  const backToSetup = () => {
    setSessionStarted(false);
    setAyahsBySurah({});
    setLoadDone(0);
    setLoadError(false);
    resetSession();
  };

  const handleRestart = () => {
    resetSession();
    setIsPlaying(false);
    if (playlist.length > 0 && playlist[0]?.audio) {
      setTimeout(() => setIsPlaying(true), 300);
    }
  };

  const currentAyah = playlist[currentAyahIndex];
  const currentSurahNumber = currentAyah
    ? surahNumberAtPlaylistIndex(
        playlist,
        currentAyahIndex,
        sortedSelected,
        ayahsBySurah
      )
    : undefined;
  const currentSurahMeta = currentSurahNumber
    ? metaByNumber.get(currentSurahNumber)
    : undefined;

  const firstSurahReady = sortedSelected.length > 0 && !!ayahsBySurah[sortedSelected[0]!];

  if (surahsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (surahsError || surahsMeta.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="shadow-peaceful">
          <CardContent className="p-6 space-y-4">
            <p className="text-destructive">Gagal memuat daftar surah.</p>
            <Button variant="outline" onClick={() => navigate("/murajaah")}>
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-w-3xl mx-auto space-y-6 transition-colors duration-500",
        sessionStarted && "rounded-xl"
      )}
    >
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="h-10 w-10">
            <Link to="/murajaah" aria-label="Kembali ke Murajaah">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary">Murajaah Quran</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {sessionStarted
                ? "Putar berurutan ayat 1 sampai akhir surah pilihan (urut nomor surah)"
                : "Pilih surah dan qari, lalu dengarkan murajaah berurutan"}
            </p>
          </div>
        </div>

        {showDisclaimerAlert && (
          <Alert className="relative p-3 pr-10 shadow-peaceful sm:p-4 border-primary/20 bg-primary/5">
            <button
              type="button"
              aria-label="Sembunyikan"
              className="absolute right-2 top-2 p-2 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setShowDisclaimerAlert(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm text-muted-foreground">
              Memutar semua ayat surah pilihan secara berurutan (nomor surah naik). Untuk video
              YouTube, gunakan Murajaah YouTube dari menu Murajaah.
            </AlertDescription>
          </Alert>
        )}

        {!sessionStarted ? (
          <>
            <SurahMultiSelect
              surahs={surahsMeta}
              filteredSurahs={filteredSurahs}
              selectedNumbers={selectedSurahNumbers}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onToggle={toggleSurah}
              onClear={clearSelection}
            />
            <ReciterSelector showResetButton={false} />
            <Card className="shadow-peaceful">
              <CardContent className="p-4 space-y-3">
                <Label htmlFor="session-loops">Ulangi sesi</Label>
                <Input
                  id="session-loops"
                  type="number"
                  min={1}
                  value={sessionLoops}
                  onChange={(e) =>
                    setSessionLoops(parseInt(e.target.value, 10) || 1)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Satu sesi = semua ayat semua surah terpilih (urut nomor surah). Ulangi
                  sesi mengulang playlist dari awal.
                </p>
              </CardContent>
            </Card>
            <Button
              className="w-full h-14 text-lg font-bold"
              onClick={startSession}
              disabled={selectedSurahNumbers.length === 0}
            >
              <Play className="h-5 w-5 mr-2" />
              Mulai #Murajaah
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={backToSetup}>
                Ubah surah / qari
              </Button>
            </div>

            {loadError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Sebagian surah gagal dimuat. Kembali ke setup atau tunggu lalu coba lagi.
                </AlertDescription>
              </Alert>
            )}

            {!firstSurahReady && !loadError && (
              <Card className="shadow-peaceful">
                <CardContent className="p-8 flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                  <p className="text-sm text-muted-foreground text-center">
                    Memuat surah {loadDone} dari {sortedSelected.length}… (mohon tunggu,
                    menghindari batas server)
                  </p>
                </CardContent>
              </Card>
            )}

            {firstSurahReady && (
              <div className="space-y-6">
                {!allSurahsLoaded && (
                  <p className="text-sm text-muted-foreground text-center">
                    Memuat surah {loadDone} dari {sortedSelected.length}…
                  </p>
                )}
                {currentSurahMeta && (
                  <p className="text-center font-semibold text-primary">
                    {surahLabel(currentSurahMeta)}
                  </p>
                )}
                {currentAyah ? (
                  <AyahDisplay
                    ayah={currentAyah}
                    isActive
                    isPlaying={isPlaying}
                  />
                ) : null}
                <MurajaahPlayer
                  playlist={playlist}
                  currentIndex={currentAyahIndex}
                  sessionLoop={currentSessionLoop}
                  sessionLoops={sessionLoops}
                  isPlaying={isPlaying}
                  isCompleted={isCompleted}
                  selectedReciter={selectedReciter}
                  canAdvance={canAdvance}
                  onIndexChange={setCurrentAyahIndex}
                  onSessionLoopChange={setCurrentSessionLoop}
                  onPlayingChange={setIsPlaying}
                  onCompleted={() => setIsCompleted(true)}
                  onRestart={handleRestart}
                />
              </div>
            )}
          </>
        )}
    </div>
  );
};

export default Murajaah;
