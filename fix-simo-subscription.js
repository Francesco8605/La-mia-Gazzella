// Script urgente per sistemare subscription di simo.d74@gmail.com
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function fixSimoSubscription() {
  try {
    console.log('🔧 Fixing simo.d74@gmail.com subscription...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not found');
    }
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool });
    
    // Find user
    const userResults = await db.select().from(users).where(eq(users.email, 'simo.d74@gmail.com'));
    if (userResults.length === 0) {
      console.log('❌ User simo.d74@gmail.com not found');
      return;
    }
    
    const user = userResults[0];
    console.log('✅ Found user:', user.id);
    
    // Update subscription
    const newEndDate = new Date('2025-10-03T23:59:59.999Z');
    
    await db.update(users)
      .set({
        subscriptionEndDate: newEndDate,
        subscriptionStatus: 'canceled'
      })
      .where(eq(users.id, user.id));
    
    console.log('✅ Subscription updated successfully!');
    console.log('📅 New end date:', newEndDate.toISOString());
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error fixing subscription:', error);
  }
}

fixSimoSubscription();