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
    } catch (logoError) {
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
              <a href="https://lamiagazzella.replit.app/dashboard" 
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