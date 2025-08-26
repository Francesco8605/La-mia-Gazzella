import express, { type Express } from "express";
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
  apiVersion: "2025-07-30.basil",
});

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getSessionExpiryDate(): Date {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // Sessions last 7 days
  return expiryDate;
}

// Database-backed authentication middleware
async function isAuthenticated(req: any, res: any, next: any) {
  try {
    const sessionId = req.cookies?.session;
    if (!sessionId) {
      return res.status(401).json({ message: "Non autenticato" });
    }
    
    const session = await storage.getSession(sessionId);
    
    if (!session) {
      return res.status(401).json({ message: "Non autenticato" });
    }
    
    // Mock user object to match what would come from Replit Auth
    const userId = (session.sess as any).userId;
    req.user = {
      claims: {
        sub: userId
      }
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: "Errore di autenticazione" });
  }
}

// Middleware to check if user has active subscription
async function requireActiveSubscription(req: any, res: any, next: any) {
  try {
    const userId = (req as any).user.claims.sub;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }



    // Check if user has active subscription
    const now = new Date();
    let hasActiveSubscription = false;

    if (user.subscriptionStatus === 'active') {
      // Check if subscription hasn't expired
      if (user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now) {
        hasActiveSubscription = true;
      }
    } else if (user.subscriptionStatus === 'trialing') {
      // Check if trial hasn't expired
      if (user.trialEndDate && new Date(user.trialEndDate) > now) {
        hasActiveSubscription = true;
      }
    }

    if (!hasActiveSubscription) {
      return res.status(403).json({ 
        message: "Abbonamento scaduto o non attivo. Rinnova il tuo abbonamento per continuare.",
        requiresSubscription: true 
      });
    }

    next();
  } catch (error) {
    console.error("Error checking subscription:", error);
    res.status(500).json({ message: "Errore nel controllo dell'abbonamento" });
  }
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
      
      // Create user without automatic trial - users must subscribe with payment details
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
      });

      // New users start without any subscription - they must go through Stripe checkout for trial

      console.log("User created successfully:", user.username);

      // Create database session
      const sessionId = generateSessionId();
      const expiresAt = getSessionExpiryDate();
      await storage.createSession(sessionId, user.id, expiresAt);

      // Set session cookie
      res.cookie('session', sessionId, { 
        httpOnly: true, 
        secure: false, // set to true in production with HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days - same as session expiry
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

      // Create database session
      const sessionId = generateSessionId();
      const expiresAt = getSessionExpiryDate();
      await storage.createSession(sessionId, user.id, expiresAt);

      // Set session cookie
      res.cookie('session', sessionId, { 
        httpOnly: true, 
        secure: false, // set to true in production with HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days - same as session expiry
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
      
      if (!sessionId) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      // Get user data
      const user = await storage.getUser(session.userId);
      if (!user) {
        await storage.deleteSession(sessionId);
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
        await storage.deleteSession(sessionId);
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
      const userId = (req as any).user.claims.sub;
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
  app.post("/api/meal-plans/generate", isAuthenticated, requireActiveSubscription, async (req: any, res) => {
    try {
      console.log("POST /api/meal-plans/generate called");
      
      // Use authenticated user ID from session
      const userId = (req as any).user.claims.sub;
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
  app.get("/api/meal-plans/user", isAuthenticated, requireActiveSubscription, async (req: any, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      console.log("Fetching meal plans for current user:", userId);
      const mealPlans = await storage.getMealPlansByUser(userId);
      console.log("Found meal plans:", mealPlans?.length || 0);
      res.json(mealPlans || []);
    } catch (error) {
      console.error("Error fetching user meal plans:", error);
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.get("/api/meal-plans/:userId", isAuthenticated, requireActiveSubscription, async (req: any, res) => {
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

  app.get("/api/meal-plan/:id", isAuthenticated, requireActiveSubscription, async (req: any, res) => {
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
      
      // Get authenticated user ID
      const currentUserId = (req as any).user?.claims?.sub;
      if (!currentUserId) {
        return res.status(401).json({ message: "Utente non autenticato" });
      }
      
      // Save to storage
      const mealPlan = await storage.createMealPlan({
        userId: currentUserId,
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
  app.post("/api/recipes/generate-gazzella", isAuthenticated, requireActiveSubscription, async (req: any, res) => {
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
      const userId = (req as any).user.claims.sub;
      
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
      const userId = (req as any).user.claims.sub;
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
  app.get("/api/weight-entries", isAuthenticated, requireActiveSubscription, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const entries = await storage.getWeightEntriesByUserId(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching weight entries:", error);
      res.status(500).json({ message: "Failed to fetch weight entries" });
    }
  });

  app.post("/api/weight-entries", isAuthenticated, requireActiveSubscription, async (req, res) => {
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
  app.post("/api/ai-chat/message", isAuthenticated, requireActiveSubscription, async (req: any, res) => {
    try {
      const { message } = req.body;
      const userId = (req as any).user.claims.sub;

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
      const userId = (req as any).user.claims.sub;
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

      // If user has already used trial, remove trial period from this plan
      let sessionParams: Stripe.Checkout.SessionCreateParams;
      const hasUsedTrial = user.hasUsedTrial === 'yes';
      const planHasTrial = (selectedPlan.trialDays || 0) > 0;
      


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

      // Create Stripe checkout session (with or without trial based on user history)
      sessionParams = {
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: selectedPlan.name,
                description: selectedPlan.description || undefined,
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
          trial_period_days: (hasUsedTrial || !planHasTrial) ? undefined : (selectedPlan.trialDays || undefined),
          metadata: {
            userId: userId,
            planId: planId,
          }
        },
      };

      // Calculate trial period - remove trial for users who already used it
      const trialDaysValue = (hasUsedTrial || !planHasTrial) ? undefined : (selectedPlan.trialDays || undefined);
      
      // Update the sessionParams with the calculated trial value
      if (sessionParams.subscription_data) {
        sessionParams.subscription_data.trial_period_days = trialDaysValue;
      }
      
      const session = await stripe.checkout.sessions.create(sessionParams);

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Errore nella creazione della sessione di pagamento" });
    }
  });

  // Manual sync endpoint for Stripe customers
  app.post("/api/sync-stripe-customer", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      console.log(`🔍 Manual sync requested for: ${email}`);
      
      // Search for customer by email in Stripe
      const customers = await stripe.customers.list({
        email: email,
        limit: 1
      });

      if (customers.data.length === 0) {
        return res.status(404).json({ error: 'Customer not found in Stripe' });
      }

      const customer = customers.data[0];
      console.log(`✅ Found customer in Stripe:`, {
        id: customer.id,
        email: customer.email,
        created: new Date(customer.created * 1000).toISOString()
      });

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(customer.email || 'unknown');
      if (existingUser) {
        return res.status(400).json({ 
          error: 'User already exists', 
          user: { id: existingUser.id, username: existingUser.username } 
        });
      }

      // Get subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all',
        limit: 10
      });

      // Create user
      const defaultPassword = Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const userData = {
        username: customer.email || `stripe_user_${customer.id}`,
        email: customer.email || '',
        password: hashedPassword,
        stripeCustomerId: customer.id,
      };

      const newUser = await storage.createUser(userData);
      console.log(`✅ User created: ${newUser.username}`);

      // Update subscription data
      if (subscriptions.data.length > 0) {
        const activeSubscription = subscriptions.data.find(sub => 
          sub.status === 'active' || sub.status === 'trialing'
        ) || subscriptions.data[0];

        const updateData: any = {
          stripeSubscriptionId: activeSubscription.id,
          subscriptionStatus: activeSubscription.status,
          subscriptionPlan: 'monthly',
          subscriptionStartDate: new Date(activeSubscription.start_date * 1000),
        };

        if (activeSubscription.status === 'trialing' && activeSubscription.trial_end) {
          updateData.trialEndDate = new Date(activeSubscription.trial_end * 1000);
          updateData.hasUsedTrial = 'yes';
        }

        if (activeSubscription.status === 'active' && (activeSubscription as any).current_period_end) {
          updateData.subscriptionEndDate = new Date((activeSubscription as any).current_period_end * 1000);
        }

        await storage.updateUserStripeInfo(newUser.id, updateData);
        console.log(`✅ Subscription synced for ${customer.email}`);
      }

      res.json({ 
        success: true, 
        message: 'Customer synced successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          subscriptionStatus: newUser.subscriptionStatus,
          temporaryPassword: defaultPassword
        }
      });

    } catch (error) {
      console.error('❌ Sync error:', error);
      res.status(500).json({ error: 'Failed to sync customer' });
    }
  });

  // Handle Stripe webhooks with proper signature verification
  app.post("/api/stripe-webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    console.log('🎯 WEBHOOK RECEIVED:', new Date().toISOString());
    
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      if (webhookSecret && sig) {
        // Verify webhook signature in production
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        console.log('✅ Webhook signature verified successfully');
      } else {
        // Development mode - parse body directly (for testing)
        console.log('⚠️ Development mode: No webhook signature verification');
        if (typeof req.body === 'string') {
          event = JSON.parse(req.body);
        } else {
          event = req.body;
        }
      }
      
      console.log('📄 Event type:', event.type);
      console.log('📄 Event ID:', event.id);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🛒 Processing checkout.session.completed...');
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        
        console.log('👤 UserId from metadata:', userId);
        console.log('📋 PlanId from metadata:', planId);
        console.log('💳 Subscription ID:', session.subscription);
        
        if (session.subscription) {
          try {
            // Skip Stripe API calls for test data
            if (session.subscription.startsWith('sub_test_') || session.customer?.startsWith('cus_test_')) {
              console.log('⚠️ Test webhook data detected, skipping Stripe API calls');
              return res.json({ received: true, test: true });
            }
            
            // Retrieve Stripe subscription and customer data
            const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
            const stripeCustomer = await stripe.customers.retrieve(stripeSubscription.customer as string);
            
            console.log('📊 Stripe subscription status:', stripeSubscription.status);
            console.log('👤 Customer email:', (stripeCustomer as any).email);
            console.log('⏰ Trial start:', stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000).toISOString() : 'No trial');
            console.log('⏰ Trial end:', stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : 'No trial');
            
            let targetUserId = userId;
            
            // If no userId in metadata, try to find user by email or create one
            if (!targetUserId) {
              const customerEmail = (stripeCustomer as any).email;
              if (customerEmail) {
                console.log('🔍 No userId in metadata, searching by email:', customerEmail);
                let existingUser = await storage.getUserByUsername(customerEmail);
                
                if (!existingUser) {
                  console.log('👤 User not found in database, creating new user...');
                  
                  // Create new user automatically
                  const defaultPassword = Math.random().toString(36).substring(2, 15);
                  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
                  
                  existingUser = await storage.createUser({
                    username: customerEmail,
                    email: customerEmail,
                    password: hashedPassword,
                    stripeCustomerId: stripeSubscription.customer as string,
                  });
                  
                  console.log('✅ New user created automatically:', existingUser.username);
                  console.log('🔑 Temporary password:', defaultPassword);
                }
                
                targetUserId = existingUser.id;
                console.log('🎯 Target user ID:', targetUserId);
              }
            }
            
            if (!targetUserId) {
              console.error('❌ Cannot determine target user for subscription');
              return res.status(400).json({ error: 'Cannot determine target user' });
            }
            
            const updateData: any = {
              stripeSubscriptionId: session.subscription,
              subscriptionStatus: stripeSubscription.status,
              subscriptionPlan: planId || 'monthly', // Default to monthly if no planId
              subscriptionStartDate: new Date(stripeSubscription.start_date * 1000),
            };

            // If it's a trial, set the trial end date and mark user as having used trial
            if (stripeSubscription.status === 'trialing' && stripeSubscription.trial_end) {
              updateData.trialEndDate = new Date(stripeSubscription.trial_end * 1000);
              updateData.hasUsedTrial = 'yes';
            }

            // Set subscription end date for active subscriptions
            if (stripeSubscription.status === 'active' && (stripeSubscription as any).current_period_end) {
              updateData.subscriptionEndDate = new Date((stripeSubscription as any).current_period_end * 1000);
            }
            
            console.log('💾 Updating user subscription info with real Stripe data...');
            console.log('📄 Update data:', JSON.stringify(updateData, null, 2));
            
            await storage.updateUserStripeInfo(targetUserId, updateData);
            
            console.log('✅ User subscription updated successfully for userId:', targetUserId);
          } catch (updateError) {
            console.error('❌ Error updating user subscription:', updateError);
            return res.status(500).json({ error: 'Failed to update subscription' });
          }
        } else {
          console.error('❌ Missing subscription in checkout session');
          return res.status(400).json({ error: 'Missing subscription data' });
        }
        break;
        
      case 'customer.subscription.updated':
        console.log('🔄 Processing customer.subscription.updated...');
        const subscription = event.data.object;
        
        console.log('📊 Subscription ID:', subscription.id);
        console.log('📊 New subscription status:', subscription.status);
        console.log('⏰ Current period end:', (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : 'No period end');
        
        try {
          // Find user by stripe subscription ID
          let targetUser = null;
          
          // Method 1: Search by stripe subscription ID
          if (storage.getAllUsers) {
            const allUsers = await storage.getAllUsers();
            targetUser = allUsers.find(user => user.stripeSubscriptionId === subscription.id);
          }
          
          // Method 2: If not found, try by customer ID
          if (!targetUser) {
            const stripeCustomer = await stripe.customers.retrieve(subscription.customer as string);
            const customerEmail = (stripeCustomer as any).email;
            if (customerEmail) {
              targetUser = await storage.getUserByUsername(customerEmail);
            }
          }
          
          if (targetUser) {
            const updateData: any = {
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              subscriptionEndDate: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : null,
            };

            // If subscription is now active (transitioned from trial), clear trial end date
            if (subscription.status === 'active') {
              updateData.trialEndDate = null;
              console.log('✅ Subscription is now active - clearing trial end date');
            }

            // If subscription is still in trial, update trial end date
            if (subscription.status === 'trialing' && subscription.trial_end) {
              updateData.trialEndDate = new Date(subscription.trial_end * 1000);
              updateData.hasUsedTrial = 'yes';
              console.log('⏰ Trial updated, new trial end:', updateData.trialEndDate.toISOString());
            }

            // Handle cancellations
            if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
              updateData.subscriptionEndDate = new Date();
              console.log('❌ Subscription canceled/unpaid');
            }

            await storage.updateUserStripeInfo(targetUser.id, updateData);
            console.log('✅ User subscription updated for userId:', targetUser.id);
          } else {
            console.error('❌ User not found for subscription:', subscription.id);
          }
        } catch (error) {
          console.error('❌ Error processing subscription update:', error);
        }
        break;
        
      case 'customer.subscription.deleted':
        console.log('🗑️ Processing customer.subscription.deleted...');
        const deletedSubscription = event.data.object;
        
        try {
          // Find user by stripe subscription ID
          let targetUser = null;
          if (storage.getAllUsers) {
            const allUsers = await storage.getAllUsers();
            targetUser = allUsers.find(user => user.stripeSubscriptionId === deletedSubscription.id);
          }
          
          if (targetUser) {
            await storage.updateUserStripeInfo(targetUser.id, {
              subscriptionStatus: 'canceled',
              subscriptionEndDate: new Date(),
              trialEndDate: null,
            });
            console.log('✅ Subscription deleted for userId:', targetUser.id);
          } else {
            console.error('❌ User not found for deleted subscription:', deletedSubscription.id);
          }
        } catch (error) {
          console.error('❌ Error processing subscription deletion:', error);
        }
        break;
        
      case 'invoice.payment_succeeded':
        console.log('💰 Processing invoice.payment_succeeded...');
        const invoice = event.data.object;
        
        try {
          if (invoice.subscription) {
            // Find user by subscription ID
            let targetUser = null;
            if (storage.getAllUsers) {
              const allUsers = await storage.getAllUsers();
              targetUser = allUsers.find(user => user.stripeSubscriptionId === invoice.subscription);
            }
            
            if (targetUser) {
              console.log('✅ Payment succeeded for user:', targetUser.username);
              // Subscription is already active, no need to update unless status changed
            }
          }
        } catch (error) {
          console.error('❌ Error processing payment success:', error);
        }
        break;
        
      case 'invoice.payment_failed':
        console.log('❌ Processing invoice.payment_failed...');
        const failedInvoice = event.data.object;
        
        try {
          if (failedInvoice.subscription) {
            // Find user by subscription ID
            let targetUser = null;
            if (storage.getAllUsers) {
              const allUsers = await storage.getAllUsers();
              targetUser = allUsers.find(user => user.stripeSubscriptionId === failedInvoice.subscription);
            }
            
            if (targetUser) {
              console.log('❌ Payment failed for user:', targetUser.username);
              // Stripe will handle retries and cancellation automatically
            }
          }
        } catch (error) {
          console.error('❌ Error processing payment failure:', error);
        }
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  // Debug endpoint to check user subscription status
  app.get("/api/debug/user-subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      const now = new Date();
      const response: any = {
        userId: user.id,
        email: user.email,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        trialEndDate: user.trialEndDate,
        hasUsedTrial: user.hasUsedTrial,
        currentTime: now.toISOString(),
      };

      // Check trial status
      if (user.subscriptionStatus === 'trialing' && user.trialEndDate) {
        response.trialActive = new Date(user.trialEndDate) > now;
        response.trialTimeLeft = user.trialEndDate ? Math.max(0, new Date(user.trialEndDate).getTime() - now.getTime()) : 0;
      }

      // Check subscription status
      if (user.subscriptionStatus === 'active' && user.subscriptionEndDate) {
        response.subscriptionActive = new Date(user.subscriptionEndDate) > now;
      }

      // Determine overall access status using the same logic as requireActiveSubscription
      let hasAccess = false;
      if (user.subscriptionStatus === 'active' && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now) {
        hasAccess = true;
      } else if (user.subscriptionStatus === 'trialing' && user.trialEndDate && new Date(user.trialEndDate) > now) {
        hasAccess = true;
      }
      
      response.hasAccess = hasAccess;

      res.json(response);
    } catch (error) {
      console.error("Error checking user subscription:", error);
      res.status(500).json({ message: "Errore nel controllo dell'abbonamento" });
    }
  });

  // Cancel subscription endpoint
  app.post("/api/cancel-subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (!user.stripeSubscriptionId && user.subscriptionStatus !== 'trialing')) {
        return res.status(404).json({ 
          message: "Nessun abbonamento attivo trovato" 
        });
      }



      if (user.stripeSubscriptionId) {
        // Cancel the subscription in Stripe if it exists
        const subscription = await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        
        // Update user status in database and mark as having used trial
        await storage.updateUserStripeInfo(userId, {
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          subscriptionStatus: 'canceled',
          hasUsedTrial: 'yes' // Prevent future trial access
        });

        console.log(`✅ Stripe subscription canceled for user ${user.email}: ${subscription.id}`);
        
        res.json({ 
          message: "Abbonamento cancellato con successo",
          subscription: {
            id: subscription.id,
            status: subscription.status,
            endDate: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null
          }
        });
      } else {
        // Cancel trial subscription (no Stripe subscription)
        await storage.updateUserStripeInfo(userId, {
          stripeCustomerId: user.stripeCustomerId,
          subscriptionStatus: 'canceled',
          trialEndDate: new Date(), // End trial immediately
          hasUsedTrial: 'yes' // Prevent future trial access
        });

        console.log(`✅ Trial subscription canceled for user ${user.email}`);
        
        res.json({ 
          message: "Abbonamento di prova cancellato con successo",
          subscription: {
            id: 'trial',
            status: 'canceled',
            endDate: new Date().toISOString()
          }
        });
      }
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({ 
        message: "Errore durante la cancellazione dell'abbonamento: " + error.message 
      });
    }
  });

  // Get user subscription status
  app.get("/api/user/subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      console.log(`🔍 Checking subscription for user ${user.email}:`, {
        subscriptionStatus: user.subscriptionStatus,
        trialEndDate: user.trialEndDate,
        subscriptionEndDate: user.subscriptionEndDate,
        stripeSubscriptionId: user.stripeSubscriptionId
      });

      const now = new Date();
      
      // Determine trial status - Fix date comparison
      const isTrialing = user.subscriptionStatus === 'trialing' && 
                         user.trialEndDate && 
                         new Date(user.trialEndDate) > now;
                         
      // Determine active subscription status  
      const isActiveSubscription = user.subscriptionStatus === 'active' &&
                                    user.subscriptionEndDate &&
                                    new Date(user.subscriptionEndDate) > now;
                         
      const hasActiveSubscription = isActiveSubscription || isTrialing;

      const subscriptionInfo = {
        hasActiveSubscription: hasActiveSubscription,
        status: user.subscriptionStatus || 'none',
        plan: user.subscriptionPlan || '',
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        trialEndDate: user.trialEndDate ? new Date(user.trialEndDate).toISOString() : null,
        isInTrial: isTrialing,
        hasUsedTrial: user.hasUsedTrial === 'yes'
      };

      console.log(`📊 Subscription status calculated for ${user.email}:`, {
        hasActiveSubscription,
        isInTrial: isTrialing,
        isActiveSubscription,
        currentTime: now.toISOString()
      });

      res.json(subscriptionInfo);
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ message: "Errore nel recupero dello stato dell'abbonamento" });
    }
  });

  // Cancel subscription endpoint
  app.post("/api/cancel-subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ message: "Nessun abbonamento attivo da cancellare" });
      }

      // Cancel subscription in Stripe
      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      // Update user subscription status
      const endDate = new Date((subscription as any).current_period_end * 1000);
      await storage.updateUserStripeInfo(userId, {
        subscriptionStatus: 'canceled',
        subscriptionEndDate: endDate,
      });

      res.json({ 
        message: "Abbonamento cancellato. Rimarrà attivo fino alla fine del periodo di fatturazione corrente.",
        endDate: endDate
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Errore nella cancellazione dell'abbonamento" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
