import { Sparkles, Check, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function LoadingStates() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">AI Generation Process</h2>
        <p className="text-slate-600 text-lg">Modern loading states and progress indicators</p>
      </div>

      {/* Loading State Examples */}
      <div className="space-y-8">
        {/* Plan Generation Loading */}
        <Card className="glass-morphism rounded-3xl shadow-2xl" data-testid="meal-plan-loading">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Generating Your Meal Plan</h3>
              <p className="text-slate-600">Our AI is analyzing your preferences and creating a personalized plan...</p>
            </div>
            
            <div className="max-w-md mx-auto">
              {/* Animated progress bar */}
              <div className="relative bg-slate-200 rounded-full h-3 mb-6 overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" 
                  style={{ width: "65%" }}
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-shimmer" 
                  style={{ width: "20%", marginLeft: "45%" }}
                />
              </div>
              
              <div className="text-center text-sm text-slate-600">
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2" data-testid="step-dietary-preferences">
                    <Check className="h-4 w-4 text-secondary" />
                    <span>Analyzing dietary preferences</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2" data-testid="step-nutritional-requirements">
                    <Check className="h-4 w-4 text-secondary" />
                    <span>Calculating nutritional requirements</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2" data-testid="step-creating-plan">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    <span>Creating personalized meal plan</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 opacity-50" data-testid="step-generating-recipes">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>Generating recipes</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Generation Loading */}
        <Card className="glass-morphism rounded-3xl shadow-2xl" data-testid="recipe-loading">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Creating Custom Recipes</h3>
              <p className="text-slate-600">Tailoring recipes to match your meal plan and taste preferences...</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recipe placeholder cards with loading animation */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-dark rounded-xl p-4 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                  data-testid={`recipe-placeholder-${i}`}
                >
                  <div className="bg-slate-300 rounded-lg h-32 mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-slate-300 rounded h-4 w-3/4"></div>
                    <div className="bg-slate-300 rounded h-3 w-1/2"></div>
                    <div className="bg-slate-300 rounded h-3 w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error State Example */}
        <Card className="glass-morphism rounded-3xl shadow-2xl border border-red-200" data-testid="error-state">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Service Temporarily Unavailable</h3>
              <p className="text-slate-600 mb-6">We're having trouble connecting to our AI service. Please try again in a moment.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-300 flex items-center justify-center space-x-2"
                  data-testid="retry-button"
                >
                  <Loader2 className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
                <button 
                  className="glass-dark hover:bg-white/20 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-colors duration-300 flex items-center justify-center space-x-2"
                  data-testid="contact-support-button"
                >
                  <span>Contact Support</span>
                </button>
              </div>
              
              <div className="mt-6 text-sm text-slate-500">
                <p>Error Code: API_TIMEOUT_001</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
