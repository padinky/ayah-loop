import { useState } from "react";
import { useQuranStore } from "../store/quranStore";
import { quranApi } from "../services/quranApi";
import { SurahSelector } from "./SurahSelector";
import { ReciterSelector } from "./ReciterSelector";
import { RangeRepeatControl } from "./RangeRepeatControl";
import { AyahSelector } from "./AyahSelector";
import { StartButton } from "./StartButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const MobileWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const {
    selectedSurah,
    selectedReciter,
    setAyahs,
    resetMemorization
  } = useQuranStore();
  const { toast } = useToast();

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleSurahSelect = async (surah: any) => {
    // Reset selections when changing surah
    useQuranStore.getState().setSelectedSurah(surah);
    useQuranStore.setState({
      selectedAyahs: [],
      repeatConfig: {
        ayahs: {},
        range: 1
      }
    });
    
    setLoading(true);
    try {
      const ayahsData = await quranApi.getCombinedSurahData(surah.number, selectedReciter?.identifier);
      setAyahs(ayahsData);
      toast({
        title: "Surah Berhasil Dimuat",
        description: `${surah.englishName} dengan ${ayahsData.length} ayat siap untuk dipilih.`
      });
      // Auto advance to next step
      setCurrentStep(2);
    } catch (error) {
      console.error('Error loading surah:', error);
      toast({
        title: "Gagal Memuat Surah",
        description: "Gagal memuat ayat. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Pilih Surah";
      case 2: return "Pilih Ayat";
      case 3: return "Atur Pengulangan";
      case 4: return "Pilih Qari";
      case 5: return "Mulai Hafalan";
      default: return "";
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedSurah !== null;
      case 2: return true; // Ayah selection is optional
      case 3: return true; // Range repeat is optional
      case 4: return selectedReciter !== null;
      case 5: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <SurahSelector onSurahSelect={handleSurahSelect} />;
      case 2:
        return loading ? (
          <Card className="shadow-peaceful">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Memuat ayat...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <AyahSelector />
        );
      case 3:
        return selectedSurah ? <RangeRepeatControl /> : null;
      case 4:
        return <ReciterSelector />;
      case 5:
        return <StartButton />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="shadow-peaceful">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Langkah {currentStep} dari {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="shadow-peaceful">
        <CardHeader>
          <CardTitle className="text-xl text-center">{getStepTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      {currentStep !== 1 && currentStep !== 5 && (
        <div className="flex justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            Lanjut
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}


      {currentStep === 5 && (
        <div className="flex justify-start">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Button>
        </div>
      )}
    </div>
  );
};