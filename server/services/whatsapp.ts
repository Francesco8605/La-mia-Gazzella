// WhatsApp notification service using CallMeBot API
// Documentation: https://www.callmebot.com/blog/free-api-whatsapp-messages/

export interface WhatsAppMessage {
  phone: string;
  text: string;
}

export interface WhatsAppConfig {
  apiKey3333401566?: string; // API key for number 3333401566
  apiKey3884480928?: string; // API key for number 3884480928
}

export class WhatsAppService {
  private readonly baseUrl = 'https://api.callmebot.com/whatsapp.php';
  private readonly config: WhatsAppConfig;

  constructor() {
    this.config = {
      apiKey3333401566: process.env.WHATSAPP_API_KEY_3333401566,
      apiKey3884480928: process.env.WHATSAPP_API_KEY_3884480928
    };
  }

  private urlEncodeText(text: string): string {
    return encodeURIComponent(text);
  }

  private formatPhoneNumber(phone: string): string {
    // Ensure phone number is in international format
    if (!phone.startsWith('+')) {
      if (phone.startsWith('39')) {
        return '+' + phone;
      } else {
        return '+39' + phone.replace(/^0+/, ''); // Remove leading zeros and add +39
      }
    }
    return phone;
  }

  private async sendMessage(phone: string, text: string, apiKey: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      const encodedText = this.urlEncodeText(text);
      
      const url = `${this.baseUrl}?phone=${formattedPhone}&text=${encodedText}&apikey=${apiKey}`;
      
      console.log(`📱 Sending WhatsApp message to ${formattedPhone}`);
      
      const response = await fetch(url);
      
      if (response.ok) {
        console.log(`✅ WhatsApp message sent successfully to ${formattedPhone}`);
        return true;
      } else {
        console.error(`❌ Failed to send WhatsApp message to ${formattedPhone}:`, response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error sending WhatsApp message to ${phone}:`, error);
      return false;
    }
  }

  async sendRegistrationNotification(userEmail: string): Promise<void> {
    const message = `🦌 Nuova registrazione La Mia Gazzella!\n\n📧 Email: ${userEmail}\n⏰ Data: ${new Date().toLocaleString('it-IT')}`;
    
    const promises: Promise<boolean>[] = [];

    // Send to 3333401566 if API key is available
    if (this.config.apiKey3333401566) {
      promises.push(this.sendMessage('3333401566', message, this.config.apiKey3333401566));
    } else {
      console.log('⚠️ WhatsApp API key for 3333401566 not configured');
    }

    // Send to 3884480928 if API key is available
    if (this.config.apiKey3884480928) {
      promises.push(this.sendMessage('3884480928', message, this.config.apiKey3884480928));
    } else {
      console.log('⚠️ WhatsApp API key for 3884480928 not configured');
    }

    if (promises.length === 0) {
      console.log('⚠️ No WhatsApp API keys configured. Skipping notifications.');
      return;
    }

    try {
      const results = await Promise.all(promises);
      const successCount = results.filter(result => result).length;
      console.log(`📱 WhatsApp notifications sent: ${successCount}/${results.length} successful`);
    } catch (error) {
      console.error('❌ Error sending WhatsApp notifications:', error);
    }
  }

  async sendPaymentNotification(userEmail: string, amount?: string): Promise<void> {
    const amountText = amount ? ` di €${amount}` : '';
    const message = `💰 Pagamento ricevuto La Mia Gazzella!\n\n📧 Cliente: ${userEmail}\n💵 Importo${amountText}\n⏰ Data: ${new Date().toLocaleString('it-IT')}\n\n✅ Abbonamento attivato!`;
    
    const promises: Promise<boolean>[] = [];

    // Send to 3333401566 if API key is available
    if (this.config.apiKey3333401566) {
      promises.push(this.sendMessage('3333401566', message, this.config.apiKey3333401566));
    } else {
      console.log('⚠️ WhatsApp API key for 3333401566 not configured');
    }

    // Send to 3884480928 if API key is available
    if (this.config.apiKey3884480928) {
      promises.push(this.sendMessage('3884480928', message, this.config.apiKey3884480928));
    } else {
      console.log('⚠️ WhatsApp API key for 3884480928 not configured');
    }

    if (promises.length === 0) {
      console.log('⚠️ No WhatsApp API keys configured. Skipping payment notifications.');
      return;
    }

    try {
      const results = await Promise.all(promises);
      const successCount = results.filter(result => result).length;
      console.log(`💰 WhatsApp payment notifications sent: ${successCount}/${results.length} successful`);
    } catch (error) {
      console.error('❌ Error sending WhatsApp payment notifications:', error);
    }
  }

  async sendTestMessage(phone: string, apiKey: string): Promise<boolean> {
    const message = '🧪 Test message from La Mia Gazzella - WhatsApp integration working!';
    return this.sendMessage(phone, message, apiKey);
  }

  isConfigured(): boolean {
    return !!(this.config.apiKey3333401566 || this.config.apiKey3884480928);
  }

  getStatus(): { configured: boolean; numbers: string[] } {
    const numbers: string[] = [];
    
    if (this.config.apiKey3333401566) {
      numbers.push('3333401566');
    }
    
    if (this.config.apiKey3884480928) {
      numbers.push('3884480928');
    }

    return {
      configured: numbers.length > 0,
      numbers
    };
  }
}

export const whatsappService = new WhatsAppService();