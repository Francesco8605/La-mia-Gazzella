#!/usr/bin/env node

/**
 * Script per sincronizzare gli utenti locali con Stripe LIVE
 * Uso: node sync-stripe-users.js
 */

import { neon } from '@neondatabase/serverless';
import Stripe from 'stripe';

// Verifica che le variabili d'ambiente siano impostate
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL non trovato');
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY non trovato');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function syncUsers() {
  try {
    console.log('🔄 Iniziando sincronizzazione utenti con Stripe...');
    
    // Ottieni tutti gli utenti senza stripeCustomerId
    const users = await sql`
      SELECT id, username, email, stripe_customer_id 
      FROM users 
      WHERE stripe_customer_id IS NULL OR stripe_customer_id = ''
    `;
    
    console.log(`📊 Trovati ${users.length} utenti da sincronizzare`);
    
    for (const user of users) {
      try {
        console.log(`\n👤 Sincronizzando utente: ${user.username} (${user.email})`);
        
        // Cerca se esiste già un customer con questa email
        const existingCustomers = await stripe.customers.list({
          email: user.email,
          limit: 1
        });
        
        let customerId;
        
        if (existingCustomers.data.length > 0) {
          // Customer esiste già
          customerId = existingCustomers.data[0].id;
          console.log(`✅ Customer esistente trovato: ${customerId}`);
        } else {
          // Crea nuovo customer
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.username,
            metadata: {
              userId: user.id,
              source: 'sync-script',
              environment: process.env.NODE_ENV || 'production'
            }
          });
          customerId = customer.id;
          console.log(`🆕 Nuovo customer creato: ${customerId}`);
        }
        
        // Aggiorna il database
        await sql`
          UPDATE users 
          SET stripe_customer_id = ${customerId}
          WHERE id = ${user.id}
        `;
        
        console.log(`✅ Database aggiornato per ${user.username}`);
        
        // Pausa per evitare rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Errore sincronizzando ${user.username}:`, error.message);
      }
    }
    
    console.log('\n🎉 Sincronizzazione completata!');
    
    // Mostra statistiche finali
    const syncedUsers = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE stripe_customer_id IS NOT NULL AND stripe_customer_id != ''
    `;
    
    console.log(`📈 Totale utenti sincronizzati: ${syncedUsers[0].count}`);
    
  } catch (error) {
    console.error('❌ Errore durante la sincronizzazione:', error);
    process.exit(1);
  }
}

// Esegui la sincronizzazione
syncUsers();