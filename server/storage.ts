import { 
  users, 
  userProfiles, 
  mealPlans, 
  recipes, 
  weightEntries,
  type User, 
  type UpsertUser, 
  type UserProfile, 
  type InsertUserProfile, 
  type MealPlan, 
  type InsertMealPlan, 
  type Recipe, 
  type InsertRecipe, 
  type WeightEntry, 
  type InsertWeightEntry 
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations for authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;
  
  // User Profiles (linked to authenticated users)
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  
  // Meal Plans (user-specific)
  getMealPlan(id: string): Promise<MealPlan | undefined>;
  getMealPlansByUser(userId: string): Promise<MealPlan[]>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: string, mealPlan: Partial<InsertMealPlan>): Promise<MealPlan | undefined>;
  deleteMealPlan(id: string): Promise<boolean>;
  
  // Recipes (user-specific)
  getRecipe(id: string): Promise<Recipe | undefined>;
  getRecipesByUser(userId: string, limit?: number, offset?: number): Promise<Recipe[]>;
  getAllRecipes(limit?: number, offset?: number): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<boolean>;
  
  // Weight Entries (user-specific)
  getWeightEntryById(id: string): Promise<WeightEntry | undefined>;
  getWeightEntriesByUser(userId: string): Promise<WeightEntry[]>;
  createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry>;
  deleteWeightEntry(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {

  // User operations for authentication
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // User Profiles
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, updateData: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [profile] = await db
      .update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.userId, userId))
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

  async getMealPlansByUser(userId: string): Promise<MealPlan[]> {
    return await db
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.userId, userId))
      .orderBy(mealPlans.createdAt);
  }

  async createMealPlan(insertMealPlan: InsertMealPlan): Promise<MealPlan> {
    const [mealPlan] = await db
      .insert(mealPlans)
      .values(insertMealPlan)
      .returning();
    return mealPlan;
  }

  async updateMealPlan(id: string, updateData: Partial<InsertMealPlan>): Promise<MealPlan | undefined> {
    const [mealPlan] = await db
      .update(mealPlans)
      .set(updateData)
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

  async getRecipesByUser(userId: string, limit = 20, offset = 0): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(recipes.createdAt);
  }

  async getAllRecipes(limit = 20, offset = 0): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .limit(limit)
      .offset(offset)
      .orderBy(recipes.createdAt);
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const [recipe] = await db
      .insert(recipes)
      .values(insertRecipe)
      .returning();
    return recipe;
  }

  async updateRecipe(id: string, updateData: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const [recipe] = await db
      .update(recipes)
      .set(updateData)
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

  async getWeightEntriesByUser(userId: string): Promise<WeightEntry[]> {
    const entries = await db
      .select()
      .from(weightEntries)
      .where(eq(weightEntries.userId, userId))
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