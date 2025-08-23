import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Download, Share, MoreVertical, Plus, X } from "lucide-react";

interface InstallPWAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallPWAModal({ isOpen, onClose }: InstallPWAModalProps) {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  const handleDontShowAgain = () => {
    localStorage.setItem('pwa-install-shown', 'true');
    onClose();
  };

  const iOSInstructions = [
    {
      step: 1,
      icon: <Share className="h-5 w-5" />,
      title: "Tocca il pulsante Condividi",
      description: "Nella barra inferiore di Safari, tocca l'icona di condivisione"
    },
    {
      step: 2,
      icon: <Plus className="h-5 w-5" />,
      title: "Aggiungi alla schermata Home",
      description: "Scorri verso il basso e tocca 'Aggiungi alla schermata Home'"
    },
    {
      step: 3,
      icon: <Download className="h-5 w-5" />,
      title: "Conferma installazione",
      description: "Tocca 'Aggiungi' in alto a destra per completare l'installazione"
    }
  ];

  const androidInstructions = [
    {
      step: 1,
      icon: <MoreVertical className="h-5 w-5" />,
      title: "Apri il menu",
      description: "Tocca i tre punti verticali nell'angolo in alto a destra di Chrome"
    },
    {
      step: 2,
      icon: <Download className="h-5 w-5" />,
      title: "Installa app",
      description: "Seleziona 'Aggiungi alla schermata Home' o 'Installa app'"
    },
    {
      step: 3,
      icon: <Smartphone className="h-5 w-5" />,
      title: "Conferma",
      description: "Tocca 'Installa' per aggiungere l'app alla tua schermata Home"
    }
  ];

  const getCurrentInstructions = () => {
    switch (deviceType) {
      case 'ios':
        return iOSInstructions;
      case 'android':
        return androidInstructions;
      default:
        return [];
    }
  };

  const getDeviceName = () => {
    switch (deviceType) {
      case 'ios':
        return 'iPhone/iPad';
      case 'android':
        return 'Android';
      default:
        return 'Desktop';
    }
  };

  if (deviceType === 'desktop') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              Installa La Mia Gazzella
            </DialogTitle>
            <DialogDescription>
              Per installare l'app, apri questo sito dal tuo smartphone (iPhone o Android) e segui le istruzioni che appariranno.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Chiudi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            Installa La Mia Gazzella
          </DialogTitle>
          <DialogDescription>
            Installa l'app sul tuo {getDeviceName()} per un accesso più veloce e un'esperienza migliore
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">
              📱 Istruzioni per {getDeviceName()}
            </Badge>
          </div>

          <div className="space-y-3">
            {getCurrentInstructions().map((instruction, index) => (
              <Card key={index} className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-700 dark:text-green-300">
                        {instruction.step}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-green-600">
                          {instruction.icon}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {instruction.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {instruction.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-blue-600">
                <Smartphone className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Perché installare l'app?
              </span>
            </div>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Accesso più veloce dal tuo telefono</li>
              <li>• Funziona anche senza connessione</li>
              <li>• Notifiche per i tuoi piani nutrizionali</li>
              <li>• Esperienza mobile ottimizzata</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-4">
          <Button variant="ghost" onClick={handleDontShowAgain} className="text-sm">
            Non mostrare più
          </Button>
          <Button onClick={onClose}>
            Ho capito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook per gestire la logica di installazione PWA
export function useInstallPWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [hasSeenInstructions, setHasSeenInstructions] = useState(false);

  useEffect(() => {
    // Controlla se l'utente ha già visto le istruzioni
    const hasSeenBefore = localStorage.getItem('pwa-install-shown') === 'true';
    setHasSeenInstructions(hasSeenBefore);

    // Listener per l'evento beforeinstallprompt (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    }
  };

  const showInstructions = () => {
    return !hasSeenInstructions || isInstallable;
  };

  return {
    isInstallable,
    installPWA,
    showInstructions: showInstructions(),
    markInstructionsSeen: () => {
      localStorage.setItem('pwa-install-shown', 'true');
      setHasSeenInstructions(true);
    }
  };
}