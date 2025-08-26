import { type UserProfile, type InsertUserProfile, type MealPlan, type InsertMealPlan, type Recipe, type InsertRecipe, type WeightEntry, type InsertWeightEntry, type MealPlanDay } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { userProfiles, mealPlans, recipes, weightEntries } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User Profiles (anonymous)
  getUserProfile(id: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(id: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  
  // Meal Plans (public access)
  getMealPlan(id: string): Promise<MealPlan | undefined>;
  getAllMealPlans(): Promise<MealPlan[]>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: string, mealPlan: Partial<InsertMealPlan>): Promise<MealPlan | undefined>;
  deleteMealPlan(id: string): Promise<boolean>;
  
  // Recipes (public access)
  getRecipe(id: string): Promise<Recipe | undefined>;
  getRecipes(limit?: number, offset?: number): Promise<Recipe[]>;
  getAllRecipes(): Promise<Recipe[]>;
  getRecipesByTags(tags: string[]): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<boolean>;
  
  // Weight Entries (linked to profiles)
  getWeightEntryById(id: string): Promise<WeightEntry | undefined>;
  getWeightEntriesByProfile(profileId: string): Promise<WeightEntry[]>;
  createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry>;
  deleteWeightEntry(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {

  // User Profiles
  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, id));
    return profile || undefined;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateUserProfile(id: string, updateData: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [profile] = await db
      .update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.id, id))
      .returning();
    return profile || undefined;
  }

  // Meal Plans
  async getMealPlan(id: string): Promise<MealPlan | undefined> {
    const [plan] = await db
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.id, id));
    return plan || undefined;
  }

  async getAllMealPlans(): Promise<MealPlan[]> {
    return await db
      .select()
      .from(mealPlans)
      .orderBy(mealPlans.createdAt);
  }

  async createMealPlan(insertMealPlan: InsertMealPlan): Promise<MealPlan> {
    const [mealPlan] = await db
      .insert(mealPlans)
      .values(insertMealPlan as any)
      .returning();
    return mealPlan;
  }

  async updateMealPlan(id: string, updateData: Partial<InsertMealPlan>): Promise<MealPlan | undefined> {
    const [mealPlan] = await db
      .update(mealPlans)
      .set(updateData as any)
      .where(eq(mealPlans.id, id))
      .returning();
    return mealPlan || undefined;
  }

  async deleteMealPlan(id: string): Promise<boolean> {
    const result = await db.delete(mealPlans).where(eq(mealPlans.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Recipes
  async getRecipe(id: string): Promise<Recipe | undefined> {
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, id));
    return recipe || undefined;
  }

  async getRecipes(limit = 20, offset = 0): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .limit(limit)
      .offset(offset)
      .orderBy(recipes.createdAt);
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async getRecipesByTags(tags: string[]): Promise<Recipe[]> {
    // For simplicity, we'll filter recipes that contain any of the provided tags
    const allRecipes = await db.select().from(recipes);
    return allRecipes.filter(recipe => 
      recipe.dietaryTags && recipe.dietaryTags.some(tag => tags.includes(tag))
    );
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const [recipe] = await db
      .insert(recipes)
      .values(insertRecipe as any)
      .returning();
    return recipe;
  }

  async updateRecipe(id: string, updateData: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const [recipe] = await db
      .update(recipes)
      .set(updateData as any)
      .where(eq(recipes.id, id))
      .returning();
    return recipe || undefined;
  }

  async deleteRecipe(id: string): Promise<boolean> {
    const result = await db.delete(recipes).where(eq(recipes.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Weight Entries  
  async getWeightEntryById(id: string): Promise<WeightEntry | undefined> {
    const [entry] = await db.select().from(weightEntries).where(eq(weightEntries.id, id));
    return entry || undefined;
  }

  async getWeightEntriesByProfile(profileId: string): Promise<WeightEntry[]> {
    const entries = await db
      .select()
      .from(weightEntries)
      .where(eq(weightEntries.profileId, profileId))
      .orderBy(weightEntries.date);
    return entries;
  }

  async createWeightEntry(insertEntry: InsertWeightEntry): Promise<WeightEntry> {
    const [entry] = await db
      .insert(weightEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async deleteWeightEntry(id: string): Promise<boolean> {
    const result = await db.delete(weightEntries).where(eq(weightEntries.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();