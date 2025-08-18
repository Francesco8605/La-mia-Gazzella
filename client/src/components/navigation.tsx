import { Link, useLocation } from "wouter";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/personalization", label: "Personalizzazione" },
    { href: "/recipe-generator", label: "Genera Ricette" },
    { href: "/meal-plans", label: "Piani Alimentari" },
    { href: "/recipes", label: "Ricette" },
    { href: "/auth", label: "Accedi" },
  ];

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 glass-morphism rounded-full px-6 py-3 animate-fade-in" data-testid="main-navigation">
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center space-x-2" data-testid="logo-link">
          <Leaf className="text-secondary text-xl" />
          <span className="font-bold text-slate-800 text-lg">La Mia Gazzella</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
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
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 glass-morphism rounded-2xl px-6 py-4 animate-scale-in" data-testid="mobile-menu">
          <div className="flex flex-col space-y-3">
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
          </div>
        </div>
      )}
    </nav>
  );
}