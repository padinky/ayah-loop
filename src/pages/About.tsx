import { ArrowLeft, Code, Heart, Mail, Globe, Database, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";

const About = () => {
  const navigate = useNavigate();

  const technologies = [
    { name: "React", description: "Frontend library for building user interfaces" },
    { name: "TypeScript", description: "Type-safe JavaScript for better development experience" },
    { name: "Tailwind CSS", description: "Utility-first CSS framework for styling" },
    { name: "Vite", description: "Fast build tool and development server" },
    { name: "Zustand", description: "Lightweight state management" },
    { name: "React Router", description: "Navigation and routing" },
    { name: "Shadcn/ui", description: "Beautiful and accessible UI components" }
  ];

  const thirdPartyServices = [
    { name: "Al-Qur'an Cloud API", description: "Provides Quranic text and audio recitations", url: "https://alquran.cloud" },
    { name: "Everyayah.com", description: "Audio recitations by various reciters", url: "https://everyayah.com" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-islamic-green-light/10 to-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/')}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Tentang Aplikasi
              </h1>
              <p className="text-muted-foreground">
                Informasi tentang proyek hafalan Al-Qur'an ini
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="space-y-8">
          {/* Project Description */}
          <Card className="shadow-peaceful bg-gradient-to-r from-card to-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Heart className="h-5 w-5 text-islamic-gold" />
                Tentang Proyek Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Aplikasi Hafalan Al-Qur'an ini adalah sebuah platform digital yang dirancang untuk membantu 
                umat Muslim dalam perjalanan menghafal Al-Qur'an. Aplikasi ini menyediakan fitur pemilihan 
                surah dan ayat, pengaturan pengulangan yang fleksibel, serta pemutaran audio berkualitas 
                tinggi untuk mendukung proses hafalan.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Dengan antarmuka yang sederhana dan intuitif, aplikasi ini memungkinkan pengguna untuk:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Memilih surah dan ayat tertentu untuk dihafal</li>
                <li>Mengatur jumlah pengulangan untuk setiap ayat</li>
                <li>Mengatur pengulangan untuk seluruh sesi hafalan</li>
                <li>Mendengarkan audio recitasi berkualitas tinggi</li>
                <li>Melacak progress hafalan secara real-time</li>
              </ul>
            </CardContent>
          </Card>

          {/* Technologies Used */}
          <Card className="shadow-peaceful">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Code className="h-5 w-5" />
                Teknologi yang Digunakan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {technologies.map((tech) => (
                  <div key={tech.name} className="p-4 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{tech.name}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tech.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Third Party Services */}
          <Card className="shadow-peaceful">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Globe className="h-5 w-5" />
                Layanan Pihak Ketiga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {thirdPartyServices.map((service) => (
                  <div key={service.name} className="p-4 rounded-lg border bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-islamic-gold" />
                        <Badge variant="outline">{service.name}</Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(service.url, '_blank')}
                        className="text-xs"
                      >
                        Kunjungi <Globe className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-islamic-green-light/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Catatan:</strong> Aplikasi ini menggunakan layanan gratis dari pihak ketiga 
                  untuk menyediakan data Al-Qur'an dan audio recitasi. Kami berterima kasih kepada 
                  para pengembang yang telah menyediakan API ini untuk kepentingan umat.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-peaceful">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Mail className="h-5 w-5" />
                Kontak & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Jika Anda menemukan masalah, memiliki saran untuk perbaikan, atau ingin memberikan 
                feedback tentang aplikasi ini, silakan hubungi kami melalui email:
              </p>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg border">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-primary">Email Kontak</p>
                  <a 
                    href="mailto:eky.pradhana@gmail.com?subject=Feedback Aplikasi Hafalan Al-Qur'an"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    eky.pradhana@gmail.com
                  </a>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('mailto:eky.pradhana@gmail.com?subject=Feedback Aplikasi Hafalan Al-Qur\'an', '_blank')}
                >
                  Kirim Email
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Feedback Anda sangat berharga untuk pengembangan aplikasi ini lebih lanjut. 
                Barakallahu fiikum!
              </p>
            </CardContent>
          </Card>

          {/* Footer Quote */}
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground italic">
              "Dan sesungguhnya telah Kami mudahkan Al-Qur'an untuk pelajaran, maka adakah orang yang mengambil pelajaran?" 
              <span className="block mt-2 text-xs font-medium">— Al-Qur'an 54:17</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;