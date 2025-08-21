import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertUserProfileSchema, insertMealPlanSchema, insertRecipeSchema, insertWeightEntrySchema } from "@shared/schema";
import { generateMealPlan, generateRecipe, calculateNutritionalNeeds, generatePersonalizedRecipe, generateAIChatResponse } from "./services/openai";
import { z } from "zod";
import bcrypt from "bcrypt";
import Stripe from "stripe";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

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

  // Update current user profile (for authenticated users)
  app.put("/api/user-profiles/current", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      console.log("Updating profile for user:", userId);
      console.log("Profile data:", req.body);
      
      // Convert weight to string for database compatibility
      const profileData = { ...req.body };
      if (profileData.weight !== undefined) {
        profileData.weight = String(profileData.weight);
      }
      
      // Use upsert to create profile if it doesn't exist
      const updatedProfile = await storage.upsertUserProfile(userId, profileData);
      
      console.log("Profile updated successfully");
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Errore nell'aggiornamento del profilo" });
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
        weight: parseFloat(profile.weight) || 0,
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
        activityLevel: (profile.activityLevel as "sedentary" | "moderate" | "active" | "very_active") || "moderate"
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
      
      // Parse AI response to extract client profile and diet explanation
      const aiResponse = typeof aiMealPlan === 'string' ? JSON.parse(aiMealPlan) : aiMealPlan;
      
      // Save to storage with client profile and diet explanation
      const mealPlan = await storage.createMealPlan({
        userId: userId,
        title: aiMealPlan.title,
        description: aiMealPlan.description,
        targetCalories: aiMealPlan.targetCalories,
        targetProtein: aiMealPlan.targetProtein,
        targetCarbs: aiMealPlan.targetCarbs,
        targetFat: aiMealPlan.targetFat,
        // Save client profile data for display
        currentWeight: aiResponse.clientProfile?.currentWeight ? String(aiResponse.clientProfile.currentWeight) : String(validatedProfile.weight),
        targetWeight: aiResponse.clientProfile?.targetWeight ? String(aiResponse.clientProfile.targetWeight) : String(nutritionalNeeds.weightGoal),
        currentBMI: aiResponse.clientProfile?.currentBMI ? String(aiResponse.clientProfile.currentBMI) : String(nutritionalNeeds.bmi),
        bmiCategory: aiResponse.clientProfile?.bmiCategory || nutritionalNeeds.healthStatus,
        weightToLose: aiResponse.clientProfile?.weightToLose ? String(aiResponse.clientProfile.weightToLose) : String((validatedProfile.weight - nutritionalNeeds.weightGoal).toFixed(1)),
        timeToGoal: aiResponse.dietExplanation?.timeToGoal,
        // Save diet explanation
        dietMethod: aiResponse.dietExplanation?.method || "Metodo Gazzella - Tabella Ufficiale 2025",
        dietPrinciples: aiResponse.dietExplanation?.principles || [],
        expectedResults: Array.isArray(aiResponse.dietExplanation?.expectedResults) ? 
          aiResponse.dietExplanation.expectedResults.join(', ') : 
          aiResponse.dietExplanation?.expectedResults || "Perdita peso graduale e sostenibile",
        // Legacy fields for backward compatibility
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

  // Get current user's meal plans (simplified route) - MUST BE BEFORE :userId route
  app.get("/api/meal-plans/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("Fetching meal plans for current user:", userId);
      const mealPlans = await storage.getMealPlansByUser(userId);
      console.log("Found meal plans:", mealPlans?.length || 0);
      res.json(mealPlans || []);
    } catch (error) {
      console.error("Error fetching user meal plans:", error);
      res.status(500).json({ message: "Failed to fetch meal plans" });
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
  app.post("/api/recipes/generate-gazzella", isAuthenticated, async (req: any, res) => {
    try {
      console.log("=== SERVER DEBUG RECIPE GENERATION ===");
      console.log("Raw request body:", JSON.stringify(req.body, null, 2));
      console.log("clientProfile in body:", req.body.clientProfile);
      
      const schema = z.object({
        mealName: z.string().min(1),
        dietaryPreferences: z.array(z.string()).default([]),
        targetCalories: z.number().min(50).max(2000),
        allergies: z.array(z.string()).optional(),
        cuisine: z.string().optional(),
        difficulty: z.enum(["facile", "media", "difficile"]).optional(),
        clientProfile: z.object({
          eta: z.number(),
          peso: z.number(),
          altezza: z.number(),
          pesoObbiettivo: z.number(),
        }),
        recipePreferences: z.object({
          preferredProteins: z.string(),
          preferredFish: z.string().optional(),
          meatOrFish: z.enum(["carne", "pesce", "uova"]),
          excludedFoods: z.string().optional(),
          additionalDetails: z.string().optional(),
        }),
      });
      
      const requestData = schema.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Get existing recipes for this user to ensure uniqueness
      const userRecipes = await storage.getRecipesByUser(userId);
      const existingTitles = userRecipes.map(recipe => recipe.title.toLowerCase());
      
      // Generate recipe using OpenAI with Gazzella protocol and client profile
      const aiRecipe = await generatePersonalizedRecipe({
        mealName: requestData.mealName,
        dietaryPreferences: requestData.dietaryPreferences,
        targetCalories: requestData.targetCalories,
        allergies: requestData.allergies,
        cuisine: requestData.cuisine || "italiana",
        difficulty: requestData.difficulty || "facile",
        clientProfile: requestData.clientProfile,
        recipePreferences: requestData.recipePreferences,
        existingRecipes: existingTitles, // Pass existing recipes to avoid duplicates
      });
      
      // Check if generated recipe is too similar to existing ones
      const isUnique = !existingTitles.some(existingTitle => 
        existingTitle.includes(aiRecipe.title.toLowerCase()) || 
        aiRecipe.title.toLowerCase().includes(existingTitle)
      );
      
      if (!isUnique) {
        console.log(`Recipe "${aiRecipe.title}" too similar to existing, regenerating...`);
        // Retry with explicit uniqueness requirement
        const uniqueRecipe = await generatePersonalizedRecipe({
          ...requestData,
          clientProfile: requestData.clientProfile,
          recipePreferences: requestData.recipePreferences,
          cuisine: requestData.cuisine || "italiana",
          existingRecipes: existingTitles,
          requireUnique: true,
        });
        
        // Use the unique recipe
        Object.assign(aiRecipe, uniqueRecipe);
      }
      
      // Salva automaticamente la ricetta nel database con userId
      const savedRecipe = await storage.createRecipe({
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
        rating: 5, // Default rating per ricette generate
        userId: userId, // Associate recipe with authenticated user
      });
      
      // Ritorna la ricetta salvata
      res.status(200).json(savedRecipe);
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

  // Get current user's recipes (simplified route)
  app.get("/api/recipes/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("Fetching recipes for current user:", userId);
      const recipes = await storage.getRecipesByUser(userId);
      console.log("Found recipes:", recipes?.length || 0);
      res.json(recipes || []);
    } catch (error) {
      console.error("Error fetching user recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
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

  // Weight tracking endpoints
  app.get("/api/weight-entries", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const entries = await storage.getWeightEntriesByUserId(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching weight entries:", error);
      res.status(500).json({ message: "Failed to fetch weight entries" });
    }
  });

  app.post("/api/weight-entries", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      console.log("Creating weight entry for user:", userId);
      console.log("Request body:", req.body);
      
      const weightEntryData = {
        userId,
        weight: parseFloat(req.body.weight),
        date: new Date(req.body.date || new Date()),
        notes: req.body.notes || ""
      };

      console.log("Weight entry data before validation:", weightEntryData);
      const validatedData = insertWeightEntrySchema.parse(weightEntryData);
      console.log("Validated data:", validatedData);
      
      const entry = await storage.createWeightEntry(validatedData);
      console.log("Created entry:", entry);
      
      // Update user profile with latest weight
      try {
        const existingProfile = await storage.getUserProfile(userId);
        if (existingProfile) {
          await storage.updateUserProfile(userId, {
            weight: validatedData.weight
          });
          console.log("Updated profile weight to:", validatedData.weight);
        }
      } catch (error) {
        console.warn("Could not update profile weight:", error);
        // Continue even if profile update fails
      }
      
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating weight entry:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create weight entry", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/weight-entries/:id", isAuthenticated, async (req, res) => {
    try {
      const entryId = req.params.id;
      const userId = (req as any).user.claims.sub;
      
      // Verify ownership before deletion
      const entry = await storage.getWeightEntryById(entryId);
      if (!entry || entry.userId !== userId) {
        return res.status(404).json({ message: "Peso entry not found" });
      }

      await storage.deleteWeightEntry(entryId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting weight entry:", error);
      res.status(500).json({ message: "Failed to delete weight entry" });
    }
  });

  // AI Chat endpoint
  app.post("/api/ai-chat/message", isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      const userId = req.user.claims.sub;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Messaggio richiesto" });
      }

      console.log("🤖 AI Chat request from user:", userId);
      console.log("📝 Message:", message);

      // Fetch user's actual data from database
      const userProfile = await storage.getUserProfile(userId);
      const userMealPlans = await storage.getMealPlansByUser(userId);
      const userRecipes = await storage.getRecipesByUser(userId);
      
      console.log("👤 User profile found:", !!userProfile);
      console.log("📋 Meal plans found:", userMealPlans?.length || 0);
      console.log("🍳 Recipes found:", userRecipes?.length || 0);

      // Generate AI response using OpenAI service
      const aiResponse = await generateAIChatResponse({
        userMessage: message,
        userId,
        userProfile,
        mealPlans: userMealPlans,
        recipes: userRecipes
      });

      res.json({
        message: aiResponse.response,
        containsHealthWarning: aiResponse.containsHealthWarning
      });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ 
        message: "Errore del server. Riprova tra poco.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Stripe Subscription Routes
  
  // Get available subscription plans
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Errore nel recupero dei piani di abbonamento" });
    }
  });

  // Create Stripe checkout session for subscription
  app.post("/api/create-checkout-session", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID è obbligatorio" });
      }

      // Get user details
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      // Get subscription plan
      const plans = await storage.getSubscriptionPlans();
      const selectedPlan = plans.find(plan => plan.id === planId);
      if (!selectedPlan) {
        return res.status(404).json({ message: "Piano di abbonamento non trovato" });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
          metadata: {
            userId: userId
          }
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUserStripeInfo(userId, { stripeCustomerId: customerId });
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: selectedPlan.name,
                description: selectedPlan.description,
              },
              unit_amount: Math.round(parseFloat(selectedPlan.priceEur) * 100), // Convert to cents
              recurring: {
                interval: selectedPlan.duration === 'quarterly' ? 'month' : 
                         selectedPlan.duration === 'monthly' ? 'month' :
                         selectedPlan.duration === 'annual' ? 'year' : 'month',
                interval_count: selectedPlan.duration === 'quarterly' ? 3 : 1,
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.protocol}://${req.get('host')}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/subscription-canceled`,
        metadata: {
          userId: userId,
          planId: planId,
        },
        subscription_data: {
          trial_period_days: selectedPlan.trialDays,
          metadata: {
            userId: userId,
            planId: planId,
          }
        },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Errore nella creazione della sessione di pagamento" });
    }
  });

  // Handle Stripe webhooks
  app.post("/api/stripe-webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // In a real app, you'd verify the webhook signature
      event = req.body;
    } catch (err) {
      console.error('Webhook signature verification failed.', err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.metadata.userId;
        const planId = session.metadata.planId;
        
        if (userId && planId) {
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 3); // 3 giorni di prova
          
          await storage.updateUserStripeInfo(userId, {
            stripeSubscriptionId: session.subscription,
            subscriptionStatus: 'trialing',
            subscriptionPlan: planId,
            subscriptionStartDate: new Date(),
            trialEndDate: trialEnd,
          });
        }
        break;
        
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        const customerUserId = subscription.metadata.userId;
        
        if (customerUserId) {
          await storage.updateUserStripeInfo(customerUserId, {
            subscriptionStatus: subscription.status,
            subscriptionEndDate: new Date(subscription.current_period_end * 1000),
          });
        }
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        const deletedUserId = deletedSubscription.metadata.userId;
        
        if (deletedUserId) {
          await storage.updateUserStripeInfo(deletedUserId, {
            subscriptionStatus: 'canceled',
            subscriptionEndDate: new Date(),
          });
        }
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  // Get user subscription status
  app.get("/api/user/subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      const subscriptionInfo = {
        hasActiveSubscription: user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing',
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        trialEndDate: user.trialEndDate,
        isInTrial: user.subscriptionStatus === 'trialing',
      };

      res.json(subscriptionInfo);
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ message: "Errore nel recupero dello stato dell'abbonamento" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
