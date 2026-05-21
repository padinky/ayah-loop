import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuranStore } from "@/store/quranStore";
import { YouTubeSetupCard } from "@/components/YouTubeSetupCard";
import { StartButton } from "@/components/StartButton";
import { Button } from "@/components/ui/button";

const MurajaahYouTube = () => {
  const setSessionMode = useQuranStore((s) => s.setSessionMode);
  const resetMemorization = useQuranStore((s) => s.resetMemorization);

  useEffect(() => {
    setSessionMode("youtube");
    resetMemorization();
  }, [setSessionMode, resetMemorization]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild className="h-10 w-10">
          <Link to="/murajaah" aria-label="Kembali ke Murajaah">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-primary">Murajaah YouTube</h1>
          <p className="text-sm text-muted-foreground">
            Tambahkan link video dan mulai loop murajaah
          </p>
        </div>
      </div>

      <YouTubeSetupCard />
      <StartButton />
    </div>
  );
};

export default MurajaahYouTube;
