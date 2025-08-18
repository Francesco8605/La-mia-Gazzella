import OpenAI from "openai";
import { type InsertUserProfile, type MealPlanDay, type Meal } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface MealPlanRequest {
  userProfile: InsertUserProfile;
  targetCalories: number;
  durationDays: number;
}

export interface RecipeRequest {
  mealName: string;
  dietaryPreferences: string[];
  targetCalories: number;
  allergies?: string[];
  cuisine?: string;
}

export async function generateMealPlan(request: MealPlanRequest): Promise<{
  title: string;
  description: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  days: MealPlanDay[];
}> {
  try {
    const prompt = `Create a personalized ${request.durationDays}-day meal plan for a user with the following profile:

Age: ${request.userProfile.age}
Weight: ${request.userProfile.weight}kg
Health Goal: ${request.userProfile.healthGoal}
Activity Level: ${request.userProfile.activityLevel}
Dietary Preferences: ${request.userProfile.dietaryPreferences?.join(", ") || "None"}
Allergies: ${request.userProfile.allergies?.join(", ") || "None"}
Target Daily Calories: ${request.targetCalories}

Please generate a complete meal plan with:
1. A descriptive title and description
2. Daily macro targets (protein, carbs, fat)
3. For each day, provide breakfast, lunch, dinner, and 2 snacks
4. Each meal should include: name, estimated calories, protein, carbs, fat
5. Ensure total daily calories are close to the target
6. Respect dietary preferences and allergies
7. Vary the meals across days for variety

Return the response in the following JSON format:
{
  "title": "string",
  "description": "string", 
  "targetCalories": number,
  "targetProtein": number,
  "targetCarbs": number,
  "targetFat": number,
  "days": [
    {
      "day": "Monday",
      "date": "2025-01-20",
      "meals": {
        "breakfast": {"id": "uuid", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number},
        "lunch": {"id": "uuid", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number},
        "dinner": {"id": "uuid", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number},
        "snacks": [
          {"id": "uuid", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number}
        ]
      },
      "totalCalories": number
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional nutritionist and meal planning expert. Create detailed, balanced, and practical meal plans that meet specific dietary requirements and health goals. Always respond with valid JSON in the exact format requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and ensure proper structure
    if (!result.days || !Array.isArray(result.days)) {
      throw new Error("Invalid meal plan structure received from AI");
    }

    return result;
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw new Error(`Failed to generate meal plan: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function generateRecipe(request: RecipeRequest): Promise<{
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  cuisine: string;
  dietaryTags: string[];
}> {
  try {
    const prompt = `Create a detailed recipe for "${request.mealName}" with the following requirements:

Target Calories: ${request.targetCalories}
Dietary Preferences: ${request.dietaryPreferences.join(", ") || "None"}
Allergies to Avoid: ${request.allergies?.join(", ") || "None"}
Preferred Cuisine: ${request.cuisine || "Any"}

Please create a complete recipe that includes:
1. Clear title and appetizing description
2. Complete ingredients list with measurements
3. Step-by-step cooking instructions
4. Accurate nutritional information per serving
5. Preparation and cooking times
6. Difficulty level (Easy, Medium, Hard)
7. Appropriate dietary tags

Return the response in the following JSON format:
{
  "title": "string",
  "description": "string",
  "ingredients": ["ingredient with measurement"],
  "instructions": ["step by step instruction"],
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "servings": number,
  "prepTime": number,
  "cookTime": number,
  "difficulty": "Easy|Medium|Hard",
  "cuisine": "string",
  "dietaryTags": ["vegetarian", "vegan", "gluten-free", etc]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional chef and nutritionist. Create detailed, practical recipes with accurate nutritional information and clear instructions. Always respond with valid JSON in the exact format requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate basic structure
    if (!result.title || !result.ingredients || !result.instructions) {
      throw new Error("Invalid recipe structure received from AI");
    }

    return result;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error(`Failed to generate recipe: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function calculateNutritionalNeeds(userProfile: InsertUserProfile): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}> {
  const { age, weight, activityLevel, healthGoal } = userProfile;
  
  // Basic BMR calculation (Mifflin-St Jeor Equation for males - simplified)
  let bmr = 88.362 + (13.397 * (weight || 70)) + (4.799 * 170) - (5.677 * (age || 30));
  
  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    moderate: 1.375,
    active: 1.55,
    very_active: 1.725,
  };
  
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  let calories = Math.round(bmr * multiplier);
  
  // Adjust based on health goal
  switch (healthGoal) {
    case "weight_loss":
      calories = Math.round(calories * 0.85); // 15% deficit
      break;
    case "weight_gain":
      calories = Math.round(calories * 1.15); // 15% surplus
      break;
    case "muscle_building":
      calories = Math.round(calories * 1.1); // 10% surplus
      break;
    default:
      // maintenance or general health - no change
      break;
  }
  
  // Calculate macros (rough guidelines)
  const protein = Math.round((calories * 0.25) / 4); // 25% of calories, 4 cal/g
  const fat = Math.round((calories * 0.30) / 9); // 30% of calories, 9 cal/g
  const carbs = Math.round((calories * 0.45) / 4); // 45% of calories, 4 cal/g
  
  return { calories, protein, carbs, fat };
}
