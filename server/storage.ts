import { type User, type InsertUser, type UserProfile, type InsertUserProfile, type MealPlan, type InsertMealPlan, type Recipe, type InsertRecipe, type WeightEntry, type InsertWeightEntry, type SubscriptionPlan, type InsertSubscriptionPlan, type MealPlanDay, type Session, type Conversation, type InsertConversation, type ChatMessage, type InsertChatMessage, type UserMemory, type InsertUserMemory } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, userProfiles, mealPlans, recipes, weightEntries, subscriptionPlans, sessions, conversations, chatMessages, userMemory } from "@shared/schema";
import { eq, lt, desc, gte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined>;
  getAllUsers?(): Promise<User[]>;
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
  getRecipesByUserId(userId: string): Promise<Recipe[]>;
  getRecipesByTags(tags: string[]): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<boolean>;
  
  // Weight Entries
  getWeightEntryById(id: string): Promise<WeightEntry | undefined>;
  getWeightEntriesByUserId(userId: string): Promise<WeightEntry[]>;
  createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry>;
  deleteWeightEntry(id: string): Promise<boolean>;
  
  // Sessions
  createSession(sessionId: string, userId: string, expiresAt: Date): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<boolean>;
  deleteExpiredSessions(): Promise<void>;
  
  // Stripe Subscription Methods
  updateUserStripeInfo(userId: string, stripeData: { stripeCustomerId?: string; stripeSubscriptionId?: string; subscriptionStatus?: string; subscriptionPlan?: string; subscriptionStartDate?: Date; subscriptionEndDate?: Date; trialEndDate?: Date; hasUsedTrial?: string }): Promise<User | undefined>;
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;

  // Conversations for Laura's long-term memory
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string, limit?: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversationTitle(id: string, title: string): Promise<Conversation | undefined>;
  updateConversationLastMessage(id: string): Promise<Conversation | undefined>;

  // Chat Messages
  getChatMessage(id: string): Promise<ChatMessage | undefined>;
  getMessagesByConversation(conversationId: string): Promise<ChatMessage[]>;
  getRecentMessagesByUser(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // User Memory for Laura's insights
  getUserMemory(userId: string): Promise<UserMemory[]>;
  getUserMemoryByType(userId: string, memoryType: string): Promise<UserMemory[]>;
  createUserMemory(memory: InsertUserMemory): Promise<UserMemory>;
  updateUserMemoryLastReferenced(id: string): Promise<UserMemory | undefined>;
  getImportantMemories(userId: string, minImportance?: number): Promise<UserMemory[]>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, password: hashedPassword };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id,
      stripeCustomerId: insertUser.stripeCustomerId ?? null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId ?? null,
      subscriptionStatus: insertUser.subscriptionStatus ?? null,
      subscriptionPlan: insertUser.subscriptionPlan ?? null,
      subscriptionStartDate: insertUser.subscriptionStartDate ?? null,
      subscriptionEndDate: insertUser.subscriptionEndDate ?? null,
      trialEndDate: insertUser.trialEndDate ?? null,
      hasUsedTrial: insertUser.hasUsedTrial ?? "no",
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
      id,
      userId: insertProfile.userId!,
      createdAt: new Date(),
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
      excludedFoods: insertProfile.excludedFoods ?? [],
      dailyWaterIntake: insertProfile.dailyWaterIntake ?? null,
      cravingTimeFrame: insertProfile.cravingTimeFrame ?? null,
      preferredCheatFood: insertProfile.preferredCheatFood ?? null,
      takingFormulaGazzella: insertProfile.takingFormulaGazzella ?? null,
      dietaryPreferences: insertProfile.dietaryPreferences ?? [],
      healthGoal: insertProfile.healthGoal ?? null,
      activityLevel: insertProfile.activityLevel ?? null,
      allergies: insertProfile.allergies ?? [],
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
      const updatedProfile = {
        ...existingProfile,
        ...profileData,
        weight: profileData.weight !== undefined ? String(profileData.weight) : existingProfile.weight,
      };
      this.userProfiles.set(existingProfile.id, updatedProfile);
      return updatedProfile;
    } else {
      // Create new profile - only if all required fields are provided
      const requiredFields = ['age', 'weight', 'height', 'thyroidIssues', 'intestinalIssues', 'weeklyExercise', 'breakfastTime', 'lunchTime', 'dinnerTime', 'dailyWaterIntake', 'cravingTimeFrame', 'preferredCheatFood', 'takingFormulaGazzella'] as const;
      const hasAllRequired = requiredFields.every(field => profileData[field] !== undefined);
      
      if (!hasAllRequired) {
        throw new Error('Missing required fields for profile creation');
      }
      
      return await this.createUserProfile({ ...profileData, userId } as InsertUserProfile);
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
      currentWeight: insertMealPlan.currentWeight ?? null,
      targetWeight: insertMealPlan.targetWeight ?? null,
      currentBMI: insertMealPlan.currentBMI ?? null,
      bmiCategory: insertMealPlan.bmiCategory ?? null,
      weightToLose: insertMealPlan.weightToLose ?? null,
      estimatedTimeWeeks: insertMealPlan.estimatedTimeWeeks ?? null,
      dietMethod: insertMealPlan.dietMethod ?? null,
      dietPrinciples: (insertMealPlan.dietPrinciples as any) || null,
      expectedResults: insertMealPlan.expectedResults ?? null,
      timeToGoal: insertMealPlan.timeToGoal ?? null,
      scientificIdealWeight: insertMealPlan.scientificIdealWeight ?? null,
      progressiveGoals: insertMealPlan.progressiveGoals as any ?? null,
      dataUpdateInstructions: insertMealPlan.dataUpdateInstructions as any ?? null,
      bmi: insertMealPlan.bmi ?? null,
      idealWeight: insertMealPlan.idealWeight ?? null,
      weightGoal: insertMealPlan.weightGoal ?? null,
      healthStatus: insertMealPlan.healthStatus ?? null,
      startDate: insertMealPlan.startDate ?? null,
      endDate: insertMealPlan.endDate ?? null,
      days: insertMealPlan.days as MealPlanDay[] | null ?? null,
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
      days: updateData.days as MealPlanDay[] | null ?? existingPlan.days,
      dietPrinciples: (updateData.dietPrinciples as any) ?? existingPlan.dietPrinciples,
    } as MealPlan;
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

  async getRecipesByUserId(userId: string): Promise<Recipe[]> {
    return this.getRecipesByUser(userId);
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
      userId: insertRecipe.userId ?? null,
      description: insertRecipe.description ?? null,
      ingredients: insertRecipe.ingredients ? [...insertRecipe.ingredients] as string[] : null,
      instructions: insertRecipe.instructions ? [...insertRecipe.instructions] as string[] : null,
      calories: insertRecipe.calories ?? null,
      protein: insertRecipe.protein ?? null,
      carbs: insertRecipe.carbs ?? null,
      fat: insertRecipe.fat ?? null,
      servings: insertRecipe.servings ?? null,
      prepTime: insertRecipe.prepTime ?? null,
      cookTime: insertRecipe.cookTime ?? null,
      difficulty: insertRecipe.difficulty ?? null,
      cuisine: insertRecipe.cuisine ?? null,
      dietaryTags: insertRecipe.dietaryTags ? [...insertRecipe.dietaryTags] as string[] : null,
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
      ingredients: updateData.ingredients ? [...updateData.ingredients] as string[] : existingRecipe.ingredients,
      instructions: updateData.instructions ? [...updateData.instructions] as string[] : existingRecipe.instructions,
      calories: updateData.calories ?? existingRecipe.calories,
      protein: updateData.protein ?? existingRecipe.protein,
      carbs: updateData.carbs ?? existingRecipe.carbs,
      fat: updateData.fat ?? existingRecipe.fat,
      servings: updateData.servings ?? existingRecipe.servings,
      prepTime: updateData.prepTime ?? existingRecipe.prepTime,
      cookTime: updateData.cookTime ?? existingRecipe.cookTime,
      difficulty: updateData.difficulty ?? existingRecipe.difficulty,
      cuisine: updateData.cuisine ?? existingRecipe.cuisine,
      dietaryTags: updateData.dietaryTags ? [...updateData.dietaryTags] as string[] : existingRecipe.dietaryTags,
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

  // Stripe Subscription Methods
  async updateUserStripeInfo(userId: string, stripeData: any): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...stripeData,
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    // Return default plans for MemStorage
    return [
      {
        id: "monthly",
        name: "Piano Mensile",
        description: "Accesso completo al piano alimentare personalizzato",
        priceMonthly: "29",
        priceEur: "29",
        duration: "monthly",
        stripePriceId: "price_monthly",
        trialDays: 3,
        features: ["Piano alimentare personalizzato", "Assistente IA", "Tracking peso"],
        isActive: "yes",
        createdAt: new Date(),
      }
    ];
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    return plan as SubscriptionPlan;
  }

  // Sessions (in-memory - would be lost on restart)
  private sessions: Map<string, { userId: string, expiresAt: Date }> = new Map();

  async createSession(sessionId: string, userId: string, expiresAt: Date): Promise<Session> {
    const session: Session = {
      sid: sessionId,
      sess: { userId },
      expire: expiresAt
    };
    this.sessions.set(sessionId, { userId, expiresAt });
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const sessionData = this.sessions.get(sessionId);
    if (!sessionData) return undefined;
    
    // Check if session has expired
    if (new Date() > sessionData.expiresAt) {
      this.sessions.delete(sessionId);
      return undefined;
    }
    
    return {
      sid: sessionId,
      sess: { userId: sessionData.userId },
      expire: sessionData.expiresAt
    };
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }

  async deleteExpiredSessions(): Promise<void> {
    const now = new Date();
    const entries = Array.from(this.sessions.entries());
    for (const [sessionId, sessionData] of entries) {
      if (now > sessionData.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // Chat conversation methods - not implemented in MemStorage
  async getConversation(id: string): Promise<Conversation | undefined> {
    return undefined;
  }
  async getConversationsByUser(userId: string, limit?: number): Promise<Conversation[]> {
    return [];
  }
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    return {} as Conversation;
  }
  async updateConversationTitle(id: string, title: string): Promise<Conversation | undefined> {
    return undefined;
  }
  async updateConversationLastMessage(id: string): Promise<Conversation | undefined> {
    return undefined;
  }

  // Chat message methods
  async getChatMessage(id: string): Promise<ChatMessage | undefined> {
    return undefined;
  }
  async getMessagesByConversation(conversationId: string): Promise<ChatMessage[]> {
    return [];
  }
  async getRecentMessagesByUser(userId: string, limit?: number): Promise<ChatMessage[]> {
    return [];
  }
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    return {} as ChatMessage;
  }

  // User memory methods
  async getUserMemory(userId: string): Promise<UserMemory[]> {
    return [];
  }
  async getUserMemoryByType(userId: string, memoryType: string): Promise<UserMemory[]> {
    return [];
  }
  async createUserMemory(memory: InsertUserMemory): Promise<UserMemory> {
    return {} as UserMemory;
  }
  async updateUserMemoryLastReferenced(id: string): Promise<UserMemory | undefined> {
    return undefined;
  }
  async getImportantMemories(userId: string, minImportance?: number): Promise<UserMemory[]> {
    return [];
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
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
      .values(insertProfile as any)
      .returning();
    return profile;
  }

  async updateUserProfile(userId: string, updateData: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    // Convert weight to string if it's a number
    const processedUpdateData = {
      ...updateData,
      weight: updateData.weight !== undefined ? String(updateData.weight) : undefined,
    };
    
    const [profile] = await db
      .update(userProfiles)
      .set(processedUpdateData)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile || undefined;
  }

  async upsertUserProfile(userId: string, profileData: Partial<InsertUserProfile>): Promise<UserProfile> {
    // First try to update existing profile
    const existingProfile = await this.getUserProfile(userId);
    
    if (existingProfile) {
      // Update existing profile
      const updateFields = {
        ...profileData,
        weight: profileData.weight !== undefined ? String(profileData.weight) : undefined,
      };
      const [updatedProfile] = await db
        .update(userProfiles)
        .set(updateFields)
        .where(eq(userProfiles.userId, userId))
        .returning();
      return updatedProfile;
    } else {
      // Create new profile
      const insertFields = {
        ...profileData,
        userId,
        weight: profileData.weight !== undefined ? String(profileData.weight) : undefined,
      };
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

  async getAllRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async getRecipesByUser(userId: string): Promise<Recipe[]> {
    return await db.select().from(recipes).where(eq(recipes.userId, userId));
  }

  async getRecipesByUserId(userId: string): Promise<Recipe[]> {
    return this.getRecipesByUser(userId);
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

  // Stripe Subscription Methods
  async updateUserStripeInfo(userId: string, stripeData: any): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(stripeData)
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, "yes"));
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [subscriptionPlan] = await db
      .insert(subscriptionPlans)
      .values(plan)
      .returning();
    return subscriptionPlan;
  }

  // Sessions
  async createSession(sessionId: string, userId: string, expiresAt: Date): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values({
        sid: sessionId,
        sess: { userId },
        expire: expiresAt
      })
      .returning();
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sid, sessionId));
    
    // Check if session has expired
    if (session && new Date() > session.expire) {
      // Delete expired session
      await this.deleteSession(sessionId);
      return undefined;
    }
    
    return session || undefined;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.sid, sessionId));
    return (result.rowCount || 0) > 0;
  }

  async deleteExpiredSessions(): Promise<void> {
    const now = new Date();
    await db.delete(sessions).where(lt(sessions.expire, now));
  }

  // Conversations for Laura's long-term memory
  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getConversationsByUser(userId: string, limit: number = 10): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(limit);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateConversationTitle(id: string, title: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ title })
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  async updateConversationLastMessage(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  // Chat Messages
  async getChatMessage(id: string): Promise<ChatMessage | undefined> {
    const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return message || undefined;
  }

  async getMessagesByConversation(conversationId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt);
  }

  async getRecentMessagesByUser(userId: string, limit: number = 20): Promise<ChatMessage[]> {
    return await db
      .select({
        id: chatMessages.id,
        conversationId: chatMessages.conversationId,
        role: chatMessages.role,
        content: chatMessages.content,
        containsHealthWarning: chatMessages.containsHealthWarning,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .innerJoin(conversations, eq(chatMessages.conversationId, conversations.id))
      .where(eq(conversations.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  // User Memory for Laura's insights
  async getUserMemory(userId: string): Promise<UserMemory[]> {
    return await db
      .select()
      .from(userMemory)
      .where(eq(userMemory.userId, userId))
      .orderBy(desc(userMemory.importance), desc(userMemory.createdAt));
  }

  async getUserMemoryByType(userId: string, memoryType: string): Promise<UserMemory[]> {
    return await db
      .select()
      .from(userMemory)
      .where(eq(userMemory.userId, userId) && eq(userMemory.memoryType, memoryType))
      .orderBy(desc(userMemory.importance), desc(userMemory.createdAt));
  }

  async createUserMemory(memory: InsertUserMemory): Promise<UserMemory> {
    const [newMemory] = await db
      .insert(userMemory)
      .values(memory)
      .returning();
    return newMemory;
  }

  async updateUserMemoryLastReferenced(id: string): Promise<UserMemory | undefined> {
    const [memory] = await db
      .update(userMemory)
      .set({ lastReferencedAt: new Date() })
      .where(eq(userMemory.id, id))
      .returning();
    return memory || undefined;
  }

  async getImportantMemories(userId: string, minImportance: number = 7): Promise<UserMemory[]> {
    return await db
      .select()
      .from(userMemory)
      .where(eq(userMemory.userId, userId) && gte(userMemory.importance, minImportance))
      .orderBy(desc(userMemory.importance), desc(userMemory.lastReferencedAt));
  }
}

export const storage = new DatabaseStorage();
