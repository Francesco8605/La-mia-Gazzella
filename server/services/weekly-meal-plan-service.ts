// Servizio per gestire la sequenza dei piani alimentari settimanali
// Ogni utente segue la sequenza: Settimana 1 → 2 → 3 → 4 → 1 (ciclo)

import { storage } from "../storage.js";
import { WEEKLY_MEAL_PLANS, getWeeklyPlan, getNextWeekNumber, type WeeklyMealPlan } from "../constants/weekly-meal-plans.js";

export interface WeeklyPlanResult {
  weekNumber: number;
  weeklyPlan: WeeklyMealPlan;
  isFirstTime: boolean;
}

/**
 * Ottiene il piano alimentare della settimana corretta per l'utente
 * e aggiorna automaticamente il counter per la prossima generazione
 */
export async function getUserWeeklyPlan(userId: string): Promise<WeeklyPlanResult> {
  try {
    // 1. Legge il counter attuale dell'utente
    const currentWeekCounter = await storage.getUserWeekCounter(userId);
    
    // 2. Determina quale settimana utilizzare
    const weekNumber = getNextWeekNumber(currentWeekCounter);
    
    // 3. Ottiene il piano della settimana
    const weeklyPlan = getWeeklyPlan(weekNumber);
    
    if (!weeklyPlan) {
      throw new Error(`Piano settimanale non trovato per la settimana ${weekNumber}`);
    }
    
    // 4. Aggiorna il counter per la prossima volta
    await storage.updateUserWeekCounter(userId, weekNumber);
    
    console.log(`📅 Utente ${userId}: Utilizzando settimana ${weekNumber} (precedente: ${currentWeekCounter})`);
    
    return {
      weekNumber,
      weeklyPlan,
      isFirstTime: currentWeekCounter === 0
    };
    
  } catch (error) {
    console.error(`Errore nel recupero del piano settimanale per utente ${userId}:`, error);
    throw new Error(`Impossibile recuperare il piano settimanale: ${error instanceof Error ? error.message : "Errore sconosciuto"}`);
  }
}

/**
 * Ottiene il piano attuale dell'utente senza aggiornare il counter
 * Utile per visualizzazioni o preview
 */
export async function getCurrentUserWeeklyPlan(userId: string): Promise<WeeklyPlanResult | null> {
  try {
    const currentWeekCounter = await storage.getUserWeekCounter(userId);
    
    if (currentWeekCounter === 0) {
      // L'utente non ha ancora generato nessun piano
      return null;
    }
    
    const weeklyPlan = getWeeklyPlan(currentWeekCounter);
    
    if (!weeklyPlan) {
      return null;
    }
    
    return {
      weekNumber: currentWeekCounter,
      weeklyPlan,
      isFirstTime: false
    };
    
  } catch (error) {
    console.error(`Errore nel recupero del piano corrente per utente ${userId}:`, error);
    return null;
  }
}

/**
 * Formatta il piano settimanale in una stringa leggibile per l'AI
 */
export function formatWeeklyPlanForAI(weeklyPlan: WeeklyMealPlan): string {
  let formatted = `PIANO ALIMENTARE - SETTIMANA ${weeklyPlan.week}\n\n`;
  
  for (const day of weeklyPlan.days) {
    formatted += `${day.day.toUpperCase()}\n`;
    formatted += `Colazione: ${day.meals.colazione.join(", ")}\n`;
    formatted += `Spuntino: ${day.meals.spuntino.join(", ")}\n`;
    formatted += `Pranzo: ${day.meals.pranzo.join(", ")}\n`;
    formatted += `Merenda: ${day.meals.merenda.join(", ")}\n`;
    formatted += `Cena: ${day.meals.cena.join(", ")}\n\n`;
  }
  
  return formatted;
}

/**
 * Ottiene statistiche sui piani utilizzati dall'utente
 */
export async function getUserWeeklyPlanStats(userId: string): Promise<{
  currentWeek: number;
  totalPlansGenerated: number;
  completedCycles: number;
  nextWeek: number;
}> {
  const currentWeekCounter = await storage.getUserWeekCounter(userId);
  const nextWeek = getNextWeekNumber(currentWeekCounter);
  
  return {
    currentWeek: currentWeekCounter,
    totalPlansGenerated: currentWeekCounter,
    completedCycles: Math.floor(currentWeekCounter / 4),
    nextWeek
  };
}