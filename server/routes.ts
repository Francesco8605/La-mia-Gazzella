import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProfileSchema, insertMealPlanSchema, insertRecipeSchema, insertWeightEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User Profiles - Anonymous profiles without authentication
  app.get("/api/profiles", async (req, res) => {
    try {
      // For privacy, we don't list all profiles - just return empty array
      // Individual profiles are accessed by ID only
      res.json([]);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ message: "Errore nel recupero dei profili" });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const validation = insertUserProfileSchema.safeParse(req.body);
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

  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const profile = await storage.getUserProfile(id);
      
      if (!profile) {
        return res.status(404).json({ message: "Profilo non trovato" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Errore nel recupero del profilo" });
    }
  });

  app.patch("/api/profiles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const profile = await storage.updateUserProfile(id, req.body);
      
      if (!profile) {
        return res.status(404).json({ message: "Profilo non trovato" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Errore nell'aggiornamento del profilo" });
    }
  });

  // Meal Plans - Public access to all meal plans
  app.get("/api/meal-plans", async (req, res) => {
    try {
      const plans = await storage.getAllMealPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      res.status(500).json({ message: "Errore nel recupero dei piani alimentari" });
    }
  });

  app.post("/api/meal-plans/generate", async (req, res) => {
    try {
      console.log("🍽️ Generating meal plan with data:", req.body);

      const validation = insertMealPlanSchema.safeParse(req.body);
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

  app.get("/api/meal-plans/:id", async (req, res) => {
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

  app.delete("/api/meal-plans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMealPlan(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Piano alimentare non trovato" });
      }
      
      res.json({ message: "Piano alimentare eliminato con successo" });
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      res.status(500).json({ message: "Errore nell'eliminazione del piano alimentare" });
    }
  });

  // Recipes - Public recipe collection
  app.get("/api/recipes", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      const recipes = await storage.getRecipes(limit, offset);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Errore nel recupero delle ricette" });
    }
  });

  app.post("/api/recipes/generate", async (req, res) => {
    try {
      console.log("🍳 Generating recipe with request:", req.body);

      const validation = insertRecipeSchema.safeParse(req.body);
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

  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const recipe = await storage.getRecipe(id);
      
      if (!recipe) {
        return res.status(404).json({ message: "Ricetta non trovata" });
      }
      
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Errore nel recupero della ricetta" });
    }
  });

  // Weight Entries - Linked to profiles
  app.get("/api/profiles/:profileId/weight-entries", async (req, res) => {
    try {
      const { profileId } = req.params;
      
      // Verify profile exists
      const profile = await storage.getUserProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profilo non trovato" });
      }
      
      const entries = await storage.getWeightEntriesByProfile(profileId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching weight entries:", error);
      res.status(500).json({ message: "Errore nel recupero delle misurazioni" });
    }
  });

  app.post("/api/profiles/:profileId/weight-entries", async (req, res) => {
    try {
      const { profileId } = req.params;
      
      // Verify profile exists
      const profile = await storage.getUserProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profilo non trovato" });
      }
      
      const validation = insertWeightEntrySchema.safeParse({
        ...req.body,
        profileId
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

  app.delete("/api/weight-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWeightEntry(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Misurazione non trovata" });
      }
      
      res.json({ message: "Misurazione eliminata con successo" });
    } catch (error) {
      console.error("Error deleting weight entry:", error);
      res.status(500).json({ message: "Errore nell'eliminazione della misurazione" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      message: "La Mia Gazzella API - Versione Semplificata"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}