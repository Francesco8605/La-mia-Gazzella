import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone, Download } from "lucide-react";
import { InstallPWAModal, useInstallPWA } from "./install-pwa-modal";

interface InstallPWAButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function InstallPWAButton({ 
  variant = "outline", 
  size = "default", 
  className = "",
  children 
}: InstallPWAButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { isInstallable, installPWA } = useInstallPWA();

  const handleClick = () => {
    if (isInstallable) {
      // Su Android Chrome mostra il prompt nativo
      installPWA();
    } else {
      // Su iOS e altri browser mostra le istruzioni
      setShowModal(true);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={`flex items-center gap-2 ${className}`}
        data-testid="button-install-pwa"
      >
        {isInstallable ? (
          <Download className="h-4 w-4" />
        ) : (
          <Smartphone className="h-4 w-4" />
        )}
        {children || (isInstallable ? "Installa App" : "Installa sul Telefono")}
      </Button>

      <InstallPWAModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}

// Componente per banner di installazione
export function InstallPWABanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { showInstructions, markInstructionsSeen } = useInstallPWA();

  // Mostra il banner solo se l'utente non ha mai visto le istruzioni
  // e solo su mobile
  const shouldShowBanner = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return isMobile && showInstructions && !isVisible;
  };

  if (!shouldShowBanner()) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    markInstructionsSeen();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg p-4 mx-auto max-w-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-sm">Installa La Mia Gazzella</p>
            <p className="text-xs opacity-90">Per un accesso più veloce</p>
          </div>
        </div>
        <div className="flex gap-2">
          <InstallPWAButton variant="ghost" size="sm" className="text-white hover:bg-white/20">
            Installa
          </InstallPWAButton>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="text-white hover:bg-white/20 px-2"
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
}