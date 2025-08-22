import { type SendPhoneVerification, type PhoneVerification } from "@shared/schema";

// Interfaccia per i provider di verifica
export interface PhoneVerificationProvider {
  sendVerification(phone: string, code: string, method: "whatsapp" | "sms" | "call"): Promise<{
    success: boolean;
    providerData?: any;
    error?: string;
  }>;
  
  validatePhone(phone: string): boolean;
}

// Mock provider per mail2whats (da sostituire con implementazione reale)
export class Mail2WhatsProvider implements PhoneVerificationProvider {
  async sendVerification(phone: string, code: string, method: "whatsapp" | "sms" | "call") {
    console.log(`📱 [Mail2Whats] Sending ${method.toUpperCase()} verification to ${phone}: ${code}`);
    
    // Simula l'invio per ora - da sostituire con API reale
    // In un'implementazione reale, qui faresti una chiamata HTTP al servizio mail2whats
    const success = Math.random() > 0.1; // 90% di successo
    
    if (success) {
      return {
        success: true,
        providerData: {
          messageId: `mail2whats_${Date.now()}`,
          provider: "mail2whats",
          method,
          sentAt: new Date().toISOString()
        }
      };
    } else {
      return {
        success: false,
        error: "Failed to send verification via mail2whats"
      };
    }
  }

  validatePhone(phone: string): boolean {
    // Validazione base numero italiano/internazionale
    const phoneRegex = /^[\+]?[1-9][\d]{8,15}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
  }
}

// Provider Twilio (opzionale)
export class TwilioProvider implements PhoneVerificationProvider {
  constructor(private accountSid: string, private authToken: string) {}

  async sendVerification(phone: string, code: string, method: "whatsapp" | "sms" | "call") {
    console.log(`📱 [Twilio] Sending ${method.toUpperCase()} verification to ${phone}: ${code}`);
    
    // Implementazione Twilio - richiede TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN
    // const client = require('twilio')(this.accountSid, this.authToken);
    
    // Simula per ora
    return {
      success: true,
      providerData: {
        messageId: `twilio_${Date.now()}`,
        provider: "twilio",
        method,
        sentAt: new Date().toISOString()
      }
    };
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{8,15}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
  }
}

// Servizio principale di verifica telefonica
export class PhoneVerificationService {
  private providers: Map<string, PhoneVerificationProvider> = new Map();

  constructor() {
    // Inizializza i provider disponibili
    this.providers.set("mail2whats", new Mail2WhatsProvider());
    
    // Aggiungi Twilio se le credenziali sono disponibili
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.providers.set("twilio", new TwilioProvider(
        process.env.TWILIO_ACCOUNT_SID, 
        process.env.TWILIO_AUTH_TOKEN
      ));
    }
  }

  // Genera codice OTP
  generateCode(length: number = 6): string {
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return result;
  }

  // Calcola data di scadenza (default: 10 minuti)
  getExpirationDate(minutesFromNow: number = 10): Date {
    const now = new Date();
    return new Date(now.getTime() + minutesFromNow * 60 * 1000);
  }

  // Normalizza numero di telefono
  normalizePhone(phone: string): string {
    // Rimuovi spazi, trattini, parentesi
    let normalized = phone.replace(/[\s\-\(\)]/g, '');
    
    // Se inizia con 0, sostituisci con +39 (Italia)
    if (normalized.startsWith('0')) {
      normalized = '+39' + normalized.substring(1);
    }
    
    // Se non ha prefisso internazionale, aggiungi +39
    if (!normalized.startsWith('+')) {
      normalized = '+39' + normalized;
    }
    
    return normalized;
  }

  // Valida formato numero
  validatePhone(phone: string): { valid: boolean; error?: string } {
    const normalized = this.normalizePhone(phone);
    
    if (normalized.length < 10) {
      return { valid: false, error: "Numero troppo corto" };
    }
    
    if (normalized.length > 16) {
      return { valid: false, error: "Numero troppo lungo" };
    }
    
    const phoneRegex = /^\+[1-9]\d{8,15}$/;
    if (!phoneRegex.test(normalized)) {
      return { valid: false, error: "Formato numero non valido" };
    }
    
    return { valid: true };
  }

  // Invia codice di verifica
  async sendVerificationCode(
    phone: string, 
    code: string, 
    method: "whatsapp" | "sms" | "call" = "whatsapp",
    providerName: string = "mail2whats"
  ): Promise<{
    success: boolean;
    providerData?: any;
    error?: string;
  }> {
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      return {
        success: false,
        error: `Provider ${providerName} not available`
      };
    }

    const validation = this.validatePhone(phone);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    const normalizedPhone = this.normalizePhone(phone);
    
    try {
      const result = await provider.sendVerification(normalizedPhone, code, method);
      
      console.log(`📱 Verification ${result.success ? 'sent' : 'failed'} to ${normalizedPhone}`);
      
      return result;
    } catch (error) {
      console.error('Error sending verification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Verifica se il codice è valido
  verifyCode(storedCode: string, inputCode: string): boolean {
    return storedCode === inputCode.trim();
  }

  // Controlla se la verifica è scaduta
  isExpired(expiresAt: Date): boolean {
    return new Date() > new Date(expiresAt);
  }
}

// Istanza singleton
export const phoneVerificationService = new PhoneVerificationService();