import { storage } from '../storage';
import { sendContentReadyNotification } from '../services/email';

const CHECK_INTERVAL_MS = 60 * 1000; // Check every 60 seconds

async function processReadyContent() {
  try {
    // Check for meal plans that are ready to be released
    const readyMealPlans = await storage.getProcessingMealPlans();
    
    for (const plan of readyMealPlans) {
      try {
        // Get user email
        const user = await storage.getUser(plan.userId);
        if (!user) {
          console.error(`User not found for meal plan ${plan.id}`);
          continue;
        }

        // Update status to ready
        await storage.updateMealPlanStatus(plan.id, 'ready', 'yes');
        console.log(`✅ Meal plan ${plan.id} released for user ${user.email}`);

        // Send email notification
        if (plan.emailNotificationSent !== 'yes') {
          await sendContentReadyNotification(user.email, 'meal_plan', plan.title);
          console.log(`📧 Email sent to ${user.email} for meal plan "${plan.title}"`);
        }
      } catch (error) {
        console.error(`Error processing meal plan ${plan.id}:`, error);
      }
    }

    // Check for recipes that are ready to be released
    const readyRecipes = await storage.getProcessingRecipes();
    
    for (const recipe of readyRecipes) {
      try {
        if (!recipe.userId) {
          console.error(`Recipe ${recipe.id} has no userId`);
          continue;
        }

        // Get user email
        const user = await storage.getUser(recipe.userId);
        if (!user) {
          console.error(`User not found for recipe ${recipe.id}`);
          continue;
        }

        // Update status to ready
        await storage.updateRecipeStatus(recipe.id, 'ready', 'yes');
        console.log(`✅ Recipe ${recipe.id} released for user ${user.email}`);

        // Send email notification
        if (recipe.emailNotificationSent !== 'yes') {
          await sendContentReadyNotification(user.email, 'recipe', recipe.title);
          console.log(`📧 Email sent to ${user.email} for recipe "${recipe.title}"`);
        }
      } catch (error) {
        console.error(`Error processing recipe ${recipe.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in content release job:', error);
  }
}

export function startContentReleaseJob() {
  console.log('🚀 Starting content release job (checking every 60 seconds)');
  
  // Run immediately on startup
  processReadyContent();
  
  // Then run periodically
  setInterval(processReadyContent, CHECK_INTERVAL_MS);
}
