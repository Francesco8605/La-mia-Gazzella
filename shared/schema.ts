import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, json, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  // Informazioni di contatto
  email: text("email"),
  phone: text("phone"),
  // Dati fisici
  age: integer("age"),
  weight: numeric("weight", { precision: 5, scale: 1 }),
  height: integer("height"),
  // Condizioni di salute
  thyroidIssues: text("thyroid_issues"), // "si" | "no" | "eutirox"
  intestinalIssues: text("intestinal_issues"), // "mai" | "qualche_volta" | "spesso"
  // Abitudini di esercizio
  weeklyExercise: integer("weekly_exercise"), // volte a settimana
  // Orari dei pasti
  breakfastTime: text("breakfast_time"),
  lunchTime: text("lunch_time"),
  dinnerTime: text("dinner_time"),
  // Preferenze alimentari
  excludedFoods: json("excluded_foods").$type<string[]>(),
  allergies: json("allergies").$type<string[]>(),
  // Abitudini idriche
  dailyWaterIntake: text("daily_water_intake"), // "si" | "no"
  // Comportamenti alimentari
  cravingTimeFrame: text("craving_time_frame"),
  preferredCheatFood: text("preferred_cheat_food"),
  // Integratori
  takingFormulaGazzella: text("taking_formula_gazzella"), // "si" | "no" | "ho_iniziato"
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
  // Condizioni di salute
  thyroidIssues: z.enum(["no", "si", "eutirox"], {
    errorMap: () => ({ message: "Seleziona un'opzione valida" })
  }),
  intestinalIssues: z.enum(["mai", "qualche_volta", "spesso"], {
    errorMap: () => ({ message: "Seleziona un'opzione valida" })
  }),
  // Abitudini di esercizio
  weeklyExercise: z.number().min(0, "Minimo 0 volte").max(14, "Massimo 14 volte a settimana"),
  // Orari dei pasti
  breakfastTime: z.string().min(1, "Inserisci l'orario della colazione"),
  lunchTime: z.string().min(1, "Inserisci l'orario del pranzo"),
  dinnerTime: z.string().min(1, "Inserisci l'orario della cena"),
  // Preferenze alimentari
  excludedFoods: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  // Abitudini idriche
  dailyWaterIntake: z.enum(["si", "no"], {
    errorMap: () => ({ message: "Seleziona un'opzione valida" })
  }),
  // Comportamenti alimentari
  cravingTimeFrame: z.string().min(1, "Inserisci la fascia oraria"),
  preferredCheatFood: z.string().min(1, "Inserisci il tipo di cibo sgarro"),
  // Integratori
  takingFormulaGazzella: z.enum(["no", "si", "ho_iniziato"], {
    errorMap: () => ({ message: "Seleziona un'opzione valida" })
  }),
  // Campi legacy per compatibilità
  dietaryPreferences: z.array(z.string()).default([]),
  healthGoal: z.enum(["weight_loss", "weight_gain", "muscle_building", "maintenance", "general_health"]).optional(),
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
