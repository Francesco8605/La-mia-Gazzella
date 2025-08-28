import { Link, useLocation } from "wouter";
import { Leaf, Menu, X, LogOut, Crown, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { InstallPWAButton } from "./install-pwa-button";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { hasActiveSubscription, isInTrial, subscriptionStatus } = useSubscription();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/genera-piano", label: "Genera Piano" },
    { href: "/piani-personalizzati", label: "I Miei Piani" },
    { href: "/recipe-generator", label: "Genera Ricette" },
    { href: "/recipes", label: "Ricette" },
    { href: "/assistente-nutrizionale", label: "Consulente AI" },
    { href: "/aggiorna-profilo", label: "Il Mio Profilo" },
    { href: "/piani-abbonamento", label: "Abbonamenti" },
  ];

  return (
    <nav className="fixed top-2 md:top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-lg shadow-lg border border-white/20 rounded-full px-4 md:px-6 py-2 md:py-3 animate-fade-in w-[95%] md:w-auto" data-testid="main-navigation">
      <div className="flex items-center justify-between w-full md:space-x-8">
        <Link href="/" className="flex items-center space-x-2" data-testid="logo-link">
          <Leaf className="text-secondary text-xl" />
          <span className="font-bold text-slate-800 text-lg">La Mia Gazzella</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-slate-700 hover:text-primary transition-colors duration-300 font-medium ${
                location === item.href ? "text-primary" : ""
              }`}
              data-testid={`nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Subscription Status Indicator */}
          <div className="flex items-center">
            {hasActiveSubscription ? (
              <div className="flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                {isInTrial ? (
                  <>
                    <AlertTriangle className="h-3 w-3" />
                    <span>Trial</span>
                  </>
                ) : (
                  <>
                    <Crown className="h-3 w-3" />
                    <span>Premium</span>
                  </>
                )}
              </div>
            ) : (
              <Link href="/piani-abbonamento">
                <div className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium hover:bg-orange-200 cursor-pointer transition-colors">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Riattiva</span>
                </div>
              </Link>
            )}
          </div>
          
          {/* Install PWA Button */}
          <InstallPWAButton 
            variant="ghost" 
            size="sm"
            className="text-slate-700 hover:text-primary transition-colors duration-300"
          />
          
          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                // Pulisci la cache
                window.location.reload();
              } catch (error) {
                console.error("Logout error:", error);
                window.location.reload();
              }
            }}
            className="text-slate-700 hover:text-red-600 transition-colors duration-300"
            data-testid="logout-button"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Esci
          </Button>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-700 hover:text-primary transition-colors duration-300"
            data-testid="mobile-menu-button"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-lg shadow-lg border border-white/20 rounded-2xl px-6 py-4 animate-scale-in" data-testid="mobile-menu">
          <div className="flex flex-col space-y-3">
            {/* Subscription Status in Mobile */}
            <div className="py-2 border-b border-slate-200">
              {hasActiveSubscription ? (
                <div className="flex items-center space-x-2 text-emerald-700">
                  {isInTrial ? (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Prova Gratuita Attiva</span>
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4" />
                      <span className="text-sm font-medium">Abbonamento Premium</span>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/piani-abbonamento" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-2 text-orange-700 hover:text-orange-800 transition-colors">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Riattiva Abbonamento</span>
                  </div>
                </Link>
              )}
            </div>
            
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-slate-700 hover:text-primary transition-colors duration-300 font-medium py-2 ${
                  location === item.href ? "text-primary" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Actions */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              {/* Install PWA Button in Mobile */}
              <InstallPWAButton 
                variant="ghost" 
                size="sm"
                className="text-slate-700 hover:text-primary transition-colors duration-300 w-full justify-start"
              >
                📱 Installa App
              </InstallPWAButton>
              
              {/* Mobile Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  setIsMobileMenuOpen(false);
                  try {
                    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                    window.location.reload();
                  } catch (error) {
                    console.error("Logout error:", error);
                    window.location.reload();
                  }
                }}
                className="text-slate-700 hover:text-red-600 transition-colors duration-300 w-full justify-start"
                data-testid="mobile-logout-button"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Esci
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}