import { type User, type InsertUser, type UserProfile, type InsertUserProfile, type MealPlan, type InsertMealPlan, type Recipe, type InsertRecipe } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // User Profiles
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  
  // Meal Plans
  getMealPlan(id: string): Promise<MealPlan | undefined>;
  getMealPlansByUser(userId: string): Promise<MealPlan[]>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(id: string, mealPlan: Partial<InsertMealPlan>): Promise<MealPlan | undefined>;
  deleteMealPlan(id: string): Promise<boolean>;
  
  // Recipes
  getRecipe(id: string): Promise<Recipe | undefined>;
  getRecipes(limit?: number, offset?: number): Promise<Recipe[]>;
  getRecipesByTags(tags: string[]): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userProfiles: Map<string, UserProfile>;
  private mealPlans: Map<string, MealPlan>;
  private recipes: Map<string, Recipe>;

  constructor() {
    this.users = new Map();
    this.userProfiles = new Map();
    this.mealPlans = new Map();
    this.recipes = new Map();
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
    const user: User = { ...insertUser, id };
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
      height: insertProfile.height ?? null,
      age: insertProfile.age ?? null,
      weight: insertProfile.weight ?? null,
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
    };
    this.userProfiles.set(existingProfile.id, updatedProfile);
    return updatedProfile;
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
      days: insertMealPlan.days ? Array.from(insertMealPlan.days) : null,
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
      days: updateData.days ? Array.from(updateData.days) : existingPlan.days,
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
      description: insertRecipe.description ?? null,
      ingredients: insertRecipe.ingredients ? Array.from(insertRecipe.ingredients) : null,
      instructions: insertRecipe.instructions ? Array.from(insertRecipe.instructions) : null,
      calories: insertRecipe.calories ?? null,
      protein: insertRecipe.protein ?? null,
      carbs: insertRecipe.carbs ?? null,
      fat: insertRecipe.fat ?? null,
      servings: insertRecipe.servings ?? null,
      prepTime: insertRecipe.prepTime ?? null,
      cookTime: insertRecipe.cookTime ?? null,
      difficulty: insertRecipe.difficulty ?? null,
      cuisine: insertRecipe.cuisine ?? null,
      dietaryTags: insertRecipe.dietaryTags ? Array.from(insertRecipe.dietaryTags) : null,
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
      ingredients: updateData.ingredients ? Array.from(updateData.ingredients) : existingRecipe.ingredients,
      instructions: updateData.instructions ? Array.from(updateData.instructions) : existingRecipe.instructions,
      calories: updateData.calories ?? existingRecipe.calories,
      protein: updateData.protein ?? existingRecipe.protein,
      carbs: updateData.carbs ?? existingRecipe.carbs,
      fat: updateData.fat ?? existingRecipe.fat,
      servings: updateData.servings ?? existingRecipe.servings,
      prepTime: updateData.prepTime ?? existingRecipe.prepTime,
      cookTime: updateData.cookTime ?? existingRecipe.cookTime,
      difficulty: updateData.difficulty ?? existingRecipe.difficulty,
      cuisine: updateData.cuisine ?? existingRecipe.cuisine,
      dietaryTags: updateData.dietaryTags ? Array.from(updateData.dietaryTags) : existingRecipe.dietaryTags,
      imageUrl: updateData.imageUrl ?? existingRecipe.imageUrl,
      rating: updateData.rating ?? existingRecipe.rating,
    };
    this.recipes.set(id, updatedRecipe);
    return updatedRecipe;
  }

  async deleteRecipe(id: string): Promise<boolean> {
    return this.recipes.delete(id);
  }
}

export const storage = new MemStorage();
