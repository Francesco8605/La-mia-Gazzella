import { useParams } from "wouter";
import MealPlanDisplay from "@/components/meal-plan-display";

export default function MealPlan() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Meal Plan Not Found</h1>
            <p className="text-slate-600">The requested meal plan could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12">
      <div className="container mx-auto px-4">
        <MealPlanDisplay mealPlanId={id} />
      </div>
    </div>
  );
}