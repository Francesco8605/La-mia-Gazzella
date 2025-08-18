import { Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserInputForm from "@/components/user-input-form";
import MealPlanDisplay from "@/components/meal-plan-display";
import RecipeCards from "@/components/recipe-cards";
import LoadingStates from "@/components/loading-states";
import { useState } from "react";
import logoGazzella from "@/immagini/Logo-gazzella.jpg";

export default function Home() {
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [generatedMealPlanId, setGeneratedMealPlanId] = useState<string | null>(null);

  const handleMealPlanGenerated = (mealPlanId: string) => {
    setGeneratedMealPlanId(mealPlanId);
    setShowMealPlan(true);
  };

  return (
    <div className="pt-24 pb-12">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="text-center max-w-4xl mx-auto animate-slide-up">
          {/* Logo Image */}
          <div className="mb-8 flex justify-center">
            <img 
              src={logoGazzella} 
              alt="Logo della Gazzella" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-full shadow-2xl glass-morphism p-4 animate-float"
              data-testid="hero-logo"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6 leading-tight">
            Your Personal
            <br />
            Nutrition Assistant
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            AI-powered meal planning that adapts to your lifestyle, dietary preferences, and health goals. Get personalized recipes and nutrition plans in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              onClick={() => document.getElementById('meal-plan-form')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="create-meal-plan-button"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Create Meal Plan
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="glass-morphism hover:bg-white/20 text-slate-700 font-semibold px-8 py-4 rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300"
              data-testid="how-it-works-button"
            >
              <Play className="mr-2 h-5 w-5" />
              See How it Works
            </Button>
          </div>
        </div>
      </section>

      {/* User Input Form */}
      <section id="meal-plan-form" className="container mx-auto px-4 mb-16">
        <UserInputForm onMealPlanGenerated={handleMealPlanGenerated} />
      </section>

      {/* Show Meal Plan if generated */}
      {showMealPlan && generatedMealPlanId && (
        <section className="container mx-auto px-4 mb-16">
          <MealPlanDisplay mealPlanId={generatedMealPlanId} />
        </section>
      )}

      {/* Featured Recipes */}
      <section className="container mx-auto px-4 mb-16">
        <RecipeCards />
      </section>

      {/* Loading States Demo */}
      <section className="container mx-auto px-4 mb-16">
        <LoadingStates />
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="text-secondary text-2xl" />
                <span className="font-bold text-2xl">NutriAI</span>
              </div>
              <p className="text-slate-300 mb-6 max-w-md">
                Empowering healthier lifestyles through AI-powered nutrition planning. Personalized meal plans and recipes that adapt to your unique needs and preferences.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Product</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Meal Planning</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Recipe Generator</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Nutrition Tracking</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Premium Features</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Support</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 NutriAI. All rights reserved. Powered by OpenAI technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}