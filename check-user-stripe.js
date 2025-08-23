import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

async function checkUserStripeStatus() {
  console.log('🔍 CONTROLLO STATO STRIPE UTENTE');
  console.log('================================');
  
  const customerId = 'cus_Sv4s1PLeE3vGPD';
  
  try {
    // 1. Controllo customer
    console.log('1️⃣ Verifica customer Stripe...');
    const customer = await stripe.customers.retrieve(customerId);
    console.log('✅ Customer trovato:', customer.id);
    console.log('📧 Email:', customer.email);
    console.log('👤 Nome:', customer.name);
    
    // 2. Controllo sottoscrizioni
    console.log('\n2️⃣ Verifica sottoscrizioni...');
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10
    });
    
    console.log('📊 Sottoscrizioni trovate:', subscriptions.data.length);
    
    if (subscriptions.data.length > 0) {
      subscriptions.data.forEach((sub, index) => {
        console.log(`\n📋 Sottoscrizione ${index + 1}:`);
        console.log('   ID:', sub.id);
        console.log('   Status:', sub.status);
        console.log('   Created:', new Date(sub.created * 1000).toLocaleString('it-IT'));
        if (sub.trial_end) {
          console.log('   Trial end:', new Date(sub.trial_end * 1000).toLocaleString('it-IT'));
        }
        console.log('   Current period:', 
          new Date(sub.current_period_start * 1000).toLocaleString('it-IT'), 
          'to', 
          new Date(sub.current_period_end * 1000).toLocaleString('it-IT'));
        
        if (sub.items && sub.items.data.length > 0) {
          const price = sub.items.data[0].price;
          console.log('   Amount:', price.unit_amount / 100, price.currency.toUpperCase());
          console.log('   Interval:', price.recurring?.interval);
        }
      });
    } else {
      console.log('⚠️ Nessuna sottoscrizione trovata');
    }
    
    // 3. Controllo sessioni di checkout recenti
    console.log('\n3️⃣ Verifica sessioni checkout recenti...');
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 10
    });
    
    console.log('📊 Sessioni checkout trovate:', sessions.data.length);
    
    if (sessions.data.length > 0) {
      sessions.data.forEach((session, index) => {
        console.log(`\n🛒 Sessione ${index + 1}:`);
        console.log('   ID:', session.id);
        console.log('   Status:', session.status);
        console.log('   Payment status:', session.payment_status);
        console.log('   Created:', new Date(session.created * 1000).toLocaleString('it-IT'));
        if (session.subscription) {
          console.log('   Subscription ID:', session.subscription);
        }
        console.log('   Success URL:', session.success_url);
      });
    }
    
    // 4. Controllo pagamenti
    console.log('\n4️⃣ Verifica pagamenti...');
    const payments = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 5
    });
    
    console.log('💳 Payment intents trovati:', payments.data.length);
    
    if (payments.data.length > 0) {
      payments.data.forEach((payment, index) => {
        console.log(`\n💰 Payment ${index + 1}:`);
        console.log('   ID:', payment.id);
        console.log('   Status:', payment.status);
        console.log('   Amount:', payment.amount / 100, payment.currency.toUpperCase());
        console.log('   Created:', new Date(payment.created * 1000).toLocaleString('it-IT'));
      });
    }
    
    // 5. Raccomandazioni
    console.log('\n🎯 DIAGNOSI E RACCOMANDAZIONI:');
    console.log('===============================');
    
    if (subscriptions.data.length === 0) {
      console.log('❌ PROBLEMA: Nessuna sottoscrizione attiva');
      console.log('🔧 SOLUZIONE: L\'utente deve completare il checkout o crearne uno nuovo');
    } else {
      const activeSub = subscriptions.data.find(sub => 
        sub.status === 'active' || sub.status === 'trialing');
      
      if (activeSub) {
        console.log('✅ SOTTOSCRIZIONE ATTIVA TROVATA');
        console.log('🔧 SOLUZIONE: Aggiornare database con ID sottoscrizione:', activeSub.id);
        console.log('📋 Status da impostare:', activeSub.status);
      } else {
        console.log('⚠️ SOTTOSCRIZIONI ESISTONO MA NON SONO ATTIVE');
        console.log('🔧 SOLUZIONE: Verificare perché le sottoscrizioni non sono attive');
      }
    }
    
  } catch (error) {
    console.error('❌ ERRORE:', error.message);
  }
}

checkUserStripeStatus();