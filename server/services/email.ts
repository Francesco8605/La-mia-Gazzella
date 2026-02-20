import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Create transporter using Gmail SMTP
const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
    throw new Error('Gmail credentials not configured');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD
    }
  });
};

// Send welcome email to new registrations
export async function sendWelcomeEmail(email: string, username: string) {
  try {
    const transporter = createTransporter();
    
    // Setup logo attachment
    const logoPath = path.join(process.cwd(), 'client/src/immagini/Logo-gazzella.jpg');
    console.log('🖼️ Reading logo from:', logoPath);
    
    let logoAttachment = null;
    try {
      if (fs.existsSync(logoPath)) {
        logoAttachment = {
          filename: 'logo-gazzella.jpg',
          path: logoPath,
          cid: 'logo-gazzella' // Content-ID per referenziare nell'HTML
        };
        console.log('✅ Logo attachment prepared');
      }
    } catch (logoError: any) {
      console.error('❌ Error preparing logo:', logoError.message);
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Benvenuta in La Mia Gazzella!</title>
      </head>
      <body style="font-family: 'Georgia', serif; background-color: #f8f9fa; padding: 20px; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 8px 25px rgba(45, 80, 22, 0.1); overflow: hidden;">
          
          <!-- Header con logo e benvenuto -->
          <div style="background: linear-gradient(135deg, #2d5016 0%, #22c55e 100%); color: white; padding: 40px 30px; text-align: center;">
            ${logoAttachment ? `<img src="cid:logo-gazzella" 
                 alt="La Mia Gazzella Logo" 
                 style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; border: 3px solid rgba(255,255,255,0.3);">` : ''}
            <h1 style="margin: 0; font-size: 2.2em; font-weight: bold;">La Mia Gazzella</h1>
            <p style="margin: 10px 0 0 0; font-size: 1.1em; opacity: 0.9;">Il tuo viaggio verso il benessere inizia qui</p>
          </div>
          
          <!-- Contenuto principale -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d5016; margin-bottom: 20px; font-size: 1.8em;">Benvenuta ${username}! 🌟</h2>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
              Grazie per esserti unita alla famiglia <strong>La Mia Gazzella</strong>! Sei pronta a trasformare la tua alimentazione con un approccio personalizzato e scientifico.
            </p>

            <!-- Cosa puoi fare con l'app -->
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #22c55e;">
              <h3 style="color: #2d5016; margin-top: 0; margin-bottom: 20px;">🎯 Cosa puoi fare con La Mia Gazzella:</h3>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #2d5016;">🍽️ Piani Pasto Personalizzati</strong><br>
                <span style="color: #666; font-size: 14px;">Ricevi piani nutrizionali creati su misura per le tue esigenze, obiettivi e preferenze alimentari</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #2d5016;">🤖 Consulente "Laura"</strong><br>
                <span style="color: #666; font-size: 14px;">Chatta con Laura, la tua nutrizionista virtuale sempre disponibile per consigli e domande</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #2d5016;">📊 Monitoraggio Peso</strong><br>
                <span style="color: #666; font-size: 14px;">Traccia i tuoi progressi con grafici dettagliati e analisi dell'andamento</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #2d5016;">🧪 Formula Gazzella</strong><br>
                <span style="color: #666; font-size: 14px;">Integrazione con i nostri integratori specializzati per la menopausa</span>
              </div>
              
              <div>
                <strong style="color: #2d5016;">📱 Accesso Completo</strong><br>
                <span style="color: #666; font-size: 14px;">Tutte le funzionalità disponibili su web e ottimizzate per dispositivi mobili</span>
              </div>
            </div>

            <!-- Prova gratuita -->
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 25px; border-radius: 10px; margin: 30px 0; text-align: center;">
              <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 1.4em;">🎁 La tua prova gratuita di 3 giorni</h3>
              <p style="margin: 0; font-size: 16px; line-height: 1.5;">
                Hai <strong>3 giorni completi</strong> per esplorare tutte le funzionalità senza alcun costo.<br>
                Puoi cancellarti in qualsiasi momento <strong>senza ricevere nessun addebito</strong>.
              </p>
            </div>

            <!-- Informazioni importante -->
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #856404; margin-top: 0; margin-bottom: 12px;">💡 Informazioni Importanti</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">La prova gratuita dura esattamente <strong>3 giorni</strong> dalla registrazione</li>
                <li style="margin-bottom: 8px;">Puoi cancellarti facilmente dalle <strong>Impostazioni Account</strong></li>
                <li style="margin-bottom: 8px;">Nessun addebito fino alla fine del periodo di prova</li>
                <li>Dopo la prova: <strong>€29/mese</strong> per l'accesso completo</li>
              </ul>
            </div>

            <!-- Call to action -->
            <div style="text-align: center; margin: 40px 0 30px 0;">
              <a href="https://lamiagazzella.replit.app/piani-abbonamento" 
                 style="background: linear-gradient(135deg, #2d5016 0%, #22c55e 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(45, 80, 22, 0.3);">
                🚀 Inizia il Tuo Percorso
              </a>
            </div>

            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Hai domande? Siamo qui per aiutarti! Rispondi a questa email per contattare il nostro team.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              <strong>La Mia Gazzella</strong> - Sistema Nutrizionale Personalizzato<br>
              Specializzato per donne in menopausa<br><br>
              Se non hai richiesto questa registrazione, puoi ignorare questa email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"La Mia Gazzella" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Benvenuta in La Mia Gazzella - Il tuo viaggio verso il benessere inizia ora!',
      html: htmlContent,
      ...(logoAttachment && { attachments: [logoAttachment] })
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', email, 'MessageID:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
}

// Send password recovery email
export async function sendPasswordRecoveryEmail(email: string, username: string, password: string) {
  try {
    const transporter = createTransporter();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recupero Password - La Mia Gazzella</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2d5016; margin-bottom: 10px;">🦌 La Mia Gazzella</h1>
            <h2 style="color: #666; margin-top: 0;">Recupero Password</h2>
          </div>
          
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Ciao <strong>${username}</strong>,
          </p>
          
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Hai richiesto il recupero della password per il tuo account La Mia Gazzella.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2d5016;">
            <p style="margin: 0; color: #333; font-size: 16px;">
              <strong>La tua password è:</strong>
            </p>
            <p style="font-size: 18px; font-weight: bold; color: #2d5016; margin: 10px 0; font-family: monospace; background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
              ${password}
            </p>
          </div>
          
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Puoi ora accedere al tuo account usando questa password. Ti consigliamo di cambiarla dopo aver effettuato l'accesso.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://lamiagazzella.replit.app/login" 
               style="background-color: #2d5016; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Accedi al tuo Account
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center; margin: 0;">
            Se non hai richiesto questa email, puoi ignorarla in tutta sicurezza.<br>
            Questo messaggio è stato inviato da La Mia Gazzella - Sistema Nutrizionale Personalizzato
          </p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"La Mia Gazzella" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '🦌 Recupero Password - La Mia Gazzella',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

// Send admin notification for important events
export async function sendAdminNotification(eventType: string, userEmail: string, details: any = {}) {
  try {
    const transporter = createTransporter();
    const adminEmail = "ilmanualedellagazzella@gmail.com";
    
    let subject = '';
    let eventTitle = '';
    let eventColor = '#2d5016';
    let eventIcon = '📧';
    
    // Configure based on event type
    switch (eventType) {
      case 'user_registration':
        subject = '🎉 Nuova Registrazione - La Mia Gazzella';
        eventTitle = 'Nuova Utente Registrata';
        eventColor = '#22c55e';
        eventIcon = '🎉';
        break;
      case 'trial_started':
        subject = '🆓 Trial Avviato - La Mia Gazzella';
        eventTitle = 'Trial Period Iniziato';
        eventColor = '#f59e0b';
        eventIcon = '🆓';
        break;
      case 'subscription_created':
        subject = '💰 Nuovo Abbonamento Pagato - La Mia Gazzella';
        eventTitle = 'Abbonamento Premium Attivato';
        eventColor = '#10b981';
        eventIcon = '💰';
        break;
      case 'subscription_renewed':
        subject = '🔄 Rinnovo Abbonamento - La Mia Gazzella';
        eventTitle = 'Abbonamento Rinnovato';
        eventColor = '#3b82f6';
        eventIcon = '🔄';
        break;
      case 'subscription_canceled':
        subject = '❌ Abbonamento Cancellato - La Mia Gazzella';
        eventTitle = 'Abbonamento Cancellato';
        eventColor = '#ef4444';
        eventIcon = '❌';
        break;
      case 'payment_failed':
        subject = `💳 Pagamento Fallito (Tentativo ${details.attemptCount || '?'}) - La Mia Gazzella`;
        eventTitle = `Pagamento Non Riuscito - Tentativo ${details.attemptCount || '?'}`;
        eventColor = '#dc2626';
        eventIcon = '💳';
        break;
      default:
        subject = '🔔 Notifica Sistema - La Mia Gazzella';
        eventTitle = 'Evento Sistema';
        eventIcon = '🔔';
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; background-color: #f8f9fa; padding: 20px; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2d5016 0%, #22c55e 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 1.8em; font-weight: bold;">🦌 La Mia Gazzella</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Dashboard Admin - Notifica Sistema</p>
          </div>
          
          <!-- Event Info -->
          <div style="padding: 30px;">
            <div style="background: ${eventColor}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
              <h2 style="margin: 0; font-size: 1.5em;">${eventIcon} ${eventTitle}</h2>
            </div>
            
            <!-- User Details -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${eventColor};">
              <h3 style="margin-top: 0; color: #2d5016;">👤 Dettagli Utente</h3>
              <p style="margin: 10px 0; color: #333;"><strong>Email:</strong> ${userEmail}</p>
              
              ${details.subscriptionPlan ? `<p style="margin: 10px 0; color: #333;"><strong>Piano:</strong> ${details.subscriptionPlan}</p>` : ''}
              ${details.amount ? `<p style="margin: 10px 0; color: #333;"><strong>Importo:</strong> €${(details.amount / 100).toFixed(2)}</p>` : ''}
              ${details.subscriptionEndDate ? `<p style="margin: 10px 0; color: #333;"><strong>Scadenza:</strong> ${new Date(details.subscriptionEndDate).toLocaleDateString('it-IT')}</p>` : ''}
              ${details.trialEndDate ? `<p style="margin: 10px 0; color: #333;"><strong>Fine Trial:</strong> ${new Date(details.trialEndDate).toLocaleDateString('it-IT')}</p>` : ''}
            </div>
            
            <!-- Admin Actions -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://lamiagazzella.replit.app/admin" 
                 style="background-color: #2d5016; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-right: 10px;">
                📊 Vai alla Dashboard
              </a>
            </div>
            
            <!-- Event Timestamp -->
            <div style="text-align: center; color: #666; font-size: 14px; margin-top: 25px;">
              <p style="margin: 0;">🕒 Evento registrato il ${new Date().toLocaleString('it-IT')}</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">Questa è una notifica automatica dal sistema La Mia Gazzella</p>
            <p style="margin: 5px 0 0 0;">Admin Dashboard - Monitoring Sistema</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"La Mia Gazzella - Sistema" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Admin notification sent: ${eventType} for ${userEmail}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error: any) {
    console.error('❌ Error sending admin notification:', error);
    // Don't throw - we don't want admin notifications to break user flow
    return { success: false, error: error.message };
  }
}

// Send daily business summary email
export async function sendDailyBusinessSummary(businessSummary: any) {
  try {
    const transporter = createTransporter();
    const adminEmail = "ilmanualedellagazzella@gmail.com";
    
    const { daily, totals, generatedAt } = businessSummary;
    const summaryDate = new Date(daily.date).toLocaleDateString('it-IT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Calculate percentage changes (if needed in future versions)
    const totalEvents = daily.newRegistrations + daily.trialsStarted + daily.subscriptionsCreated + 
                       daily.subscriptionsRenewed + daily.subscriptionsCanceled;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>📊 Riepilogo Giornaliero - La Mia Gazzella</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; background-color: #f8f9fa; padding: 20px; line-height: 1.6; margin: 0;">
        <div style="max-width: 700px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2d5016 0%, #22c55e 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 2em; font-weight: bold;">🦌 La Mia Gazzella</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 1.1em;">Riepilogo Business Giornaliero</p>
            <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 1em;">${summaryDate}</p>
          </div>
          
          <!-- Daily Metrics Section -->
          <div style="padding: 30px;">
            <div style="background: #f0f9ff; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 5px solid #3b82f6;">
              <h2 style="margin-top: 0; color: #1e40af; font-size: 1.5em; display: flex; align-items: center;">
                📈 Attività di Oggi
              </h2>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <!-- Registrations -->
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #22c55e;">
                  <div style="font-size: 2.5em; font-weight: bold; color: #22c55e; margin-bottom: 5px;">
                    ${daily.newRegistrations}
                  </div>
                  <div style="color: #666; font-weight: 500;">🎉 Nuove Registrazioni</div>
                </div>
                
                <!-- Trials -->
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #f59e0b;">
                  <div style="font-size: 2.5em; font-weight: bold; color: #f59e0b; margin-bottom: 5px;">
                    ${daily.trialsStarted}
                  </div>
                  <div style="color: #666; font-weight: 500;">🆓 Trial Avviati</div>
                </div>
                
                <!-- New Subscriptions -->
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #10b981;">
                  <div style="font-size: 2.5em; font-weight: bold; color: #10b981; margin-bottom: 5px;">
                    ${daily.subscriptionsCreated}
                  </div>
                  <div style="color: #666; font-weight: 500;">💰 Abbonamenti Pagati</div>
                </div>
                
                <!-- Renewals -->
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #3b82f6;">
                  <div style="font-size: 2.5em; font-weight: bold; color: #3b82f6; margin-bottom: 5px;">
                    ${daily.subscriptionsRenewed}
                  </div>
                  <div style="color: #666; font-weight: 500;">🔄 Rinnovi</div>
                </div>
              </div>

              <!-- Cancellations (Full Width) -->
              <div style="margin-top: 20px;">
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #ef4444;">
                  <div style="font-size: 2.5em; font-weight: bold; color: #ef4444; margin-bottom: 5px;">
                    ${daily.subscriptionsCanceled}
                  </div>
                  <div style="color: #666; font-weight: 500;">❌ Cancellazioni</div>
                </div>
              </div>

              <!-- Daily Summary -->
              <div style="margin-top: 25px; padding: 15px; background: rgba(45, 80, 22, 0.1); border-radius: 8px; text-align: center;">
                <strong style="color: #2d5016; font-size: 1.1em;">
                  📊 Totale Eventi Oggi: ${totalEvents}
                </strong>
              </div>
            </div>

            <!-- Total Metrics Section -->
            <div style="background: #fef3c7; padding: 25px; border-radius: 10px; border-left: 5px solid #f59e0b;">
              <h2 style="margin-top: 0; color: #92400e; font-size: 1.5em; display: flex; align-items: center;">
                🏆 Statistiche Totali Business
              </h2>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <!-- Total Users -->
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 2.2em; font-weight: bold; color: #2d5016; margin-bottom: 5px;">
                    ${totals.totalUsers}
                  </div>
                  <div style="color: #666; font-weight: 500;">👥 Utenti Totali</div>
                </div>
                
                <!-- Active Subscriptions -->
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 2.2em; font-weight: bold; color: #10b981; margin-bottom: 5px;">
                    ${totals.activeSubscriptions}
                  </div>
                  <div style="color: #666; font-weight: 500;">✅ Abbonamenti Attivi</div>
                </div>
                
                <!-- Trial Users -->
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 2.2em; font-weight: bold; color: #f59e0b; margin-bottom: 5px;">
                    ${totals.trialUsers}
                  </div>
                  <div style="color: #666; font-weight: 500;">🆓 Utenti in Trial</div>
                </div>
                
                <!-- Churned Users -->
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 2.2em; font-weight: bold; color: #ef4444; margin-bottom: 5px;">
                    ${totals.churnedUsers}
                  </div>
                  <div style="color: #666; font-weight: 500;">💔 Utenti Persi</div>
                </div>
              </div>

              <!-- Business Performance Indicator -->
              <div style="margin-top: 25px; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; text-align: center;">
                <strong style="color: #059669; font-size: 1.1em;">
                  📈 Tasso di Conversione: ${totals.totalUsers > 0 ? Math.round((totals.activeSubscriptions / totals.totalUsers) * 100) : 0}%
                </strong>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://lamiagazzella.replit.app/admin" 
                 style="background-color: #2d5016; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin-right: 15px;">
                📊 Vai alla Dashboard
              </a>
              <a href="https://lamiagazzella.replit.app/admin" 
                 style="background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                👥 Gestisci Utenti
              </a>
            </div>
            
            <!-- Timestamp -->
            <div style="text-align: center; color: #666; font-size: 14px; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="margin: 0;">📅 Generato il ${new Date(generatedAt).toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</p>
              <p style="margin: 5px 0 0 0;">🕐 Fuso Orario: Europe/Rome</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">Questo è il riepilogo automatico giornaliero del business La Mia Gazzella</p>
            <p style="margin: 5px 0 0 0;">Sistema di Monitoraggio Business - Dati in tempo reale</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"La Mia Gazzella - Business Report" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `📊 Riepilogo Giornaliero ${daily.date} - La Mia Gazzella (${totalEvents} eventi)`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Daily business summary sent successfully: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error: any) {
    console.error('❌ Error sending daily business summary:', error);
    throw error;
  }
}

// Send notification when meal plan or recipe is ready
export async function sendContentReadyNotification(
  email: string, 
  contentType: 'meal_plan' | 'recipe',
  contentTitle: string
) {
  try {
    const transporter = createTransporter();
    
    const isRecipe = contentType === 'recipe';
    const contentName = isRecipe ? 'ricetta' : 'piano alimentare';
    const contentIcon = isRecipe ? '🍳' : '🍽️';
    const subject = isRecipe 
      ? `🍳 La tua nuova ricetta è pronta! - La Mia Gazzella`
      : `🍽️ Il tuo piano alimentare è pronto! - La Mia Gazzella`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: 'Georgia', serif; background-color: #f8f9fa; padding: 20px; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 8px 25px rgba(45, 80, 22, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2d5016 0%, #22c55e 100%); color: white; padding: 40px 30px; text-align: center;">
            <div style="font-size: 4em; margin-bottom: 15px;">${contentIcon}</div>
            <h1 style="margin: 0; font-size: 1.8em; font-weight: bold;">La Mia Gazzella</h1>
            <p style="margin: 10px 0 0 0; font-size: 1.1em; opacity: 0.9;">Ottime notizie!</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #2d5016; margin-bottom: 15px; font-size: 1.6em;">
                ${isRecipe ? 'La tua nuova ricetta è pronta!' : 'Il tuo piano alimentare è pronto!'}
              </h2>
              
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #22c55e;">
                <p style="margin: 0; color: #166534; font-size: 1.2em; font-weight: 500;">
                  "${contentTitle}"
                </p>
              </div>
              
              <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
                Le nostre nutrizioniste hanno preparato ${contentType === 'recipe' ? 'la tua ricetta personalizzata' : 'il tuo piano alimentare personalizzato'} seguendo la <strong>Filosofia Gazzella</strong>.
              </p>
            </div>

            <!-- Call to action -->
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; font-size: 15px; margin-bottom: 20px;">
                Accedi alla piattaforma per visualizzare ${isRecipe ? 'la tua nuova ricetta' : 'il tuo nuovo piano'}.
              </p>
            </div>

            <!-- Info box -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #22c55e;">
              <p style="margin: 0; color: #333; font-size: 14px;">
                <strong>💡 Ricorda:</strong> ${isRecipe 
                  ? 'Puoi trovare tutte le tue ricette nella sezione "Le mie ricette" della piattaforma.' 
                  : 'Puoi trovare il tuo piano nella sezione "Il mio piano" della piattaforma.'}
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              <strong>La Mia Gazzella</strong> - Sistema Nutrizionale Personalizzato<br>
              Specializzato per donne in menopausa
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"La Mia Gazzella" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Content ready notification sent to ${email}: ${contentType} - "${contentTitle}"`);
    return { success: true, messageId: result.messageId };
    
  } catch (error: any) {
    console.error('❌ Error sending content ready notification:', error);
    // Don't throw - we don't want notification errors to break user flow
    return { success: false, error: error.message };
  }
}

// Send confirmation email when content request is received (immediate notification)
export async function sendContentRequestConfirmation(
  email: string, 
  contentType: 'meal_plan' | 'recipe',
  contentDescription?: string
) {
  try {
    const transporter = createTransporter();
    
    const isRecipe = contentType === 'recipe';
    const teamName = isRecipe ? 'i nostri Chef' : 'i nostri Esperti';
    const contentName = isRecipe ? 'la tua ricetta personalizzata' : 'il tuo piano alimentare personalizzato';
    const contentIcon = isRecipe ? '👨‍🍳' : '📋';
    const subject = isRecipe 
      ? `👨‍🍳 Richiesta ricevuta! I nostri Chef sono al lavoro - La Mia Gazzella`
      : `📋 Richiesta ricevuta! I nostri Esperti sono al lavoro - La Mia Gazzella`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: 'Georgia', serif; background-color: #f8f9fa; padding: 20px; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 8px 25px rgba(45, 80, 22, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center;">
            <div style="font-size: 4em; margin-bottom: 15px;">${contentIcon}</div>
            <h1 style="margin: 0; font-size: 1.8em; font-weight: bold;">Richiesta Ricevuta!</h1>
            <p style="margin: 10px 0 0 0; font-size: 1.1em; opacity: 0.9;">La Mia Gazzella</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #92400e; margin-bottom: 15px; font-size: 1.5em;">
                ${teamName} stanno lavorando per te! 💪
              </h2>
              
              ${contentDescription ? `
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border: 2px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 1.1em; font-weight: 500;">
                  "${contentDescription}"
                </p>
              </div>
              ` : ''}
              
              <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
                Abbiamo ricevuto la tua richiesta per ${contentName}. 
                ${teamName} stanno preparando tutto con cura seguendo la <strong>Filosofia Gazzella</strong>.
              </p>
            </div>

            <!-- Status box -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0; margin-bottom: 15px;">⏳ Cosa succede ora?</h3>
              <ul style="color: #78350f; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;">
                  ${teamName} stanno analizzando le tue preferenze e creando ${isRecipe ? 'la ricetta perfetta' : 'il piano perfetto'} per te
                </li>
                <li style="margin-bottom: 10px;">
                  <strong>Riceverai un'email</strong> appena ${isRecipe ? 'la ricetta sarà' : 'il piano sarà'} pronto/a
                </li>
                <li>
                  Potrai trovare ${isRecipe ? 'la ricetta' : 'il piano'} nella sezione "${isRecipe ? 'Le mie ricette' : 'I miei piani'}" della piattaforma
                </li>
              </ul>
            </div>

            <!-- Tempo stimato -->
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #fef3c7; padding: 15px 30px; border-radius: 50px; border: 2px solid #f59e0b;">
                <span style="color: #92400e; font-size: 16px; font-weight: 500;">
                  ⏱️ Tempo stimato: <strong>${isRecipe ? '~22 minuti' : '~57 minuti'}</strong>
                </span>
              </div>
            </div>

            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 25px;">
              Nel frattempo, puoi continuare a esplorare la piattaforma o rilassarti - ti avviseremo noi!
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              <strong>La Mia Gazzella</strong> - Sistema Nutrizionale Personalizzato<br>
              Specializzato per donne in menopausa
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"La Mia Gazzella" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Content request confirmation sent to ${email}: ${contentType}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error: any) {
    console.error('❌ Error sending content request confirmation:', error);
    // Don't throw - we don't want notification errors to break user flow
    return { success: false, error: error.message };
  }
}

export async function sendPaymentFailedEmail(
  email: string, 
  attemptNumber: number, 
  amount: string
) {
  try {
    const transporter = createTransporter();

    const logoPath = path.join(process.cwd(), 'client/src/immagini/Logo-gazzella.jpg');
    let logoAttachment = null;
    try {
      if (fs.existsSync(logoPath)) {
        logoAttachment = {
          filename: 'logo-gazzella.jpg',
          path: logoPath,
          cid: 'logo-gazzella'
        };
      }
    } catch (e) {}

    let subject = '';
    let headerColor = '';
    let headerIcon = '';
    let bodyContent = '';

    if (attemptNumber <= 1) {
      subject = 'Pagamento non riuscito - La Mia Gazzella';
      headerColor = '#f59e0b';
      headerIcon = '⚠️';
      bodyContent = `
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Ti informiamo che il pagamento di <strong>${amount}€</strong> per il rinnovo del tuo abbonamento a La Mia Gazzella <strong>non è andato a buon fine</strong>.
        </p>
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          I nostri Esperti e i nostri Chef hanno già preparato contenuti personalizzati per il tuo percorso, e il servizio che ti è stato riservato ha un costo che deve essere onorato.
        </p>
        <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
          Ti chiediamo di <strong>aggiornare il tuo metodo di pagamento</strong> il prima possibile per regolarizzare la tua posizione.
        </p>
      `;
    } else if (attemptNumber === 2) {
      subject = '⚠️ Secondo sollecito - Pagamento di ' + amount + '€ ancora non ricevuto';
      headerColor = '#ef4444';
      headerIcon = '⚠️';
      bodyContent = `
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Ti contattiamo nuovamente perché il pagamento di <strong>${amount}€</strong> per il tuo abbonamento risulta <strong>ancora non saldato</strong>, nonostante il nostro precedente avviso.
        </p>
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Ti ricordiamo che al momento della registrazione hai accettato i termini di servizio che prevedono il pagamento dell'abbonamento mensile. <strong>L'importo resta dovuto.</strong>
        </p>
        <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
          Il nostro team ha dedicato tempo e risorse per creare un percorso su misura per te, e ci aspettiamo che l'impegno preso venga rispettato.
        </p>
        <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
          Aggiorna il tuo metodo di pagamento per saldare quanto dovuto.
        </p>
      `;
    } else {
      subject = '❌ Ultimo sollecito - Importo di ' + amount + '€ insoluto';
      headerColor = '#991b1b';
      headerIcon = '❌';
      bodyContent = `
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Questo è il nostro <strong>terzo e ultimo sollecito</strong> per il pagamento di <strong>${amount}€</strong> relativo al tuo abbonamento a La Mia Gazzella.
        </p>
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
          Ad oggi il tuo pagamento risulta insoluto nonostante i ripetuti tentativi di addebito e le nostre precedenti comunicazioni. Ti ricordiamo che <strong>l'importo è dovuto</strong> in base ai termini di servizio da te accettati al momento dell'iscrizione.
        </p>
        <p style="color: #333; font-size: 16px; margin-bottom: 25px;">
          Ti invitiamo a regolarizzare <strong>immediatamente</strong> la tua posizione aggiornando il metodo di pagamento.
        </p>
        <div style="background-color: #fef2f2; border: 2px solid #991b1b; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="color: #991b1b; font-size: 15px; margin: 0; font-weight: 500;">
            In assenza di pagamento, ci riserviamo il diritto di procedere secondo quanto previsto dai nostri termini di servizio per il recupero dell'importo dovuto.
          </p>
        </div>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: 'Georgia', serif; background-color: #f8f9fa; padding: 20px; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); overflow: hidden;">
          
          <div style="background: ${headerColor}; color: white; padding: 40px 30px; text-align: center;">
            ${logoAttachment ? `<img src="cid:logo-gazzella" alt="La Mia Gazzella Logo" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 15px; border: 3px solid rgba(255,255,255,0.3);">` : ''}
            <div style="font-size: 2.5em; margin-bottom: 10px;">${headerIcon}</div>
            <h1 style="margin: 0; font-size: 1.6em; font-weight: bold;">La Mia Gazzella</h1>
            <p style="margin: 10px 0 0 0; font-size: 1.1em; opacity: 0.9;">Comunicazione Importante</p>
          </div>
          
          <div style="padding: 40px 30px;">
            ${bodyContent}

            <div style="text-align: center; margin: 35px 0;">
              <a href="https://lamiagazzella.replit.app/piani-abbonamento" 
                 style="background: ${headerColor}; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                Aggiorna Metodo di Pagamento
              </a>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #94a3b8;">
              <p style="margin: 0 0 10px 0; color: #333; font-size: 14px; font-weight: 600;">Se il problema dipende dalla tua banca, ti consigliamo di:</p>
              <ul style="color: #555; margin: 0; padding-left: 20px; font-size: 14px;">
                <li style="margin-bottom: 5px;">Verificare che la carta non sia scaduta</li>
                <li style="margin-bottom: 5px;">Controllare di avere fondi sufficienti</li>
                <li>Contattare la tua banca per autorizzare il pagamento</li>
              </ul>
            </div>

            <p style="color: #666; font-size: 13px; text-align: center; margin-top: 30px;">
              Per qualsiasi chiarimento, rispondi a questa email.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              <strong>La Mia Gazzella</strong> - Sistema Nutrizionale Personalizzato<br>
              Questa comunicazione è inviata ai sensi dei termini di servizio accettati al momento della registrazione.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"La Mia Gazzella" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlContent,
      ...(logoAttachment && { attachments: [logoAttachment] })
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Payment failed email (attempt ${attemptNumber}) sent to ${email}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error: any) {
    console.error(`❌ Error sending payment failed email (attempt ${attemptNumber}) to ${email}:`, error);
    return { success: false, error: error.message };
  }
}