import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Menghafal from "./pages/Home";
import About from "./pages/About";
import Memorize from "./pages/Memorize";
import SambungAyat from "./pages/SambungAyat";
import SambungSurat from "./pages/SambungSurat";
import MurajaahHub from "./pages/MurajaahHub";
import MurajaahQuran from "./pages/Murajaah";
import MurajaahYouTube from "./pages/MurajaahYouTube";
import LatihanHub from "./pages/LatihanHub";
import NotFound from "./pages/NotFound";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Menghafal />} />
            <Route path="/murajaah" element={<MurajaahHub />} />
            <Route path="/murajaah/quran" element={<MurajaahQuran />} />
            <Route path="/murajaah/youtube" element={<MurajaahYouTube />} />
            <Route path="/latihan" element={<LatihanHub />} />
            <Route path="/about" element={<About />} />
            <Route path="/sambung-ayat" element={<SambungAyat />} />
            <Route path="/sambung-surat" element={<SambungSurat />} />
          </Route>
          <Route path="/memorize" element={<Memorize />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
