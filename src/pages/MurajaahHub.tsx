import { Link } from "react-router-dom";
import { ChevronRight, Headphones, Youtube } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
const sources = [
  {
    to: "/murajaah/quran",
    icon: Headphones,
    title: "Murajaah Quran",
    description: "Putar ayat berurutan dari surah pilihan (API Al-Qur'an)",
  },
  {
    to: "/murajaah/youtube",
    icon: Youtube,
    title: "Murajaah YouTube",
    description: "Loop video YouTube untuk murajaah",
  },
] as const;

const MurajaahHub = () => {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Murajaah</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Dengarkan hafalan berurutan — pilih sumber audio
        </p>
      </div>

      <ul className="space-y-3">
        {sources.map(({ to, icon: Icon, title, description }) => (
          <li key={to}>
            <Link to={to}>
              <Card className="shadow-peaceful hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-foreground">{title}</span>
                    <span className="block text-xs text-muted-foreground">{description}</span>
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MurajaahHub;
