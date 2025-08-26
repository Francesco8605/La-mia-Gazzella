import { Link, useLocation } from "wouter";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { InstallPWAButton } from "./install-pwa-button";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/recipe-generator", label: "Genera Ricette" },
    { href: "/piani-personalizzati", label: "I Miei Piani" },
    { href: "/aggiorna-profilo", label: "Profilo" },
    { href: "/recipes", label: "Ricette" },
    { href: "/consulente-nutrizionale", label: "Consulente AI" },
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
          
          {/* Install PWA Button */}
          <InstallPWAButton 
            variant="ghost" 
            size="sm"
            className="text-slate-700 hover:text-primary transition-colors duration-300"
          />
        </div>
        
        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
            aria-label="Toggle menu"
            data-testid="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 bg-white rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors font-medium ${
                  location === item.href ? "text-primary bg-green-50" : ""
                }`}
                data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile PWA Install */}
            <div className="px-4 py-2">
              <InstallPWAButton 
                variant="ghost" 
                size="sm"
                className="w-full justify-start text-slate-700 hover:text-primary transition-colors duration-300"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}