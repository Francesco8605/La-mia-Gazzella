import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  age: integer("age"),
  weight: integer("weight"),
  height: integer("height"),
  dietaryPreferences: json("dietary_preferences").$type<string[]>(),
  healthGoal: text("health_goal"),
  activityLevel: text("activity_level"),
  allergies: json("allergies").$type<string[]>(),
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
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  days: json("days").$type<MealPlanDay[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
}).extend({
  age: z.number().min(13).max(120),
  weight: z.number().min(30).max(300),
  height: z.number().min(100).max(250).optional(),
  dietaryPreferences: z.array(z.string()).default([]),
  healthGoal: z.enum(["weight_loss", "weight_gain", "muscle_building", "maintenance", "general_health"]),
  activityLevel: z.enum(["sedentary", "moderate", "active", "very_active"]),
  allergies: z.array(z.string()).default([]),
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  createdAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
