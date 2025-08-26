import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserProfileSchema, insertMealPlanSchema, insertRecipeSchema, insertWeightEntrySchema } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Temporary auth bypass for testing
  app.get('/api/auth/user', async (req: any, res) => {
    // Return null to indicate no user is logged in
    res.status(401).json({ message: "Authentication temporarily disabled" });
  });

  // Subscription status check (temporarily bypassed)
  app.get('/api/subscription/status', async (req: any, res) => {
    // Temporarily return empty subscription data
    res.json({
      hasActiveSubscription: false,
      isInTrial: false,
      subscriptionStatus: null,
      trialEndsAt: null,
      hasUsedTrial: false,
      subscription: null
    });
  });

  // User Profiles - Temporarily bypassed
  app.get("/api/user-profiles/current", async (req: any, res) => {
    res.status(404).json({ message: "Profilo non trovato" });
  });

  app.post("/api/user-profiles", async (req: any, res) => {
    try {
      const validation = insertUserProfileSchema.safeParse({
        ...req.body,
        userId: "temp-user-id"
      });
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Dati del profilo non validi", 
          errors: validation.error.errors 
        });
      }

      const profile = await storage.createUserProfile(validation.data);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Errore nella creazione del profilo" });
    }
  });

  // Meal Plans - Temporarily bypassed
  app.get("/api/meal-plans", async (req: any, res) => {
    try {
      const plans = await storage.getMealPlansByUser("temp-user-id");
      res.json(plans);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      res.status(500).json({ message: "Errore nel recupero dei piani alimentari" });
    }
  });

  app.post("/api/meal-plans/generate", async (req: any, res) => {
    try {
      console.log("🍽️ Generating meal plan");

      const validation = insertMealPlanSchema.safeParse({
        ...req.body,
        userId: "temp-user-id"
      });
      if (!validation.success) {
        console.error("❌ Validation failed:", validation.error.errors);
        return res.status(400).json({ 
          message: "Dati non validi per la generazione del piano", 
          errors: validation.error.errors 
        });
      }

      const mealPlan = await storage.createMealPlan(validation.data);
      console.log("✅ Meal plan generated successfully:", mealPlan.id);
      
      res.status(201).json(mealPlan);
    } catch (error) {
      console.error("❌ Error generating meal plan:", error);
      res.status(500).json({ message: "Errore nella generazione del piano alimentare" });
    }
  });

  app.get("/api/meal-plans/:id", async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const mealPlan = await storage.getMealPlan(id);
      
      if (!mealPlan) {
        return res.status(404).json({ message: "Piano alimentare non trovato" });
      }
      
      res.json(mealPlan);
    } catch (error) {
      console.error("Error fetching meal plan:", error);
      res.status(500).json({ message: "Errore nel recupero del piano alimentare" });
    }
  });

  // Recipes - Temporarily bypassed
  app.get("/api/recipes", async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      const recipes = await storage.getRecipesByUser("temp-user-id", limit, offset);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Errore nel recupero delle ricette" });
    }
  });

  app.post("/api/recipes/generate", async (req: any, res) => {
    try {
      console.log("🍳 Generating recipe");

      const validation = insertRecipeSchema.safeParse({
        ...req.body,
        userId: "temp-user-id"
      });
      if (!validation.success) {
        console.error("❌ Recipe validation failed:", validation.error.errors);
        return res.status(400).json({ 
          message: "Dati ricetta non validi", 
          errors: validation.error.errors 
        });
      }

      const recipe = await storage.createRecipe(validation.data);
      console.log("✅ Recipe generated successfully:", recipe.id);
      
      res.status(201).json(recipe);
    } catch (error) {
      console.error("❌ Error generating recipe:", error);
      res.status(500).json({ message: "Errore nella generazione della ricetta" });
    }
  });

  // Weight Entries - Temporarily bypassed
  app.get("/api/weight-entries", async (req: any, res) => {
    try {
      const entries = await storage.getWeightEntriesByUser("temp-user-id");
      res.json(entries);
    } catch (error) {
      console.error("Error fetching weight entries:", error);
      res.status(500).json({ message: "Errore nel recupero delle misurazioni" });
    }
  });

  app.post("/api/weight-entries", async (req: any, res) => {
    try {
      const validation = insertWeightEntrySchema.safeParse({
        ...req.body,
        userId: "temp-user-id"
      });
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Dati misurazione non validi", 
          errors: validation.error.errors 
        });
      }

      const entry = await storage.createWeightEntry(validation.data);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating weight entry:", error);
      res.status(500).json({ message: "Errore nella registrazione della misurazione" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      message: "La Mia Gazzella API - Modalità Test"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}