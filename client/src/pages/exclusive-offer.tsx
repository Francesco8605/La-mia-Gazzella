import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Heart, Leaf, ArrowRight, CheckCircle } from "lucide-react";
import formulaGazzellaImage from "@assets/PRODOTTO_formulagazzella_-formatoQUADRATO_1758271113849.webp";

const DISCOUNT_URL = "https://ilmanualedellagazzella.com/discount/LAMIAGAZELLAELITEE";

export default function ExclusiveOffer() {
  const handleCTAClick = () => {
    window.open(DISCOUNT_URL, "_blank", "noopener,noreferrer");
  };

  // Set SEO meta tags
  useEffect(() => {
    document.title = "Offerta Esclusiva Formula Gazzella - La Mia Gazzella";
    
    // Create or update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Esclusiva per abbonati La Mia Gazzella: ricevi 29€ di sconto su Formula Gazzella. Il tuo abbonamento diventa praticamente gratuito!');

    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: 'Offerta Esclusiva Formula Gazzella - Solo per Abbonati' },
      { property: 'og:description', content: 'Sconto di 29€ su Formula Gazzella riservato agli abbonati La Mia Gazzella. Completa il tuo percorso nutrizionale!' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:type', content: 'website' }
    ];

    ogTags.forEach(({ property, content }) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (!ogTag) {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', property);
        document.head.appendChild(ogTag);
      }
      ogTag.setAttribute('content', content);
    });

    return () => {
      // Reset title on cleanup
      document.title = "La Mia Gazzella";
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900">
      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Crown className="h-16 w-16 md:h-20 md:w-20 text-emerald-600 animate-pulse" />
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-ping" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-green-700 dark:from-emerald-400 dark:to-green-500 bg-clip-text text-transparent" data-testid="text-hero-title">
            Completa il tuo percorso esclusivo
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-8 font-medium">
            Solo chi ha scelto di abbonarsi a La Mia Gazzella può ottenere questo vantaggio straordinario.
          </p>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl mb-8 border border-emerald-100 dark:border-emerald-800">
            <p className="text-lg md:text-xl text-slate-800 dark:text-slate-200 leading-relaxed mb-6">
              Ricevi <span className="font-bold text-emerald-600 dark:text-emerald-400 text-2xl">29€ di sconto</span> su Formula Gazzella, 
              l'integratore studiato per il metabolismo in menopausa.<br />
              <span className="font-semibold text-red-600 dark:text-red-400">È come se il tuo abbonamento mensile all'app fosse completamente ripagato.</span><br />
              Un privilegio riservato solo a chi vuole il percorso completo.
            </p>
          </div>

          <Button
            onClick={handleCTAClick}
            size="lg"
            className="w-full md:w-auto px-6 md:px-12 py-4 md:py-6 text-lg md:text-xl font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 text-white rounded-2xl shadow-2xl transition-all duration-300 border-0 min-h-[56px] touch-manipulation"
            data-testid="button-main-cta"
          >
            <Crown className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
            <span className="block sm:hidden">Sconto Esclusivo -29€</span>
            <span className="hidden sm:block">Attiva ora il tuo sconto esclusivo</span>
          </Button>
        </div>
      </section>

      {/* Storytelling Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-emerald-100 to-green-100">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-emerald-200">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center justify-center mb-8">
                <Heart className="h-12 w-12 text-emerald-600 mr-4" />
                <Badge className="bg-emerald-100 text-emerald-800 text-lg px-4 py-2">
                  Community Esclusiva
                </Badge>
              </div>
              
              <p className="text-lg md:text-xl text-slate-700 leading-relaxed text-center mb-8">
                Entrare in La Mia Gazzella significa molto più che seguire una dieta.<br />
                Significa essere parte di una <span className="font-semibold text-emerald-600">community ristretta</span>, 
                con strumenti e risorse che nessun altro ha.<br /><br />
                Formula Gazzella è stata creata solo per le donne in menopausa che vogliono 
                <span className="font-semibold text-green-700"> risultati concreti e duraturi</span>.<br />
                Questo sconto esclusivo è il nostro modo di ringraziarti per aver scelto di affidarti completamente a noi.
              </p>
              
              <div className="text-center">
                <Button
                  onClick={handleCTAClick}
                  variant="ghost"
                  className="text-emerald-600 hover:text-emerald-800 active:text-emerald-900 text-lg font-semibold inline-flex items-center group transition-colors duration-200 px-6 py-4 min-h-[48px] touch-manipulation rounded-xl hover:bg-emerald-50 active:bg-emerald-100"
                  data-testid="button-storytelling-cta"
                >
                  <span className="block sm:hidden">Scopri l'offerta</span>
                  <span className="hidden sm:block">Scopri ora la tua offerta</span>
                  <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Formula Gazzella Composition */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Leaf className="h-16 w-16 text-emerald-600 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Formula Gazzella – 100% naturale, pensata per la menopausa
            </h2>
          </div>

          <Card className="bg-white shadow-2xl border-emerald-200">
            <CardContent className="p-8 md:p-12">
              {/* Product Image */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <img 
                    src={formulaGazzellaImage} 
                    alt="Formula Gazzella - Acceleratore del Metabolismo per Menopausa" 
                    className="w-48 h-48 md:w-64 md:h-64 object-contain mx-auto rounded-2xl shadow-lg"
                    data-testid="img-formula-gazzella-product"
                  />
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    -29€
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[
                  { name: "Meliloto", benefit: "Riduce gonfiore e ritenzione idrica" },
                  { name: "Melissa", benefit: "Favorisce relax e benessere generale" },
                  { name: "Tiglio", benefit: "Aiuta la depurazione naturale" },
                  { name: "Biancospino", benefit: "Supporta l'equilibrio emotivo e ormonale" },
                  { name: "Luppolo", benefit: "Rimedio naturale per i sintomi della menopausa" },
                  { name: "Trifoglio Rosso", benefit: "Stimola il metabolismo femminile" },
                ].map((ingredient, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-emerald-50">
                    <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-800 text-lg">{ingredient.name}</h4>
                      <p className="text-slate-600">{ingredient.benefit}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-100 rounded-xl p-6 text-center mb-8">
                <p className="text-emerald-800 font-semibold text-lg">
                  <span className="text-2xl font-bold">85%</span> di principi attivi, 
                  senza iodio né alghe, totalmente naturale.
                </p>
              </div>

              <div className="text-center">
                <Button
                  onClick={handleCTAClick}
                  className="w-full md:w-auto px-6 md:px-8 py-4 md:py-4 text-base md:text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 text-white rounded-xl shadow-lg transition-all duration-300 min-h-[56px] touch-manipulation"
                  data-testid="button-formula-cta"
                >
                  <Leaf className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  <span className="block sm:hidden">Ottieni Formula Gazzella -29€</span>
                  <span className="hidden sm:block">Ricevi Formula Gazzella con 29€ di sconto →</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Economic Value Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-green-100 to-emerald-100">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white shadow-2xl border-green-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
                È come avere l'app GRATIS ogni mese
              </h2>
            </div>
            
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="bg-emerald-50 rounded-2xl p-6">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">29€</div>
                    <div className="text-slate-700">Costo abbonamento<br />mensile La Mia Gazzella</div>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">=</span>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-2xl p-6">
                    <div className="text-3xl font-bold text-red-600 mb-2">29€</div>
                    <div className="text-slate-700">Sconto esclusivo<br />su Formula Gazzella</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-8">
                  <p className="text-lg md:text-xl text-slate-800 leading-relaxed">
                    L'abbonamento a La Mia Gazzella costa <span className="font-bold text-emerald-600">29€ al mese</span>.<br />
                    Con questo sconto esclusivo, risparmi esattamente <span className="font-bold text-red-600">29€</span> sull'integratore, 
                    come se il tuo abbonamento fosse totalmente rimborsato.<br /><br />
                    <span className="font-semibold text-green-700">Solo chi segue il percorso completo può accedere a questa offerta speciale.</span>
                  </p>
                </div>

                <Button
                  onClick={handleCTAClick}
                  size="lg"
                  className="w-full md:w-auto px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 text-white rounded-2xl shadow-2xl transition-all duration-300 min-h-[56px] touch-manipulation"
                  data-testid="button-economic-cta"
                >
                  <Crown className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                  <span className="block sm:hidden">Completa il Percorso</span>
                  <span className="hidden sm:block">Completa il tuo percorso adesso</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-slate-500 leading-relaxed">
            Offerta valida solo per utenti con abbonamento attivo a La Mia Gazzella.<br />
            Formula Gazzella non sostituisce uno stile di vita sano ed equilibrato.
          </p>
        </div>
      </footer>
    </div>
  );
}