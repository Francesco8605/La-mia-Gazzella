import { Link, useLocation } from "wouter";
import { Leaf, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InstallPWAButton } from "./install-pwa-button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/recipe-generator", label: "Genera Ricette" },
    { href: "/genera-piano", label: "Genera Piano Alimentare" },
    { href: "/recipes", label: "Ricette" },
    { href: "/piani-personalizzati", label: "I Miei Piani" },
    { href: "/assistente-nutrizionale", label: "Assistente Nutrizionale" },
    { href: "/aggiorna-profilo", label: "Il Mio Profilo" },
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
              data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Auth Section */}
          <div className="flex items-center space-x-2">
            <InstallPWAButton 
              variant="ghost" 
              size="sm"
              className="text-slate-700 hover:text-primary"
            />
            
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.profileImageUrl} alt={user.firstName || "User"} />
                      <AvatarFallback>
                        {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-slate-700">
                      {user.firstName || user.email}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = '/api/logout'}
                      className="text-slate-700 hover:text-red-600"
                    >
                      <LogOut size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = '/login'}
                      className="text-slate-700 hover:text-primary"
                    >
                      Accedi
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => window.location.href = '/signup'}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <User size={16} className="mr-2" />
                      Registrati
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-700"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-lg border border-white/20 rounded-lg mt-2 shadow-lg">
          <div className="flex flex-col space-y-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-slate-700 hover:text-primary transition-colors duration-300 font-medium py-2 px-3 rounded ${
                  location === item.href ? "text-primary bg-primary/10" : ""
                }`}
                data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="pt-2 border-t border-gray-200 space-y-2">
              <InstallPWAButton 
                variant="outline" 
                size="sm"
                className="w-full justify-center"
              />
              
              {!isLoading && (
                <>
                  {isAuthenticated && user ? (
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.profileImageUrl} alt={user.firstName || "User"} />
                          <AvatarFallback className="text-xs">
                            {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-slate-700">
                          {user.firstName || user.email}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/api/logout'}
                        className="text-slate-700 hover:text-red-600 h-auto p-1"
                      >
                        <LogOut size={14} />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = '/login'}
                        className="w-full"
                      >
                        Accedi
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => window.location.href = '/signup'}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        <User size={16} className="mr-2" />
                        Registrati
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}