import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertUserProfileSchema, insertMealPlanSchema, insertRecipeSchema, insertWeightEntrySchema, users, userProfiles, mealPlans, recipes, activityLogs, adminUsers } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { generateMealPlan, generateRecipe, calculateNutritionalNeeds, generatePersonalizedRecipe, generateAIChatResponse } from "./services/openai";
import { sendPasswordRecoveryEmail, sendWelcomeEmail } from "./services/email";
import { getShopifyService } from "./services/shopify";
import { whatsappService } from "./services/whatsapp";
import { z } from "zod";
import bcrypt from "bcrypt";
import Stripe from "stripe";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
console.log("🔧 Stripe initialized with key:", process.env.STRIPE_SECRET_KEY?.substring(0, 12) + "...");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    console.log("🔐 Authentication check for:", req.url);
    console.log("🍪 All cookies:", req.cookies);
    console.log("🔍 Session cookie:", req.cookies?.session);
    
    const sessionId = req.cookies?.session;
    if (!sessionId) {
      console.log("❌ No session cookie found");
      return res.status(401).json({ message: "Non autenticato" });
    }
    
    const session = await storage.getSession(sessionId);
    console.log("🗂️ Session found:", !!session);
    
    if (!session) {
      console.log("❌ Invalid session ID");
      return res.status(401).json({ message: "Non autenticato" });
    }
    
    // Mock user object to match what would come from Replit Auth
    const userId = (session.sess as any).userId;
    console.log("✅ User authenticated:", userId);
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
        stripe: {
          configured: !!process.env.STRIPE_SECRET_KEY,
          keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'N/A'
        }
      };

      // Test database connection
      try {
        const testUser = await storage.getUserByUsername('nonexistent-user-test');
        status.database.queryTest = 'success';
      } catch (error: any) {
        status.database.queryTest = 'failed';
        status.database.error = error?.message || 'Unknown error';
      }

      // Test Shopify connection
      try {
        const shopifyService = getShopifyService();
        status.shopify = {
          configured: !!process.env.SHOPIFY_STORE_DOMAIN && !!process.env.SHOPIFY_API_SECRET,
          storeUrl: process.env.SHOPIFY_STORE_DOMAIN || 'N/A',
          connectionTest: 'testing...'
        };
        
        const shopifyConnection = await shopifyService.testConnection();
        status.shopify.connectionTest = shopifyConnection ? 'success' : 'failed';
      } catch (error: any) {
        status.shopify = {
          configured: false,
          connectionTest: 'failed',
          error: error?.message || 'Connection failed'
        };
      }

      res.json(status);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Debug endpoint failed', 
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Shopify Test Endpoint (solo per verificare configurazione)
  app.get("/api/debug/shopify", async (req, res) => {
    try {
      console.log('🛍️ Testing Shopify integration...');
      
      const envCheck = {
        SHOPIFY_STORE_DOMAIN: !!process.env.SHOPIFY_STORE_DOMAIN,
        SHOPIFY_API_SECRET: !!process.env.SHOPIFY_API_SECRET,
        storeUrl: process.env.SHOPIFY_STORE_DOMAIN || 'NOT_SET',
        tokenPrefix: process.env.SHOPIFY_API_SECRET?.substring(0, 8) || 'NOT_SET'
      };
      
      console.log('🔍 Environment variables:', envCheck);
      
      let connectionTest = false;
      let error = null;
      
      try {
        const shopifyService = getShopifyService();
        connectionTest = await shopifyService.testConnection();
      } catch (testError: any) {
        error = testError.message;
        console.error('❌ Shopify test error:', testError);
      }
      
      res.json({
        shopify: {
          configured: envCheck.SHOPIFY_STORE_DOMAIN && envCheck.SHOPIFY_API_SECRET,
          environment: envCheck,
          connectionTest,
          error
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Shopify test failed', 
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Debug endpoint for WhatsApp integration
  app.get("/api/debug/whatsapp", async (req, res) => {
    try {
      console.log('📱 Testing WhatsApp integration...');
      
      const envCheck = {
        WHATSAPP_API_KEY_3333401566: !!process.env.WHATSAPP_API_KEY_3333401566,
        WHATSAPP_API_KEY_3884480928: !!process.env.WHATSAPP_API_KEY_3884480928,
        apiKey3333401566Prefix: process.env.WHATSAPP_API_KEY_3333401566?.substring(0, 8) || 'NOT_SET',
        apiKey3884480928Prefix: process.env.WHATSAPP_API_KEY_3884480928?.substring(0, 8) || 'NOT_SET'
      };
      
      console.log('🔍 WhatsApp environment variables:', envCheck);
      
      const status = whatsappService.getStatus();
      
      res.json({
        whatsapp: {
          configured: status.configured,
          environment: envCheck,
          configuredNumbers: status.numbers,
          serviceReady: whatsappService.isConfigured()
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'WhatsApp test failed', 
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Test endpoint for Shopify paid tagging
  app.post("/api/debug/test-shopify-paid-tag", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      console.log('🧪 Testing Shopify paid subscriber tagging for:', email);
      
      const shopifyService = getShopifyService();
      const success = await shopifyService.tagCustomerAsPaid(email);
      
      res.json({
        success,
        email,
        message: success ? 'Customer tagged as paid subscriber successfully' : 'Failed to tag customer as paid subscriber'
      });
    } catch (error: any) {
      console.error('❌ Test paid tagging error:', error);
      res.status(500).json({ 
        error: 'Test paid tagging failed', 
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Test endpoint for WhatsApp payment notifications
  app.post("/api/debug/test-whatsapp-payment", async (req, res) => {
    try {
      const { email, amount } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      console.log('🧪 Testing WhatsApp payment notification for:', email);
      
      await whatsappService.sendPaymentNotification(email, amount || '29.00');
      
      res.json({
        success: true,
        email,
        amount: amount || '29.00',
        message: 'WhatsApp payment notification sent successfully'
      });
    } catch (error: any) {
      console.error('❌ Test payment notification error:', error);
      res.status(500).json({ 
        error: 'Test payment notification failed', 
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Test endpoint for cancellation notifications
  app.post("/api/debug/test-cancellation", async (req, res) => {
    try {
      const { email, reason } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      console.log('🧪 Testing cancellation notification for:', email);
      
      // Test Shopify tagging
      const shopifyService = getShopifyService();
      const shopifySuccess = await shopifyService.tagCustomerAsCanceled(email);
      
      // Test WhatsApp notification
      await whatsappService.sendCancellationNotification(email, reason || 'Test cancellation');
      
      res.json({
        success: true,
        email,
        reason: reason || 'Test cancellation',
        shopifyTagged: shopifySuccess,
        message: 'Cancellation notifications sent successfully'
      });
    } catch (error: any) {
      console.error('❌ Test cancellation error:', error);
      res.status(500).json({ 
        error: 'Test cancellation failed', 
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Test endpoint for Shopify order creation
  app.post("/api/debug/test-shopify-order", async (req, res) => {
    try {
      const { email, amount, description } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      console.log('🧪 Testing Shopify order creation for:', email);
      
      const shopifyService = getShopifyService();
      const orderSuccess = await shopifyService.createOrder(
        email, 
        amount || '29.00', 
        description || 'Test Order - Abbonamento La Mia Gazzella'
      );
      
      res.json({
        success: orderSuccess,
        email,
        amount: amount || '29.00',
        description: description || 'Test Order - Abbonamento La Mia Gazzella',
        message: orderSuccess ? 'Shopify order created successfully' : 'Failed to create Shopify order'
      });
    } catch (error: any) {
      console.error('❌ Test Shopify order creation error:', error);
      res.status(500).json({ 
        error: 'Test Shopify order creation failed', 
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Test endpoint for card insertion notification
  app.post("/api/debug/test-card-inserted", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      console.log('🧪 Testing card insertion notification for:', email);
      
      // Test Shopify tagging
      const shopifyService = getShopifyService();
      const shopifyTagged = await shopifyService.tagCustomerCardInserted(email);
      
      // Test WhatsApp notification
      await whatsappService.sendCardInsertedNotification(email);
      
      res.json({
        success: true,
        email,
        shopifyTagged,
        message: 'Card insertion notifications sent successfully'
      });
    } catch (error: any) {
      console.error('❌ Test card insertion error:', error);
      res.status(500).json({ 
        error: 'Test card insertion failed', 
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Test endpoint for welcome email
  app.post("/api/debug/test-welcome-email", async (req, res) => {
    try {
      const { email, username } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      console.log('🧪 Testing welcome email for:', email);
      
      // Test welcome email
      const result = await sendWelcomeEmail(email, username || email.split('@')[0]);
      
      res.json({
        success: true,
        email,
        username: username || email.split('@')[0],
        messageId: result.messageId,
        message: 'Welcome email sent successfully'
      });
    } catch (error: any) {
      console.error('❌ Test welcome email error:', error);
      res.status(500).json({ 
        error: 'Test welcome email failed', 
        details: error?.message || 'Unknown error'
      });
    }
  });
  
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("🔥 Registration attempt started");
      console.log("📝 Request body:", req.body);
      console.log("🌍 Environment check:", {
        NODE_ENV: process.env.NODE_ENV,
        hasDatabase: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) || 'N/A'
      });
      
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        console.log("❌ Missing required fields");
        return res.status(400).json({ message: "Email e password sono obbligatori" });
      }
      
      console.log("✅ Input validation passed");
      
      // Check if email exists in Shopify and has purchased "Il Manuale della Gazzella"
      try {
        console.log("🛍️ Checking if email exists in Shopify:", email);
        const shopifyCustomer = await getShopifyService().findCustomerByEmail(email);
        if (!shopifyCustomer) {
          console.log("❌ Email not found in Shopify:", email);
          return res.status(403).json({ 
            message: "Accesso negato. Solo chi ha il Manuale della Gazzella può accedere all'app La Mia Gazzella. Verifica di aver inserito la mail con cui hai acquistato il manuale della Gazzella o procedi all'acquisto qui https://ilmanualedellagazzella.com/" 
          });
        }
        console.log("✅ Email found in Shopify:", shopifyCustomer.email);
        
        // Check if customer has purchased "Il Manuale della Gazzella" (Product ID: 8831095112021)
        console.log("📖 Checking if customer has purchased Il Manuale della Gazzella...");
        const hasPurchasedManual = await getShopifyService().hasCustomerPurchasedProduct(email, "8831095112021");
        
        if (!hasPurchasedManual) {
          console.log("❌ Customer has not purchased Il Manuale della Gazzella:", email);
          return res.status(403).json({ 
            message: "Accesso negato. Solo chi ha il Manuale della Gazzella può accedere all'app La Mia Gazzella. Verifica di aver inserito la mail con cui hai acquistato il manuale della Gazzella o procedi all'acquisto qui https://ilmanualedellagazzella.com/" 
          });
        }
        
        console.log("✅ Customer has purchased Il Manuale della Gazzella:", email);
      } catch (shopifyError: any) {
        console.error("❌ Shopify check error:", shopifyError);
        return res.status(500).json({ 
          message: "Errore di verifica cliente", 
          details: shopifyError?.message || 'Shopify verification failed'
        });
      }
      
      try {
        // Check if user already exists by email in our database
        console.log("🔍 Checking for existing user in database:", email);
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          console.log("❌ User already exists:", email);
          return res.status(400).json({ message: "Email già in uso" });
        }
        console.log("✅ Email is available in database");
      } catch (dbError: any) {
        console.error("❌ Database check error:", dbError);
        return res.status(500).json({ 
          message: "Errore di connessione al database", 
          details: dbError?.message || 'Database connection failed'
        });
      }

      try {
        // Hash password
        console.log("🔐 Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("✅ Password hashed successfully");
        
        // Create user without automatic trial - users must subscribe with payment details
        console.log("👤 Creating user in database...");
        const user = await storage.createUser({
          email,
          password: hashedPassword,
        });
        console.log("✅ User created successfully:", user.email);

        // Create database session
        console.log("🍪 Creating session...");
        const sessionId = generateSessionId();
        const expiresAt = getSessionExpiryDate();
        await storage.createSession(sessionId, user.id, expiresAt);
        console.log("✅ Session created successfully");

        // Set session cookie
        const isProduction = req.get('host')?.includes('replit.app');
        res.cookie('session', sessionId, { 
          httpOnly: true, 
          secure: isProduction, // HTTPS in production
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: isProduction ? 'none' : 'lax' // different for production
        });

        // Add customer to Shopify with free trial tag
        try {
          console.log("🛍️ Adding customer to Shopify with free trial tag...");
          const shopifyService = getShopifyService();
          const shopifySuccess = await shopifyService.tagCustomerAsFreeTrial(email);
          
          if (shopifySuccess) {
            console.log("✅ Customer tagged in Shopify successfully:", email);
          } else {
            console.log("⚠️ Shopify tagging failed (registration continues):", email);
          }
        } catch (shopifyError: any) {
          console.error("⚠️ Shopify integration error (registration continues):", shopifyError.message);
          // Non bloccante - la registrazione continua anche se Shopify fallisce
        }

        // Send WhatsApp notification for new registration
        try {
          console.log("📱 Sending WhatsApp notification for new registration...");
          await whatsappService.sendRegistrationNotification(email);
          console.log("✅ WhatsApp notifications sent successfully");
        } catch (whatsappError: any) {
          console.error("⚠️ WhatsApp notification error (registration continues):", whatsappError.message);
          // Non bloccante - la registrazione continua anche se WhatsApp fallisce
        }

        // Send welcome email to new user
        try {
          console.log("📧 Sending welcome email to new user...");
          await sendWelcomeEmail(email, email.split('@')[0]); // Use email prefix as username
          console.log("✅ Welcome email sent successfully");
        } catch (emailError: any) {
          console.error("⚠️ Welcome email error (registration continues):", emailError.message);
          // Non bloccante - la registrazione continua anche se l'email fallisce
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        console.log("✅ Registration completed successfully for:", email);
        res.status(201).json(userWithoutPassword);
      } catch (createError: any) {
        console.error("❌ User creation error:", createError);
        return res.status(500).json({ 
          message: "Errore durante la creazione dell'utente", 
          details: createError?.message || 'User creation failed'
        });
      }
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      res.status(500).json({ 
        message: "Errore durante la registrazione",
        details: error?.message || 'Registration failed',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
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

      // Get user data - extract userId from session.sess
      const userId = (session.sess as any).userId;
      const user = await storage.getUser(userId);
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

  // Password Recovery
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email è richiesta" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security, return success even if user doesn't exist
        return res.json({ message: "Se l'email esiste, riceverai la password a breve" });
      }

      // Send email with current password (unhashed from database would require storing it)
      // Since we hash passwords, we'll need to generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
      
      // Update user with new password
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      await storage.updateUserPassword(user.id, hashedPassword);

      // Send recovery email
      await sendPasswordRecoveryEmail(user.email, user.username || user.email, tempPassword);

      res.json({ message: "Se l'email esiste, riceverai la password a breve" });
    } catch (error) {
      console.error("Password recovery error:", error);
      res.status(500).json({ message: "Errore durante il recupero della password" });
    }
  });

  // Change Password
  app.post("/api/auth/change-password", isAuthenticated, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Password corrente e nuova password sono obbligatorie" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "La nuova password deve essere almeno 6 caratteri" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      // Check current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Password corrente non corretta" });
      }

      // Hash new password and update
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(userId, hashedNewPassword);

      res.json({ message: "Password aggiornata con successo" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Errore durante il cambio password" });
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
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      const userId = (session.sess as any).userId;
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
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      const userId = (session.sess as any).userId;
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
      
      // FALLBACK: Calculate missing data if AI doesn't provide it
      const calculateIdealWeight = (height: number, age: number): number => {
        // Formula di Robinson per donne 
        let idealWeight = 49 + (1.7 * (height - 152.4) / 2.54);
        // Correzione per età
        if (age > 30) {
          const ageCorrection = (age - 30) * 0.1;
          idealWeight = idealWeight - ageCorrection;
        }
        return Math.max(45, Math.min(Math.round(idealWeight * 10) / 10, 70));
      };
      
      const createProgressiveSteps = (currentWeight: number, targetWeight: number) => {
        const weightToLose = currentWeight - targetWeight;
        if (weightToLose <= 0) return [];
        
        const steps = [];
        let remainingWeight = weightToLose;
        let currentStepWeight = currentWeight;
        let stepNumber = 1;
        
        while (remainingWeight > 0.5) {
          const stepWeightLoss = remainingWeight > 6 ? 3 : remainingWeight > 3 ? 2 : remainingWeight;
          const stepTarget = currentStepWeight - stepWeightLoss;
          const weeksDuration = Math.ceil(stepWeightLoss / 0.5);
          
          steps.push({
            phaseNumber: stepNumber,
            targetWeight: `${Math.round(stepTarget * 10) / 10}kg`,
            duration: `${weeksDuration} settimane`,
            description: `Fase ${stepNumber}: Perdere ${stepWeightLoss.toFixed(1)}kg in ${weeksDuration} settimane`,
            advice: `Quando raggiungi ${Math.round(stepTarget * 10) / 10}kg, aggiorna immediatamente il tuo peso nell'app per ricalcolare le grammature precise!`
          });
          
          currentStepWeight = stepTarget;
          remainingWeight -= stepWeightLoss;
          stepNumber++;
        }
        return steps;
      };
      
      // Generate fallback data
      const scientificIdealWeight = calculateIdealWeight(validatedProfile.height, validatedProfile.age);
      const progressiveSteps = createProgressiveSteps(validatedProfile.weight, nutritionalNeeds.weightGoal);
      
      const fallbackProgressiveGoals = {
        idealWeightCalculation: `Peso ideale calcolato con formula Robinson per donne (altezza ${validatedProfile.height}cm, età ${validatedProfile.age} anni): ${scientificIdealWeight}kg`,
        comparisonMessage: scientificIdealWeight !== nutritionalNeeds.weightGoal 
          ? `Il tuo peso ideale scientificamente calcolato è ${scientificIdealWeight}kg, diverso dal tuo obiettivo attuale di ${nutritionalNeeds.weightGoal}kg`
          : 'Perfetto! Il tuo obiettivo coincide con il peso ideale calcolato',
        progressiveSteps: progressiveSteps
      };
      
      const fallbackDataInstructions = {
        importance: "FONDAMENTALE: Aggiorna i tuoi dati personali ogni volta che raggiungi un obiettivo intermedio per mantenere le grammature micrometriche sempre precise.",
        whenToUpdate: [
          "Appena raggiungi il peso dell'obiettivo intermedio",
          "Ogni 2-3 settimane per monitorare i progressi", 
          "Se cambi abitudini alimentari o livello di attività fisica",
          "Se hai variazioni significative di peso (anche 500g)"
        ],
        whatToUpdate: [
          "Peso attuale (fondamentale per ricalcolo grammature)",
          "Frequenza esercizio settimanale",
          "Orari dei pasti se cambiati",
          "Preferenze alimentari o esclusioni"
        ],
        whyImportant: "Il sistema Gazzella ricalcola automaticamente le grammature precise per il tuo nuovo peso, garantendo la massima efficacia e personalizzazione. Anche 100g di differenza possono richiedere aggiustamenti nelle porzioni!"
      };
      
      console.log("💡 FALLBACK DATA GENERATED:");
      console.log("🎯 Scientific Ideal Weight:", scientificIdealWeight);
      console.log("📈 Progressive Steps:", progressiveSteps.length);
      console.log("📊 Data Instructions: READY");
      
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
        // New enhanced fields - use fallback data generated by server
        scientificIdealWeight: String(scientificIdealWeight),
        progressiveGoals: fallbackProgressiveGoals,
        dataUpdateInstructions: fallbackDataInstructions,
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

  // Chat endpoint
  app.post("/api/ai-chat/message", isAuthenticated, requireActiveSubscription, async (req: any, res) => {
    try {
      const { message, conversationId } = req.body;
      const userId = (req as any).user.claims.sub;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Messaggio richiesto" });
      }

      console.log("🤖 Chat request from user:", userId);
      console.log("📝 Message:", message);
      console.log("💬 Conversation ID:", conversationId);

      // Fetch user's actual data from database
      const userProfile = await storage.getUserProfile(userId);
      const userMealPlans = await storage.getMealPlansByUser(userId);
      const userRecipes = await storage.getRecipesByUser(userId);
      
      console.log("👤 User profile found:", !!userProfile);
      console.log("📋 Meal plans found:", userMealPlans?.length || 0);
      console.log("🍳 Recipes found:", userRecipes?.length || 0);

      // Get or create conversation
      let currentConversation;
      if (conversationId) {
        currentConversation = await storage.getConversation(conversationId);
      }
      
      if (!currentConversation) {
        console.log("🆕 Creating new conversation...");
        currentConversation = await storage.createConversation({
          userId,
          title: null // Will be generated later based on conversation content
        });
      }

      // Save user message to database
      const userMessage = await storage.createChatMessage({
        conversationId: currentConversation.id,
        role: "user",
        content: message,
        containsHealthWarning: "no"
      });

      // Auto-save important personal information from user message BEFORE AI response
      const personalInfoPatterns = [
        { pattern: /mi chiamo ([a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+)/i, type: "name", title: "Nome utente" },
        { pattern: /sono ([a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+)/i, type: "name", title: "Nome utente" },
        { pattern: /il mio nome è ([a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+)/i, type: "name", title: "Nome utente" }
      ];

      // Check existing memories first
      let userMemories = await storage.getImportantMemories(userId, 6);

      for (const { pattern, type, title } of personalInfoPatterns) {
        const match = message.match(pattern);
        if (match) {
          const value = match[1];
          // Check if we don't already have this information
          const existingNameMemory = userMemories.find(m => m.memoryType === "preference" && m.title === "Nome utente");
          
          if (!existingNameMemory) {
            try {
              await storage.createUserMemory({
                userId,
                memoryType: "preference",
                title: title,
                content: `La cliente si chiama ${value}`,
                importance: 10 // Highest importance for name
              });
              console.log(`💾 Saved ${type}: ${value} to memory`);
              // Refresh memories after saving
              userMemories = await storage.getImportantMemories(userId, 6);
            } catch (error) {
              console.error(`❌ Error saving ${type} to memory:`, error);
            }
          }
        }
      }

      const recentMessages = await storage.getRecentMessagesByUser(userId, 10); // Last 10 messages across all conversations
      
      console.log("🧠 User memories found:", userMemories.length);
      console.log("💭 Recent messages found:", recentMessages.length);

      // Generate response with memory context
      const aiResponse = await generateAIChatResponse({
        userMessage: message,
        userId,
        userProfile,
        mealPlans: userMealPlans,
        recipes: userRecipes,
        conversationHistory: recentMessages,
        userMemories: userMemories,
        conversationId: currentConversation.id
      });

      // Save response to database
      const assistantMessage = await storage.createChatMessage({
        conversationId: currentConversation.id,
        role: "assistant",
        content: aiResponse.response,
        containsHealthWarning: aiResponse.containsHealthWarning ? "yes" : "no"
      });

      // Update conversation timestamp
      await storage.updateConversationLastMessage(currentConversation.id);

      // Mark relevant memories as recently referenced
      for (const memory of userMemories) {
        if (aiResponse.response.toLowerCase().includes(memory.title.toLowerCase()) || 
            aiResponse.response.toLowerCase().includes(memory.content.toLowerCase().substring(0, 50))) {
          await storage.updateUserMemoryLastReferenced(memory.id);
        }
      }

      res.json({
        message: aiResponse.response,
        containsHealthWarning: aiResponse.containsHealthWarning,
        conversationId: currentConversation.id,
        messageId: assistantMessage.id
      });
    } catch (error) {
      console.error("Error in chat:", error);
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
      console.log("🏪 Creating checkout session...");
      console.log("🔑 Stripe Secret Key exists:", !!process.env.STRIPE_SECRET_KEY);
      console.log("🔑 Stripe Secret Key starts with:", process.env.STRIPE_SECRET_KEY?.substring(0, 7));
      
      const userId = (req as any).user.claims.sub;
      const { planId } = req.body;
      
      console.log("👤 User ID:", userId);
      console.log("📦 Plan ID:", planId);
      console.log("📋 Request body:", JSON.stringify(req.body));
      
      if (!planId) {
        console.log("❌ Missing plan ID");
        return res.status(400).json({ message: "Plan ID è obbligatorio" });
      }

      // Get user details
      const user = await storage.getUser(userId);
      if (!user) {
        console.log("❌ User not found");
        return res.status(404).json({ message: "Utente non trovato" });
      }
      console.log("✅ User found:", user.username);

      // Get subscription plan
      console.log("🔍 === CHECKOUT DEBUG START ===");
      const plans = await storage.getSubscriptionPlans();
      console.log("🔍 Raw plans from DB:", JSON.stringify(plans, null, 2));
      console.log("🔍 Plans array length:", plans?.length);
      console.log("🔍 Plans type:", typeof plans);
      console.log("🔍 Is array:", Array.isArray(plans));
      console.log("🔍 Available plan IDs:", plans?.map(p => p.id));
      console.log("🔍 Looking for planId:", planId);
      console.log("🔍 PlanId type:", typeof planId);
      console.log("🔍 === CHECKOUT DEBUG END ===");
      
      let selectedPlan = plans.find(plan => plan.id === planId);
      
      // Fallback: try to find by name or partial match
      if (!selectedPlan) {
        console.log("❌ Plan not found by ID, trying fallback matching...");
        console.log("Available plan IDs:", plans.map(p => p.id));
        
        // Try to match by partial ID (e.g., "monthly" matches "monthly-29")
        selectedPlan = plans.find(plan => 
          plan.id.includes(planId) || planId.includes(plan.id) ||
          plan.name.toLowerCase().includes(planId.toLowerCase())
        );
        
        if (!selectedPlan) {
          // Use first plan as ultimate fallback
          selectedPlan = plans[0];
          console.log("🔄 Using fallback plan:", selectedPlan?.name);
        }
      }
      
      if (!selectedPlan) {
        console.log("❌ No plans available");
        return res.status(404).json({ message: "Nessun piano di abbonamento disponibile" });
      }
      console.log("✅ Plan found:", selectedPlan.name, selectedPlan.priceEur);
      console.log("💳 Stripe Price ID:", selectedPlan.stripePriceId);
      console.log("🌐 Request origin:", req.headers.origin);
      console.log("🌐 Request host:", req.headers.host);

      // If user has already used trial, remove trial period from this plan
      let sessionParams: Stripe.Checkout.SessionCreateParams;
      const hasUsedTrial = user.hasUsedTrial === 'yes';
      const planHasTrial = (selectedPlan.trialDays || 0) > 0;
      


      // Create or get Stripe customer - force sync in production
      let customerId = user.stripeCustomerId;
      console.log("🔍 Current Stripe Customer ID:", customerId);
      
      // Always verify customer exists in Stripe, especially for production
      if (customerId) {
        try {
          const existingCustomer = await stripe.customers.retrieve(customerId);
          console.log("✅ Stripe customer verified:", existingCustomer.id);
          if (existingCustomer.deleted) {
            console.log("⚠️ Customer was deleted, creating new one");
            customerId = null; // Force recreation
          }
        } catch (error) {
          console.log("❌ Stripe customer not found, creating new one:", error);
          customerId = null; // Force recreation
        }
      }
      
      if (!customerId) {
        console.log("🆕 Creating new Stripe customer...");
        const customer = await stripe.customers.create({
          email: user.email || '',
          name: user.username || user.email || 'La Mia Gazzella User',
          metadata: {
            userId: userId,
            environment: process.env.NODE_ENV || 'development'
          }
        });
        customerId = customer.id;
        console.log("✅ New Stripe customer created:", customerId);
        
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
        success_url: `https://lamiagazzella.replit.app/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://lamiagazzella.replit.app/piani-abbonamento`,
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
      
      console.log("🔄 Creating Stripe session with params:", JSON.stringify(sessionParams, null, 2));
      const session = await stripe.checkout.sessions.create(sessionParams);
      console.log("✅ Stripe session created:", session.id);

      res.json({ url: session.url });
    } catch (error) {
      console.error("❌ Error creating checkout session:", error);
      console.error("Error details:", error instanceof Error ? error.message : "Unknown error");
      if (error instanceof Error && 'type' in error) {
        console.error("Stripe error type:", (error as any).type);
        console.error("Stripe error code:", (error as any).code);
      }
      res.status(500).json({ message: "Errore nella creazione della sessione di pagamento", details: error instanceof Error ? error.message : "Unknown error" });
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

  // Manual sync endpoint for troubleshooting
  app.post("/api/sync-user-subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ message: "User or Stripe customer not found" });
      }

      console.log(`🔄 Syncing subscriptions for user ${user.email} (${user.stripeCustomerId})`);

      // Get all subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'all',
        limit: 10
      });

      console.log(`📊 Found ${subscriptions.data.length} subscriptions`);

      if (subscriptions.data.length > 0) {
        const activeSubscription = subscriptions.data.find(sub => 
          sub.status === 'active' || sub.status === 'trialing'
        ) || subscriptions.data[0];

        console.log(`✅ Active subscription found: ${activeSubscription.id} (${activeSubscription.status})`);

        const updateData: any = {
          stripeSubscriptionId: activeSubscription.id,
          subscriptionStatus: activeSubscription.status,
          subscriptionStartDate: new Date(activeSubscription.start_date * 1000),
        };

        // Determine plan based on price
        const priceId = activeSubscription.items.data[0]?.price.id;
        const priceAmount = activeSubscription.items.data[0]?.price.unit_amount; // in cents
        console.log(`💰 Price ID: ${priceId}, Amount: ${priceAmount} cents`);
        
        if (priceId === 'price_1QPNGdFFbqCkTHrmRqyRoNdq') {
          updateData.subscriptionPlan = 'monthly';
        } else if (priceId === 'price_1QPNGsFFbqCkTHrmd0J28nz8') {
          updateData.subscriptionPlan = 'quarterly';
        } else if (priceId === 'price_1QPNHAFFbqCkTHrm3uNWKgDZ') {
          updateData.subscriptionPlan = 'annual';
        } else {
          // Map by amount if price ID doesn't match
          if (priceAmount === 2900) updateData.subscriptionPlan = 'monthly';
          else if (priceAmount === 7900) updateData.subscriptionPlan = 'quarterly';
          else if (priceAmount === 24900) updateData.subscriptionPlan = 'annual';
          else updateData.subscriptionPlan = 'monthly'; // fallback
          
          console.log(`⚠️ Unknown price ID ${priceId}, mapped by amount to: ${updateData.subscriptionPlan}`);
        }

        if (activeSubscription.status === 'trialing' && activeSubscription.trial_end) {
          updateData.trialEndDate = new Date(activeSubscription.trial_end * 1000);
          updateData.hasUsedTrial = 'yes';
          console.log(`📅 Trial end: ${updateData.trialEndDate}`);
        }

        if (activeSubscription.status === 'active' && (activeSubscription as any).current_period_end) {
          updateData.subscriptionEndDate = new Date((activeSubscription as any).current_period_end * 1000);
          console.log(`📅 Subscription end: ${updateData.subscriptionEndDate}`);
        }

        console.log(`🔄 Updating user with:`, JSON.stringify(updateData, null, 2));
        const updatedResult = await storage.updateUserStripeInfo(userId, updateData);
        console.log(`🔄 Update result:`, JSON.stringify(updatedResult, null, 2));
        
        const updatedUser = await storage.getUser(userId);
        console.log(`✅ User after update:`, JSON.stringify({
          subscriptionPlan: updatedUser?.subscriptionPlan,
          subscriptionStatus: updatedUser?.subscriptionStatus,
          stripeSubscriptionId: updatedUser?.stripeSubscriptionId
        }, null, 2));
        
        res.json({ 
          success: true, 
          message: 'Subscription synced successfully',
          user: updatedUser
        });
      } else {
        console.log(`❌ No subscriptions found for customer ${user.stripeCustomerId}`);
        res.json({ 
          success: false, 
          message: 'No subscriptions found for this customer' 
        });
      }

    } catch (error: any) {
      console.error('❌ Sync error:', error);
      res.status(500).json({ error: 'Failed to sync subscription', details: error?.message || 'Sync failed' });
    }
  });

  // Handle Stripe webhooks with proper signature verification
  // Note: express.raw() middleware is now configured globally for this route in server/index.ts
  app.post("/api/stripe-webhook", async (req, res) => {
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

            // Handle trial activation - send card insertion notification
            if (stripeSubscription.status === 'trialing') {
              try {
                const customerEmail = (stripeCustomer as any).email;
                if (customerEmail) {
                  console.log('💳 Trial activated - Processing card insertion notifications...');
                  const shopifyService = getShopifyService();
                  
                  // Tag customer as having inserted card data in Shopify
                  const shopifyTagged = await shopifyService.tagCustomerCardInserted(customerEmail);
                  
                  if (shopifyTagged) {
                    console.log('✅ Customer tagged as card inserted in Shopify:', customerEmail);
                  } else {
                    console.log('⚠️ Shopify card inserted tagging failed (trial continues):', customerEmail);
                  }
                  
                  // Send WhatsApp card insertion notification
                  try {
                    console.log('📱 Sending WhatsApp card insertion notification...');
                    await whatsappService.sendCardInsertedNotification(customerEmail);
                    console.log('✅ WhatsApp card insertion notification sent successfully');
                  } catch (whatsappError: any) {
                    console.error('⚠️ WhatsApp card insertion notification error (trial continues):', whatsappError.message);
                  }
                }
              } catch (trialError: any) {
                console.error('⚠️ Trial activation error (checkout continues):', trialError.message);
              }
            }

            // Tag customer as paid in Shopify and send WhatsApp notification if subscription is active (paid)
            if (stripeSubscription.status === 'active') {
              try {
                const customerEmail = (stripeCustomer as any).email;
                if (customerEmail) {
                  console.log('💰 Tagging customer as paid subscriber in Shopify...');
                  const shopifyService = getShopifyService();
                  const shopifySuccess = await shopifyService.tagCustomerAsPaid(customerEmail);
                  
                  if (shopifySuccess) {
                    console.log('✅ Customer tagged as paid subscriber in Shopify:', customerEmail);
                  } else {
                    console.log('⚠️ Shopify paid tagging failed (checkout continues):', customerEmail);
                  }

                  // Create order in Shopify
                  try {
                    console.log('📦 Creating Shopify order for payment...');
                    const orderSuccess = await shopifyService.createOrder(customerEmail, '29.00', 'Abbonamento La Mia Gazzella - Checkout');
                    if (orderSuccess) {
                      console.log('✅ Shopify order created successfully');
                    } else {
                      console.log('⚠️ Shopify order creation failed (checkout continues)');
                    }
                  } catch (orderError: any) {
                    console.error('⚠️ Shopify order creation error (checkout continues):', orderError.message);
                  }
                  
                  // Send WhatsApp payment notification
                  try {
                    console.log('📱 Sending WhatsApp payment notification...');
                    await whatsappService.sendPaymentNotification(customerEmail, '29.00');
                    console.log('✅ WhatsApp payment notification sent successfully');
                  } catch (whatsappError: any) {
                    console.error('⚠️ WhatsApp payment notification error (checkout continues):', whatsappError.message);
                  }
                }
              } catch (shopifyError: any) {
                console.error('⚠️ Shopify paid tagging error (checkout continues):', shopifyError.message);
              }
            }
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
              
              // Get user email for notifications
              const customer = await stripe.customers.retrieve(subscription.customer as string);
              const userEmail = (customer as any).email;
              
              if (userEmail) {
                // Tag customer as canceled in Shopify
                const shopifyService = getShopifyService();
                await shopifyService.tagCustomerAsCanceled(userEmail);
                
                // Send cancellation notification via WhatsApp
                await whatsappService.sendCancellationNotification(
                  userEmail, 
                  subscription.status === 'unpaid' ? 'Pagamento non riuscito' : 'Cancellazione volontaria'
                );
              }
            }

            await storage.updateUserStripeInfo(targetUser.id, updateData);
            console.log('✅ User subscription updated for userId:', targetUser.id);

            // Tag customer as paid in Shopify and send WhatsApp notification if subscription is now active (payment started)
            if (subscription.status === 'active') {
              try {
                const stripeCustomer = await stripe.customers.retrieve(subscription.customer as string);
                const customerEmail = (stripeCustomer as any).email;
                if (customerEmail) {
                  console.log('💰 Tagging customer as paid subscriber in Shopify (subscription active)...');
                  const shopifyService = getShopifyService();
                  const shopifySuccess = await shopifyService.tagCustomerAsPaid(customerEmail);
                  
                  if (shopifySuccess) {
                    console.log('✅ Customer tagged as paid subscriber in Shopify:', customerEmail);
                  } else {
                    console.log('⚠️ Shopify paid tagging failed (subscription update continues):', customerEmail);
                  }

                  // Create order in Shopify for subscription activation
                  try {
                    console.log('📦 Creating Shopify order for subscription activation...');
                    const orderSuccess = await shopifyService.createOrder(customerEmail, '29.00', 'Abbonamento La Mia Gazzella - Attivazione');
                    if (orderSuccess) {
                      console.log('✅ Shopify order created successfully');
                    } else {
                      console.log('⚠️ Shopify order creation failed (subscription continues)');
                    }
                  } catch (orderError: any) {
                    console.error('⚠️ Shopify order creation error (subscription continues):', orderError.message);
                  }
                  
                  // Send WhatsApp payment notification for subscription activation
                  try {
                    console.log('📱 Sending WhatsApp payment notification (subscription activated)...');
                    await whatsappService.sendPaymentNotification(customerEmail, '29.00');
                    console.log('✅ WhatsApp payment notification sent successfully');
                  } catch (whatsappError: any) {
                    console.error('⚠️ WhatsApp payment notification error (subscription update continues):', whatsappError.message);
                  }
                }
              } catch (shopifyError: any) {
                console.error('⚠️ Shopify paid tagging error (subscription update continues):', shopifyError.message);
              }
            }
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
            
            // Tag customer as canceled in Shopify and send WhatsApp notification
            if (targetUser.email) {
              const shopifyService = getShopifyService();
              await shopifyService.tagCustomerAsCanceled(targetUser.email);
              await whatsappService.sendCancellationNotification(targetUser.email, 'Abbonamento cancellato definitivamente');
            }
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
              
              // Tag customer as paid in Shopify and send WhatsApp notification for successful payments
              try {
                const stripeCustomer = await stripe.customers.retrieve(invoice.customer as string);
                const customerEmail = (stripeCustomer as any).email;
                if (customerEmail) {
                  console.log('💰 Tagging customer as paid subscriber in Shopify (payment succeeded)...');
                  const shopifyService = getShopifyService();
                  const shopifySuccess = await shopifyService.tagCustomerAsPaid(customerEmail);
                  
                  if (shopifySuccess) {
                    console.log('✅ Customer tagged as paid subscriber in Shopify:', customerEmail);
                  } else {
                    console.log('⚠️ Shopify paid tagging failed (payment processing continues):', customerEmail);
                  }

                  // Create order in Shopify for invoice payment
                  try {
                    console.log('📦 Creating Shopify order for invoice payment...');
                    const invoiceAmount = ((invoice as any).amount_paid / 100).toFixed(2); // Convert from cents
                    const orderSuccess = await shopifyService.createOrder(customerEmail, invoiceAmount, 'Abbonamento La Mia Gazzella - Rinnovo');
                    if (orderSuccess) {
                      console.log('✅ Shopify order created successfully');
                    } else {
                      console.log('⚠️ Shopify order creation failed (payment continues)');
                    }
                  } catch (orderError: any) {
                    console.error('⚠️ Shopify order creation error (payment continues):', orderError.message);
                  }
                  
                  // Send WhatsApp payment notification for successful invoice payment
                  try {
                    console.log('📱 Sending WhatsApp payment notification (invoice paid)...');
                    const invoiceAmount = ((invoice as any).amount_paid / 100).toFixed(2); // Convert from cents
                    await whatsappService.sendPaymentNotification(customerEmail, invoiceAmount);
                    console.log('✅ WhatsApp payment notification sent successfully');
                  } catch (whatsappError: any) {
                    console.error('⚠️ WhatsApp payment notification error (payment processing continues):', whatsappError.message);
                  }
                }
              } catch (shopifyError: any) {
                console.error('⚠️ Shopify paid tagging error (payment processing continues):', shopifyError.message);
              }
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
        
        // Tag customer as canceled in Shopify and send WhatsApp notification
        const shopifyService = getShopifyService();
        await shopifyService.tagCustomerAsCanceled(user.email);
        await whatsappService.sendCancellationNotification(user.email, 'Cancellazione richiesta dall\'utente');
        
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
        
        // Tag customer as canceled in Shopify and send WhatsApp notification
        const shopifyService = getShopifyService();
        await shopifyService.tagCustomerAsCanceled(user.email);
        await whatsappService.sendCancellationNotification(user.email, 'Trial gratuito cancellato');
        
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
      
      // TEMPORARY FIX for Maria's account - direct SQL lookup to bypass Drizzle mapping bug
      let actualSubscriptionEndDate = user.subscriptionEndDate;
      console.log(`🔧 Maria check: email=${user.email}, subscriptionEndDate=${user.subscriptionEndDate}`);
      
      if (user.email === 'ayetta@me.com' && !user.subscriptionEndDate) {
        console.log(`🔧 Maria fix: Condition met, executing SQL query...`);
        try {
          const result = await db.execute(sql`
            SELECT subscription_end_date 
            FROM users 
            WHERE email = 'ayetta@me.com'
          `);
          
          console.log(`🔧 SQL result:`, result);
          console.log(`🔧 SQL rows:`, result.rows);
          
          const rawDate = result.rows[0]?.subscription_end_date;
          actualSubscriptionEndDate = rawDate ? new Date(rawDate as string) : null;
          console.log(`🔧 Maria fix: rawDate=${rawDate}, converted=${actualSubscriptionEndDate}`);
        } catch (error) {
          console.error(`🔧 SQL error:`, error);
        }
      } else {
        console.log(`🔧 Maria fix: Condition NOT met`);
      }
      
      // Determine trial status - Fix date comparison
      const isTrialing = user.subscriptionStatus === 'trialing' && 
                         user.trialEndDate && 
                         new Date(user.trialEndDate) > now;
                         
      // Determine active subscription status  
      const isActiveSubscription = user.subscriptionStatus === 'active' &&
                                    actualSubscriptionEndDate &&
                                    new Date(actualSubscriptionEndDate) > now;
                         
      const hasActiveSubscription = isActiveSubscription || isTrialing;

      const subscriptionInfo = {
        hasActiveSubscription: hasActiveSubscription,
        status: user.subscriptionStatus || 'none',
        plan: user.subscriptionPlan || '',
        startDate: user.subscriptionStartDate,
        endDate: actualSubscriptionEndDate,
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
      
      // Get user for notifications
      const cancelUser = await storage.getUser(userId);
      if (cancelUser && cancelUser.email) {
        // Tag customer as canceled in Shopify and send WhatsApp notification
        const shopifyService = getShopifyService();
        await shopifyService.tagCustomerAsCanceled(cancelUser.email);
        await whatsappService.sendCancellationNotification(cancelUser.email, 'Cancellazione programmata - attivo fino a fine periodo');
      }

      res.json({ 
        message: "Abbonamento cancellato. Rimarrà attivo fino alla fine del periodo di fatturazione corrente.",
        endDate: endDate
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Errore nella cancellazione dell'abbonamento" });
    }
  });

  // =================
  // ADMIN DASHBOARD ROUTES
  // =================

  // Admin authentication middleware
  const isAdminAuthenticated = async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: "Token richiesto" });
      }

      // For now, use simple password check - replace with JWT in production
      const adminEmail = req.headers['x-admin-email'];
      if (!adminEmail) {
        return res.status(401).json({ message: "Email admin richiesta" });
      }

      const admin = await storage.getAdminUserByEmail(adminEmail);
      if (!admin || admin.isActive !== 'yes') {
        return res.status(401).json({ message: "Admin non trovato o non attivo" });
      }

      req.admin = admin;
      next();
    } catch (error) {
      console.error("Error in admin auth:", error);
      res.status(401).json({ message: "Autenticazione fallita" });
    }
  };

  // Temporary: Setup admin (remove after setup)
  app.post("/api/admin/setup", async (req, res) => {
    try {
      // Create admin user if doesn't exist
      const existingAdmin = await storage.getAdminUserByEmail("admin@lamiagazzella.com");
      if (existingAdmin) {
        return res.json({ message: "Admin già esistente" });
      }

      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      // Insert directly into DB
      await db.insert(adminUsers).values({
        email: "admin@lamiagazzella.com",
        password: hashedPassword,
        name: "Amministratore",
        role: "super_admin"
      });

      res.json({ message: "Admin creato con successo" });
    } catch (error) {
      console.error("Setup error:", error);
      res.status(500).json({ message: "Errore setup", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email e password richieste" });
      }

      const admin = await storage.getAdminUserByEmail(email);
      if (!admin) {
        return res.status(401).json({ message: "Credenziali non valide" });
      }

      // Temporary: Allow simple password check for admin setup
      const isValidPassword = await bcrypt.compare(password, admin.password) || 
        (email === "admin@lamiagazzella.com" && password === "admin123");
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenziali non valide" });
      }

      // Update last login
      await storage.updateAdminLastLogin(admin.id);

      res.json({
        token: "admin_token", // TODO: Generate JWT
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    } catch (error) {
      console.error("Error in admin login:", error);
      res.status(500).json({ message: "Errore del server" });
    }
  });

  // Get all users for dashboard
  app.get("/api/admin/users", isAdminAuthenticated, async (req: any, res) => {
    try {
      const { page = 1, limit = 20, search, status } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Get all users with profiles and subscription info
      const allUsers = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          subscriptionStatus: users.subscriptionStatus,
          subscriptionPlan: users.subscriptionPlan,
          trialEndDate: users.trialEndDate,
          hasUsedTrial: users.hasUsedTrial,
          createdAt: users.createdAt,
          profile: {
            id: userProfiles.id,
            age: userProfiles.age,
            weight: userProfiles.weight,
            height: userProfiles.height,
          }
        })
        .from(users)
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .limit(parseInt(limit))
        .offset(offset)
        .orderBy(desc(users.createdAt));

      // Get activity logs for each user (last activity)
      const usersWithActivity = await Promise.all(
        allUsers.map(async (user) => {
          const lastActivity = await db
            .select()
            .from(activityLogs)
            .where(eq(activityLogs.userId, user.id))
            .orderBy(desc(activityLogs.createdAt))
            .limit(1);

          return {
            ...user,
            lastActivity: lastActivity[0]?.createdAt || null,
            lastAction: lastActivity[0]?.action || null
          };
        })
      );

      res.json({
        users: usersWithActivity,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          offset
        }
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Errore nel recupero utenti" });
    }
  });

  // Get user details for dashboard
  app.get("/api/admin/users/:userId", isAdminAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;

      // Get user with profile
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Utente non trovato" });
      }

      const profile = await storage.getUserProfile(userId);
      const mealPlans = await storage.getMealPlansByUser(userId);
      const recipes = await storage.getRecipesByUser(userId);
      const activityLogs = await storage.getActivityLogsByUser(userId, 50);
      const conversations = await storage.getConversationsByUser(userId, 10);

      // Get chat messages for recent conversations
      const conversationsWithMessages = await Promise.all(
        conversations.map(async (conv) => {
          const messages = await storage.getMessagesByConversation(conv.id);
          return { ...conv, messages: messages.slice(-10) }; // Last 10 messages
        })
      );

      res.json({
        user,
        profile,
        mealPlans, // Full meal plans data
        recipes, // Full recipes data
        activityLogs,
        conversations: conversationsWithMessages,
        stats: {
          totalMealPlans: mealPlans.length,
          totalRecipes: recipes.length,
          totalActivities: activityLogs.length,
          totalConversations: conversations.length
        }
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ message: "Errore nel recupero dettagli utente" });
    }
  });

  // Get dashboard stats
  app.get("/api/admin/stats", isAdminAuthenticated, async (req: any, res) => {
    try {
      const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
      const activeSubscriptions = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.subscriptionStatus, 'active'));
      const totalMealPlans = await db.select({ count: sql`count(*)` }).from(mealPlans);
      const totalRecipes = await db.select({ count: sql`count(*)` }).from(recipes);

      // Recent activity
      const recentLogs = await storage.getAllActivityLogs(20, 0);

      res.json({
        stats: {
          totalUsers: totalUsers[0].count,
          activeSubscriptions: activeSubscriptions[0].count,
          totalMealPlans: totalMealPlans[0].count,
          totalRecipes: totalRecipes[0].count
        },
        recentActivity: recentLogs
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Errore nel recupero statistiche" });
    }
  });

  console.log("✅ All routes registered successfully including admin dashboard");

  const httpServer = createServer(app);
  return httpServer;
}
