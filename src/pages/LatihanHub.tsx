import { Link } from "react-router-dom";
import { ChevronRight, Link2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const modes = [
  {
    to: "/sambung-ayat",
    icon: Sparkles,
    title: "#SambungAyat",
    description: "Sambung ayat berikutnya dalam satu surah (soal acak)",
  },
  {
    to: "/sambung-surat",
    icon: Link2,
    title: "#SambungSurat",
    description: "Akhir surah → awal surah berikutnya dalam urutan Mushaf",
  },
] as const;

const LatihanHub = () => {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Latihan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Uji hafalan dengan soal acak — aplikasi tidak menilai, Anda yang mengecek
        </p>
      </div>

      <ul className="divide-y divide-border/60 rounded-lg border border-border/50 overflow-hidden bg-card shadow-peaceful">
        {modes.map(({ to, icon: Icon, title, description }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{title}</span>
                <span className="block text-xs text-muted-foreground">{description}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LatihanHub;
