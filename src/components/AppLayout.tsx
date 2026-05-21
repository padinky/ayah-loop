import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { BookOpen, Headphones, Info, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mainNav = [
  { to: "/", label: "Menghafal", icon: BookOpen },
  { to: "/murajaah", label: "Murajaah", icon: Headphones },
  { to: "/latihan", label: "Latihan", icon: Sparkles },
] as const;

function isMainNavActive(pathname: string, to: string): boolean {
  if (to === "/") return pathname === "/";
  if (to === "/murajaah") {
    return pathname === "/murajaah" || pathname.startsWith("/murajaah/");
  }
  if (to === "/latihan") {
    return (
      pathname === "/latihan" ||
      pathname.startsWith("/sambung-ayat") ||
      pathname.startsWith("/sambung-surat")
    );
  }
  return pathname === to;
}

function MainNavItem({
  to,
  label,
  icon: Icon,
  layout,
}: {
  to: string;
  label: string;
  icon: typeof BookOpen;
  layout: "desktop" | "mobile";
}) {
  const { pathname } = useLocation();
  const active = isMainNavActive(pathname, to);

  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={cn(
        layout === "desktop"
          ? "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          : "flex flex-col items-center gap-0.5 rounded-lg py-2 px-1 text-[10px] font-semibold transition-colors",
        active
          ? layout === "desktop"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-primary bg-primary/10"
          : layout === "desktop"
            ? "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            : "text-muted-foreground"
      )}
    >
      <Icon className={layout === "desktop" ? "h-4 w-4" : "h-5 w-5"} />
      {label}
    </NavLink>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-islamic-green-light/10 to-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between gap-3 py-3">
            <Link
              to="/"
              className="text-sm font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent shrink-0"
            >
              Hafalan Project
            </Link>
            <nav className="hidden md:flex items-center gap-1" aria-label="Menu utama">
              {mainNav.map((item) => (
                <MainNavItem key={item.to} {...item} layout="desktop" />
              ))}
            </nav>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/about">
                  <Info className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Tentang</span>
                </Link>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl w-full pb-24 md:pb-8">
        <Outlet />
      </main>

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md"
        aria-label="Menu utama"
      >
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          {mainNav.map((item) => (
            <MainNavItem key={item.to} {...item} layout="mobile" />
          ))}
        </div>
      </nav>
    </div>
  );
}
