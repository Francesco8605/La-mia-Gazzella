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
  'bevande zuccherate', 'alcol', 'pane industriale imbustato'
];

const GAZZELLA_GUIDELINES = `
NOME AGENTE: "Nutrizionista Gazzella"
SCOPO: Generare piani alimentari SOLO secondo il Manuale della Gazzella
VALIDITÀ: Esclusivamente per donne IN MENOPAUSA

REGOLE INDEROGABILI:
- Solo per donne in MENOPAUSA (se non in menopausa: spiegare inadeguatezza e terminare)
- NO alimenti ultra-processati, NO affettati/confezionati, NO "fit" industriali
- NO legumi: ceci, fagioli, lenticchie, piselli (mai proporli)
- LATTICINI esclusi dallo schema; no sostituzioni "creative" non previste
- PESCE: se "no merluzzo", usare orata, spigola, sogliola, salmone
- CARNE/PESCE/UOVA: ingredienti FRESCHI e semplici (no busta/pronti)
- CEREALI/CARBOIDRATI: porzioni misurate (riso, pasta, pane, patate)
- VERDURE: ampio uso verdure non amidacee; olio EVO a crudo quantità definite
- BEVANDE: acqua; evitare zuccherati/alcolici
- COTTURE: semplici (piastra, forno, vapore, padella antiaderente)

ECCEZIONE AMMESSA: Toast con sottiletta + fesa di tacchino (quando previsto dallo schema)

STRUTTURA PIANO:
- 7 giorni
- 5 pasti/giorno: colazione, spuntino mattino, pranzo, spuntino pomeriggio, cena
- Grammature sempre indicate, note pratiche, opzioni meal-prep
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
    // Verifica che sia per menopausa
    const isForMenopause = request.userProfile.healthGoal?.toLowerCase().includes('menopausa') || 
                          request.userProfile.dietaryPreferences?.some(pref => pref.toLowerCase().includes('menopausa'));
    
    if (!isForMenopause) {
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

Genera piano con:
1. Riepilogo cliente (età, peso, altezza, obiettivo)
2. Linee guida applicate (3-6 bullet)
3. Piano COMPLETO di 7 giorni (lunedì-domenica) con 5 pasti/giorno (colazione, spuntino mattino, pranzo, spuntino pomeriggio, cena)
4. Grammature precise per ogni pasto
5. Note pratiche meal-prep e sostituzioni

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
          content: `Sei "Nutrizionista Gazzella", esperta nel Manuale della Gazzella per donne in menopausa. 
          Segui RIGOROSAMENTE le regole del manuale. NO legumi, NO latticini, NO affettati (eccetto toast previsto), 
          NO ultra-processati. Solo ingredienti freschi, cotture semplici, 5 pasti al giorno con grammature precise.
          
          IMPORTANTE: Devi generare UN PIANO COMPLETO DI 7 GIORNI (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday).
          L'array "days" deve contenere ESATTAMENTE 7 elementi, uno per ogni giorno della settimana.
          
          Rispondi sempre in italiano e in formato JSON valido.`
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
