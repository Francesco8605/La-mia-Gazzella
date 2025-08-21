import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable must be set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: params.from || "La Mia Gazzella <onboarding@resend.dev>",
      to: [params.to],
      subject: params.subject,
      text: params.text,
      html: params.html,
    });

    if (error) {
      console.error('Resend email error:', error);
      return false;
    }

    console.log('✅ Email sent successfully to:', params.to, 'ID:', data?.id);
    return true;
  } catch (error) {
    console.error('Resend email error:', error);
    return false;
  }
}

export function generateEmailVerificationEmail(username: string, verificationUrl: string) {
  return {
    subject: 'Verifica la tua email - La Mia Gazzella',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Benvenuto in La Mia Gazzella, ${username}!</h2>
        
        <p>Grazie per esserti registrato alla nostra piattaforma di pianificazione nutrizionale.</p>
        
        <p>Per completare la registrazione e attivare il tuo account, clicca sul pulsante qui sotto:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verifica Email
          </a>
        </div>
        
        <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Questo link scadrà tra 24 ore per motivi di sicurezza.
        </p>
        
        <p style="font-size: 14px; color: #666;">
          Se non hai creato un account su La Mia Gazzella, puoi ignorare questa email.
        </p>
      </div>
    `,
    text: `
      Benvenuto in La Mia Gazzella, ${username}!
      
      Per completare la registrazione, visita questo link: ${verificationUrl}
      
      Questo link scadrà tra 24 ore.
      
      Se non hai creato un account, puoi ignorare questa email.
    `
  };
}

export function generatePasswordResetEmail(username: string, resetUrl: string) {
  return {
    subject: 'Reimposta la tua password - La Mia Gazzella',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Richiesta Reset Password</h2>
        
        <p>Ciao ${username},</p>
        
        <p>Hai richiesto di reimpostare la password per il tuo account La Mia Gazzella.</p>
        
        <p>Clicca sul pulsante qui sotto per creare una nuova password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reimposta Password
          </a>
        </div>
        
        <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Questo link scadrà tra 1 ora per motivi di sicurezza.
        </p>
        
        <p style="font-size: 14px; color: #666;">
          Se non hai richiesto il reset della password, puoi ignorare questa email. La tua password rimarrà invariata.
        </p>
      </div>
    `,
    text: `
      Richiesta Reset Password
      
      Ciao ${username},
      
      Per reimpostare la password, visita questo link: ${resetUrl}
      
      Questo link scadrà tra 1 ora.
      
      Se non hai richiesto il reset, puoi ignorare questa email.
    `
  };
}