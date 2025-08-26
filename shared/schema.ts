import { sql } from "drizzle-orm";
import { 
  index,
  jsonb,
  pgTable, 
  text, 
  varchar, 
  integer, 
  real, 
  json, 
  timestamp, 
  numeric 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication  
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Stripe integration fields
  stripeCustomerId: varchar("stripe_customer_id").unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
  subscriptionStatus: varchar("subscription_status"), // active, cancelled, trial
  trialEndsAt: timestamp("trial_ends_at"),
  hasUsedTrial: integer("has_used_trial").default(0), // 0 = no, 1 = yes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profili nutrizionali legati agli utenti autenticati
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
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

// Piani alimentari legati agli utenti autenticati
export const mealPlans = pgTable("meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
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

// Tracking peso - associato agli utenti autenticati
export const weightEntries = pgTable("weight_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  weight: real("weight").notNull(), // peso in kg con decimali
  date: timestamp("date").notNull(),
  notes: text("notes"), // note opzionali
  createdAt: timestamp("created_at").defaultNow(),
});

// Ricette pubbliche - accessibili a tutti gli utenti abbonati
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }), // Chi ha generato la ricetta
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

// Types per la struttura dei giorni del meal plan
export type MealPlanDay = {
  day: string;
  meals: {
    [mealType: string]: {
      items: string[];
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      portions?: string;
    };
  };
};

// Insert schemas per Zod validation
export const insertUserSchema = createInsertSchema(users);
export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const insertMealPlanSchema = createInsertSchema(mealPlans);
export const insertWeightEntrySchema = createInsertSchema(weightEntries);
export const insertRecipeSchema = createInsertSchema(recipes);

// Update schema for users (for Stripe fields)
export const updateUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof insertUserSchema>;

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;

export type WeightEntry = typeof weightEntries.$inferSelect;
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;