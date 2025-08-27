import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProfileSchema, insertMealPlanSchema, insertRecipeSchema, insertWeightEntrySchema } from "@shared/schema";
import { generateMealPlan, generateRecipe, calculateNutritionalNeeds, generatePersonalizedRecipe, generateAIChatResponse } from "./services/openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Debug endpoint for production troubleshooting
  app.get("/api/debug/status", async (req, res) => {
    try {
      const status: any = {
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        database: {
          connected: !!process.env.DATABASE_URL,
          urlPrefix: process.env.DATABASE_URL?.substring(0, 30) || 'N/A'
        },
        openai: {
          configured: !!process.env.OPENAI_API_KEY,
          keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) || 'N/A'
        }
      };

      res.json(status);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Debug endpoint failed', 
        details: error?.message || 'Unknown error'
      });
    }
  });

  // User Profile Routes (no authentication needed)
  app.post("/api/user-profile", async (req, res) => {
    try {
      const profileData = insertUserProfileSchema.parse(req.body);
      
      // Create temporary user ID for session (no real user needed)
      const tempUserId = Date.now().toString();
      
      const profile = await storage.createUserProfile({
        ...profileData,
        userId: tempUserId
      });
      
      res.status(201).json(profile);
    } catch (error: any) {
      console.error("Profile creation error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dati del profilo non validi", errors: error.errors });
      }
      res.status(500).json({ message: "Errore durante la creazione del profilo" });
    }
  });

  app.get("/api/user-profile", async (req, res) => {
    try {
      // Return empty profile - user can create one
      res.json(null);
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Errore durante il recupero del profilo" });
    }
  });

  app.put("/api/user-profile", async (req, res) => {
    try {
      const profileData = insertUserProfileSchema.parse(req.body);
      const tempUserId = Date.now().toString();
      
      const profile = await storage.createUserProfile({
        ...profileData,
        userId: tempUserId
      });
      
      res.json(profile);
    } catch (error: any) {
      console.error("Profile update error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dati del profilo non validi", errors: error.errors });
      }
      res.status(500).json({ message: "Errore durante l'aggiornamento del profilo" });
    }
  });

  // Weight Tracking Routes
  app.post("/api/weight-entries", async (req, res) => {
    try {
      const entryData = insertWeightEntrySchema.parse(req.body);
      const tempUserId = Date.now().toString();
      
      const entry = await storage.createWeightEntry({
        ...entryData,
        userId: tempUserId
      });
      
      res.status(201).json(entry);
    } catch (error: any) {
      console.error("Weight entry creation error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dati del peso non validi", errors: error.errors });
      }
      res.status(500).json({ message: "Errore durante il salvataggio del peso" });
    }
  });

  app.get("/api/weight-entries", async (req, res) => {
    try {
      // Return empty array - no user-specific data
      res.json([]);
    } catch (error) {
      console.error("Weight entries fetch error:", error);
      res.status(500).json({ message: "Errore durante il recupero dei pesi" });
    }
  });

  // Recipe Generation Routes
  app.post("/api/generate-recipe", async (req, res) => {
    try {
      const { preferences, servings = 2, cookingTime, difficulty } = req.body;
      
      if (!preferences || preferences.length === 0) {
        return res.status(400).json({ message: "Le preferenze sono obbligatorie" });
      }

      const recipe = await generateRecipe(preferences, servings, cookingTime, difficulty);
      
      // Save recipe to database with temporary user
      const tempUserId = Date.now().toString();
      const savedRecipe = await storage.createRecipe({
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        calories: recipe.nutrition.calories,
        protein: recipe.nutrition.protein,
        carbs: recipe.nutrition.carbs,
        fat: recipe.nutrition.fat,
        fiber: recipe.nutrition.fiber,
        tags: recipe.tags,
        userId: tempUserId
      });

      res.json(savedRecipe);
    } catch (error: any) {
      console.error("Recipe generation error:", error);
      res.status(500).json({ 
        message: "Errore durante la generazione della ricetta", 
        details: error.message 
      });
    }
  });

  // Meal Plan Generation Routes
  app.post("/api/generate-meal-plan", async (req, res) => {
    try {
      const { preferences, days = 7, targetCalories, restrictions } = req.body;
      
      if (!preferences || preferences.length === 0) {
        return res.status(400).json({ message: "Le preferenze sono obbligatorie" });
      }

      const mealPlan = await generateMealPlan(
        preferences, 
        days, 
        targetCalories || 1800, 
        restrictions || []
      );
      
      // Save meal plan with temporary user
      const tempUserId = Date.now().toString();
      const savedPlan = await storage.createMealPlan({
        title: mealPlan.title,
        description: mealPlan.description,
        targetCalories: mealPlan.targetCalories,
        duration: mealPlan.duration,
        meals: mealPlan.meals,
        shoppingList: mealPlan.shoppingList,
        userId: tempUserId
      });

      res.json(savedPlan);
    } catch (error: any) {
      console.error("Meal plan generation error:", error);
      res.status(500).json({ 
        message: "Errore durante la generazione del piano alimentare", 
        details: error.message 
      });
    }
  });

  // AI Chat Routes
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Il messaggio è obbligatorio" });
      }

      const response = await generateAIChatResponse(message, context);
      res.json({ response });
    } catch (error: any) {
      console.error("AI chat error:", error);
      res.status(500).json({ 
        message: "Errore durante la comunicazione con l'assistente AI", 
        details: error.message 
      });
    }
  });

  // Recipe and Meal Plan Retrieval Routes
  app.get("/api/recipes", async (req, res) => {
    try {
      // Return empty array - no user-specific data
      res.json([]);
    } catch (error) {
      console.error("Recipes fetch error:", error);
      res.status(500).json({ message: "Errore durante il recupero delle ricette" });
    }
  });

  app.get("/api/recipe/:id", async (req, res) => {
    try {
      const recipe = await storage.getRecipe(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: "Ricetta non trovata" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Recipe fetch error:", error);
      res.status(500).json({ message: "Errore durante il recupero della ricetta" });
    }
  });

  app.get("/api/meal-plans", async (req, res) => {
    try {
      // Return empty array - no user-specific data  
      res.json([]);
    } catch (error) {
      console.error("Meal plans fetch error:", error);
      res.status(500).json({ message: "Errore durante il recupero dei piani alimentari" });
    }
  });

  app.get("/api/meal-plan/:id", async (req, res) => {
    try {
      const mealPlan = await storage.getMealPlan(req.params.id);
      if (!mealPlan) {
        return res.status(404).json({ message: "Piano alimentare non trovato" });
      }
      res.json(mealPlan);
    } catch (error) {
      console.error("Meal plan fetch error:", error);
      res.status(500).json({ message: "Errore durante il recupero del piano alimentare" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}