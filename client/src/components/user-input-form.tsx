import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { User, Weight, Leaf, Target, Activity, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  userId: z.string().default("default-user"),
  age: z.number().min(13).max(120),
  weight: z.number().min(30).max(300),
  height: z.number().min(100).max(250).optional(),
  dietaryPreferences: z.array(z.string()).default([]),
  healthGoal: z.enum(["weight_loss", "weight_gain", "muscle_building", "maintenance", "general_health"]),
  activityLevel: z.enum(["sedentary", "moderate", "active", "very_active"]),
  allergies: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

interface UserInputFormProps {
  onMealPlanGenerated: (mealPlanId: string) => void;
}

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian", icon: "🌱" },
  { id: "vegan", label: "Vegan", icon: "🥕" },
  { id: "gluten-free", label: "Gluten-Free", icon: "🌾" },
  { id: "keto", label: "Keto", icon: "🐟" },
  { id: "paleo", label: "Paleo", icon: "🥩" },
  { id: "mediterranean", label: "Mediterranean", icon: "🫒" },
];

const activityLevels = [
  { 
    id: "sedentary", 
    label: "Sedentary", 
    description: "Little to no exercise",
    icon: "🛋️"
  },
  { 
    id: "moderate", 
    label: "Moderate", 
    description: "Light exercise 1-3 days/week",
    icon: "🚶"
  },
  { 
    id: "active", 
    label: "Active", 
    description: "Moderate exercise 3-5 days/week",
    icon: "🏃"
  },
  { 
    id: "very_active", 
    label: "Very Active", 
    description: "Hard exercise 6-7 days/week",
    icon: "🏋️"
  },
];

export default function UserInputForm({ onMealPlanGenerated }: UserInputFormProps) {
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "default-user",
      dietaryPreferences: [],
      allergies: [],
    },
  });

  const generateMealPlanMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/generate-meal-plan", {
        userProfile: data,
        durationDays: 7,
      });
      return response.json();
    },
    onSuccess: (mealPlan) => {
      toast({
        title: "Meal Plan Generated!",
        description: "Your personalized meal plan has been created successfully.",
      });
      onMealPlanGenerated(mealPlan.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate meal plan",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const formDataWithPreferences = {
      ...data,
      dietaryPreferences: selectedDietaryPreferences,
    };
    generateMealPlanMutation.mutate(formDataWithPreferences);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-morphism rounded-3xl p-8 md:p-12 shadow-2xl animate-scale-in">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Tell Us About Yourself</h2>
          <p className="text-slate-600 text-lg">Help us create the perfect nutrition plan tailored just for you</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" data-testid="user-input-form">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold flex items-center space-x-2">
                      <User className="text-primary h-5 w-5" />
                      <span>Age</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter your age"
                        className="glass-dark rounded-xl border-0 focus:ring-2 focus:ring-primary/50 text-slate-800 placeholder-slate-500"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || "")}
                        data-testid="input-age"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold flex items-center space-x-2">
                      <Weight className="text-primary h-5 w-5" />
                      <span>Weight (kg)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter your weight"
                        className="glass-dark rounded-xl border-0 focus:ring-2 focus:ring-primary/50 text-slate-800 placeholder-slate-500"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || "")}
                        data-testid="input-weight"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dietary Preferences */}
            <div className="space-y-4">
              <Label className="text-slate-700 font-semibold flex items-center space-x-2">
                <Leaf className="text-secondary h-5 w-5" />
                <span>Dietary Preferences</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {dietaryOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`glass-dark rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all duration-300 group ${
                      selectedDietaryPreferences.includes(option.id) ? "ring-2 ring-primary bg-white/30" : ""
                    }`}
                    onClick={() => {
                      setSelectedDietaryPreferences(prev =>
                        prev.includes(option.id)
                          ? prev.filter(p => p !== option.id)
                          : [...prev, option.id]
                      );
                    }}
                    data-testid={`dietary-option-${option.id}`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                        {option.icon}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{option.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Goals */}
            <FormField
              control={form.control}
              name="healthGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold flex items-center space-x-2">
                    <Target className="text-accent h-5 w-5" />
                    <span>Health Goals</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="glass-dark rounded-xl border-0 focus:ring-2 focus:ring-primary/50 text-slate-800" data-testid="select-health-goal">
                        <SelectValue placeholder="Select your health goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem value="weight_gain">Weight Gain</SelectItem>
                      <SelectItem value="muscle_building">Muscle Building</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="general_health">General Health</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Activity Level */}
            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold flex items-center space-x-2">
                    <Activity className="text-secondary h-5 w-5" />
                    <span>Activity Level</span>
                  </FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {activityLevels.map((level) => (
                      <div
                        key={level.id}
                        className={`glass-dark rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all duration-300 group ${
                          field.value === level.id ? "ring-2 ring-primary bg-white/30" : ""
                        }`}
                        onClick={() => field.onChange(level.id)}
                        data-testid={`activity-level-${level.id}`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                            {level.icon}
                          </div>
                          <h4 className="font-semibold text-slate-700">{level.label}</h4>
                          <p className="text-xs text-slate-600">{level.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="text-center pt-4">
              <Button
                type="submit"
                disabled={generateMealPlanMutation.isPending}
                className="food-gradient text-white font-bold px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="submit-meal-plan"
              >
                {generateMealPlanMutation.isPending ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Sparkles className="h-5 w-5" />
                    <span>Generate My Meal Plan</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
