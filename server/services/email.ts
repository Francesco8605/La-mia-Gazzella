import nodemailer from 'nodemailer';

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

// Send email verification email
export async function sendEmailVerificationEmail(email: string, username: string, verificationToken: string) {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `https://lamiagazzella.replit.app/verify-email?token=${verificationToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verifica Email - La Mia Gazzella</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2d5016; margin-bottom: 10px;">🦌 La Mia Gazzella</h1>
            <h2 style="color: #666; margin-top: 0;">Benvenuto nella famiglia!</h2>
          </div>
          
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Ciao <strong>${username}</strong>,
          </p>
          
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Benvenuto in La Mia Gazzella! Per completare la registrazione e accedere a tutte le funzionalità del nostro sistema nutrizionale personalizzato, devi verificare la tua email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2d5016; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              ✅ Verifica la tua Email
            </a>
          </div>
          
          <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
            Una volta verificata la tua email, potrai:
          </p>
          
          <ul style="color: #333; line-height: 1.8; margin-bottom: 20px;">
            <li>🍽️ Generare piani alimentari personalizzati</li>
            <li>📱 Ricevere ricette adatte ai tuoi obiettivi</li>
            <li>🏥 Consultare il nostro assistente nutrizionale AI</li>
            <li>📊 Monitorare i tuoi progressi</li>
          </ul>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d5016;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>Nota:</strong> Se il pulsante non funziona, puoi copiare e incollare questo link nel tuo browser:<br>
              <span style="word-break: break-all; color: #2d5016; font-family: monospace; font-size: 12px;">
                ${verificationUrl}
              </span>
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px; text-align: center; margin: 0;">
            Se non hai creato questo account, puoi ignorare questa email in tutta sicurezza.<br>
            Questo messaggio è stato inviato da La Mia Gazzella - Sistema Nutrizionale Personalizzato
          </p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"La Mia Gazzella" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '🦌 Verifica la tua Email - La Mia Gazzella',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
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