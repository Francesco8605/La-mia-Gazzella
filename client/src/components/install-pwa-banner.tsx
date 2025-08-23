import { useState, useEffect } from "react";
import { InstallPWAButton } from "./install-pwa-button";
import { X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPWABanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenBanner, setHasSeenBanner] = useState(false);

  useEffect(() => {
    // Controlla se l'utente ha già visto il banner
    const bannerSeen = localStorage.getItem('pwa-banner-seen') === 'true';
    setHasSeenBanner(bannerSeen);
    
    // Mostra il banner solo su mobile e se non è stato visto
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isMobile && !bannerSeen && !isStandalone) {
      // Ritarda la visualizzazione del banner di 3 secondi per non essere invasivo
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-banner-seen', 'true');
    setHasSeenBanner(true);
  };

  const handleNeverShowAgain = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-banner-seen', 'true');
    localStorage.setItem('pwa-install-shown', 'true');
    setHasSeenBanner(true);
  };

  if (!isVisible || hasSeenBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg p-4 animate-slide-up">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-sm">Installa La Mia Gazzella</p>
              <p className="text-xs opacity-90">Accesso rapido dalla home</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="text-white hover:bg-white/20 px-2 py-1 h-auto -mt-1 -mr-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <InstallPWAButton 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20 border border-white/30 flex-1"
          >
            Installa
          </InstallPWAButton>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNeverShowAgain}
            className="text-white hover:bg-white/20 text-xs px-2"
          >
            Mai più
          </Button>
        </div>
      </div>
    </div>
  );
}