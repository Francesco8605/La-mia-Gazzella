import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProfileSchema, insertMealPlanSchema, insertRecipeSchema } from "@shared/schema";
import { generateMealPlan, generateRecipe, calculateNutritionalNeeds } from "./services/openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User Profiles
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/user-profiles", async (req, res) => {
    try {
      const validatedData = insertUserProfileSchema.parse(req.body);
      const profile = await storage.createUserProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put("/api/profile/:userId", async (req, res) => {
    try {
      const validatedData = insertUserProfileSchema.partial().parse(req.body);
      const profile = await storage.updateUserProfile(req.params.userId, validatedData);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Meal Plans
  app.get("/api/meal-plans/:userId", async (req, res) => {
    try {
      const mealPlans = await storage.getMealPlansByUser(req.params.userId);
      res.json(mealPlans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.get("/api/meal-plan/:id", async (req, res) => {
    try {
      const mealPlan = await storage.getMealPlan(req.params.id);
      if (!mealPlan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      res.json(mealPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plan" });
    }
  });

  app.post("/api/generate-meal-plan", async (req, res) => {
    try {
      const schema = z.object({
        userProfile: insertUserProfileSchema,
        durationDays: z.number().min(1).max(14).default(7),
      });
      
      const { userProfile, durationDays } = schema.parse(req.body);
      
      // Calculate nutritional needs
      const nutritionalNeeds = await calculateNutritionalNeeds(userProfile);
      
      // Generate meal plan using OpenAI
      const aiMealPlan = await generateMealPlan({
        userProfile,
        targetCalories: nutritionalNeeds.calories,
        durationDays,
      });
      
      // Save to storage
      const mealPlan = await storage.createMealPlan({
        userId: userProfile.userId,
        title: aiMealPlan.title,
        description: aiMealPlan.description,
        targetCalories: aiMealPlan.targetCalories,
        targetProtein: aiMealPlan.targetProtein,
        targetCarbs: aiMealPlan.targetCarbs,
        targetFat: aiMealPlan.targetFat,
        startDate: new Date(),
        endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        days: aiMealPlan.days,
      });
      
      res.status(201).json(mealPlan);
    } catch (error) {
      console.error("Error generating meal plan:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ 
        message: "Failed to generate meal plan", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.delete("/api/meal-plan/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMealPlan(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meal plan" });
    }
  });

  // Recipes
  app.get("/api/recipes", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const recipes = await storage.getRecipes(limit, offset);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get("/api/recipe/:id", async (req, res) => {
    try {
      const recipe = await storage.getRecipe(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.post("/api/generate-recipe", async (req, res) => {
    try {
      const schema = z.object({
        mealName: z.string().min(1),
        dietaryPreferences: z.array(z.string()).default([]),
        targetCalories: z.number().min(50).max(2000),
        allergies: z.array(z.string()).optional(),
        cuisine: z.string().optional(),
      });
      
      const recipeRequest = schema.parse(req.body);
      
      // Generate recipe using OpenAI
      const aiRecipe = await generateRecipe(recipeRequest);
      
      // Save to storage
      const recipe = await storage.createRecipe({
        title: aiRecipe.title,
        description: aiRecipe.description,
        ingredients: aiRecipe.ingredients,
        instructions: aiRecipe.instructions,
        calories: aiRecipe.calories,
        protein: aiRecipe.protein,
        carbs: aiRecipe.carbs,
        fat: aiRecipe.fat,
        servings: aiRecipe.servings,
        prepTime: aiRecipe.prepTime,
        cookTime: aiRecipe.cookTime,
        difficulty: aiRecipe.difficulty,
        cuisine: aiRecipe.cuisine,
        dietaryTags: aiRecipe.dietaryTags,
        imageUrl: null,
        rating: 5, // Default rating
      });
      
      res.status(201).json(recipe);
    } catch (error) {
      console.error("Error generating recipe:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ 
        message: "Failed to generate recipe",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Endpoint specifico per il generatore ricette Gazzella
  app.post("/api/recipes/generate", async (req, res) => {
    try {
      const schema = z.object({
        mealName: z.string().min(1),
        dietaryPreferences: z.array(z.string()).default([]),
        targetCalories: z.number().min(50).max(2000),
        allergies: z.array(z.string()).optional(),
        cuisine: z.string().optional(),
        userProfile: z.object({
          email: z.string().email(),
          fullName: z.string().min(1),
          phone: z.string().min(1),
          age: z.number(),
          currentWeight: z.number(),
          height: z.number(),
          targetWeight: z.number(),
          preferredProteins: z.string(),
          preferredFish: z.string().optional(),
          meatOrFish: z.enum(["carne", "pesce"]),
          excludedFoods: z.string().optional(),
          additionalDetails: z.string().optional(),
        }),
      });
      
      const requestData = schema.parse(req.body);
      
      // Generate recipe using OpenAI with Gazzella protocol
      const aiRecipe = await generateRecipe({
        mealName: requestData.mealName,
        dietaryPreferences: requestData.dietaryPreferences,
        targetCalories: requestData.targetCalories,
        allergies: requestData.allergies,
        cuisine: requestData.cuisine || "italiana",
      });
      
      // Ritorna direttamente la ricetta senza salvarla automaticamente
      res.status(200).json(aiRecipe);
    } catch (error) {
      console.error("Error generating Gazzella recipe:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ 
        message: "Failed to generate recipe",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/recipes/by-tags", async (req, res) => {
    try {
      const tags = Array.isArray(req.query.tags) 
        ? req.query.tags as string[]
        : (req.query.tags as string)?.split(",") || [];
      
      const recipes = await storage.getRecipesByTags(tags);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes by tags" });
    }
  });

  // Nutritional calculation endpoint
  app.post("/api/calculate-nutrition", async (req, res) => {
    try {
      const userProfile = insertUserProfileSchema.parse(req.body);
      const nutritionalNeeds = await calculateNutritionalNeeds(userProfile);
      res.json(nutritionalNeeds);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to calculate nutritional needs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
