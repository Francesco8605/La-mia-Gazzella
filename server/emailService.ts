import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
  baseUrl: string
): Promise<boolean> {
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌿 Benvenuta in La Mia Gazzella!</h1>
        </div>
        <div class="content">
          <h2>Verifica il tuo indirizzo email</h2>
          <p>Grazie per esserti registrata alla nostra piattaforma di nutrizione personalizzata per la menopausa!</p>
          <p>Per completare la registrazione e accedere a tutte le funzionalità, clicca sul pulsante qui sotto per verificare il tuo indirizzo email:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verifica Email</a>
          </div>
          
          <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
          
          <p><strong>Questo link scadrà tra 24 ore per motivi di sicurezza.</strong></p>
          
          <p>Se non hai richiesto questa registrazione, puoi ignorare questa email.</p>
        </div>
        <div class="footer">
          <p>La Mia Gazzella - Il tuo assistente nutrizionale AI</p>
          <p>Nutrizione personalizzata secondo il Protocollo Gazzella</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    from: 'lamia.gazzella.ai@gmail.com', // Email verificata su SendGrid
    subject: '🌿 Verifica il tuo account La Mia Gazzella',
    text: `Benvenuta in La Mia Gazzella! Verifica il tuo email cliccando su questo link: ${verificationUrl}`,
    html: htmlContent,
  });
}