import { users, sessions, subscriptionPlans, userProfiles, type User, type InsertUser, type SubscriptionPlan, type InsertSubscriptionPlan } from "../shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string }): Promise<void>;
  updateUserSubscription(userId: string, subscriptionData: {
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
    subscriptionPlan?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    trialEndDate?: Date;
    hasUsedTrial?: boolean;
  }): Promise<void>;
  
  // Session operations
  getSession(sessionId: string): Promise<any>;
  createSession(sessionId: string, userId: string, expiryDate: Date): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Subscription plan operations
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string }): Promise<void> {
    await db
      .update(users)
      .set({
        ...stripeInfo,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateUserSubscription(userId: string, subscriptionData: {
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
    subscriptionPlan?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    trialEndDate?: Date;
    hasUsedTrial?: boolean;
  }): Promise<void> {
    await db
      .update(users)
      .set({
        ...subscriptionData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Session operations
  async getSession(sessionId: string): Promise<any> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.sid, sessionId),
        // Check if session is not expired
        eq(sessions.expire, sessions.expire) // This will be handled by cleanup
      ));
    return session;
  }

  async createSession(sessionId: string, userId: string, expiryDate: Date): Promise<void> {
    await db
      .insert(sessions)
      .values({
        sid: sessionId,
        sess: { userId },
        expire: expiryDate,
      })
      .onConflictDoUpdate({
        target: sessions.sid,
        set: {
          sess: { userId },
          expire: expiryDate,
        },
      });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.sid, sessionId));
  }

  // Subscription plan operations
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.createdAt);
    
    // Return with fallback plans if database is empty
    if (plans.length === 0) {
      console.log("No subscription plans found in database, returning fallback plans");
      return [
        {
          id: "monthly-29",
          name: "Piano Mensile",
          description: "Accesso completo al sistema nutrizionale personalizzato La Mia Gazzella",
          priceEur: "29.00",
          duration: "monthly",
          stripePriceId: "price_1QPNGdFFbqCkTHrmRqyRoNdq",
          trialDays: 3,
          features: ["Piani alimentari personalizzati", "Generazione ricette IA", "Tracciamento peso", "Chat assistente nutrizionale", "Supporto email"],
          isActive: true,
          createdAt: new Date("2025-08-26T07:36:24.634Z"),
        },
        {
          id: "quarterly-79",
          name: "Piano Trimestrale",
          description: "Piano trimestrale con risparmio del 10% - il più popolare",
          priceEur: "79.00",
          duration: "quarterly",
          stripePriceId: "price_1QPNGsFFbqCkTHrmd0J28nz8",
          trialDays: 3,
          features: ["Piani alimentari personalizzati", "Generazione ricette IA", "Tracciamento peso", "Chat assistente nutrizionale", "Supporto email prioritario", "10% di risparmio"],
          isActive: true,
          createdAt: new Date("2025-08-26T07:36:24.634Z"),
        },
        {
          id: "annual-249",
          name: "Piano Annuale",
          description: "Piano annuale con massimo risparmio del 29%",
          priceEur: "249.00",
          duration: "annual",
          stripePriceId: "price_1QPNHAFFbqCkTHrm3uNWKgDZ",
          trialDays: 3,
          features: ["Piani alimentari personalizzati", "Generazione ricette IA", "Tracciamento peso", "Chat assistente nutrizionale", "Supporto email prioritario", "29% di risparmio", "Accesso anticipato alle nuove funzionalità"],
          isActive: true,
          createdAt: new Date("2025-08-26T07:36:24.634Z"),
        },
      ];
    }
    
    return plans;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [createdPlan] = await db
      .insert(subscriptionPlans)
      .values(plan)
      .returning();
    return createdPlan;
  }
}

export const storage = new DatabaseStorage();