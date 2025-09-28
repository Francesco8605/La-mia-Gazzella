import { storage } from "../storage";
import { db } from "../db";
import { users, activityLogs } from "@shared/schema";
import { sql, and, gte, lt, eq } from "drizzle-orm";

// Types for metrics
interface DailyMetrics {
  date: string;
  newRegistrations: number;
  trialsStarted: number;
  subscriptionsCreated: number;
  subscriptionsRenewed: number;
  subscriptionsCanceled: number;
}

interface TotalMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  trialUsers: number;
  canceledUsers: number;
  churnedUsers: number; // Canceled with end date <= now
}

interface BusinessSummary {
  daily: DailyMetrics;
  totals: TotalMetrics;
  generatedAt: string;
  timeZone: string;
}

/**
 * Calculate metrics for a specific date
 */
export async function getDailyMetrics(targetDate: Date): Promise<DailyMetrics> {
  // Set time boundaries for the target date (00:00:00 to 23:59:59)
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  console.log(`📊 Calculating daily metrics for ${targetDate.toISOString().split('T')[0]} (${startOfDay.toISOString()} to ${endOfDay.toISOString()})`);

  try {
    // Get activity counts for the day
    const [
      registrations,
      trialsStarted,
      subscriptionsCreated,
      subscriptionsRenewed,
      subscriptionsCanceled
    ] = await Promise.all([
      // New registrations
      db.select({ count: sql<number>`count(*)` })
        .from(activityLogs)
        .where(and(
          eq(activityLogs.action, 'user_registration'),
          gte(activityLogs.createdAt, startOfDay),
          lt(activityLogs.createdAt, endOfDay)
        )),
      
      // Trials started
      db.select({ count: sql<number>`count(*)` })
        .from(activityLogs)
        .where(and(
          eq(activityLogs.action, 'trial_started'),
          gte(activityLogs.createdAt, startOfDay),
          lt(activityLogs.createdAt, endOfDay)
        )),
      
      // Subscriptions created (trial to premium)
      db.select({ count: sql<number>`count(*)` })
        .from(activityLogs)
        .where(and(
          eq(activityLogs.action, 'subscription_created'),
          gte(activityLogs.createdAt, startOfDay),
          lt(activityLogs.createdAt, endOfDay)
        )),
      
      // Subscriptions renewed
      db.select({ count: sql<number>`count(*)` })
        .from(activityLogs)
        .where(and(
          eq(activityLogs.action, 'subscription_renewed'),
          gte(activityLogs.createdAt, startOfDay),
          lt(activityLogs.createdAt, endOfDay)
        )),
      
      // Subscriptions canceled
      db.select({ count: sql<number>`count(*)` })
        .from(activityLogs)
        .where(and(
          eq(activityLogs.action, 'subscription_canceled'),
          gte(activityLogs.createdAt, startOfDay),
          lt(activityLogs.createdAt, endOfDay)
        ))
    ]);

    const dailyMetrics: DailyMetrics = {
      date: targetDate.toISOString().split('T')[0],
      newRegistrations: registrations[0]?.count || 0,
      trialsStarted: trialsStarted[0]?.count || 0,
      subscriptionsCreated: subscriptionsCreated[0]?.count || 0,
      subscriptionsRenewed: subscriptionsRenewed[0]?.count || 0,
      subscriptionsCanceled: subscriptionsCanceled[0]?.count || 0
    };

    console.log('📊 Daily metrics calculated:', dailyMetrics);
    return dailyMetrics;
  } catch (error) {
    console.error('❌ Error calculating daily metrics:', error);
    throw error;
  }
}

/**
 * Calculate total business metrics
 */
export async function getTotalMetrics(): Promise<TotalMetrics> {
  console.log('📊 Calculating total business metrics...');
  
  try {
    const now = new Date();
    
    // Get all users and calculate metrics in memory (since current scale supports it)
    const allUsers = await db.select({
      subscriptionStatus: users.subscriptionStatus,
      trialEndDate: users.trialEndDate,
      subscriptionEndDate: users.subscriptionEndDate
    }).from(users);

    let totalUsers = allUsers.length;
    let activeSubscriptions = 0;
    let trialUsers = 0;
    let canceledUsers = 0;
    let churnedUsers = 0; // Canceled users whose subscription has actually ended

    allUsers.forEach(user => {
      const trialDate = user.trialEndDate ? new Date(user.trialEndDate) : null;
      const endDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;

      if (user.subscriptionStatus === 'trialing' && trialDate && trialDate.getTime() > now.getTime()) {
        // Active trial user
        trialUsers++;
        activeSubscriptions++; // Trial users still have access
      } else if (user.subscriptionStatus === 'active') {
        // Premium active user
        activeSubscriptions++;
      } else if (user.subscriptionStatus === 'canceled') {
        canceledUsers++;
        
        // Check if canceled user still has access (subscription hasn't ended yet)
        if (endDate && endDate.getTime() > now.getTime()) {
          activeSubscriptions++; // Still has access until end date
        } else {
          churnedUsers++; // Actually churned - no access
        }
      }
    });

    const totalMetrics: TotalMetrics = {
      totalUsers,
      activeSubscriptions,
      trialUsers,
      canceledUsers,
      churnedUsers
    };

    console.log('📊 Total metrics calculated:', totalMetrics);
    return totalMetrics;
  } catch (error) {
    console.error('❌ Error calculating total metrics:', error);
    throw error;
  }
}

/**
 * Get complete business summary for a specific date
 */
export async function getBusinessSummary(targetDate?: Date): Promise<BusinessSummary> {
  const summaryDate = targetDate || new Date();
  
  console.log(`📊 Generating business summary for ${summaryDate.toISOString().split('T')[0]}`);
  
  const [daily, totals] = await Promise.all([
    getDailyMetrics(summaryDate),
    getTotalMetrics()
  ]);

  return {
    daily,
    totals,
    generatedAt: new Date().toISOString(),
    timeZone: 'Europe/Rome'
  };
}

/**
 * Get yesterday's business summary (useful for morning reports)
 */
export async function getYesterdayBusinessSummary(): Promise<BusinessSummary> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return getBusinessSummary(yesterday);
}