import { MailService } from '@sendgrid/mail';

// Initialize SendGrid service
if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

// Send password recovery email using SendGrid
export async function sendPasswordRecoveryEmail(email: string, username: string, password: string) {
  try {
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

    await mailService.send({
      to: email,
      from: 'noreply@lamiagazzella.com',
      subject: '🦌 Recupero Password - La Mia Gazzella',
      html: htmlContent
    });
    
    console.log('✅ Password recovery email sent successfully to:', email);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error sending password recovery email:', error);
    throw error;
  }
}

// Send welcome email to new users
export async function sendWelcomeEmail(email: string, username?: string) {
  try {
    const displayName = username || email.split('@')[0];
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Benvenuta in La Mia Gazzella!</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; padding: 20px; margin: 0;">
        <div style="max-width: 650px; margin: 0 auto; background-color: white; border-radius: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2d5016 0%, #4a7c2a 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">🦌 La Mia Gazzella</h1>
            <p style="color: #e8f5e8; margin: 10px 0 0 0; font-size: 16px;">Il tuo percorso nutrizionale personalizzato</p>
          </div>
          
          <!-- Welcome Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d5016; font-size: 24px; margin: 0 0 20px 0; font-weight: 400;">
              Benvenuta, ${displayName}! 🎉
            </h2>
            
            <p style="color: #333; line-height: 1.7; font-size: 16px; margin-bottom: 25px;">
              Sei ufficialmente entrata nella famiglia La Mia Gazzella! Siamo entusiaste di accompagnarti in questo percorso di trasformazione nutrizionale pensato appositamente per le donne in menopausa.
            </p>

            <!-- App Features -->
            <div style="background-color: #f8fdf8; padding: 25px; border-radius: 12px; border-left: 4px solid #2d5016; margin: 30px 0;">
              <h3 style="color: #2d5016; margin: 0 0 20px 0; font-size: 18px;">
                ✨ Cosa puoi fare con La Mia Gazzella:
              </h3>
              
              <ul style="color: #333; line-height: 1.8; font-size: 15px; margin: 0; padding-left: 20px;">
                <li><strong>📋 Piani Alimentari Personalizzati:</strong> Ricevi menu settimanali creati su misura per le tue esigenze e obiettivi specifici</li>
                <li><strong>🍽️ Ricette Esclusive:</strong> Accedi a centinaia di ricette gustose e bilanciate, pensate per la menopausa</li>
                <li><strong>💬 Consulenza con Laura:</strong> Chatta direttamente con la nostra nutrizionista AI specializzata in menopausa</li>
                <li><strong>📊 Monitoraggio Peso:</strong> Tieni traccia dei tuoi progressi con grafici intuitivi e motivanti</li>
                <li><strong>💊 Formula Gazzella:</strong> Scopri gli integratori naturali specifici per il tuo benessere</li>
              </ul>
            </div>

            <!-- Trial Information -->
            <div style="background-color: #fff3cd; padding: 25px; border-radius: 12px; border: 1px solid #ffeaa7; margin: 30px 0;">
              <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">
                🎁 I tuoi 3 giorni di prova gratuita
              </h3>
              
              <p style="color: #856404; line-height: 1.6; font-size: 15px; margin: 0 0 15px 0;">
                <strong>Hai 3 giorni completi per esplorare tutte le funzionalità</strong> senza alcun costo. Puoi cancellarti in qualsiasi momento entro questo periodo e non riceverai nessun addebito.
              </p>
              
              <p style="color: #856404; line-height: 1.6; font-size: 15px; margin: 0;">
                Dopo i 3 giorni, se decidi di continuare, l'abbonamento sarà di <strong>€29 al mese</strong> - facilmente cancellabile quando vuoi.
              </p>
            </div>

            <!-- Get Started -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="https://lamiagazzella.replit.app/" 
                 style="background: linear-gradient(135deg, #2d5016 0%, #4a7c2a 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(45, 80, 22, 0.3); transition: all 0.3s ease;">
                🚀 Inizia il tuo percorso
              </a>
            </div>

            <p style="color: #333; line-height: 1.6; font-size: 15px; margin-top: 25px; text-align: center; font-style: italic;">
              Ricorda: La trasformazione inizia dal primo passo. <br>
              Siamo qui per supportarti in ogni momento! 💚
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; font-size: 13px; margin: 0; line-height: 1.5;">
              Questo messaggio è stato inviato da <strong>La Mia Gazzella</strong><br>
              Sistema Nutrizionale Personalizzato per Donne in Menopausa<br>
              <span style="color: #adb5bd;">Se hai domande, contattaci direttamente dall'app</span>
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;

    await mailService.send({
      to: email,
      from: 'welcome@lamiagazzella.com',
      subject: '🦌 Benvenuta in La Mia Gazzella! Il tuo percorso nutrizionale inizia ora',
      html: htmlContent
    });
    
    console.log('✅ Welcome email sent successfully to:', email);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
}