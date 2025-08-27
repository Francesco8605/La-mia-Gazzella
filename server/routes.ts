import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { sendVerificationEmail } from "./emailService";
import OpenAI from "openai";
import bcrypt from "bcrypt";
import { 
  insertUserProfileSchema, 
  insertMealPlanSchema, 
  insertRecipeSchema, 
  insertWeightEntrySchema,
  type User 
} from "@shared/schema";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Email signup route
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const signupSchema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
        firstName: z.string().min(2),
        lastName: z.string().min(2),
      });

      const { email, password, firstName, lastName } = signupSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Un account con questa email esiste già" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await storage.createEmailUser(email, hashedPassword, firstName, lastName);

      // Send verification email
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const emailSent = await sendVerificationEmail(email, user.emailVerificationToken!, baseUrl);

      if (!emailSent) {
        console.error("Failed to send verification email");
        // Don't fail the signup, user can request resend
      }

      res.json({ 
        message: "Account creato! Controlla la tua email per verificare l'account.",
        userId: user.id
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dati di registrazione non validi" });
      }
      res.status(500).json({ message: "Errore durante la registrazione" });
    }
  });

  // Email verification route
  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token di verifica richiesto" });
      }

      const user = await storage.verifyEmailUser(token);
      
      if (!user) {
        return res.status(400).json({ message: "Token di verifica non valido o scaduto" });
      }

      res.json({ 
        message: "Email verificata con successo!",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Errore durante la verifica" });
    }
  });

  // Email login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user || user.authProvider !== "email") {
        return res.status(401).json({ message: "Email o password non corretti" });
      }

      if (!user.emailVerified) {
        return res.status(401).json({ message: "Account non verificato. Controlla la tua email." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password!);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Email o password non corretti" });
      }

      // Create session manually for email users
      (req.session as any).emailUserId = user.id;
      
      res.json({ 
        message: "Accesso effettuato con successo!",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Errore durante l'accesso" });
    }
  });

  // Public route for status
  app.get("/api/debug/status", async (req, res) => {
    res.json({
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      database: {
        connected: !!process.env.DATABASE_URL,
        urlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "..."
      },
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 8) + "..."
      }
    });
  });

  // User Profiles routes
  app.get("/api/user-profiles/current", async (req, res) => {
    try {
      // For now, we'll create a simple session-based profile
      const sessionId = req.sessionID || 'anonymous';
      let profile = await storage.getUserProfile(sessionId);
      
      if (!profile) {
        profile = await storage.createUserProfile({
          userId: sessionId,
          createdAt: new Date()
        });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/user-profiles", async (req, res) => {
    try {
      const validatedData = insertUserProfileSchema.parse(req.body);
      const sessionId = req.sessionID || 'anonymous';
      
      const profile = await storage.upsertUserProfile(sessionId, validatedData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Meal Plans routes
  app.get("/api/meal-plans/user", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.sessionID || 'anonymous';
      const mealPlans = await storage.getMealPlansByUser(userId);
      res.json(mealPlans);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.post("/api/meal-plans", async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.sessionID || 'anonymous';
      const mealPlanData = { ...req.body, userId };
      
      const validatedData = insertMealPlanSchema.parse(mealPlanData);
      const mealPlan = await storage.createMealPlan(validatedData);
      
      res.json(mealPlan);
    } catch (error) {
      console.error("Error creating meal plan:", error);
      res.status(500).json({ message: "Failed to create meal plan" });
    }
  });

  // Recipes routes
  app.get("/api/recipes", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const recipes = await storage.getRecipes(limit, offset);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.sessionID || 'anonymous';
      const recipeData = { ...req.body, userId };
      
      const validatedData = insertRecipeSchema.parse(recipeData);
      const recipe = await storage.createRecipe(validatedData);
      
      res.json(recipe);
    } catch (error) {
      console.error("Error creating recipe:", error);
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  // AI Generation routes
  app.post("/api/generate-meal-plan", async (req, res) => {
    try {
      const { profile } = req.body;
      
      const prompt = `Crea un piano alimentare personalizzato secondo il Protocollo Gazzella per una persona con queste caratteristiche:
      - Età: ${profile.age} anni
      - Peso: ${profile.weight} kg
      - Altezza: ${profile.height} cm
      - Attività fisica: ${profile.weeklyExercise} volte a settimana
      - Problemi tiroide: ${profile.thyroidIssues}
      - Problemi intestinali: ${profile.intestinalIssues}
      - Cibi esclusi: ${profile.excludedFoods?.join(', ')}
      - Allergie: ${profile.allergies?.join(', ')}
      
      Crea un piano di 7 giorni con colazione, pranzo, cena e spuntini, seguendo rigorosamente il Protocollo Gazzella.
      
      Restituisci SOLO un JSON valido con questa struttura:
      {
        "title": "Piano Alimentare Personalizzato",
        "description": "Descrizione del piano",
        "targetCalories": numero,
        "targetProtein": numero,
        "targetCarbs": numero,
        "targetFat": numero,
        "days": [array di 7 giorni con struttura completa dei pasti]
      }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const responseText = completion.choices[0].message.content;
      const mealPlan = JSON.parse(responseText || '{}');
      
      res.json(mealPlan);
    } catch (error) {
      console.error("Error generating meal plan:", error);
      res.status(500).json({ message: "Failed to generate meal plan" });
    }
  });

  app.post("/api/generate-recipe", async (req, res) => {
    try {
      const { preferences, ingredients, type } = req.body;
      
      const prompt = `Crea una ricetta seguendo il Protocollo Gazzella con questi parametri:
      - Tipo: ${type}
      - Ingredienti disponibili: ${ingredients}
      - Preferenze: ${preferences}
      
      La ricetta deve seguire le regole del Protocollo Gazzella per le combinazioni alimentari.
      
      Restituisci SOLO un JSON valido con questa struttura:
      {
        "title": "Nome ricetta",
        "description": "Descrizione",
        "ingredients": ["ingrediente 1", "ingrediente 2"],
        "instructions": ["passo 1", "passo 2"],
        "calories": numero,
        "protein": numero,
        "carbs": numero,
        "fat": numero,
        "servings": numero,
        "prepTime": numero,
        "cookTime": numero,
        "difficulty": "facile|medio|difficile",
        "cuisine": "italiana",
        "dietaryTags": ["tag1", "tag2"]
      }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const responseText = completion.choices[0].message.content;
      const recipe = JSON.parse(responseText || '{}');
      
      res.json(recipe);
    } catch (error) {
      console.error("Error generating recipe:", error);
      res.status(500).json({ message: "Failed to generate recipe" });
    }
  });

  // Weight tracking routes
  app.get("/api/weight-entries", async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.sessionID || 'anonymous';
      const entries = await storage.getWeightEntriesByUserId(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching weight entries:", error);
      res.status(500).json({ message: "Failed to fetch weight entries" });
    }
  });

  app.post("/api/weight-entries", async (req, res) => {
    try {
      const userId = req.user?.claims?.sub || req.sessionID || 'anonymous';
      const entryData = { ...req.body, userId };
      
      const validatedData = insertWeightEntrySchema.parse(entryData);
      const entry = await storage.createWeightEntry(validatedData);
      
      res.json(entry);
    } catch (error) {
      console.error("Error creating weight entry:", error);
      res.status(500).json({ message: "Failed to create weight entry" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}