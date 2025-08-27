import {
  users,
  userProfiles,
  recipes,
  mealPlans,
  weightEntries,
  type User,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type Recipe,
  type InsertRecipe,
  type MealPlan,
  type InsertMealPlan,
  type WeightEntry,
  type InsertWeightEntry,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createEmailUser(email: string, password: string, firstName?: string, lastName?: string): Promise<User>;
  verifyEmailUser(token: string): Promise<User | undefined>;
  updateEmailVerificationToken(userId: string, token: string): Promise<void>;
  
  // User Profiles
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  upsertUserProfile(userId: string, profileData: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Meal Plans
  getMealPlan(id: string): Promise<MealPlan | undefined>;
  getMealPlansByUser(userId: string): Promise<MealPlan[]>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: string, mealPlan: Partial<InsertMealPlan>): Promise<MealPlan | undefined>;
  deleteMealPlan(id: string): Promise<boolean>;
  
  // Recipes
  getRecipe(id: string): Promise<Recipe | undefined>;
  getRecipes(limit?: number, offset?: number): Promise<Recipe[]>;
  getAllRecipes(): Promise<Recipe[]>;
  getRecipesByUser(userId: string): Promise<Recipe[]>;
  getRecipesByTags(tags: string[]): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<boolean>;
  
  // Weight Entries
  getWeightEntryById(id: string): Promise<WeightEntry | undefined>;
  getWeightEntriesByUserId(userId: string): Promise<WeightEntry[]>;
  createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry>;
  deleteWeightEntry(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
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

  async createEmailUser(email: string, password: string, firstName?: string, lastName?: string): Promise<User> {
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const [user] = await db
      .insert(users)
      .values({
        email,
        password, // In production, questo dovrebbe essere hashato
        firstName,
        lastName,
        authProvider: "email",
        emailVerificationToken: verificationToken,
        emailVerified: null, // null = non verificato
      })
      .returning();
    return user;
  }

  async verifyEmailUser(token: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        emailVerified: new Date(),
        emailVerificationToken: null,
      })
      .where(eq(users.emailVerificationToken, token))
      .returning();
    return user;
  }

  async updateEmailVerificationToken(userId: string, token: string): Promise<void> {
    await db
      .update(users)
      .set({
        emailVerificationToken: token,
      })
      .where(eq(users.id, userId));
  }

  // User Profiles
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, profileData: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set(profileData)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async upsertUserProfile(userId: string, profileData: Partial<InsertUserProfile>): Promise<UserProfile> {
    const existingProfile = await this.getUserProfile(userId);
    
    if (existingProfile) {
      return await this.updateUserProfile(userId, profileData) || existingProfile;
    } else {
      return await this.createUserProfile({ ...profileData, userId } as InsertUserProfile);
    }
  }

  // Meal Plans
  async getMealPlan(id: string): Promise<MealPlan | undefined> {
    const [plan] = await db
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.id, id));
    return plan;
  }

  async getMealPlansByUser(userId: string): Promise<MealPlan[]> {
    return await db
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.userId, userId));
  }

  async createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> {
    const [newPlan] = await db
      .insert(mealPlans)
      .values(mealPlan)
      .returning();
    return newPlan;
  }

  async updateMealPlan(id: string, mealPlanData: Partial<InsertMealPlan>): Promise<MealPlan | undefined> {
    const [updatedPlan] = await db
      .update(mealPlans)
      .set(mealPlanData)
      .where(eq(mealPlans.id, id))
      .returning();
    return updatedPlan;
  }

  async deleteMealPlan(id: string): Promise<boolean> {
    const result = await db
      .delete(mealPlans)
      .where(eq(mealPlans.id, id));
    return result.rowCount > 0;
  }

  // Recipes
  async getRecipe(id: string): Promise<Recipe | undefined> {
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, id));
    return recipe;
  }

  async getRecipes(limit: number = 50, offset: number = 0): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .limit(limit)
      .offset(offset);
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async getRecipesByUser(userId: string): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId));
  }

  async getRecipesByTags(tags: string[]): Promise<Recipe[]> {
    // This would need a more complex query in a real implementation
    // For now, return all recipes
    return await db.select().from(recipes);
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db
      .insert(recipes)
      .values(recipe)
      .returning();
    return newRecipe;
  }

  async updateRecipe(id: string, recipeData: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const [updatedRecipe] = await db
      .update(recipes)
      .set(recipeData)
      .where(eq(recipes.id, id))
      .returning();
    return updatedRecipe;
  }

  async deleteRecipe(id: string): Promise<boolean> {
    const result = await db
      .delete(recipes)
      .where(eq(recipes.id, id));
    return result.rowCount > 0;
  }

  // Weight Entries
  async getWeightEntryById(id: string): Promise<WeightEntry | undefined> {
    const [entry] = await db
      .select()
      .from(weightEntries)
      .where(eq(weightEntries.id, id));
    return entry;
  }

  async getWeightEntriesByUserId(userId: string): Promise<WeightEntry[]> {
    return await db
      .select()
      .from(weightEntries)
      .where(eq(weightEntries.userId, userId));
  }

  async createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry> {
    const [newEntry] = await db
      .insert(weightEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async deleteWeightEntry(id: string): Promise<boolean> {
    const result = await db
      .delete(weightEntries)
      .where(eq(weightEntries.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();