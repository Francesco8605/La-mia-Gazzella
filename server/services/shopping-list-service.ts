import { storage } from "../storage.js";
import { type MealPlan, type MealPlanDay } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface IngredientWithCategory {
  name: string;
  quantity: string;
  category: string;
}

/**
 * Estrae gli ingredienti da un piano settimanale usando OpenAI
 * e li organizza per categoria con quantità aggregate
 */
async function extractIngredientsFromMealPlan(mealPlan: MealPlan): Promise<IngredientWithCategory[]> {
  try {
    // Costruisci un riassunto dei pasti della settimana
    const mealsSummary = (mealPlan.days || []).map((day: MealPlanDay) => {
      return `
${day.day} (${day.date}):
- Colazione: ${day.meals.breakfast.name}
- Pranzo: ${day.meals.lunch.name}
- Cena: ${day.meals.dinner.name}
${day.meals.snacks && day.meals.snacks.length > 0 ? `- Spuntini: ${day.meals.snacks.map(s => s.name).join(', ')}` : ''}
      `.trim();
    }).join('\n\n');

    const prompt = `Analizza questo piano alimentare settimanale ed estrai TUTTI gli ingredienti necessari per preparare i pasti.

PIANO SETTIMANALE:
${mealsSummary}

ISTRUZIONI:
1. Estrai ogni singolo ingrediente menzionato nei pasti
2. Aggrega le quantità dello stesso ingrediente usato in giorni diversi
3. Calcola quantità realistiche per una persona (es: se "pollo" appare 3 volte, metti "600g di petto di pollo")
4. Categorizza ogni ingrediente in UNA di queste categorie:
   - "Frutta" (mele, pere, banane, frutti di bosco, ecc.)
   - "Verdura" (insalata, pomodori, zucchine, carote, verdure crude, ecc.)
   - "Proteine" (pollo, pesce, carne, uova, tonno, bresaola, prosciutto, ecc.)
   - "Latticini" (yogurt, kefir, formaggi, ecc.)
   - "Cereali" (pasta, pane, riso, avena, cous cous, biscotti, ecc.)
   - "Frutta Secca" (mandorle, noci, nocciole, ecc.)
   - "Condimenti" (olio EVO, spezie, sale, ecc.)
   - "Altro" (cioccolato fondente, ecc.)

5. Per ogni ingrediente, specifica una quantità pratica per la spesa settimanale

FORMATO RISPOSTA (JSON):
Rispondi SOLO con un array JSON valido, senza testo aggiuntivo. Esempio:
[
  {"name": "Petto di pollo", "quantity": "800g", "category": "Proteine"},
  {"name": "Yogurt greco", "quantity": "1kg", "category": "Latticini"},
  {"name": "Mele", "quantity": "6 pezzi", "category": "Frutta"}
]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Nessuna risposta ricevuta da OpenAI");
    }

    // Parse la risposta JSON
    let ingredients: IngredientWithCategory[];
    try {
      // Rimuovi eventuali backticks o markdown se presenti
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      ingredients = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Errore nel parsing della risposta OpenAI:", content);
      throw new Error("Formato risposta non valido da OpenAI");
    }

    return ingredients;
  } catch (error) {
    console.error("Errore nell'estrazione degli ingredienti:", error);
    throw error;
  }
}

/**
 * Genera automaticamente una shopping list da un meal plan
 */
export async function generateShoppingListFromMealPlan(
  userId: string,
  mealPlanId: string
): Promise<string> {
  try {
    // 1. Recupera il meal plan
    const mealPlan = await storage.getMealPlan(mealPlanId);
    if (!mealPlan) {
      throw new Error("Piano alimentare non trovato");
    }

    // 2. Verifica che appartenga all'utente
    if (mealPlan.userId !== userId) {
      throw new Error("Non autorizzato ad accedere a questo piano");
    }

    // 3. Controlla se esiste già una shopping list per questo meal plan
    const existingList = await storage.getShoppingListByMealPlan(mealPlanId);
    if (existingList) {
      return existingList.id;
    }

    // 4. Estrai gli ingredienti usando AI
    console.log("🤖 Estrazione ingredienti dal piano alimentare...");
    const ingredients = await extractIngredientsFromMealPlan(mealPlan);
    console.log(`✅ Estratti ${ingredients.length} ingredienti`);

    // 5. Crea la shopping list
    const shoppingList = await storage.createShoppingList({
      userId,
      mealPlanId,
      title: `Lista della Spesa - ${mealPlan.title}`,
      weekNumber: null,
    });

    // 6. Crea gli items della shopping list
    const itemPromises = ingredients.map((ingredient, index) =>
      storage.createShoppingListItem({
        shoppingListId: shoppingList.id,
        category: ingredient.category,
        name: ingredient.name,
        quantity: ingredient.quantity,
        isPurchased: "no",
        notes: null,
        order: index,
      })
    );

    await Promise.all(itemPromises);
    console.log(`✅ Lista della spesa creata con ${ingredients.length} articoli`);

    return shoppingList.id;
  } catch (error) {
    console.error("Errore nella generazione della shopping list:", error);
    throw error;
  }
}

/**
 * Rigenera una shopping list esistente (utile se il meal plan viene modificato)
 */
export async function regenerateShoppingList(
  userId: string,
  shoppingListId: string
): Promise<void> {
  try {
    // 1. Recupera la shopping list
    const shoppingList = await storage.getShoppingList(shoppingListId);
    if (!shoppingList) {
      throw new Error("Lista della spesa non trovata");
    }

    // 2. Verifica autorizzazione
    if (shoppingList.userId !== userId) {
      throw new Error("Non autorizzato");
    }

    // 3. Elimina tutti gli items esistenti
    const existingItems = await storage.getShoppingListItems(shoppingListId);
    await Promise.all(existingItems.map(item => storage.deleteShoppingListItem(item.id)));

    // 4. Recupera il meal plan e rigenera gli items
    const mealPlan = await storage.getMealPlan(shoppingList.mealPlanId);
    if (!mealPlan) {
      throw new Error("Piano alimentare non trovato");
    }

    const ingredients = await extractIngredientsFromMealPlan(mealPlan);

    const itemPromises = ingredients.map((ingredient, index) =>
      storage.createShoppingListItem({
        shoppingListId: shoppingList.id,
        category: ingredient.category,
        name: ingredient.name,
        quantity: ingredient.quantity,
        isPurchased: "no",
        notes: null,
        order: index,
      })
    );

    await Promise.all(itemPromises);

    // 5. Aggiorna il timestamp
    await storage.updateShoppingList(shoppingListId, {});

    console.log(`✅ Lista della spesa rigenerata con ${ingredients.length} articoli`);
  } catch (error) {
    console.error("Errore nella rigenerazione della shopping list:", error);
    throw error;
  }
}
