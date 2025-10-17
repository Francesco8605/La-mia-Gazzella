import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, json, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(), // Optional field, email is primary identifier
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  // Stripe subscription fields
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status"), // "active", "trialing", "canceled", "expired"
  subscriptionPlan: varchar("subscription_plan"), // "monthly", "quarterly", "annual"
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  trialEndDate: timestamp("trial_end_date"),
  hasUsedTrial: text("has_used_trial").default("no"), // "yes" | "no" - tracks if user ever used a trial
  // Piano alimentare settimana - traccia quale settimana (1-4) è stata usata per ultimo
  weekCounter: integer("week_counter").notNull().default(0), // 0=mai usato, 1-4=settimane, poi ricomincia da 1
  // Limitazione generazione piani - solo uno ogni 168 ore (7 giorni)
  lastMealPlanGeneratedAt: timestamp("last_meal_plan_generated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  // Informazioni di contatto
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  // Dati fisici
  age: integer("age"),
  weight: numeric("weight", { precision: 5, scale: 1 }),
  height: integer("height"),
  // Condizioni di salute (testo libero)
  thyroidIssues: text("thyroid_issues"), // Testo libero per problemi alla tiroide
  intestinalIssues: text("intestinal_issues"), // Testo libero per problemi intestinali
  // Abitudini di esercizio
  weeklyExercise: integer("weekly_exercise"), // volte a settimana
  // Orari dei pasti
  breakfastTime: text("breakfast_time"),
  lunchTime: text("lunch_time"),
  dinnerTime: text("dinner_time"),
  // Preferenze alimentari
  excludedFoods: json("excluded_foods").$type<string[]>(),
  allergies: json("allergies").$type<string[]>(),
  // Abitudini idriche (testo libero)
  dailyWaterIntake: text("daily_water_intake"), // Testo libero per abitudini di idratazione
  // Comportamenti alimentari
  cravingTimeFrame: text("craving_time_frame"),
  preferredCheatFood: text("preferred_cheat_food"),
  // Integratori (testo libero)
  takingFormulaGazzella: text("taking_formula_gazzella"), // Testo libero per uso Formula Gazzella
  // Campi legacy per compatibilità
  dietaryPreferences: json("dietary_preferences").$type<string[]>(),
  healthGoal: text("health_goal"),
  activityLevel: text("activity_level"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mealPlans = pgTable("meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetCalories: integer("target_calories"),
  targetProtein: integer("target_protein"),
  targetCarbs: integer("target_carbs"),
  targetFat: integer("target_fat"),
  // Client profile data for personalization
  currentWeight: numeric("current_weight", { precision: 5, scale: 1 }),
  targetWeight: numeric("target_weight", { precision: 5, scale: 1 }),
  currentBMI: numeric("current_bmi", { precision: 4, scale: 1 }),
  bmiCategory: varchar("bmi_category"),
  weightToLose: numeric("weight_to_lose", { precision: 4, scale: 1 }),
  estimatedTimeWeeks: integer("estimated_time_weeks"),
  // Diet explanation and methodology
  dietMethod: text("diet_method"),
  dietPrinciples: json("diet_principles").$type<string[]>(),
  expectedResults: text("expected_results"),
  timeToGoal: varchar("time_to_goal"),
  // AI-generated personalized summary explaining the Gazzella philosophy for this specific plan
  aiSummary: text("ai_summary"),
  // New fields for enhanced goal tracking
  scientificIdealWeight: numeric("scientific_ideal_weight", { precision: 5, scale: 1 }),
  progressiveGoals: json("progressive_goals").$type<{
    idealWeightCalculation: string;
    comparisonMessage: string;
    progressiveSteps: Array<{
      phaseNumber: number;
      targetWeight: string;
      duration: string;
      description: string;
      advice: string;
    }>;
  }>(),
  dataUpdateInstructions: json("data_update_instructions").$type<{
    importance: string;
    whenToUpdate: string[];
    whatToUpdate: string[];
    whyImportant: string;
  }>(),
  // Legacy fields for backward compatibility
  bmi: text("bmi"),
  idealWeight: integer("ideal_weight"),
  weightGoal: integer("weight_goal"),
  healthStatus: text("health_status"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  days: json("days").$type<MealPlanDay[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weightEntries = pgTable("weight_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  weight: real("weight").notNull(), // peso in kg con decimali
  date: timestamp("date").notNull(),
  notes: text("notes"), // note opzionali
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat conversations for Laura's long-term memory
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title"), // Auto-generated summary of the conversation
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual chat messages within conversations
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  containsHealthWarning: text("contains_health_warning").default("no"), // "yes" | "no"
  createdAt: timestamp("created_at").defaultNow(),
});

// Laura's memory about each user - key insights to remember
export const userMemory = pgTable("user_memory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  memoryType: text("memory_type").notNull(), // "preference", "goal", "progress", "health_note", "success", "challenge"
  title: text("title").notNull(), // Short description
  content: text("content").notNull(), // Detailed memory content
  importance: integer("importance").default(5), // 1-10 scale, 10 being most important
  lastReferencedAt: timestamp("last_referenced_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // Associate recipes with users - nullable for backward compatibility
  title: text("title").notNull(),
  description: text("description"),
  ingredients: json("ingredients").$type<string[]>(),
  instructions: json("instructions").$type<string[]>(),
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  servings: integer("servings"),
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  difficulty: text("difficulty"),
  cuisine: text("cuisine"),
  dietaryTags: json("dietary_tags").$type<string[]>(),
  imageUrl: text("image_url"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stripe subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priceMonthly: numeric("price_monthly", { precision: 8, scale: 2 }),
  priceEur: numeric("price_eur", { precision: 8, scale: 2 }).notNull(),
  duration: varchar("duration").notNull(), // "monthly", "quarterly", "annual"
  stripePriceId: varchar("stripe_price_id").notNull(),
  trialDays: integer("trial_days").default(3),
  features: json("features").$type<string[]>(),
  isActive: text("is_active").default("yes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin Users table for dashboard access
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").default("admin"), // "admin", "super_admin"
  isActive: text("is_active").default("yes"), // "yes", "no"
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity Logs table for tracking user actions
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(), // "login", "register", "trial_start", "subscription_start", "meal_plan_created", "recipe_generated", "chat_message", etc.
  details: json("details").$type<Record<string, any>>(), // Additional context about the action
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shopping Lists table - automatically generated from meal plans
export const shoppingLists = pgTable("shopping_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  mealPlanId: varchar("meal_plan_id").notNull(), // Link to the meal plan
  title: text("title").notNull(), // "Lista della Spesa - Settimana 1"
  weekNumber: integer("week_number"), // Optional week reference
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shopping List Items - individual ingredients with quantities
export const shoppingListItems = pgTable("shopping_list_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shoppingListId: varchar("shopping_list_id").notNull(),
  category: text("category").notNull(), // "Frutta", "Verdura", "Proteine", "Latticini", "Cereali", "Spezie", "Altro"
  name: text("name").notNull(), // "Pollo"
  quantity: text("quantity").notNull(), // "500g" or "2 pezzi"
  isPurchased: text("is_purchased").notNull().default("no"), // "yes" | "no"
  notes: text("notes"), // Optional notes
  order: integer("order").default(0), // For custom ordering
  createdAt: timestamp("created_at").defaultNow(),
});

// Type definitions
export type MealPlanDay = {
  day: string;
  date: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal[];
  };
  totalCalories: number;
};

export type Meal = {
  id: string;
  name: string;
  recipeId?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  username: z.string().optional(), // Make username optional since email is primary identifier
});

export const insertWeightEntrySchema = createInsertSchema(weightEntries).omit({
  id: true,
  createdAt: true,
}).extend({
  userId: z.string().min(1, "User ID è obbligatorio"),
  weight: z.number().min(30, "Il peso deve essere almeno 30kg").max(300, "Il peso deve essere massimo 300kg"),
  date: z.date(),
  notes: z.string().nullable().optional(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
}).extend({
  userId: z.string().min(1, "User ID è obbligatorio").optional(),
  // Informazioni di contatto (opzionali)
  email: z.string().optional(),
  phone: z.string().optional(),
  // Dati fisici
  age: z.number().min(13, "Età minima 13 anni").max(120, "Età massima 120 anni"),
  weight: z.number().min(30, "Peso minimo 30 kg").max(300, "Peso massimo 300 kg"),
  height: z.number().min(100, "Altezza minima 100 cm").max(250, "Altezza massima 250 cm"),
  // Condizioni di salute (testo libero)
  thyroidIssues: z.string().min(1, "Descrivi eventuali problemi alla tiroide o scrivi 'no'"),
  intestinalIssues: z.string().min(1, "Descrivi eventuali problemi intestinali o scrivi 'mai'"),
  // Abitudini di esercizio
  weeklyExercise: z.number().min(0, "Minimo 0 volte").max(14, "Massimo 14 volte a settimana"),
  // Orari dei pasti
  breakfastTime: z.string().min(1, "Inserisci l'orario della colazione"),
  lunchTime: z.string().min(1, "Inserisci l'orario del pranzo"),
  dinnerTime: z.string().min(1, "Inserisci l'orario della cena"),
  // Preferenze alimentari
  excludedFoods: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  // Abitudini idriche (testo libero)
  dailyWaterIntake: z.string().min(1, "Descrivi le tue abitudini di idratazione"),
  // Comportamenti alimentari
  cravingTimeFrame: z.string().min(1, "Inserisci la fascia oraria"),
  preferredCheatFood: z.string().min(1, "Inserisci il tipo di cibo sgarro"),
  // Integratori (testo libero)
  takingFormulaGazzella: z.string().min(1, "Descrivi se e come assumi la Formula Gazzella"),
  // Campi legacy per compatibilità
  dietaryPreferences: z.array(z.string()).default([]),
  healthGoal: z.string().min(1, "Descrivi il tuo obiettivo principale di salute").optional(),
  activityLevel: z.enum(["sedentary", "moderate", "active", "very_active"]).optional(),
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  createdAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);

// Chat schemas
export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertUserMemorySchema = createInsertSchema(userMemory).omit({
  id: true,
  createdAt: true,
  lastReferencedAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;
export type WeightEntry = typeof weightEntries.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type Session = typeof sessions.$inferSelect;

// Chat conversation types
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

export type UserMemory = typeof userMemory.$inferSelect;
export type InsertUserMemory = typeof userMemory.$inferInsert;

// Admin and Activity Log types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// Shopping List schemas
export const insertShoppingListSchema = createInsertSchema(shoppingLists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShoppingListItemSchema = createInsertSchema(shoppingListItems).omit({
  id: true,
  createdAt: true,
});

// Shopping List types
export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type InsertShoppingListItem = z.infer<typeof insertShoppingListItemSchema>;
