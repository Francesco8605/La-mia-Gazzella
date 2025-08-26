import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
// import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUserProfileSchema, insertMealPlanSchema, insertRecipeSchema, insertWeightEntrySchema } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Temporarily disable auth for testing
  // await setupAuth(app);

  // Temporary auth bypass for testing
  app.get('/api/auth/user', async (req: any, res) => {
    // Return null to indicate no user is logged in
    res.status(401).json({ message: "Authentication temporarily disabled" });
  });

  // Subscription status check (temporarily bypassed)
  app.get('/api/subscription/status', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      // Check trial period
      const now = new Date();
      const isInTrial = user.trialEndsAt && now < user.trialEndsAt;
      
      // Check subscription status
      let hasActiveSubscription = false;
      let subscriptionData = null;

      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          hasActiveSubscription = subscription.status === 'active';
          subscriptionData = {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          };
        } catch (error) {
          console.error('Error fetching Stripe subscription:', error);
        }
      }

      res.json({
        hasActiveSubscription: hasActiveSubscription || isInTrial,
        isInTrial,
        subscriptionStatus: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt,
        hasUsedTrial: user.hasUsedTrial === 1,
        subscription: subscriptionData
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      res.status(500).json({ message: "Errore nel controllo abbonamento" });
    }
  });

  // Create Stripe checkout session for subscription
  app.post('/api/create-checkout-session', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      // Check if user already has a subscription
      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          if (subscription.status === 'active') {
            return res.status(400).json({ message: "Hai già un abbonamento attivo" });
          }
        } catch (error) {
          // Subscription doesn't exist, continue
        }
      }

      // Determine if user gets trial (only if never used trial)
      const hasUsedTrial = user.hasUsedTrial === 1;
      
      const sessionConfig: any = {
        mode: 'subscription',
        customer_email: user.email,
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'La Mia Gazzella Premium',
              description: 'Accesso completo a piani nutrizionali personalizzati, generatore ricette AI e consulente nutrizionale'
            },
            unit_amount: 2900, // 29€ in centesimi
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }],
        success_url: `${req.protocol}://${req.get('host')}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/subscription-plans`,
        client_reference_id: userId,
        metadata: {
          userId: userId
        }
      };

      // Add trial only if user hasn't used it before
      if (!hasUsedTrial) {
        sessionConfig.subscription_data = {
          trial_period_days: 3,
          metadata: {
            userId: userId,
            trial_granted: 'true'
          }
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);
      
      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ 
        message: 'Errore nella creazione della sessione di pagamento',
        details: error.message 
      });
    }
  });

  // Stripe webhooks
  app.post('/api/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature']!;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.client_reference_id;
          
          if (userId && session.subscription) {
            await storage.updateUser(userId, {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              subscriptionStatus: 'active'
            });

            // If this was a trial subscription, mark trial as used and set trial end date
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            if (subscription.trial_end) {
              await storage.updateUser(userId, {
                hasUsedTrial: 1,
                trialEndsAt: new Date(subscription.trial_end * 1000)
              });
            }
          }
          break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          
          // Find user by Stripe subscription ID
          const users = await storage.getAllUsers?.() || []; // We need this method
          const user = users.find(u => u.stripeSubscriptionId === subscription.id);
          
          if (user) {
            const status = subscription.status === 'active' ? 'active' : 'cancelled';
            await storage.updateUser(user.id, {
              subscriptionStatus: status
            });

            // If subscription cancelled, mark trial as used to prevent re-trialing
            if (status === 'cancelled') {
              await storage.updateUser(user.id, {
                hasUsedTrial: 1
              });
            }
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            const users = await storage.getAllUsers?.() || [];
            const user = users.find(u => u.stripeSubscriptionId === invoice.subscription);
            if (user) {
              await storage.updateUser(user.id, {
                subscriptionStatus: 'past_due'
              });
            }
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Protected routes - require subscription
  const requireSubscription = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "Utente non trovato" });
      }

      // Check if user has active subscription or trial
      const now = new Date();
      const isInTrial = user.trialEndsAt && now < user.trialEndsAt;
      let hasActiveSubscription = isInTrial;

      if (user.stripeSubscriptionId && !hasActiveSubscription) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          hasActiveSubscription = subscription.status === 'active';
        } catch (error) {
          // Subscription doesn't exist
        }
      }

      if (!hasActiveSubscription) {
        return res.status(403).json({ 
          message: "Abbonamento richiesto",
          requiresSubscription: true 
        });
      }

      next();
    } catch (error) {
      console.error("Error checking subscription:", error);
      res.status(500).json({ message: "Errore nel controllo abbonamento" });
    }
  };

  // User Profiles - Protected routes
  app.get("/api/user-profiles/current", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profilo non trovato" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Errore nel recupero del profilo" });
    }
  });

  app.post("/api/user-profiles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validation = insertUserProfileSchema.safeParse({
        ...req.body,
        userId
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

  app.patch("/api/user-profiles/current", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const profile = await storage.updateUserProfile(userId, req.body);
      
      if (!profile) {
        return res.status(404).json({ message: "Profilo non trovato" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Errore nell'aggiornamento del profilo" });
    }
  });

  // Meal Plans - Protected routes
  app.get("/api/meal-plans", isAuthenticated, requireSubscription, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plans = await storage.getMealPlansByUser(userId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      res.status(500).json({ message: "Errore nel recupero dei piani alimentari" });
    }
  });

  app.post("/api/meal-plans/generate", isAuthenticated, requireSubscription, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("🍽️ Generating meal plan for user:", userId);

      const validation = insertMealPlanSchema.safeParse({
        ...req.body,
        userId
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

  app.get("/api/meal-plans/:id", isAuthenticated, requireSubscription, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const mealPlan = await storage.getMealPlan(id);
      
      if (!mealPlan) {
        return res.status(404).json({ message: "Piano alimentare non trovato" });
      }

      // Check if meal plan belongs to user
      if (mealPlan.userId !== userId) {
        return res.status(403).json({ message: "Accesso negato" });
      }
      
      res.json(mealPlan);
    } catch (error) {
      console.error("Error fetching meal plan:", error);
      res.status(500).json({ message: "Errore nel recupero del piano alimentare" });
    }
  });

  // Recipes - Protected routes
  app.get("/api/recipes", isAuthenticated, requireSubscription, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      const recipes = await storage.getRecipesByUser(userId, limit, offset);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Errore nel recupero delle ricette" });
    }
  });

  app.post("/api/recipes/generate", isAuthenticated, requireSubscription, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("🍳 Generating recipe for user:", userId);

      const validation = insertRecipeSchema.safeParse({
        ...req.body,
        userId
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

  // Weight Entries - Protected routes
  app.get("/api/weight-entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const entries = await storage.getWeightEntriesByUser(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching weight entries:", error);
      res.status(500).json({ message: "Errore nel recupero delle misurazioni" });
    }
  });

  app.post("/api/weight-entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validation = insertWeightEntrySchema.safeParse({
        ...req.body,
        userId
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
      message: "La Mia Gazzella API - Versione Premium"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}