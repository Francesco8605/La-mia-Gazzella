import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { getYesterdayBusinessSummary } from "./services/business-metrics";
import { sendDailyBusinessSummary } from "./services/email";

const app = express();
app.use(cookieParser());

// CRITICAL: Webhook MUST be registered BEFORE express.json() middleware
// Stripe webhooks require raw body for signature verification
app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add CORS headers for production deployment
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Initialize daily business summary scheduler
    initializeDailyScheduler();
  });
})();

/**
 * Calculate milliseconds until next 8:00 AM Europe/Rome
 */
function getMillisecondsUntilNext8AM(): number {
  const now = new Date();
  const romeTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
  
  // Create next 8:00 AM in Rome timezone
  const next8AM = new Date(romeTime);
  next8AM.setHours(8, 0, 0, 0);
  
  // If it's already past 8:00 AM today, schedule for tomorrow
  if (romeTime.getHours() >= 8) {
    next8AM.setDate(next8AM.getDate() + 1);
  }
  
  // Convert back to UTC for proper calculation
  const next8AMUTC = new Date(next8AM.getTime() - (next8AM.getTimezoneOffset() * 60000));
  const nowUTC = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  
  const msUntilNext = next8AMUTC.getTime() - nowUTC.getTime();
  
  log(`📅 Daily summary scheduler: Next execution at ${next8AM.toLocaleString('it-IT', { timeZone: 'Europe/Rome' })} (in ${Math.round(msUntilNext / 1000 / 60)} minutes)`);
  
  return msUntilNext;
}

/**
 * Send daily business summary and log results
 */
async function sendDailySummary(): Promise<void> {
  try {
    console.log('🕐 📊 Daily business summary scheduler triggered at:', new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }));
    
    // Get yesterday's business summary
    const businessSummary = await getYesterdayBusinessSummary();
    
    // Send email
    const emailResult = await sendDailyBusinessSummary(businessSummary);
    
    console.log('✅ Daily business summary sent successfully:', {
      messageId: emailResult.messageId,
      date: businessSummary.daily.date,
      totalEvents: businessSummary.daily.newRegistrations + 
                  businessSummary.daily.trialsStarted + 
                  businessSummary.daily.subscriptionsCreated + 
                  businessSummary.daily.subscriptionsRenewed + 
                  businessSummary.daily.subscriptionsCanceled,
      activeSubscriptions: businessSummary.totals.activeSubscriptions
    });
    
  } catch (error: any) {
    console.error('❌ Daily business summary scheduler error:', error);
    // Log error but don't crash the server
  }
}

/**
 * Initialize the daily business summary scheduler
 */
function initializeDailyScheduler(): void {
  console.log('🤖 Initializing daily business summary scheduler (08:00 Europe/Rome)...');
  
  const msUntilFirst = getMillisecondsUntilNext8AM();
  
  // Schedule first execution
  setTimeout(async () => {
    await sendDailySummary();
    
    // Then schedule recurring execution every 24 hours
    setInterval(async () => {
      await sendDailySummary();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    
  }, msUntilFirst);
  
  console.log('✅ Daily business summary scheduler initialized successfully');
}
