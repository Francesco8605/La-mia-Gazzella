import { type User, type InsertUser, type UserProfile, type InsertUserProfile, type MealPlan, type InsertMealPlan, type Recipe, type InsertRecipe, type WeightEntry, type InsertWeightEntry } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, userProfiles, mealPlans, recipes, weightEntries } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userProfiles: Map<string, UserProfile>;
  private mealPlans: Map<string, MealPlan>;
  private recipes: Map<string, Recipe>;
  private weightEntries: Map<string, WeightEntry>;

  constructor() {
    this.users = new Map();
    this.userProfiles = new Map();
    this.mealPlans = new Map();
    this.recipes = new Map();
    this.weightEntries = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // User Profiles
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const id = randomUUID();
    const profile: UserProfile = {
      ...insertProfile,
      id,
      createdAt: new Date(),
      // Gestire tutti i nuovi campi con valori di default appropriati
      email: insertProfile.email ?? null,
      phone: insertProfile.phone ?? null,
      height: insertProfile.height ?? null,
      age: insertProfile.age ?? null,
      weight: insertProfile.weight ? String(insertProfile.weight) : null,
      thyroidIssues: insertProfile.thyroidIssues ?? null,
      intestinalIssues: insertProfile.intestinalIssues ?? null,
      weeklyExercise: insertProfile.weeklyExercise ?? null,
      breakfastTime: insertProfile.breakfastTime ?? null,
      lunchTime: insertProfile.lunchTime ?? null,
      dinnerTime: insertProfile.dinnerTime ?? null,
      excludedFoods: insertProfile.excludedFoods ?? null,
      dailyWaterIntake: insertProfile.dailyWaterIntake ?? null,
      cravingTimeFrame: insertProfile.cravingTimeFrame ?? null,
      preferredCheatFood: insertProfile.preferredCheatFood ?? null,
      takingFormulaGazzella: insertProfile.takingFormulaGazzella ?? null,
      dietaryPreferences: insertProfile.dietaryPreferences ?? null,
      healthGoal: insertProfile.healthGoal ?? null,
      activityLevel: insertProfile.activityLevel ?? null,
      allergies: insertProfile.allergies ?? null,
    };
    this.userProfiles.set(id, profile);
    return profile;
  }

  async updateUserProfile(userId: string, updateData: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const existingProfile = await this.getUserProfile(userId);
    if (!existingProfile) return undefined;

    const updatedProfile: UserProfile = {
      ...existingProfile,
      ...updateData,
      // Handle special fields properly
      weight: updateData.weight !== undefined ? String(updateData.weight) : existingProfile.weight,
      excludedFoods: updateData.excludedFoods !== undefined ? updateData.excludedFoods : existingProfile.excludedFoods,
      allergies: updateData.allergies !== undefined ? updateData.allergies : existingProfile.allergies,
    };
    
    this.userProfiles.set(existingProfile.id, updatedProfile);
    console.log("Profile updated successfully:", updatedProfile.id);
    return updatedProfile;
  }

  async upsertUserProfile(userId: string, profileData: Partial<InsertUserProfile>): Promise<UserProfile> {
    // For MemStorage, implement basic upsert logic
    const existingProfile = await this.getUserProfile(userId);
    
    if (existingProfile) {
      // Update existing profile
      const updatedProfile = { ...existingProfile, ...profileData };
      this.userProfiles.set(existingProfile.id, updatedProfile);
      return updatedProfile;
    } else {
      // Create new profile
      return await this.createUserProfile({ ...profileData, userId });
    }
  }

  // Meal Plans
  async getMealPlan(id: string): Promise<MealPlan | undefined> {
    return this.mealPlans.get(id);
  }

  async getMealPlansByUser(userId: string): Promise<MealPlan[]> {
    return Array.from(this.mealPlans.values()).filter(
      (plan) => plan.userId === userId,
    );
  }

  async createMealPlan(insertMealPlan: InsertMealPlan): Promise<MealPlan> {
    const id = randomUUID();
    const mealPlan: MealPlan = {
      ...insertMealPlan,
      id,
      createdAt: new Date(),
      description: insertMealPlan.description ?? null,
      targetCalories: insertMealPlan.targetCalories ?? null,
      targetProtein: insertMealPlan.targetProtein ?? null,
      targetCarbs: insertMealPlan.targetCarbs ?? null,
      targetFat: insertMealPlan.targetFat ?? null,
      startDate: insertMealPlan.startDate ?? null,
      endDate: insertMealPlan.endDate ?? null,
      days: insertMealPlan.days as any ?? null,
    };
    this.mealPlans.set(id, mealPlan);
    return mealPlan;
  }

  async updateMealPlan(id: string, updateData: Partial<InsertMealPlan>): Promise<MealPlan | undefined> {
    const existingPlan = this.mealPlans.get(id);
    if (!existingPlan) return undefined;

    const updatedPlan: MealPlan = {
      ...existingPlan,
      ...updateData,
      description: updateData.description ?? existingPlan.description,
      targetCalories: updateData.targetCalories ?? existingPlan.targetCalories,
      targetProtein: updateData.targetProtein ?? existingPlan.targetProtein,
      targetCarbs: updateData.targetCarbs ?? existingPlan.targetCarbs,
      targetFat: updateData.targetFat ?? existingPlan.targetFat,
      startDate: updateData.startDate ?? existingPlan.startDate,
      endDate: updateData.endDate ?? existingPlan.endDate,
      days: updateData.days as any ?? existingPlan.days,
    };
    this.mealPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteMealPlan(id: string): Promise<boolean> {
    return this.mealPlans.delete(id);
  }

  // Recipes
  async getRecipe(id: string): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getRecipes(limit = 20, offset = 0): Promise<Recipe[]> {
    const allRecipes = Array.from(this.recipes.values());
    return allRecipes.slice(offset, offset + limit);
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipesByUser(userId: string): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter(recipe => recipe.userId === userId);
  }

  async getRecipesByTags(tags: string[]): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter((recipe) =>
      recipe.dietaryTags?.some((tag) => tags.includes(tag)),
    );
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = randomUUID();
    const recipe: Recipe = {
      ...insertRecipe,
      id,
      createdAt: new Date(),
      userId: insertRecipe.userId ?? null, // Support userId for recipe ownership
      description: insertRecipe.description ?? null,
      ingredients: insertRecipe.ingredients as any ?? null,
      instructions: insertRecipe.instructions as any ?? null,
      calories: insertRecipe.calories ?? null,
      protein: insertRecipe.protein ?? null,
      carbs: insertRecipe.carbs ?? null,
      fat: insertRecipe.fat ?? null,
      servings: insertRecipe.servings ?? null,
      prepTime: insertRecipe.prepTime ?? null,
      cookTime: insertRecipe.cookTime ?? null,
      difficulty: insertRecipe.difficulty ?? null,
      cuisine: insertRecipe.cuisine ?? null,
      dietaryTags: insertRecipe.dietaryTags as any ?? null,
      imageUrl: insertRecipe.imageUrl ?? null,
      rating: insertRecipe.rating ?? null,
    };
    this.recipes.set(id, recipe);
    return recipe;
  }

  async updateRecipe(id: string, updateData: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const existingRecipe = this.recipes.get(id);
    if (!existingRecipe) return undefined;

    const updatedRecipe: Recipe = {
      ...existingRecipe,
      ...updateData,
      description: updateData.description ?? existingRecipe.description,
      ingredients: updateData.ingredients as any ?? existingRecipe.ingredients,
      instructions: updateData.instructions as any ?? existingRecipe.instructions,
      calories: updateData.calories ?? existingRecipe.calories,
      protein: updateData.protein ?? existingRecipe.protein,
      carbs: updateData.carbs ?? existingRecipe.carbs,
      fat: updateData.fat ?? existingRecipe.fat,
      servings: updateData.servings ?? existingRecipe.servings,
      prepTime: updateData.prepTime ?? existingRecipe.prepTime,
      cookTime: updateData.cookTime ?? existingRecipe.cookTime,
      difficulty: updateData.difficulty ?? existingRecipe.difficulty,
      cuisine: updateData.cuisine ?? existingRecipe.cuisine,
      dietaryTags: updateData.dietaryTags as any ?? existingRecipe.dietaryTags,
      imageUrl: updateData.imageUrl ?? existingRecipe.imageUrl,
      rating: updateData.rating ?? existingRecipe.rating,
    };
    this.recipes.set(id, updatedRecipe);
    return updatedRecipe;
  }

  async deleteRecipe(id: string): Promise<boolean> {
    return this.recipes.delete(id);
  }

  // Weight Entries
  async getWeightEntryById(id: string): Promise<WeightEntry | undefined> {
    return this.weightEntries.get(id);
  }

  async getWeightEntriesByUserId(userId: string): Promise<WeightEntry[]> {
    return Array.from(this.weightEntries.values()).filter(
      (entry) => entry.userId === userId,
    );
  }

  async createWeightEntry(insertEntry: InsertWeightEntry): Promise<WeightEntry> {
    const id = randomUUID();
    const entry: WeightEntry = {
      ...insertEntry,
      id,
      createdAt: new Date(),
      notes: insertEntry.notes ?? null,
    };
    this.weightEntries.set(id, entry);
    return entry;
  }

  async deleteWeightEntry(id: string): Promise<boolean> {
    return this.weightEntries.delete(id);
  }
}

// DatabaseStorage implementation using PostgreSQL
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // User Profiles
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db
      .insert(userProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async updateUserProfile(userId: string, updateData: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [profile] = await db
      .update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile || undefined;
  }

  async upsertUserProfile(userId: string, profileData: Partial<InsertUserProfile>): Promise<UserProfile> {
    // First try to update existing profile
    const existingProfile = await this.getUserProfile(userId);
    
    if (existingProfile) {
      // Update existing profile
      const updateFields = { ...profileData };
      if (updateFields.weight !== undefined) {
        updateFields.weight = String(updateFields.weight);
      }
      const [updatedProfile] = await db
        .update(userProfiles)
        .set(updateFields)
        .where(eq(userProfiles.userId, userId))
        .returning();
      return updatedProfile;
    } else {
      // Create new profile
      const insertFields = { ...profileData, userId };
      if (insertFields.weight !== undefined) {
        insertFields.weight = String(insertFields.weight);
      }
      const [newProfile] = await db
        .insert(userProfiles)
        .values(insertFields)
        .returning();
      return newProfile;
    }
  }

  // Meal Plans
  async getMealPlan(id: string): Promise<MealPlan | undefined> {
    const [mealPlan] = await db.select().from(mealPlans).where(eq(mealPlans.id, id));
    return mealPlan || undefined;
  }

  async getMealPlansByUser(userId: string): Promise<MealPlan[]> {
    return await db.select().from(mealPlans).where(eq(mealPlans.userId, userId));
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
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe || undefined;
  }

  async getRecipes(limit?: number, offset?: number): Promise<Recipe[]> {
    const baseQuery = db.select().from(recipes);
    
    if (limit !== undefined && offset !== undefined) {
      return await baseQuery.limit(limit).offset(offset);
    } else if (limit !== undefined) {
      return await baseQuery.limit(limit);
    } else if (offset !== undefined) {
      return await baseQuery.offset(offset);
    }
    
    return await baseQuery;
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

  async getWeightEntriesByUserId(userId: string): Promise<WeightEntry[]> {
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
