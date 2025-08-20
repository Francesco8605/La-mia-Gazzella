import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertUserProfileSchema, insertMealPlanSchema, insertRecipeSchema } from "@shared/schema";
import { generateMealPlan, generateRecipe, calculateNutritionalNeeds } from "./services/openai";
import { z } from "zod";
import bcrypt from "bcrypt";

// Simple in-memory session storage
const sessions = new Map<string, { userId: string, createdAt: Date }>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Simple authentication middleware
function isAuthenticated(req: any, res: any, next: any) {
  const sessionId = req.cookies?.session;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ message: "Non autenticato" });
  }
  
  // Mock user object to match what would come from Replit Auth
  req.user = {
    claims: {
      sub: session.userId
    }
  };
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Registration request body:", req.body);
      
      const { username, email, password } = req.body;
      
      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email e password sono obbligatori" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username già in uso" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
      });

      console.log("User created successfully:", user.username);

      // Create session
      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id, createdAt: new Date() });

      // Set session cookie
      res.cookie('session', sessionId, { 
        httpOnly: true, 
        secure: false, // set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Errore durante la registrazione" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Credenziali non valide" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenziali non valide" });
      }

      // Create session
      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id, createdAt: new Date() });

      // Set session cookie
      res.cookie('session', sessionId, { 
        httpOnly: true, 
        secure: false, // set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Errore durante l'accesso" });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      const sessionId = req.cookies?.session;
      
      if (!sessionId || !sessions.has(sessionId)) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      const session = sessions.get(sessionId);
      if (!session) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      // Check if session is expired (24 hours)
      const isExpired = Date.now() - session.createdAt.getTime() > 24 * 60 * 60 * 1000;
      if (isExpired) {
        sessions.delete(sessionId);
        res.clearCookie('session');
        return res.status(401).json({ message: "Sessione scaduta" });
      }

      // Get user data
      const user = await storage.getUser(session.userId);
      if (!user) {
        sessions.delete(sessionId);
        res.clearCookie('session');
        return res.status(401).json({ message: "Utente non trovato" });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "Errore del server" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const sessionId = req.cookies?.session;
      
      if (sessionId) {
        sessions.delete(sessionId);
        res.clearCookie('session');
      }

      res.json({ message: "Logout effettuato con successo" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Errore durante il logout" });
    }
  });
  
  // User Profiles
  app.get("/api/user-profiles/current", isAuthenticated, async (req: any, res) => {
    try {
      // Use authenticated user ID from session
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profilo non trovato" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Errore durante il recupero del profilo" });
    }
  });

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

  app.post("/api/user-profiles", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertUserProfileSchema.parse(req.body);
      // Set the userId from authenticated session
      validatedData.userId = req.user.claims.sub;
      const profile = await storage.createUserProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  // Update user profile (PATCH)
  app.patch("/api/user-profile", async (req, res) => {
    try {
      const sessionId = req.cookies?.session;
      const session = sessions.get(sessionId);
      
      if (!session) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      const userId = session.userId;
      const updateData = req.body;
      
      const updatedProfile = await storage.updateUserProfile(userId, updateData);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profilo non trovato" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Errore nell'aggiornamento del profilo:", error);
      res.status(500).json({ message: "Errore interno del server" });
    }
  });

  // Get current user profile (API for frontend)
  app.get("/api/user-profile", async (req, res) => {
    try {
      const sessionId = req.cookies?.session;
      const session = sessions.get(sessionId);
      
      if (!session) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      const userId = session.userId;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profilo non trovato" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Errore nel recupero del profilo:", error);
      res.status(500).json({ message: "Errore interno del server" });
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
  app.post("/api/meal-plans/generate", isAuthenticated, async (req: any, res) => {
    try {
      console.log("POST /api/meal-plans/generate called");
      
      // Use authenticated user ID from session
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      
      console.log("Profile found:", !!profile);
      
      if (!profile) {
        console.log("No profile found, returning 404");
        return res.status(404).json({ message: "Profilo non trovato. Completa prima la personalizzazione." });
      }

      // Validate profile has required fields
      if (!profile.age || !profile.weight || !profile.height) {
        return res.status(400).json({ 
          message: "Profilo incompleto. Assicurati di aver compilato età, peso e altezza." 
        });
      }

      // Convert database profile to API format
      const validatedProfile = {
        userId: profile.userId,
        email: profile.email || undefined,
        phone: profile.phone || undefined,
        age: profile.age,
        weight: profile.weight,
        height: profile.height,
        thyroidIssues: profile.thyroidIssues as "si" | "no" | "eutirox" || "no",
        intestinalIssues: profile.intestinalIssues as "mai" | "qualche_volta" | "spesso" || "mai",
        weeklyExercise: profile.weeklyExercise || 0,
        breakfastTime: profile.breakfastTime || "08:00",
        lunchTime: profile.lunchTime || "13:00",
        dinnerTime: profile.dinnerTime || "20:00",
        excludedFoods: profile.excludedFoods || [],
        allergies: profile.allergies || [],
        dailyWaterIntake: profile.dailyWaterIntake as "si" | "no" || "si",
        cravingTimeFrame: profile.cravingTimeFrame || "",
        preferredCheatFood: profile.preferredCheatFood || "",
        takingFormulaGazzella: profile.takingFormulaGazzella as "si" | "no" | "ho_iniziato" || "no",
        dietaryPreferences: profile.dietaryPreferences || ["gazzella"],
        healthGoal: (profile.healthGoal as "weight_loss" | "weight_gain" | "muscle_building" | "maintenance" | "general_health") || "maintenance",
        activityLevel: (profile.activityLevel as "sedentary" | "lightly_active" | "moderately_active" | "very_active") || "lightly_active"
      };

      // Calculate nutritional needs
      const nutritionalNeeds = await calculateNutritionalNeeds(validatedProfile);
      
      // Generate meal plan using OpenAI
      const aiMealPlan = await generateMealPlan({
        userProfile: validatedProfile,
        nutritionalNeeds: nutritionalNeeds,
        targetCalories: nutritionalNeeds.calories,
        durationDays: 7,
      });
      
      // Save to storage
      const mealPlan = await storage.createMealPlan({
        userId: userId,
        title: aiMealPlan.title,
        description: aiMealPlan.description,
        targetCalories: aiMealPlan.targetCalories,
        targetProtein: aiMealPlan.targetProtein,
        targetCarbs: aiMealPlan.targetCarbs,
        targetFat: aiMealPlan.targetFat,
        bmi: nutritionalNeeds.bmi.toString(),
        idealWeight: nutritionalNeeds.idealWeight,
        weightGoal: nutritionalNeeds.weightGoal,
        healthStatus: nutritionalNeeds.healthStatus,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        days: aiMealPlan.days,
      });
      
      res.status(201).json(mealPlan);
    } catch (error) {
      console.error("Error generating meal plan:", error);
      res.status(500).json({ 
        message: "Errore nella generazione del piano nutrizionale", 
        error: error instanceof Error ? error.message : "Errore sconosciuto" 
      });
    }
  });

  app.get("/api/meal-plans/:userId", isAuthenticated, async (req: any, res) => {
    try {
      // Check if requesting own data or if admin
      const requestedUserId = req.params.userId;
      const currentUserId = req.user.claims.sub;
      
      if (requestedUserId !== currentUserId) {
        return res.status(403).json({ message: "Non autorizzato ad accedere ai dati di altri utenti" });
      }
      
      const mealPlans = await storage.getMealPlansByUser(requestedUserId);
      res.json(mealPlans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.get("/api/meal-plan/:id", isAuthenticated, async (req: any, res) => {
    try {
      const mealPlan = await storage.getMealPlan(req.params.id);
      if (!mealPlan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      
      // Check if requesting own data
      const currentUserId = req.user.claims.sub;
      if (mealPlan.userId !== currentUserId) {
        return res.status(403).json({ message: "Non autorizzato ad accedere a questo piano alimentare" });
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
        nutritionalNeeds: nutritionalNeeds,
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
