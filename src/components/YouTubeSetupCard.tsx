import { FormEvent, useMemo, useState } from "react";
import { useQuranStore } from "../store/quranStore";
import { extractYouTubeVideoId } from "../utils/youtube";
import { ustHanifPlaylist } from "../data/ustHanifPlaylist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Youtube, ListPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const getLinkId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const YouTubeSetupCard = () => {
  const { youtubeLinks, youtubeSessionLoops, setYouTubeLinks, setYouTubeSessionLoops } = useQuranStore();
  const [linkInput, setLinkInput] = useState("");
  const { toast } = useToast();

  const totalPlaysPerSession = useMemo(
    () => youtubeLinks.reduce((sum, link) => sum + Math.max(1, link.loopCount), 0),
    [youtubeLinks]
  );

  const handleAddLink = (event: FormEvent) => {
    event.preventDefault();
    const videoId = extractYouTubeVideoId(linkInput);
    if (!videoId) {
      toast({
        title: "Link tidak valid",
        description: "Masukkan URL YouTube yang valid.",
        variant: "destructive",
      });
      return;
    }

    const duplicate = youtubeLinks.some((link) => link.videoId === videoId);
    if (duplicate) {
      toast({
        title: "Link sudah ada",
        description: "Video YouTube ini sudah ada di daftar.",
        variant: "destructive",
      });
      return;
    }

    setYouTubeLinks([
      ...youtubeLinks,
      {
        id: getLinkId(),
        url: linkInput.trim(),
        videoId,
        loopCount: 1,
      },
    ]);
    setLinkInput("");
  };

  const addLinkToSession = (url: string, surahName?: string) => {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      toast({
        title: "Link rekomendasi tidak valid",
        description: surahName ? `Periksa link untuk ${surahName}.` : "Periksa link rekomendasi.",
        variant: "destructive",
      });
      return false;
    }

    const duplicate = youtubeLinks.some((link) => link.videoId === videoId);
    if (duplicate) {
      return false;
    }

    setYouTubeLinks([
      ...youtubeLinks,
      {
        id: getLinkId(),
        url: url.trim(),
        videoId,
        loopCount: 1,
      },
    ]);
    return true;
  };

  const handleAddAllRecommended = () => {
    let addedCount = 0;
    const existingVideoIds = new Set(youtubeLinks.map((link) => link.videoId));
    const merged = [...youtubeLinks];

    ustHanifPlaylist.forEach((item) => {
      const videoId = extractYouTubeVideoId(item.url);
      if (!videoId || existingVideoIds.has(videoId)) {
        return;
      }
      existingVideoIds.add(videoId);
      merged.push({
        id: getLinkId(),
        url: item.url.trim(),
        videoId,
        loopCount: 1,
      });
      addedCount += 1;
    });

    setYouTubeLinks(merged);
    toast({
      title: "Playlist ditambahkan",
      description: addedCount > 0 ? `${addedCount} link berhasil ditambahkan.` : "Tidak ada link baru untuk ditambahkan.",
    });
  };

  const updateLinkLoopCount = (linkId: string, nextValue: number) => {
    const safeValue = Math.max(1, nextValue);
    setYouTubeLinks(
      youtubeLinks.map((item) =>
        item.id === linkId ? { ...item, loopCount: safeValue } : item
      )
    );
  };

  return (
    <Card className="shadow-peaceful">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Youtube className="h-5 w-5" />
          Siapkan Sesi Murajaah YouTube
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleAddLink} className="space-y-3">
          <Label htmlFor="youtube-link">Link YouTube</Label>
          <div className="flex gap-2">
            <Input
              id="youtube-link"
              value={linkInput}
              onChange={(event) => setLinkInput(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <Button type="submit" className="shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </Button>
          </div>
        </form>

        <div className="space-y-3 rounded-md border p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-primary">Playlist Ust. Hanif</p>
              <p className="text-xs text-muted-foreground">
                Tambahkan rekomendasi dari Ust. Hanif.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddAllRecommended}>
              <ListPlus className="h-4 w-4 mr-1" />
              Tambah Semua
            </Button>
          </div>

          {ustHanifPlaylist.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Daftar masih kosong. Tambahkan data di `src/data/ustHanifPlaylist.ts`.
            </p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {ustHanifPlaylist.map((item) => {
                const videoId = extractYouTubeVideoId(item.url);
                const alreadyAdded = videoId ? youtubeLinks.some((link) => link.videoId === videoId) : false;
                return (
                  <div key={`${item.surahName}-${item.url}`} className="rounded-md border p-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.surahName}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.url}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={alreadyAdded || !videoId}
                        onClick={() => addLinkToSession(item.url, item.surahName)}
                      >
                        {alreadyAdded ? "Sudah ditambah" : "Tambah"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Daftar Link</Label>
            <Badge variant="outline">{youtubeLinks.length} link</Badge>
          </div>
          {youtubeLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada link YouTube.</p>
          ) : (
            <div className="space-y-2">
              {youtubeLinks.map((link, index) => (
                <div key={link.id} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">Link {index + 1}: {link.url}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setYouTubeLinks(youtubeLinks.filter((item) => item.id !== link.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`loop-${link.id}`} className="text-xs text-muted-foreground">
                      Loop link ini
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateLinkLoopCount(link.id, link.loopCount - 1)}
                    >
                      -
                    </Button>
                    <Input
                      id={`loop-${link.id}`}
                      type="number"
                      min={1}
                      value={link.loopCount}
                      onChange={(event) => {
                        updateLinkLoopCount(link.id, Number(event.target.value) || 1);
                      }}
                      className="w-20 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateLinkLoopCount(link.id, link.loopCount + 1)}
                    >
                      +
                    </Button>
                    <span className="text-xs text-muted-foreground">kali</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="session-loop">Loop sesi (ulang seluruh daftar)</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setYouTubeSessionLoops(Math.max(1, youtubeSessionLoops - 1))}
            >
              -
            </Button>
            <Input
              id="session-loop"
              type="number"
              min={1}
              value={youtubeSessionLoops}
              onChange={(event) => setYouTubeSessionLoops(Math.max(1, Number(event.target.value) || 1))}
              className="w-24 text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setYouTubeSessionLoops(youtubeSessionLoops + 1)}
            >
              +
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Total putar per sesi: {totalPlaysPerSession} | Target putar keseluruhan:{" "}
            {totalPlaysPerSession * youtubeSessionLoops}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
