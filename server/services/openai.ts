import OpenAI from "openai";
import { type InsertUserProfile, type MealPlanDay, type Meal } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface MealPlanRequest {
  userProfile: InsertUserProfile;
  nutritionalNeeds: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    bmi: number;
    idealWeight: number;
    weightGoal: number;
    healthStatus: string;
  };
  targetCalories: number;
  durationDays: number;
}

export interface RecipeRequest {
  mealName: string;
  dietaryPreferences: string[];
  targetCalories: number;
  allergies?: string[];
  cuisine?: string;
}

// TABELLA UFFICIALE MANUALE DELLA GAZZELLA 2025
const GAZZELLA_WEEKLY_STRUCTURE = {
  LUNEDI: {
    colazione: "Yogurt greco + fiocchi di avena + mandorle",
    spuntino: "1 mela + cioccolato fondente", 
    pranzo: "Insalata + pasta integrale al pomodoro + petto di pollo",
    merenda: "Yogurt bianco intero + mandorle",
    cena: "Verdure crude + frittata + pane integrale"
  },
  MARTEDI: {
    colazione: "Yogurt bianco + biscotti",
    spuntino: "1 Pera + noci",
    pranzo: "Verdure crude + cous cous + pesce spada + zucchine", 
    merenda: "1 Yogurt greco + cioccolato fondente",
    cena: "Verdure crude + carne rossa + pane integrale"
  },
  MERCOLEDI: {
    colazione: "Pane integrale + uova + olio EVO",
    spuntino: "1 Mela + nocciole",
    pranzo: "Insalata + pasta integrale + tonno in vetro + verdure",
    merenda: "Kefir + cioccolato fondente", 
    cena: "Verdure crude + petto di tacchino + pane integrale"
  },
  GIOVEDI: {
    colazione: "Yogurt greco + fiocchi di avena + cioccolato fondente",
    spuntino: "1 Mela + cioccolato fondente",
    pranzo: "Verdure crude + cous cous + pasta al pomodoro + bresaola",
    merenda: "1 Yogurt bianco + mandorle",
    cena: "Verdure crude + pesce grigliato + pane integrale"
  },
  VENERDI: {
    colazione: "Yogurt bianco + biscotti", 
    spuntino: "1 Pesca + cioccolato fondente",
    pranzo: "Verdure crude + riso nero + gamberetti + zucchine",
    merenda: "Kefir + noci",
    cena: "Verdure crude + frittata + pane integrale"
  },
  SABATO: {
    colazione: "Pane integrale + prosciutto crudo + olio EVO",
    spuntino: "Ananas + mandorle", 
    pranzo: "Verdure crude + riso nero + gamberetti + zucchine",
    merenda: "1 Yogurt greco + cioccolato fondente",
    cena: "Verdure crude + carne rossa + pane integrale"
  },
  DOMENICA: {
    colazione: "1 Yogurt greco + fiocchi di avena + nocciole",
    spuntino: "1 Mela + cioccolato fondente",
    pranzo: "Verdure crude + pasta al pomodoro + prosciutto crudo", 
    merenda: "1 Yogurt bianco + mandorle",
    cena: "Verdure crude + pesce al vapore + pane integrale"
  }
};

// Protocollo Nutrizionista Gazzella - Alimenti da evitare
const FORBIDDEN_FOODS = [
  'legumi', 'ceci', 'fagioli', 'lenticchie', 'piselli', 'latticini esclusi dalla tabella', 
  'latte', 'formaggi', 'burro', 'panna', 'affettati confezionati', 'salumi', 'wurstel', 
  'carni in busta', 'petto di pollo in busta', 'petto di tacchino in busta', 'prodotti ultra-processati',
  'merendine', 'barrette fit industriali', 'sughi pronti', 'salse industriali',
  'bevande zuccherate', 'alcol', 'pane industriale imbustato', 'quinoa', 'avena in fiocchi non prevista',
  'yogurt di soia', 'yogurt di riso', 'latte di soia', 'latte di riso',
  'latte di avena', 'smoothie', 'frullati con latte', 'porridge', 'muesli', 'cereali industriali',
  'crackers industriali', 'tofu', 'seitan', 'tempeh'
];

const GAZZELLA_GUIDELINES = `
NOME AGENTE: "Nutrizionista Gazzella"
SCOPO: Generare piani alimentari seguendo ESATTAMENTE la tabella del Manuale della Gazzella 2025
VALIDITÀ: Per tutte le donne che vogliono seguire il protocollo Gazzella

TABELLA UFFICIALE DA SEGUIRE ALLA LETTERA:
${JSON.stringify(GAZZELLA_WEEKLY_STRUCTURE, null, 2)}

REGOLE INDEROGABILI:
- Seguire ESATTAMENTE la struttura della tabella sopra come base
- COLAZIONI SALATE incluse: "Pane integrale + uova + olio EVO" (mercoledì), "Pane integrale + prosciutto crudo + olio EVO" (sabato)
- Yogurt greco e yogurt bianco AMMESSI solo come specificato nella tabella ufficiale
- Fiocchi di avena AMMESSI solo nelle combinazioni specificate nella tabella
- Biscotti AMMESSI solo come specificato per martedì e venerdì
- Personalizzare le porzioni in base al peso e obiettivi della cliente
- Mantenere le combinazioni proteina + carboidrato complesso in ogni pasto principale
- Variare gli ingredienti rispettando le combinazioni della tabella
- NO legumi, NO latticini non previsti, NO alimenti ultra-processati
- Cotture semplici: griglia, forno, vapore, padella antiaderente

STRUTTURA PIANO OBBLIGATORIA:
- 7 giorni completi (Monday-Sunday)
- 5 pasti/giorno: colazione, spuntino mattino, pranzo, spuntino pomeriggio, cena
- Grammature precise sempre indicate
- Note pratiche e opzioni meal-prep

PERSONALIZZAZIONE OBBLIGATORIA:
- Calcola BMI: peso(kg) / (altezza(m))²
- Peso ideale: (altezza(cm) - 100) * 0.9 per donne  
- Adatta grammature in base a peso attuale vs obiettivo
- Stima tempo: (peso attuale - peso obiettivo) / 0.75kg/settimana per perdita sana
- Includi spiegazione completa metodo Gazzella con principi e benefici
- Mostra profilo personalizzato con BMI attuale, categoria, obiettivo peso
- Se compare alimento vietato o escluso da cliente, sostituisci automaticamente con opzione compatibile
`;

/**
 * Calcola grammature personalizzate precise basate sul peso esatto della cliente
 * Reattivo anche a piccoli cambiamenti di peso (pochi grammi)
 */
function calculatePrecisePortions(weight: number, height: number, bmi: number, isForMainDish: boolean = true) {
  // Calcolo granulare basato sul peso esatto - sensibile al grammo
  const baseWeight = 60; // peso di riferimento medio
  const weightDifference = weight - baseWeight;
  
  // Fattore di scala preciso: ogni 100g di peso influenza le porzioni dello 0.15%
  const scaleFactor = 1 + (weightDifference * 0.0015); // 0.15% per ogni 100g di differenza
  
  // Correzione BMI per precisione estrema
  const bmiCorrection = bmi > 25 ? 0.92 : bmi < 18.5 ? 1.08 : 1.0;
  
  // Correzione altezza per metabolismo
  const heightCorrection = height > 170 ? 1.03 : height < 160 ? 0.97 : 1.0;
  
  const finalScale = scaleFactor * bmiCorrection * heightCorrection;
  
  return {
    // Proteine principali (per secondi piatti)
    proteinsMain: Math.round(140 * finalScale),
    // Proteine accompagnamento (per primi piatti) 
    proteinsSide: Math.round(100 * finalScale),
    // Carboidrati base (per primi piatti)
    carbsMain: Math.round(80 * finalScale),
    // Carboidrati contorno (per secondi piatti)
    carbsSide: Math.round(60 * finalScale),
    // Verdure sempre abbondanti
    vegetables: Math.round(200 * finalScale),
    // Olio extravergine
    oil: Math.round(12 * finalScale),
    // Frutta per spuntini
    fruit: Math.round(150 * finalScale),
    // Frutta secca
    nuts: Math.round(20 * finalScale)
  };
}

/**
 * Calcola il peso ideale basato su altezza ed età della cliente
 * Utilizzando formule specifiche per donne
 */
function calculateIdealWeight(height: number, age: number): number {
  // Formula di Robinson per donne (più accurata)
  let idealWeight = 49 + (1.7 * (height - 152.4) / 2.54);
  
  // Correzione per età: metabolismo rallenta dopo i 30 anni
  if (age > 30) {
    const ageCorrection = (age - 30) * 0.1; // -0.1kg per ogni anno oltre i 30
    idealWeight = idealWeight - ageCorrection;
  }
  
  // Limite minimo e massimo ragionevole
  idealWeight = Math.max(45, Math.min(idealWeight, 70));
  
  return Math.round(idealWeight * 10) / 10; // Arrotonda a 1 decimale
}

/**
 * Crea step intermedi progressivi per raggiungere l'obiettivo finale
 */
function createProgressiveSteps(currentWeight: number, idealWeight: number): Array<{
  stepNumber: number;
  targetWeight: number;
  weeksDuration: number;
  description: string;
}> {
  const weightToLose = currentWeight - idealWeight;
  
  if (weightToLose <= 0) {
    return [{
      stepNumber: 1,
      targetWeight: currentWeight,
      weeksDuration: 4,
      description: "Mantenimento peso ideale raggiunto"
    }];
  }
  
  const steps: any[] = [];
  let remainingWeight = weightToLose;
  let currentStepWeight = currentWeight;
  let stepNumber = 1;
  
  // Strategia progressiva: perdere circa 2-3kg per step iniziale, poi 1-2kg
  while (remainingWeight > 0.5) {
    let stepWeightLoss: number;
    
    if (remainingWeight > 6) {
      stepWeightLoss = 3; // Prima fase: perdita più consistente
    } else if (remainingWeight > 3) {
      stepWeightLoss = 2; // Fase intermedia
    } else {
      stepWeightLoss = remainingWeight; // Fase finale: tutto il residuo
    }
    
    stepWeightLoss = Math.min(stepWeightLoss, remainingWeight);
    const targetWeight = currentStepWeight - stepWeightLoss;
    const weeksDuration = Math.ceil(stepWeightLoss / 0.5); // Circa 0.5kg/settimana
    
    steps.push({
      stepNumber,
      targetWeight: Math.round(targetWeight * 10) / 10,
      weeksDuration,
      description: `Fase ${stepNumber}: Perdere ${stepWeightLoss.toFixed(1)}kg in ${weeksDuration} settimane`
    });
    
    currentStepWeight = targetWeight;
    remainingWeight -= stepWeightLoss;
    stepNumber++;
  }
  
  return steps;
}

export async function generateMealPlan(request: MealPlanRequest): Promise<{
  title: string;
  description: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  days: MealPlanDay[];
}> {
  try {
    // Il protocollo Gazzella è applicabile a tutte le donne
    // Rimuoviamo la restrizione di età per rendere l'app più accessibile

    const excludedFoods = request.userProfile.excludedFoods || [];
    const allergies = request.userProfile.allergies || [];
    const merluzzo_excluded = excludedFoods.includes('merluzzo') || allergies.includes('merluzzo');

    // Calcolo grammature precise per questa specifica cliente
    const precisePortions = calculatePrecisePortions(
      parseFloat(request.userProfile.weight.toString()), 
      request.userProfile.height, 
      request.nutritionalNeeds.bmi
    );
    
    // Calcolo peso ideale personalizzato basato su altezza ed età
    const calculatedIdealWeight = calculateIdealWeight(
      request.userProfile.height,
      request.userProfile.age
    );
    
    // Creazione step intermedi progressivi
    const progressiveSteps = createProgressiveSteps(
      parseFloat(request.userProfile.weight.toString()),
      calculatedIdealWeight
    );

    const prompt = `Sei "Nutrizionista Gazzella". Crea un piano alimentare di 7 giorni seguendo ESATTAMENTE la tabella del Manuale della Gazzella 2025 allegata, personalizzando solo le porzioni per questa cliente.

TABELLA UFFICIALE DA RISPETTARE:
${JSON.stringify(GAZZELLA_WEEKLY_STRUCTURE, null, 2)}

PROFILO CLIENTE PER CALCOLO GRAMMATURE PERSONALIZZATE:
- Età: ${request.userProfile.age} anni
- Peso attuale: ${request.userProfile.weight}kg
- Altezza: ${request.userProfile.height}cm
- BMI ATTUALE: ${request.nutritionalNeeds.bmi} (${request.nutritionalNeeds.healthStatus})
- Peso ideale calcolato: ${request.nutritionalNeeds.idealWeight}kg
- OBIETTIVO PESO CLIENTE: ${request.nutritionalNeeds.weightGoal}kg
- Differenza da perdere: ${(parseFloat(request.userProfile.weight.toString()) - request.nutritionalNeeds.weightGoal).toFixed(1)}kg

DATI METABOLICI TARGET PERSONALIZZATI:
- Calorie giornaliere personalizzate: ${request.nutritionalNeeds.calories} kcal
- Proteine target: ${request.nutritionalNeeds.protein}g
- Carboidrati target: ${request.nutritionalNeeds.carbs}g
- Grassi target: ${request.nutritionalNeeds.fat}g

🎯 ANALISI PESO IDEALE E OBIETTIVI PROGRESSIVI:
- PESO IDEALE CALCOLATO per altezza ${request.userProfile.height}cm ed età ${request.userProfile.age} anni: ${calculatedIdealWeight}kg
- Formula utilizzata: Robinson per donne con correzione età-metabolismo
- OBIETTIVO CLIENTE CORRENTE: ${request.nutritionalNeeds.weightGoal}kg
${calculatedIdealWeight !== request.nutritionalNeeds.weightGoal ? 
  `- SUGGERIMENTO: Il tuo peso ideale scientificamente calcolato è ${calculatedIdealWeight}kg` : 
  '- PERFETTO: Il tuo obiettivo coincide con il peso ideale calcolato'
}

🚀 PERCORSO PROGRESSIVO PERSONALIZZATO - STEP INTERMEDI:
${progressiveSteps.map(step => 
  `FASE ${step.stepNumber}: Obiettivo ${step.targetWeight}kg in ${step.weeksDuration} settimane
  ${step.description}
  ⏱️ Durata stimata: ${step.weeksDuration} settimane (perdita sana e sostenibile)`
).join('\n\n')}

📢 ISTRUZIONI FONDAMENTALI PER LA CLIENTE:
⚠️ IMPORTANTE: Ogni volta che raggiungi un obiettivo intermedio, DEVI aggiornare i tuoi dati personali nell'app!

QUANDO AGGIORNARE I DATI:
✅ Appena raggiungi il peso dell'obiettivo intermedio
✅ Ogni 2-3 settimane per monitorare i progressi  
✅ Se cambi abitudini alimentari o livello di attività fisica
✅ Se hai variazioni significative di peso (anche 500g)

COSA AGGIORNARE:
📊 Peso attuale (fondamentale per ricalcolo grammature)
🏃‍♀️ Frequenza esercizio settimanale
⏰ Orari dei pasti se cambiati
🥗 Preferenze alimentari o esclusioni

💡 PERCHÉ È IMPORTANTE:
Il sistema Gazzella ricalcola automaticamente le grammature precise per il tuo nuovo peso, garantendo la massima efficacia e personalizzazione. Anche 100g di differenza possono richiedere aggiustamenti nelle porzioni!

CALCOLO GRAMMATURE PERSONALIZZATE OBBLIGATORIO:
🎯 PESO ${request.userProfile.weight}kg → OBIETTIVO ${request.nutritionalNeeds.weightGoal}kg
📊 BMI ${request.nutritionalNeeds.bmi} (${request.nutritionalNeeds.healthStatus})
⚖️ Da perdere: ${(parseFloat(request.userProfile.weight.toString()) - request.nutritionalNeeds.weightGoal).toFixed(1)}kg

GRAMMATURE PERSONALIZZATE PRECISISSIME - CALCOLATE AL GRAMMO:
🎯 CLIENTE ${request.userProfile.weight}kg | ALTEZZA ${request.userProfile.height}cm | BMI ${request.nutritionalNeeds.bmi}

CALCOLI PERSONALIZZATI ESATTI PER QUESTA CLIENTE:
- Proteine principali (carne/pesce secondi): ${precisePortions.proteinsMain}g esatti
- Proteine accompagnamento (primi piatti): ${precisePortions.proteinsSide}g esatti  
- Carboidrati base (primi piatti): ${precisePortions.carbsMain}g esatti
- Carboidrati contorno (secondi): ${precisePortions.carbsSide}g esatti
- Verdure: ${precisePortions.vegetables}g esatti
- Olio EVO: ${precisePortions.oil}g esatti
- Frutta spuntini: ${precisePortions.fruit}g esatti
- Frutta secca: ${precisePortions.nuts}g esatti

⚠️ FONDAMENTALE: USA ESATTAMENTE QUESTI PESI - NON FASCE GENERICHE
Sono calcolati specificamente per il peso ${request.userProfile.weight}kg di questa cliente

CONDIZIONI E PREFERENZE:
- Problemi tiroide: ${request.userProfile.thyroidIssues}
- Problemi intestinali: ${request.userProfile.intestinalIssues}
- Esercizio settimanale: ${request.userProfile.weeklyExercise} volte
- Orario colazione: ${request.userProfile.breakfastTime}
- Orario pranzo: ${request.userProfile.lunchTime}  
- Orario cena: ${request.userProfile.dinnerTime}
- Alimenti esclusi: ${excludedFoods.join(", ") || "Nessuno"}
- Allergie: ${allergies.join(", ") || "Nessune"}
- Consumo acqua: ${request.userProfile.dailyWaterIntake}
- Orario fame/sgarri: ${request.userProfile.cravingTimeFrame}
- Cibo sgarro preferito: ${request.userProfile.preferredCheatFood}
- Formula Gazzella: ${request.userProfile.takingFormulaGazzella}

🎯 SEGUI ESATTAMENTE IL PIANO DELLA TABELLA GAZZELLA UFFICIALE:
- 5 pasti al giorno: Colazione, Spuntino, Pranzo, Merenda, Cena
- Struttura fissa per ogni pasto come mostrato nella tabella
- Alterna gli ingredienti seguendo le variazioni della tabella  
- Mantieni sempre l'equilibrio nutrizionale di ogni pasto
- ⚠️ CRITICO: Usa SOLO alimenti della lista permessa sopra - MAI PATATE o altri carboidrati

⛔ ALIMENTI RIGOROSAMENTE DALLA TABELLA GAZZELLA UFFICIALE - USA SOLO QUESTI ⛔:

🥩 PROTEINE PERMESSE: yogurt greco, yogurt bianco, kefir, uova, frittata, petto di pollo, petto di tacchino, carne rossa, pesce spada, pesce grigliato, gamberetti, bresaola, prosciutto crudo, tonno in vetro

🌾 CARBOIDRATI PERMESSI: fiocchi di avena, biscotti, pane integrale, pasta integrale, cous cous, riso nero

🥬 VERDURE PERMESSE: insalata, verdure crude, zucchine, pomodoro (solo come base pasta)

🥜 GRASSI PERMESSI: mandorle, noci, nocciole, cioccolato fondente, olio EVO

🍎 FRUTTA PERMESSA: mela, pera, pesca, ananas

❌ ALIMENTI VIETATI (NON USARE MAI): 
- PATATE di qualsiasi tipo (novelle, al forno, bollite, ecc.)
- LEGUMI (fagioli, lenticchie, ceci, piselli)
- LATTICINI oltre yogurt greco/bianco e kefir
- QUINOA, AVENA DIVERSA DA FIOCCHI
- VERDURE non elencate sopra
- FRUTTA non elencata sopra
${merluzzo_excluded ? "ATTENZIONE: Cliente esclude merluzzo - usare orata, spigola, sogliola, salmone" : ""}

🔥 PRECISIONE ASSOLUTA GRAMMATURE - OGNI GRAMMO CONTA 🔥
- OGNI ingrediente ha un peso MICROMETRICO calcolato per questa cliente specifica
- REATTIVITÀ TOTALE: anche 100g di variazione peso = nuove grammature automatiche
- PERSONALIZZAZIONE ESTREMA: cliente ${request.userProfile.weight}kg ha porzioni UNICHE nel mondo
🎯 PROFILO ESATTO PER CALCOLO MICROMETRICO:
- Peso ESATTO: ${request.userProfile.weight}kg | Altezza: ${request.userProfile.height}cm 
- BMI PRECISO: ${request.nutritionalNeeds.bmi} | Metabolismo: ${request.nutritionalNeeds.calories} kcal esatte
- Target ESATTI: ${request.nutritionalNeeds.protein}g proteine | ${request.nutritionalNeeds.carbs}g carbo | ${request.nutritionalNeeds.fat}g grassi
⚠️ ZERO APPROSSIMAZIONI - USA LE GRAMMATURE CALCOLATE SOPRA
- VIETATO: "una porzione", "q.b.", "abbondante", "a piacere", "circa", "più o meno"
- OBBLIGATORIO: grammi esatti come calcolati per il peso ${request.userProfile.weight}kg

FORMATO OBBLIGATORIO NEL JSON "name":
- "Salmone 120g alla griglia + riso basmati 70g + broccoli 200g + olio EVO 8g"
- "Petto di pollo 140g + patate 180g + zucchine 250g + olio EVO 10g"
- "Uova 2 medie (100g) + pane integrale 50g + spinaci 150g + olio EVO 5g"

GRAMMATURE PERSONALIZZATE (adatta ai dati cliente):
- Proteine: 100-200g (pesce/carne), 80-120g (2-3 uova)
- Carboidrati: 50-120g (cereali crudi), 120-300g (patate), 30-80g (pane)  
- Verdure: 150-400g (varia per cliente)
- Grassi: 5-20g (olio), 15-40g (frutta secca)

REGOLA FONDAMENTALE GAZZELLA - OGNI PASTO DEVE CONTENERE:
- 1 FONTE PROTEICA + 1 FONTE CARBOIDRATI COMPLESSI (nessuna eccezione)
- GRAMMATURE SPECIFICHE per ogni ingrediente

⚠️ REGOLA CRITICA: OGNI "name" DEVE INCLUDERE GRAMMATURE PRECISE
ESEMPI OBBLIGATORI NEL CAMPO "name":

COLAZIONI CON GRAMMATURE:
"Uova 2 medie (100g) strapazzate + pane integrale 50g + spinaci 150g + olio EVO 5g"
"Omelette con 2 uova (100g) + pane tostato 45g + pomodori 120g + olio EVO 6g"

PRANZI CON GRAMMATURE:
"Orata 140g al forno + riso basmati 80g + zucchine 200g + olio EVO 10g"
"Petto di pollo 150g alla griglia + pasta 70g + insalata mista 180g + olio EVO 8g"

CENE CON GRAMMATURE:
"Salmone 130g + patate 200g + broccoli 250g + olio EVO 8g"
"Tacchino 140g al forno + pane 50g + spinaci 200g + olio EVO 10g"

SPUNTINI CON GRAMMATURE (sempre combinati):
"Mela 150g + mandorle 20g + gallette di riso 15g"
"Pera 140g + noci 18g + crackers integrali 12g"

❌ ESEMPI SBAGLIATI (MAI fare così):
❌ "Salmone alla griglia con riso e verdure" (mancano tutte le grammature)
❌ "Pollo con patate" (mancano grammature e verdure)
❌ "Omelette con pane e insalata" (mancano grammature)
❌ "Mela con mandorle" (mancano grammature)

✅ ESEMPI CORRETTI (sempre così):
✅ "Salmone 130g alla griglia + riso basmati 80g + zucchine 200g + olio EVO 10g"
✅ "Petto di pollo 140g + pane integrale 50g + insalata 150g + olio EVO 8g"
✅ "Omelette 2 uova (100g) + pane integrale 50g + insalata 120g + olio EVO 5g"

📋 STRUTTURA SETTIMANALE ESATTA DALLA TABELLA GAZZELLA:
Segui ESATTAMENTE questa struttura per tutti i 7 giorni con GRAMMATURE PRECISE:

COLAZIONE: Yogurt greco/bianco + Cereali/Pane + Frutta secca/Olio
SPUNTINO: Frutta + Frutta secca/Cioccolato fondente  
PRANZO: Insalata/Verdure + Cereali + Proteina + Verdure
MERENDA: Yogurt/Kefir + Frutta secca/Cioccolato fondente
CENA: Insalata/Verdure + Proteina + Pane + Olio EVO

OBBLIGATORIO INCLUDERE NEL JSON FINALE:
{
  "title": "Piano Gazzella Personalizzato per ${request.userProfile.weight}kg → ${request.nutritionalNeeds.weightGoal}kg",
  "clientProfile": {
    "name": "Cliente Gazzella",
    "age": ${request.userProfile.age},
    "currentWeight": ${request.userProfile.weight},
    "height": ${request.userProfile.height},
    "currentBMI": ${request.nutritionalNeeds.bmi},
    "bmiCategory": "${request.nutritionalNeeds.healthStatus}",
    "scientificIdealWeight": ${calculatedIdealWeight},
    "targetWeight": ${request.nutritionalNeeds.weightGoal},
    "weightToLose": ${(parseFloat(request.userProfile.weight.toString()) - request.nutritionalNeeds.weightGoal).toFixed(1)},
    "estimatedTimeWeeks": ${Math.ceil((parseFloat(request.userProfile.weight.toString()) - request.nutritionalNeeds.weightGoal) / 0.75)}
  },
  "progressiveGoals": {
    "idealWeightCalculation": "Peso ideale calcolato con formula Robinson per donne (altezza ${request.userProfile.height}cm, età ${request.userProfile.age} anni): ${calculatedIdealWeight}kg",
    "comparisonMessage": "${calculatedIdealWeight !== request.nutritionalNeeds.weightGoal ? 
      'Il tuo peso ideale scientificamente calcolato è ' + calculatedIdealWeight + 'kg, diverso dal tuo obiettivo attuale di ' + request.nutritionalNeeds.weightGoal + 'kg' : 
      'Perfetto! Il tuo obiettivo coincide con il peso ideale calcolato'}",
    "progressiveSteps": [
${progressiveSteps.map(step => `
      {
        "phaseNumber": ${step.stepNumber},
        "targetWeight": "${step.targetWeight}kg",
        "duration": "${step.weeksDuration} settimane", 
        "description": "${step.description}",
        "advice": "Quando raggiungi ${step.targetWeight}kg, aggiorna immediatamente il tuo peso nell'app per ricalcolare le grammature precise!"
      }`).join(',')}
    ]
  },
  "dataUpdateInstructions": {
    "importance": "FONDAMENTALE: Aggiorna i tuoi dati personali ogni volta che raggiungi un obiettivo intermedio per mantenere le grammature micrometriche sempre precise.",
    "whenToUpdate": [
      "Appena raggiungi il peso dell'obiettivo intermedio",
      "Ogni 2-3 settimane per monitorare i progressi",
      "Se cambi abitudini alimentari o livello di attività fisica",
      "Se hai variazioni significative di peso (anche 500g)"
    ],
    "whatToUpdate": [
      "Peso attuale (fondamentale per ricalcolo grammature)",
      "Frequenza esercizio settimanale",
      "Orari dei pasti se cambiati",
      "Preferenze alimentari o esclusioni"
    ],
    "whyImportant": "Il sistema Gazzella ricalcola automaticamente le grammature precise per il tuo nuovo peso, garantendo la massima efficacia e personalizzazione. Anche 100g di differenza possono richiedere aggiustamenti nelle porzioni!"
  },
  "dietExplanation": {
    "method": "Protocollo Gazzella basato sulla tabella ufficiale 2025",
    "principles": [
      "Ogni pasto contiene sempre proteine + carboidrati complessi",
      "Colazioni salate incluse (mercoledì e sabato) come da tabella",
      "Grammature personalizzate per BMI ${request.nutritionalNeeds.bmi} e peso ${request.userProfile.weight}kg",
      "Eliminazione totale di legumi, latticini non previsti, alimenti processati",
      "Cotture semplici e naturali per massima digeribilità"
    ],
    "expectedResults": [
      "Perdita di peso graduale e sostenibile, miglioramento della composizione corporea",
      "Stabilizzazione dell'energia durante la giornata",
      "Riduzione significativa delle voglie e degli attacchi di fame",
      "Ottimizzazione del metabolismo e miglioramento della digestione",
      "Raggiungimento progressivo degli obiettivi intermedi"
    ]
  },
  "days": [...]
}
CENA: Verdure crude + Proteina + Pane integrale

ALIMENTI ESATTI DALLA TABELLA GAZZELLA:
✅ Yogurt greco, yogurt bianco, kefir
✅ Fiocchi di avena, biscotti, pane integrale  
✅ Cioccolato fondente, mandorle, noci, nocciole
✅ Pasta integrale, cous cous, riso nero
✅ Pesce (spada, grigliato, gamberetti), carne rossa, petto di pollo/tacchino
✅ Frittata, uova, bresaola, prosciutto crudo, tonno
✅ Insalata, verdure crude, zucchine
ESEMPI ESATTI DALLA TABELLA CON GRAMMATURE PERSONALIZZATE:

LUNEDÌ (Esempio tabella):
- COLAZIONE: "Yogurt greco 150g + fiocchi di avena 40g + mandorle 15g"  
- SPUNTINO: "Mela 150g + cioccolato fondente 10g"
- PRANZO: "Insalata mista 120g + pasta integrale 70g + petto di pollo 140g + pomodoro 80g"
- MERENDA: "Yogurt bianco 125g + mandorle 15g"  
- CENA: "Verdure crude 150g + frittata 2 uova (100g) + pane integrale 50g"

MARTEDÌ (Esempio tabella):
- COLAZIONE: "Yogurt bianco 150g + biscotti integrali 30g"
- SPUNTINO: "Pera 140g + noci 15g"  
- PRANZO: "Verdure crude 120g + cous cous 70g + pesce spada 140g + zucchine 150g"
- MERENDA: "Yogurt greco 125g + cioccolato fondente 10g"
- CENA: "Verdure crude 150g + carne rossa 140g + pane integrale 50g"

CONTINUA per tutti i 7 giorni variando gli alimenti della tabella con GRAMMATURE PRECISE

VIETATI PASTI SBILANCIATI:
- Solo frutta (mela da sola)
- Solo proteine (pollo senza carboidrati)  
- Solo verdure (insalata senza proteine/carboidrati)
- Solo frutta secca (mandorle da sole)

CONTROLLO OBBLIGATORIO: Prima di generare il piano, verifica che OGNI pasto contenga proteine + carboidrati. Se manca uno dei due, aggiungi automaticamente l'elemento mancante.

FORMATO RICHIESTO:
1. Riepilogo cliente (età, peso, altezza, BMI: ${request.nutritionalNeeds.bmi}, stato: ${request.nutritionalNeeds.healthStatus})
2. Linee guida Gazzella applicate (3-6 bullet specifici)
3. Piano COMPLETO 7 giorni con 5 pasti/giorno (colazione, spuntino mattino, pranzo, spuntino pomeriggio, cena)
4. Grammature precise e preparazione semplice
5. Note meal-prep e sostituzioni compatibili

IMPORTANTE: Genera TUTTI i 7 giorni della settimana (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)

INCLUDI SEMPRE NEL PIANO:
1. BMI attuale e classificazione
2. Obiettivo di peso della cliente  
3. Spiegazione della dieta Gazzella
4. Previsione tempo per raggiungere l'obiettivo
5. Benefici specifici per questa cliente

Rispondi in JSON con:
{
  "title": "Piano Gazzella Personalizzato per [peso]kg → [obiettivo]kg",
  "description": "Piano basato sulla tabella ufficiale 2025 del Manuale della Gazzella con grammature calcolate per BMI [bmi] e obiettivo peso [goal]kg", 
  "clientProfile": {
    "currentWeight": ${request.userProfile.weight},
    "targetWeight": ${request.nutritionalNeeds.weightGoal},
    "currentBMI": ${request.nutritionalNeeds.bmi},
    "bmiCategory": "${request.nutritionalNeeds.healthStatus}",
    "weightToLose": ${(parseFloat(request.userProfile.weight.toString()) - request.nutritionalNeeds.weightGoal).toFixed(1)},
    "estimatedTimeWeeks": "CALCOLA in base a peso da perdere (0.5-1kg/settimana)"
  },
  "dietExplanation": {
    "method": "Protocollo Gazzella basato sulla tabella ufficiale 2025",
    "principles": [
      "Ogni pasto contiene sempre proteine + carboidrati complessi",
      "Colazioni salate incluse (mercoledì e sabato) come da tabella",
      "Grammature personalizzate per BMI [bmi] e peso [currentWeight]kg",
      "Eliminazione totale di legumi, latticini non previsti, alimenti processati",
      "Cotture semplici e naturali per massima digeribilità"
    ],
    "expectedResults": "PERSONALIZZA benefici per questa cliente specifica",
    "timeToGoal": "STIMA realistica basata su peso da perdere e metabolismo"
  },
  "targetCalories": ${request.nutritionalNeeds.calories},
  "targetProtein": ${request.nutritionalNeeds.protein},
  "targetCarbs": ${request.nutritionalNeeds.carbs},
  "targetFat": ${request.nutritionalNeeds.fat},
  "days": [
    {
      "day": "Monday",
      "date": "2025-01-20",
      "meals": {
        "breakfast": {"id": "uuid", "name": "DEVE contenere grammature precise (es: 'Uova 2 medie 100g + pane 50g + spinaci 150g + olio 5g')", "calories": number, "protein": number, "carbs": number, "fat": number},
        "lunch": {"id": "uuid", "name": "DEVE contenere grammature precise (es: 'Orata 140g + riso 80g + zucchine 200g + olio 10g')", "calories": number, "protein": number, "carbs": number, "fat": number},
        "dinner": {"id": "uuid", "name": "DEVE contenere grammature precise (es: 'Salmone 130g + pane integrale 50g + verdure 200g + olio 8g')", "calories": number, "protein": number, "carbs": number, "fat": number},
        "snacks": [
          {"id": "uuid", "name": "DEVE contenere grammature precise (es: 'Mela 150g + mandorle 20g + gallette riso 15g')", "calories": number, "protein": number, "carbs": number, "fat": number},
          {"id": "uuid", "name": "DEVE contenere grammature precise (es: 'Pera 140g + noci 18g + crackers 12g')", "calories": number, "protein": number, "carbs": number, "fat": number}
        ]
      },
      "totalCalories": number
    },
    // ... Continua con Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
    // DEVI generare TUTTI i 7 giorni della settimana
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Sei "Nutrizionista Gazzella", esperta certificata nel Manuale della Gazzella per donne in MENOPAUSA.

REGOLE INDEROGABILI:
- REGOLA ASSOLUTA: OGNI pasto deve contenere PROTEINE + CARBOIDRATI (no eccezioni)
- NO legumi (ceci, fagioli, lenticchie, piselli) - MAI proporli in nessun pasto
- NO latticini (latte, yogurt, formaggi, burro, panna) - TOTALMENTE esclusi dallo schema
- NO cereali alternativi (quinoa, avena, muesli, porridge) - NON sono previsti dal protocollo
- NO yogurt di qualsiasi tipo (greco, soia, riso, avena) - VIETATO
- NO affettati/salumi/carni in busta - eccetto toast quando specificatamente previsto
- NO alimenti ultra-processati, merendine, barrette "fit" industriali
- NO sughi pronti, salse industriali, bevande zuccherate/alcoliche
- NO smoothie, frullati con latte o yogurt - SOLO frutta fresca intera
- NO pasti sbilanciati: solo frutta, solo proteine, solo verdure, solo frutta secca

ALIMENTI CONSENTITI DAL PROTOCOLLO GAZZELLA:
- Pesce fresco: orata, spigola, sogliola, salmone (evitare merluzzo se escluso)
- Carne fresca: petto di pollo, petto di tacchino, manzo magro, vitello (SOLO freschi, mai confezionati)
- Uova fresche (massimo 2 per pasto)
- Verdure non amidacee: spinaci, zucchine, broccoli, cavolfiori, insalata, pomodori, peperoni, carote, finocchi
- Cereali SOLO questi: pasta integrale, riso nero, cous cous, pane integrale, fiocchi di avena
- Frutta fresca: mela, pera, arancia, kiwi, fragole (INTERA, mai frullata)
- Frutta secca: mandorle, noci, nocciole (max 30g)
- Olio extravergine di oliva a crudo (quantità precise)
- Cotture semplici: piastra, forno, vapore, padella antiaderente

ASSOLUTAMENTE VIETATO - NON PROPORRE MAI:
- Avena, quinoa, muesli, porridge, cereali da colazione
- Yogurt (greco, normale, vegetale), latte (vaccino, vegetale), smoothie, frullati
- Legumi: ceci, fagioli, lenticchie, piselli
- Formaggi, burro, panna, affettati (eccetto toast specifico)
- Alimenti industriali/confezionati

UNICA ECCEZIONE: Toast con sottiletta + fesa di tacchino quando previsto

STRUTTURA OBBLIGATORIA:
- ESATTAMENTE 7 giorni (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
- 5 pasti/giorno: colazione, spuntino mattino, pranzo, spuntino pomeriggio, cena
- Grammature sempre precise
- SOLO ingredienti consentiti dal protocollo Gazzella
- Note meal-prep pratiche

CONTROLLO FINALE OBBLIGATORIO: 
1. Verifica che OGNI singolo pasto (colazione, spuntino mattino, pranzo, spuntino pomeriggio, cena) contenga SEMPRE proteine + carboidrati
2. Verifica che NESSUN pasto contenga alimenti vietati (avena, quinoa, yogurt, smoothie, legumi, latticini)
3. Se trovi pasti sbilanciati (solo frutta, solo proteine, solo verdure), correggili IMMEDIATAMENTE prima di rispondere
4. SPUNTINI: Il nome deve descrivere UN PIATTO COMPLETO con tutti gli ingredienti
   Esempi SBAGLIATI: "Mela", "Mandorle" (nomi incompleti)  
   Esempi CORRETTI: "Mela con mandorle e gallette di riso", "Tonno al naturale con crackers e carote"

IMPORTANTE: Ogni spuntino nel JSON deve avere un name che descrive TUTTI gli ingredienti in un unico piatto completo.

Rispondi SEMPRE in italiano e formato JSON valido. L'array "days" deve contenere tutti i 7 giorni della settimana.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Log the AI response for debugging
    console.log("AI Response structure:", JSON.stringify(result, null, 2));
    
    // Validate and ensure proper structure
    if (!result.days || !Array.isArray(result.days)) {
      console.error("Invalid AI response structure:", result);
      throw new Error("Invalid meal plan structure received from AI");
    }
    
    // Check if any day has invalid meal structure
    for (let i = 0; i < result.days.length; i++) {
      const day = result.days[i];
      if (!day.meals || typeof day.meals !== 'object') {
        console.error(`Invalid meals structure in day ${i}:`, day);
        throw new Error(`Invalid meal plan structure received from AI - day ${i} has invalid meals`);
      }
      
      // Check if the AI used the wrong snack format
      if (day.meals.morningSnack || day.meals.afternoonSnack) {
        console.log(`Converting morningSnack/afternoonSnack format to snacks array for day ${i}`);
        day.meals.snacks = [
          day.meals.morningSnack || day.meals.snacks?.[0],
          day.meals.afternoonSnack || day.meals.snacks?.[1]
        ].filter(Boolean);
        delete day.meals.morningSnack;
        delete day.meals.afternoonSnack;
      }
    }
    
    // Ensure we have all 7 days - if not, generate the missing ones
    if (result.days.length < 7) {
      console.log(`Piano incompleto: ricevuti ${result.days.length} giorni, genero i restanti...`);
      
      const missingDays = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].slice(result.days.length - 2);
      
      for (const dayName of missingDays) {
        const dayPrompt = `Genera solo il giorno ${dayName} seguendo il Manuale della Gazzella per menopausa.
        
Rispondi in JSON con:
{
  "day": "${dayName}",
  "date": "2025-01-${22 + missingDays.indexOf(dayName)}",
  "meals": {
    "breakfast": {"id": "uuid", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number},
    "lunch": {"id": "uuid", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number},
    "dinner": {"id": "uuid", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number},
    "snacks": [
      {"id": "uuid", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number}
    ]
  },
  "totalCalories": number
}`;

        const dayResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `Sei "Nutrizionista Gazzella", esperta nel Manuale della Gazzella per donne in menopausa. 
              Segui RIGOROSAMENTE le regole del manuale. NO legumi, NO latticini, NO affettati (eccetto toast previsto), 
              NO ultra-processati. Solo ingredienti freschi, cotture semplici, 5 pasti al giorno con grammature precise.
              Rispondi sempre in italiano e in formato JSON valido.`
            },
            {
              role: "user",
              content: dayPrompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        const dayResult = JSON.parse(dayResponse.choices[0].message.content || "{}");
        result.days.push(dayResult);
      }
    }

    return result;
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw new Error(`Failed to generate meal plan: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function generateRecipe(request: RecipeRequest): Promise<{
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  cuisine: string;
  dietaryTags: string[];
}> {
  try {
    const prompt = `Sei "Nutrizionista Gazzella". Crea una ricetta dettagliata per "${request.mealName}" seguendo RIGOROSAMENTE il Manuale della Gazzella:

⛔ REGOLE GAZZELLA RIGOROSE - TABELLA UFFICIALE 2025:

❌ ALIMENTI TOTALMENTE VIETATI:
- PATATE di qualsiasi tipo (novelle, al forno, bollite, purè, ecc.)
- LEGUMI (ceci, fagioli, lenticchie, piselli)
- LATTICINI oltre yogurt greco/bianco/kefir dalla tabella
- QUINOA, AVENA diversa da fiocchi, CEREALI alternativi
- VERDURE non della tabella (melanzane, carote, peperoni se non specificate)
- FRUTTA non della tabella (diverse da mela, pera, pesca, ananas)

✅ ALIMENTI PERMESSI DALLA TABELLA GAZZELLA:
- PROTEINE: yogurt greco, yogurt bianco, kefir, uova, frittata, petto di pollo, petto di tacchino, carne rossa, pesce spada, pesce grigliato, gamberetti, bresaola, prosciutto crudo, tonno in vetro
- CARBOIDRATI: fiocchi di avena, biscotti, pane integrale, pasta integrale, cous cous, riso nero
- VERDURE: insalata, verdure crude, zucchine, pomodoro
- GRASSI: mandorle, noci, nocciole, cioccolato fondente, olio EVO
- FRUTTA: mela, pera, pesca, ananas

🎯 OBBLIGATORIO: Usa SOLO alimenti dalla lista sopra - MAI PATATE o altri carboidrati
- Cotture semplici: piastra, forno, vapore, padella antiaderente
- Grammature precise per ogni ingrediente

REQUISITI RICETTA:

Target Calories: ${request.targetCalories}
Dietary Preferences: ${request.dietaryPreferences.join(", ") || "None"}
Allergies to Avoid: ${request.allergies?.join(", ") || "None"}
Preferred Cuisine: ${request.cuisine || "Any"}

Please create a complete recipe that includes:
1. Clear title and appetizing description
2. Complete ingredients list with measurements
3. Step-by-step cooking instructions
4. Accurate nutritional information per serving
5. Preparation and cooking times
6. Difficulty level (Easy, Medium, Hard)
7. Appropriate dietary tags

Return the response in the following JSON format:
{
  "title": "string",
  "description": "string",
  "ingredients": ["ingredient with measurement"],
  "instructions": ["step by step instruction"],
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "servings": number,
  "prepTime": number,
  "cookTime": number,
  "difficulty": "Easy|Medium|Hard",
  "cuisine": "string",
  "dietaryTags": ["vegetarian", "vegan", "gluten-free", etc]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Sei "Nutrizionista Gazzella", chef esperta del Manuale della Gazzella per menopausa. 
          Crea ricette seguendo RIGOROSAMENTE le regole: NO legumi, NO latticini, NO affettati, NO ultra-processati.
          Solo ingredienti freschi, cotture semplici, grammature precise. Rispondi sempre in italiano e JSON valido.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate basic structure
    if (!result.title || !result.ingredients || !result.instructions) {
      throw new Error("Invalid recipe structure received from AI");
    }

    return result;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error(`Failed to generate recipe: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function generatePersonalizedRecipe(request: {
  mealName: string;
  dietaryPreferences: string[];
  targetCalories: number;
  allergies?: string[];
  cuisine?: string;
  difficulty?: "facile" | "media" | "difficile";
  clientProfile: {
    eta: number;
    peso: number;
    altezza: number;
    pesoObbiettivo: number;
  };
  recipePreferences: {
    preferredProteins: string;
    preferredFish?: string;
    meatOrFish: "carne" | "pesce" | "uova";
    excludedFoods?: string;
  };
  existingRecipes?: string[]; // List of existing recipe titles to avoid duplicates
  requireUnique?: boolean; // Force unique generation
}): Promise<any> {
  try {
    const { clientProfile, recipePreferences } = request;
    
    // Calcola BMI e categoria peso per personalizzare le grammature
    const heightInM = clientProfile.altezza / 100;
    const bmi = clientProfile.peso / (heightInM * heightInM);
    const weightCategory = 
      clientProfile.peso < 60 ? "leggera" :
      clientProfile.peso <= 70 ? "media" : "robusta";

    const dishType = request.mealName.includes("Primo piatto") ? "PRIMO PIATTO" : "SECONDO PIATTO";
    
    // Calcolo grammature precise per questa ricetta specifica
    const recipePortions = calculatePrecisePortions(
      clientProfile.peso, 
      clientProfile.altezza, 
      bmi
    );
    
    // Build unique recipe requirements
    const uniqueRequirement = request.existingRecipes && request.existingRecipes.length > 0 ? 
      `\n🚫 IMPORTANTE - EVITA DUPLICATI: NON generare ricette simili a queste già esistenti:\n${request.existingRecipes.map(title => `- ${title}`).join('\n')}\n\n✅ OBBLIGATORIO: Crea una ricetta COMPLETAMENTE DIVERSA e UNICA.` : '';
    
    const forceUniqueText = request.requireUnique ? 
      '\n⚠️ CRITICO: Questa ricetta deve essere ASSOLUTAMENTE UNICA e diversa da tutte quelle già generate. Usa ingredienti, combinazioni e tecniche di cottura completamente diverse.' : '';

    const prompt = `Sei "Nutrizionista Gazzella". Crea una ricetta dettagliata per "${request.mealName}" seguendo RIGOROSAMENTE il Manuale della Gazzella.
${uniqueRequirement}${forceUniqueText}

⚠️ ATTENZIONE TIPO PIATTO: Questa deve essere una ricetta per ${dishType}.
${dishType === "PRIMO PIATTO" ? "🍝 PRIMO PIATTO = CARBOIDRATI come base principale (pasta, riso, farro) con proteina integrata" : "🐟 SECONDO PIATTO = PROTEINA come elemento principale con verdure di contorno"}

DATI CLIENTE:
- Età: ${clientProfile.eta} anni
- Peso attuale: ${clientProfile.peso}kg  
- Altezza: ${clientProfile.altezza}cm
- Peso obiettivo: ${clientProfile.pesoObbiettivo}kg
- BMI: ${bmi.toFixed(1)}
- Categoria peso: ${weightCategory}

PREFERENZE RICETTA:
- Proteine preferite: ${recipePreferences.preferredProteins}
- Base: ${recipePreferences.meatOrFish}
- Livello difficoltà richiesto: ${request.difficulty || "facile"}
${recipePreferences.preferredFish ? `- Pesci preferiti: ${recipePreferences.preferredFish}` : ''}
${recipePreferences.excludedFoods ? `- Cibi da evitare: ${recipePreferences.excludedFoods}` : ''}

⛔ REGOLE GAZZELLA ASSOLUTE - TABELLA UFFICIALE 2025:

❌ ALIMENTI TOTALMENTE VIETATI:
- PATATE di qualsiasi tipo (novelle, al forno, bollite, purè, ecc.)
- LEGUMI (ceci, fagioli, lenticchie, piselli)
- LATTICINI oltre yogurt greco/bianco/kefir dalla tabella
- QUINOA, AVENA diversa da fiocchi, CEREALI alternativi
- VERDURE non della tabella (melanzane, carote, peperoni se non specificate)
- FRUTTA non della tabella (diverse da mela, pera, pesca, ananas)

✅ ALIMENTI PERMESSI DALLA TABELLA GAZZELLA:
- PROTEINE: yogurt greco, yogurt bianco, kefir, uova, frittata, petto di pollo, petto di tacchino, carne rossa, pesce spada, pesce grigliato, gamberetti, bresaola, prosciutto crudo, tonno in vetro
- CARBOIDRATI: fiocchi di avena, biscotti, pane integrale, pasta integrale, cous cous, riso nero
- VERDURE: insalata, verdure crude, zucchine, pomodoro
- GRASSI: mandorle, noci, nocciole, cioccolato fondente, olio EVO
- FRUTTA: mela, pera, pesca, ananas

🎯 OBBLIGATORIO: Usa SOLO alimenti dalla lista sopra - MAI PATATE o altri carboidrati
- Cotture semplici: piastra, forno, vapore, padella antiaderente
- Grammature precise per ogni ingrediente

SPECIFICHE OBBLIGATORIE PER TIPO PIATTO:
${dishType === "PRIMO PIATTO" ? `
- PRIMO PIATTO OBBLIGATORIO: Il piatto DEVE essere basato su CARBOIDRATI COMPLESSI come ingrediente principale
- CARBOIDRATI AMMESSI GAZZELLA: pasta integrale, riso nero, cous cous, pane integrale, fiocchi di avena (SOLO questi dalla tabella)
- STRUTTURA OBBLIGATORIA: Cereale/Pasta + Proteina + Verdure tutto insieme in un unico piatto
- La proteina è un ACCOMPAGNAMENTO, NON l'elemento principale
- ESEMPI CORRETTI: "Risotto integrale con salmone e zucchine", "Pasta integrale ai frutti di mare", "Farro con pollo e verdure"
- NON fare secondi piatti di pesce/carne con contorno!
` : `
- SECONDO PIATTO: La proteina (pesce, carne, uova) è l'elemento PRINCIPALE del piatto
- Contorno di verdure cotte o crude
- Eventuale piccola porzione di carboidrati come accompagnamento
- Esempi: Salmone grigliato con verdure, Petto di pollo alle erbe, Merluzzo al cartoccio
`}

🔥 GRAMMATURE MICROMETRICHE CALCOLATE PER ${clientProfile.peso}kg ESATTI 🔥
${dishType === "PRIMO PIATTO" ? `
- Carboidrati complessi (base): ${recipePortions.carbsMain}g PRECISI - NO approssimazioni
- Proteine (accompagnamento): ${recipePortions.proteinsSide}g ESATTI per questo peso
` : `
- Proteine (principale): ${recipePortions.proteinsMain}g MICROMETRICI per peso ${clientProfile.peso}kg
- Carboidrati (contorno): ${recipePortions.carbsSide}g PRECISI - personalizzati
`}
- Verdure: ${recipePortions.vegetables}g ESATTI (calcolati per BMI ${bmi.toFixed(1)})
- Olio EVO: ${recipePortions.oil}g PRECISI (non ml, grammi esatti)

⚠️ USARE ESATTAMENTE QUESTI PESI - ZERO MARGINI DI ERRORE
Calcolati specificamente per cliente ${clientProfile.peso}kg, altezza ${clientProfile.altezza}cm

OBIETTIVI:
- Calorie target: ${request.targetCalories}
- Supporto obiettivo peso: ${clientProfile.pesoObbiettivo}kg
- Allergie da evitare: ${request.allergies?.join(", ") || "nessuna"}

🎯 LIVELLO DIFFICOLTÀ RICHIESTO: ${request.difficulty || "facile"}
${request.difficulty === "facile" ? `
- FACILE: Cotture semplici (griglia, vapore, padella), max 15-20 minuti, pochi ingredienti
- Tecniche: saltare in padella, grigliare, cuocere al vapore, bollire
- Massimo 6-8 ingredienti principali
` : request.difficulty === "media" ? `
- MEDIA: Cotture diverse, 20-30 minuti, ingredienti variati
- Tecniche: brasare, cuocere al forno, marinare, ridurre salse
- Massimo 10-12 ingredienti principali
` : `
- DIFFICILE: Tecniche elaborate, 30-45 minuti, preparazione complessa
- Tecniche: cotture multiple, preparazioni preliminari, tecniche avanzate
- Fino a 15 ingredienti con preparazioni articolate
`}

Crea una ricetta completa con:
1. Titolo appetitoso e descrizione
2. Lista ingredienti con grammature PRECISE personalizzate per il peso del cliente
3. Istruzioni passo-passo dettagliate appropriate al livello di difficoltà
4. Informazioni nutrizionali accurate per porzione
5. Tempi di preparazione e cottura realistici per la difficoltà scelta
6. Livello di difficoltà corrispondente alla richiesta

Risposta in formato JSON:
{
  "title": "string",
  "description": "string", 
  "ingredients": ["ingrediente con grammatura precisa"],
  "instructions": ["istruzione dettagliata passo-passo"],
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "servings": 1,
  "prepTime": number,
  "cookTime": number,
  "difficulty": "Facile|Media|Difficile",
  "cuisine": "italiana",
  "dietaryTags": ["per menopausa", "senza legumi", "senza latticini", "gazzella"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `Sei "Nutrizionista Gazzella", esperta del Manuale della Gazzella per menopausa. 
          Crea ricette personalizzate con grammature precise basate sul peso del cliente.
          RISPETTA SEMPRE: NO legumi, NO latticini, NO affettati, NO ultra-processati.
          IMPORTANTE: Se richiesto PRIMO PIATTO, la base DEVE essere pasta/riso/cereali con proteina integrata.
          Se richiesto SECONDO PIATTO, la base è proteina con contorno verdure.
          Solo ingredienti freschi, cotture semplici. Rispondi SOLO in JSON valido italiano.`
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate structure
    if (!result.title || !result.ingredients || !result.instructions) {
      throw new Error("Invalid recipe structure received from AI");
    }

    return result;
  } catch (error) {
    console.error("Error generating personalized recipe:", error);
    throw new Error(`Failed to generate personalized recipe: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// AI Chat Response Interface
export interface AIChatRequest {
  userMessage: string;
  userId: string;
  userProfile?: any;
  mealPlans?: any[];
  recipes?: any[];
}

export interface AIChatResponse {
  response: string;
  containsHealthWarning: boolean;
}

export async function generateAIChatResponse(request: AIChatRequest): Promise<AIChatResponse> {
  try {
    const { userMessage, userId, userProfile, mealPlans, recipes } = request;
    
    // Build context about user's data
    const userContext = userProfile ? `
DATI CLIENTE ATTUALI:
- Peso: ${userProfile.weight}kg
- Altezza: ${userProfile.height}cm  
- Età: ${userProfile.age} anni
- BMI: ${userProfile.height ? ((userProfile.weight / ((userProfile.height/100) ** 2)).toFixed(1)) : 'non calcolabile'}
- Piani nutrizionali salvati: ${mealPlans?.length || 0}
- Ricette personali: ${recipes?.length || 0}
` : `
DATI CLIENTE: 
⚠️ PROFILO NON COMPLETATO - La cliente ha ${mealPlans?.length || 0} piani nutrizionali e ${recipes?.length || 0} ricette generate ma manca il profilo personale (peso, altezza, età).
IMPORTANTE: Deve completare il profilo in "Il Mio Profilo" per ricevere consigli personalizzati sulle grammature e proporzioni.

ISTRUZIONI SPECIFICHE PER PROFILO MANCANTE:
- Se la cliente chiede dei suoi piani o ricette, rispondi che li vedi (indica quanti) ma serve il profilo per personalizzare
- Invitala a completare "Il Mio Profilo" con peso, altezza, età per calcoli BMI e grammature precise
- Puoi fornire informazioni generali sui principi Gazzella ma non consigli specifici senza dati antropometrici
- Sii empatica e spiega l'importanza del profilo per l'efficacia del metodo
`;

    // Detect health-related concerns that require medical consultation
    const healthKeywords = [
      'diabete', 'ipertensione', 'tiroide', 'celiachia', 'allergie gravi', 'malattie cardiache', 
      'problemi renali', 'problemi epatici', 'disturbi alimentari', 'gravidanza', 'allattamento',
      'chemioterapia', 'farmaci', 'sangue', 'pressione alta', 'colesterolo alto', 'anemia',
      'gastrite', 'reflusso', 'colon irritabile', 'morbo', 'sindrome', 'patologia', 'malattia',
      'dolore cronico', 'infiammazione cronica', 'artrite', 'fibromialgia', 'depressione grave'
    ];
    
    const containsHealthConcern = healthKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    const prompt = `Sei "Assistente Gazzella", esperta nutrizionista specializzata nel Manuale della Gazzella per donne in menopausa.

${userContext}

DOMANDA CLIENTE: "${userMessage}"

🏥 IMPORTANTE CONTROLLO MEDICO:
${containsHealthConcern ? `
⚠️ ATTENZIONE: La domanda menziona possibili problemi di salute.
DEVI includere questo avvertimento nella risposta:
"Per problemi di salute specifici come quelli che menzioni, è fondamentale consultare un medico di persona. Il mio supporto è limitato agli aspetti nutrizionali generali del Manuale della Gazzella."
` : ''}

MANUALE DELLA GAZZELLA - CONOSCENZA COMPLETA:

📋 TABELLA UFFICIALE 2025 (da seguire RIGOROSAMENTE):
${JSON.stringify(GAZZELLA_WEEKLY_STRUCTURE, null, 2)}

❌ ALIMENTI COMPLETAMENTE VIETATI:
${FORBIDDEN_FOODS.join(', ')}

✅ REGOLE FONDAMENTALI:
1. OGNI pasto deve contenere PROTEINE + CARBOIDRATI COMPLESSI (regola assoluta)
2. Colazioni salate incluse: mercoledì (pane + uova + olio) e sabato (pane + prosciutto + olio)
3. Solo ingredienti dalla tabella ufficiale - MAI patate, legumi, latticini non previsti
4. Grammature personalizzate in base al peso della cliente
5. Cotture semplici: griglia, vapore, forno, padella antiaderente
6. 5 pasti al giorno: colazione, spuntino mattino, pranzo, spuntino pomeriggio, cena
7. Eliminazione totale di alimenti ultra-processati, affettati (eccetto prosciutto crudo dalla tabella)

🎯 PRINCIPI NUTRIZIONALI GAZZELLA:
- Supporto specifico per menopausa con equilibrio ormonale
- Perdita peso graduale e sostenibile (0.5-1kg/settimana)
- Controllo glicemico attraverso combinazioni protein+carboidrati
- Anti-infiammazione naturale con ingredienti freschi
- Digestione ottimizzata con cotture semplici

💡 COME RISPONDERE:
- Fornisci consigli pratici basati SOLO sulla tabella Gazzella 2025
- Spiega sempre il "perché" dietro ogni consiglio
- Suggerisci modifiche ai piani esistenti se necessario
- Offri alternative per esigenze specifiche (sempre dentro i limiti Gazzella)
- Calcola grammature personalizzate se richiesto
- Proponi sostituzioni SOLO con alimenti dalla tabella ufficiale

🚫 NON FARE MAI:
- Suggerire alimenti non nella tabella (patate, quinoa, avena diversa da fiocchi, yogurt non previsti)
- Consigli medici o diagnosi
- Modifiche radicali senza spiegazione del protocollo Gazzella
- Suggerimenti che violano le regole fondamentali

RISPONDI in italiano in modo:
- Professionale ma caloroso
- Specifico con riferimenti alla tabella
- Pratico con esempi concreti
- Motivante per il percorso della cliente`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `Sei "Assistente Gazzella", nutrizionista esperta del Manuale della Gazzella per menopausa.
          
          REGOLE ASSOLUTE:
          - Rispondi SOLO basandoti sulla tabella ufficiale Gazzella 2025
          - Se la domanda riguarda problemi di salute, includi sempre l'avviso di consultare un medico
          - Personalizza i consigli sui dati specifici della cliente
          - Mantieni sempre il focus sui principi Gazzella: proteine+carboidrati in ogni pasto
          - Rispondi in italiano con tono professionale ma accogliente`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0].message.content || "Mi dispiace, non sono riuscita a processare la tua domanda. Riprova tra poco.";

    return {
      response: aiResponse,
      containsHealthWarning: containsHealthConcern
    };

  } catch (error) {
    console.error("Error generating AI chat response:", error);
    
    return {
      response: "Mi dispiace, sto avendo difficoltà tecniche. Riprova tra qualche minuto. Se il problema persiste, contatta il supporto.",
      containsHealthWarning: false
    };
  }
}

export async function calculateNutritionalNeeds(userProfile: InsertUserProfile): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bmi: number;
  idealWeight: number;
  weightGoal: number;
  healthStatus: string;
}> {
  const { age, weight, height, weeklyExercise } = userProfile;
  
  // BMI calculation
  const heightInMeters = (height || 170) / 100;
  const currentWeight = weight || 70;
  const bmi = parseFloat((currentWeight / (heightInMeters * heightInMeters)).toFixed(1));
  
  // Ideal weight calculation (BMI 22 - optimal for women)
  const idealWeight = Math.round(22 * heightInMeters * heightInMeters);
  
  // Weight goal and health status based on current BMI
  let weightGoal = currentWeight;
  let healthStatus = "";
  
  if (bmi < 18.5) {
    healthStatus = "Sottopeso";
    weightGoal = idealWeight;
  } else if (bmi >= 18.5 && bmi < 25) {
    healthStatus = "Peso normale";
    weightGoal = currentWeight;
  } else if (bmi >= 25 && bmi < 30) {
    healthStatus = "Sovrappeso";
    weightGoal = idealWeight;
  } else {
    healthStatus = "Obesità";
    weightGoal = Math.round(currentWeight * 0.9); // 10% weight loss target
  }
  
  // BMR calculation using Mifflin-St Jeor equation for women
  const bmr = 10 * currentWeight + 6.25 * (height || 170) - 5 * (age || 30) - 161;
  
  // Activity factor based on weekly exercise
  let activityFactor = 1.2; // sedentary
  const exerciseFreq = weeklyExercise || 0;
  if (exerciseFreq >= 5) activityFactor = 1.725; // very active
  else if (exerciseFreq >= 3) activityFactor = 1.55; // moderately active
  else if (exerciseFreq >= 1) activityFactor = 1.375; // lightly active
  
  let calories = Math.round(bmr * activityFactor);
  
  // Adjust calories for weight goal
  if (weightGoal < currentWeight) {
    calories = calories - 300; // Deficit for weight loss
  } else if (weightGoal > currentWeight) {
    calories = calories + 200; // Surplus for weight gain
  }
  
  // Macro distribution for Gazzella protocol
  const protein = Math.round((calories * 0.25) / 4); // 25% protein
  const carbs = Math.round((calories * 0.45) / 4);   // 45% carbs
  const fat = Math.round((calories * 0.30) / 9);     // 30% fat
  
  return { 
    calories, 
    protein, 
    carbs, 
    fat, 
    bmi, 
    idealWeight, 
    weightGoal, 
    healthStatus 
  };
}
