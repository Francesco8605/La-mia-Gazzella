import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "../shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import Stripe from "stripe";
import cookieParser from "cookie-parser";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getSessionExpiryDate(): Date {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // Sessions last 7 days
  return expiryDate;
}

// Authentication middleware with proper typing
interface AuthenticatedRequest extends Request {
  userId: string;
}

async function requireAuth(req: any, res: any, next: any) {
  try {
    const sessionId = req.cookies?.session;
    if (!sessionId) {
      return res.status(401).json({ message: "Non autenticato" });
    }
    
    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ message: "Non autenticato" });
    }
    
    // Add user info to request
    req.userId = (session.sess as any).userId;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: "Errore di autenticazione" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Registration attempt for:", req.body.username);
      
      // Validate input
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email e password sono obbligatori" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username già in uso" });
      }
      
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email già in uso" });
      }
      
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: passwordHash,
      });
      
      // Create session
      const sessionId = generateSessionId();
      await storage.createSession(sessionId, user.id, getSessionExpiryDate());
      
      // Set session cookie
      res.cookie('session', sessionId, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Return user without sensitive data
      const { password: _, ...userResponse } = user;
      res.status(201).json(userResponse);
      
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati non validi", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Errore durante la registrazione" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username e password sono obbligatori" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Credenziali non valide" });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenziali non valide" });
      }
      
      // Create session
      const sessionId = generateSessionId();
      await storage.createSession(sessionId, user.id, getSessionExpiryDate());
      
      // Set session cookie
      res.cookie('session', sessionId, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Return user without sensitive data
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
      
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Errore durante il login" });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      const sessionId = req.cookies?.session;
      if (sessionId) {
        await storage.deleteSession(sessionId);
      }
      
      res.clearCookie('session');
      res.json({ message: "Logout effettuato con successo" });
      
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Errore durante il logout" });
    }
  });

  app.get("/api/auth/user", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
      
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
      
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Errore durante il recupero dell'utente" });
    }
  });

  // Subscription routes
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Errore nel recupero dei piani di abbonamento" });
    }
  });

  app.post("/api/create-checkout-session", requireAuth, async (req: any, res) => {
    try {
      console.log("Creating checkout session for user:", req.userId);
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID è obbligatorio" });
      }
      
      // Get user
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
      
      // Get plan
      const plans = await storage.getSubscriptionPlans();
      const selectedPlan = plans.find(plan => plan.id === planId);
      if (!selectedPlan) {
        return res.status(404).json({ message: "Piano di abbonamento non trovato" });
      }
      
      console.log("Selected plan:", selectedPlan.name, selectedPlan.priceEur);
      
      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
          metadata: { userId: user.id }
        });
        customerId = customer.id;
        
        // Update user with customer ID
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customerId });
      }
      
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
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
        cancel_url: `${req.protocol}://${req.get('host')}/piani-abbonamento`,
        metadata: {
          userId: user.id,
          planId: planId,
        },
        subscription_data: {
          trial_period_days: user.hasUsedTrial ? undefined : (selectedPlan.trialDays || undefined),
          metadata: {
            userId: user.id,
            planId: planId,
          }
        },
      });
      
      console.log("Stripe session created:", session.id);
      res.json({ url: session.url });
      
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ 
        message: "Errore nella creazione della sessione di pagamento",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Stripe webhook
  app.post("/api/stripe/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      // In production, you should set STRIPE_WEBHOOK_SECRET
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test');
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as any;
          const userId = subscription.metadata?.userId;
          
          if (userId) {
            await storage.updateUserSubscription(userId, {
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              subscriptionPlan: subscription.metadata?.planId,
              subscriptionStartDate: new Date(subscription.current_period_start * 1000),
              subscriptionEndDate: new Date(subscription.current_period_end * 1000),
              trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
              hasUsedTrial: true,
            });
            console.log('Updated user subscription:', userId);
          }
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as any;
          const userId = subscription.metadata?.userId;
          
          if (userId) {
            await storage.updateUserSubscription(userId, {
              subscriptionStatus: 'canceled',
            });
            console.log('Canceled user subscription:', userId);
          }
          break;
        }
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // User subscription status
  app.get("/api/user/subscription", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }
      
      const now = new Date();
      const isInTrial = user.trialEndDate && now < user.trialEndDate;
      const hasActiveSubscription = user.subscriptionStatus === 'active' || isInTrial;
      
      res.json({
        hasActiveSubscription,
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        isInTrial: !!isInTrial,
        trialEndDate: user.trialEndDate?.toISOString(),
        hasUsedTrial: user.hasUsedTrial,
      });
      
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ message: "Errore nel recupero dell'abbonamento" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}