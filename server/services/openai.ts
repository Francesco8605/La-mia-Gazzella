import OpenAI from "openai";
import { type InsertUserProfile, type MealPlanDay, type Meal } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface MealPlanRequest {
  userProfile: InsertUserProfile;
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

// Protocollo Nutrizionista Gazzella
const FORBIDDEN_FOODS = [
  'legumi', 'ceci', 'fagioli', 'lenticchie', 'piselli', 'latticini', 'latte', 'yogurt', 
  'formaggi', 'burro', 'panna', 'affettati', 'salumi', 'wurstel', 'carni in busta',
  'petto di pollo in busta', 'petto di tacchino in busta', 'prodotti ultra-processati',
  'merendine', 'barrette fit industriali', 'sughi pronti', 'salse industriali',
  'bevande zuccherate', 'alcol', 'pane industriale imbustato', 'quinoa', 'avena',
  'yogurt greco', 'yogurt di soia', 'yogurt di riso', 'latte di soia', 'latte di riso',
  'latte di avena', 'smoothie', 'frullati con latte', 'porridge', 'muesli', 'cereali',
  'biscotti', 'crackers industriali', 'tofu', 'seitan', 'tempeh'
];

const GAZZELLA_GUIDELINES = `
NOME AGENTE: "Nutrizionista Gazzella"
SCOPO: Generare piani alimentari SOLO secondo il Manuale della Gazzella
VALIDITÀ: Esclusivamente per donne IN MENOPAUSA

REGOLE INDEROGABILI DAL MANUALE:
- Solo MENOPAUSA: se non in menopausa, spiegare che il Manuale non è adatto e terminare
- NO alimenti ultra-processati, NO affettati/confezionati, NO "fit" industriali
- NO legumi: ceci, fagioli, lenticchie, piselli (non proporli mai)
- LATTICINI esclusi dallo schema; non proporre sostituzioni "creative" non previste
- PESCE: se cliente indica "no merluzzo", usare alternative: orata, spigola, sogliola, salmone
- CARNE/PESCE/UOVA: preferire ingredienti FRESCHI e semplici (no busta/pronti)
- CEREALI/CARBOIDRATI: prevedere porzioni misurate (riso, pasta, pane, patate)
- VERDURE: ampio uso di verdure non amidacee; condire con olio EVO a crudo in quantità definite
- BEVANDE: acqua; evitare zuccherati/alcolici
- COTTURE: semplici (piastra, forno, vapore, padella antiaderente)
- NON copiare estratti del Manuale > 90 caratteri; parafrasa sempre

UNICA ECCEZIONE AMMESSA: Toast con sottiletta + fesa di tacchino (quando previsto dallo schema)

STRUTTURA PIANO OBBLIGATORIA:
- 7 giorni completi (Monday-Sunday)
- 5 pasti/giorno: colazione, spuntino mattino, pranzo, spuntino pomeriggio, cena
- Grammature precise sempre indicate
- Note pratiche e opzioni meal-prep

PERSONALIZZAZIONE:
- Adatta pasti a: orari indicati, preferenze, allergie/intolleranze, livello attività, strumenti cucina
- Se compare alimento vietato o escluso da cliente, sostituisci automaticamente con opzione compatibile
`;

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
    // Verifica che sia per menopausa - accetta "menopausa" in qualsiasi campo o semplice presenza di età > 45
    const isForMenopause = 
      request.userProfile.healthGoal?.toLowerCase().includes('menopausa') || 
      request.userProfile.dietaryPreferences?.some(pref => pref.toLowerCase().includes('menopausa')) ||
      (request.userProfile.age && request.userProfile.age >= 45); // Assume menopausa per età >= 45
    
    if (!isForMenopause && request.userProfile.age && request.userProfile.age < 45) {
      throw new Error('Il Manuale della Gazzella è specifico per donne in menopausa. Per altre condizioni consultare un nutrizionista qualificato.');
    }

    const excludedFoods = request.userProfile.excludedFoods || [];
    const allergies = request.userProfile.allergies || [];
    const merluzzo_excluded = excludedFoods.includes('merluzzo') || allergies.includes('merluzzo');

    const prompt = `Sei "Nutrizionista Gazzella". Crea un piano alimentare di 7 giorni secondo il Manuale della Gazzella per donna in MENOPAUSA.

PROFILO CLIENTE:
- Età: ${request.userProfile.age} anni
- Peso: ${request.userProfile.weight}kg  
- Altezza: ${request.userProfile.height}cm
- Email: ${request.userProfile.email}
- Telefono: ${request.userProfile.phone}
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

${GAZZELLA_GUIDELINES}

ALIMENTI VIETATI (da escludere sempre): ${FORBIDDEN_FOODS.join(", ")}
${merluzzo_excluded ? "ATTENZIONE: Cliente esclude merluzzo - usare orata, spigola, sogliola, salmone" : ""}

Genera piano con esempi consentiti:

ESEMPI PASTI GAZZELLA CONFORMI:
COLAZIONI: uova strapazzate con spinaci + pane tostato, frittata con zucchine 80g, toast (SOLO se previsto): 2 fette pane + sottiletta + fesa tacchino
SPUNTINI MATTINO: mela 150g, mandorle 30g, carote crude 100g con olio EVO 5ml
SPUNTINI POMERIGGIO: pera 150g, noci 30g, finocchi crudi 100g con olio EVO 5ml  
PRANZI: orata 150g + verdure grigliate 200g + olio EVO 10ml, petto pollo 120g + insalata 150g + olio EVO 10ml, pasta 80g + pomodoro fresco + basilico + olio EVO 10ml
CENE: tacchino 120g + zucchine 200g + olio EVO 10ml, salmone 150g + patate 150g + olio EVO 10ml, uova 2 + verdure grigliate 200g + olio EVO 10ml

VIETATO CATEGORICAMENTE: legumi (tutti), latticini (tutti), quinoa, avena, yogurt (qualsiasi tipo), smoothie con latte/yogurt

FORMATO RICHIESTO:
1. Riepilogo cliente (età, peso, altezza, settimane in menopausa)
2. Linee guida Gazzella applicate (3-6 bullet specifici)
3. Piano COMPLETO 7 giorni con 5 pasti/giorno (colazione, spuntino mattino, pranzo, spuntino pomeriggio, cena)
4. Grammature precise e preparazione semplice
5. Note meal-prep e sostituzioni compatibili

IMPORTANTE: Genera TUTTI i 7 giorni della settimana (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)

Rispondi in JSON con:
{
  "title": "string",
  "description": "string", 
  "targetCalories": number,
  "targetProtein": number,
  "targetCarbs": number,
  "targetFat": number,
  "days": [
    {
      "day": "Monday",
      "date": "2025-01-20",
      "meals": {
        "breakfast": {"id": "uuid", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number},
        "lunch": {"id": "uuid", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number},
        "dinner": {"id": "uuid", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number},
        "snacks": [
          {"id": "uuid", "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number}
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
- NO legumi (ceci, fagioli, lenticchie, piselli) - MAI proporli in nessun pasto
- NO latticini (latte, yogurt, formaggi, burro, panna) - TOTALMENTE esclusi dallo schema
- NO cereali alternativi (quinoa, avena, muesli, porridge) - NON sono previsti dal protocollo
- NO yogurt di qualsiasi tipo (greco, soia, riso, avena) - VIETATO
- NO affettati/salumi/carni in busta - eccetto toast quando specificatamente previsto
- NO alimenti ultra-processati, merendine, barrette "fit" industriali
- NO sughi pronti, salse industriali, bevande zuccherate/alcoliche
- NO smoothie, frullati con latte o yogurt - SOLO frutta fresca intera

ALIMENTI CONSENTITI DAL PROTOCOLLO GAZZELLA:
- Pesce fresco: orata, spigola, sogliola, salmone (evitare merluzzo se escluso)
- Carne fresca: petto di pollo, petto di tacchino, manzo magro, vitello (SOLO freschi, mai confezionati)
- Uova fresche (massimo 2 per pasto)
- Verdure non amidacee: spinaci, zucchine, broccoli, cavolfiori, insalata, pomodori, peperoni, carote, finocchi
- Cereali SOLO questi: pasta (grano duro), riso, pane (semplice), patate
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

CONTROLLO FINALE: Prima di rispondere, verifica che NESSUN pasto contenga alimenti vietati (avena, quinoa, yogurt, smoothie, legumi, latticini). Se trovi alimenti vietati, sostituiscili immediatamente con alternative conformi.

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
    
    // Validate and ensure proper structure
    if (!result.days || !Array.isArray(result.days)) {
      throw new Error("Invalid meal plan structure received from AI");
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

REGOLE GAZZELLA:
- NO legumi (ceci, fagioli, lenticchie, piselli)
- NO latticini (latte, yogurt, formaggi, burro, panna) 
- NO affettati/salumi (eccetto fesa tacchino per toast quando previsto)
- NO prodotti ultra-processati o confezionati
- Solo ingredienti FRESCHI e naturali
- Cotture semplici: piastra, forno, vapore, padella antiaderente
- Condimenti: olio EVO a crudo, spezie, erbe aromatiche
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

export async function calculateNutritionalNeeds(userProfile: InsertUserProfile): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}> {
  const { age, weight, activityLevel, healthGoal } = userProfile;
  
  // Basic BMR calculation (Mifflin-St Jeor Equation for males - simplified)
  let bmr = 88.362 + (13.397 * (weight || 70)) + (4.799 * 170) - (5.677 * (age || 30));
  
  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    moderate: 1.375,
    active: 1.55,
    very_active: 1.725,
  };
  
  const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.2;
  let calories = Math.round(bmr * multiplier);
  
  // Adjust based on health goal
  switch (healthGoal) {
    case "weight_loss":
      calories = Math.round(calories * 0.85); // 15% deficit
      break;
    case "weight_gain":
      calories = Math.round(calories * 1.15); // 15% surplus
      break;
    case "muscle_building":
      calories = Math.round(calories * 1.1); // 10% surplus
      break;
    default:
      // maintenance or general health - no change
      break;
  }
  
  // Calculate macros (rough guidelines)
  const protein = Math.round((calories * 0.25) / 4); // 25% of calories, 4 cal/g
  const fat = Math.round((calories * 0.30) / 9); // 30% of calories, 9 cal/g
  const carbs = Math.round((calories * 0.45) / 4); // 45% of calories, 4 cal/g
  
  return { calories, protein, carbs, fat };
}
