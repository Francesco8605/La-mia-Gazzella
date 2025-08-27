import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  numeric,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
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
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  targetCalories: integer("target_calories"),
  targetProtein: integer("target_protein"),
  targetCarbs: integer("target_carbs"),
  targetFat: integer("target_fat"),
  currentWeight: numeric("current_weight", { precision: 5, scale: 1 }),
  targetWeight: numeric("target_weight", { precision: 5, scale: 1 }),
  weeklyWeightLoss: numeric("weekly_weight_loss", { precision: 3, scale: 1 }),
  days: json("days").$type<MealPlanDay[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  ingredients: json("ingredients").$type<string[]>(),
  instructions: json("instructions").$type<string[]>(),
  servings: integer("servings"),
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  difficulty: text("difficulty"),
  cuisine: text("cuisine"),
  dietaryTags: json("dietary_tags").$type<string[]>(),
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weightEntries = pgTable("weight_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  weight: numeric("weight", { precision: 5, scale: 1 }).notNull(),
  date: timestamp("date").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Types
export type MealPlanDay = {
  date: string;
  day: string;
  meals: {
    breakfast: MealItem;
    lunch: MealItem;
    dinner: MealItem;
    snacks: MealItem[];
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};

export type MealItem = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  recipeId?: string;
};

// Drizzle schemas and types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = typeof mealPlans.$inferInsert;

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

export type WeightEntry = typeof weightEntries.$inferSelect;
export type InsertWeightEntry = typeof weightEntries.$inferInsert;

// Zod schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const insertMealPlanSchema = createInsertSchema(mealPlans);
export const insertRecipeSchema = createInsertSchema(recipes);
export const insertWeightEntrySchema = createInsertSchema(weightEntries);

export type InsertUserProfileType = z.infer<typeof insertUserProfileSchema>;
export type InsertMealPlanType = z.infer<typeof insertMealPlanSchema>;
export type InsertRecipeType = z.infer<typeof insertRecipeSchema>;
export type InsertWeightEntryType = z.infer<typeof insertWeightEntrySchema>;