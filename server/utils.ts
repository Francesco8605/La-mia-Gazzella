import { randomBytes } from 'crypto';

export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

export function getBaseUrl(): string {
  return process.env.NODE_ENV === 'production' 
    ? process.env.BASE_URL || 'https://your-app.replit.app'
    : 'http://localhost:5000';
}