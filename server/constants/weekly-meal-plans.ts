// Piano alimentare strutturato per 4 settimane con sequenza progressiva
// Ogni settimana ha 7 giorni, ogni giorno ha 5 pasti
// L'AI userà questo come base e calcolerà le grammature precise in base al profilo del cliente

export interface MealPlan {
  day: string;
  meals: {
    colazione: string[];
    spuntino: string[];
    pranzo: string[];
    merenda: string[];
    cena: string[];
  };
}

export interface WeeklyMealPlan {
  week: number;
  days: MealPlan[];
}

export const WEEKLY_MEAL_PLANS: WeeklyMealPlan[] = [
  {
    week: 1,
    days: [
      {
        day: "Lunedì",
        meals: {
          colazione: ["Yogurt greco", "fiocchi d'avena", "mandorle"],
          spuntino: ["1 mela", "cioccolato fondente"],
          pranzo: ["Lattuga iceberg", "pasta integrale al pomodoro", "petto di pollo grigliato", "asparagi al vapore"],
          merenda: ["Yogurt bianco", "mandorle"],
          cena: ["Cetriolo", "frittata con zucchine", "pane integrale"]
        }
      },
      {
        day: "Martedì",
        meals: {
          colazione: ["Yogurt bianco", "biscotti integrali"],
          spuntino: ["1 pera", "noci"],
          pranzo: ["Valeriana (songino)", "cous cous", "spigola al forno", "broccoli al vapore"],
          merenda: ["Kefir", "cioccolato fondente"],
          cena: ["Indivia riccia", "tacchino alla piastra", "pane integrale", "carote al vapore"]
        }
      },
      {
        day: "Mercoledì",
        meals: {
          colazione: ["Pane integrale", "uova strapazzate", "olio EVO"],
          spuntino: ["1 kiwi", "nocciole"],
          pranzo: ["Lattuga romana", "farro", "tonno fresco alla griglia", "carote al vapore"],
          merenda: ["Yogurt bianco", "frutti di bosco"],
          cena: ["Finocchio crudo", "orata al forno", "pane integrale", "zucchine al vapore o grigliate"]
        }
      },
      {
        day: "Giovedì",
        meals: {
          colazione: ["Yogurt greco", "fiocchi d'avena", "cioccolato fondente"],
          spuntino: ["1 mela", "mandorle"],
          pranzo: ["Cetriolo", "riso nero", "salmone al vapore", "spinaci al vapore"],
          merenda: ["Yogurt bianco", "noci"],
          cena: ["Finocchio crudo", "pollo al curry", "pane integrale", "zucchine e carote al vapore"]
        }
      },
      {
        day: "Venerdì",
        meals: {
          colazione: ["Yogurt bianco", "biscotti integrali"],
          spuntino: ["1 pesca", "cioccolato fondente"],
          pranzo: ["Valeriana (songino)", "bresaola", "pane integrale", "fagiolini al vapore"],
          merenda: ["Kefir", "nocciole"],
          cena: ["Finocchio crudo", "pasta integrale", "tonno in vetro sgocciolato", "pomodorini"]
        }
      },
      {
        day: "Sabato",
        meals: {
          colazione: ["Pane integrale", "prosciutto crudo", "olio EVO"],
          spuntino: ["Ananas", "mandorle"],
          pranzo: ["Cetriolo", "orzo", "branzino al cartoccio", "melanzane grigliate"],
          merenda: ["Yogurt greco", "cioccolato fondente"],
          cena: ["Indivia riccia", "manzo alla griglia", "pane integrale", "zucca al forno"]
        }
      },
      {
        day: "Domenica",
        meals: {
          colazione: ["Yogurt greco", "fiocchi d'avena", "nocciole"],
          spuntino: ["1 mela", "cioccolato fondente"],
          pranzo: ["Invidia belga", "pasta integrale", "astice al vapore", "zucchine al vapore"],
          merenda: ["Yogurt bianco", "mandorle"],
          cena: ["Finocchio crudo", "uova sode", "pane integrale", "fagiolini al vapore"]
        }
      }
    ]
  },
  {
    week: 2,
    days: [
      {
        day: "Lunedì",
        meals: {
          colazione: ["Yogurt greco", "fiocchi di avena", "noci"],
          spuntino: ["1 pera", "cioccolato fondente"],
          pranzo: ["Finocchio crudo", "prosciutto crudo", "pane integrale", "fagiolini al vapore"],
          merenda: ["Yogurt bianco intero", "mandorle"],
          cena: ["Valeriana (songino)", "farro", "sogliola al vapore", "zucchine"]
        }
      },
      {
        day: "Martedì",
        meals: {
          colazione: ["Pane integrale", "uova sode", "olio EVO"],
          spuntino: ["1 mela", "nocciole"],
          pranzo: ["Spinaci baby", "cous cous", "branzino al cartoccio", "broccoli al vapore"],
          merenda: ["Kefir", "cioccolato fondente"],
          cena: ["Cetriolo", "coniglio in umido", "pane integrale", "peperoni al forno"]
        }
      },
      {
        day: "Mercoledì",
        meals: {
          colazione: ["Yogurt bianco", "biscotti integrali"],
          spuntino: ["1 pesca", "mandorle"],
          pranzo: ["Insalata belga", "quinoa", "pollo alla piastra", "spinaci al vapore"],
          merenda: ["Yogurt greco", "frutti di bosco"],
          cena: ["Carote alla julienne", "salmone al forno", "pane integrale", "asparagi al vapore"]
        }
      },
      {
        day: "Giovedì",
        meals: {
          colazione: ["Yogurt greco", "fiocchi di avena", "cioccolato fondente"],
          spuntino: ["1 kiwi", "noci"],
          pranzo: ["Cavolo cappuccio rosso", "pasta integrale con sgombro in vetro sgocciolato", "pomodorini"],
          merenda: ["Yogurt bianco", "nocciole"],
          cena: ["Insalata riccia", "manzo alla griglia", "pane integrale", "fagiolini al vapore"]
        }
      },
      {
        day: "Venerdì",
        meals: {
          colazione: ["Pane integrale", "bresaola", "olio EVO"],
          spuntino: ["1 mela", "cioccolato fondente"],
          pranzo: ["Insalata mista", "pasta integrale al pomodoro", "tonno fresco grigliato", "carote al vapore"],
          merenda: ["Kefir", "mandorle"],
          cena: ["Finocchio crudo", "uova strapazzate", "pane integrale", "broccoli al vapore"]
        }
      },
      {
        day: "Sabato",
        meals: {
          colazione: ["Yogurt bianco", "biscotti integrali"],
          spuntino: ["Ananas", "noci"],
          pranzo: ["Valeriana (songino)", "cous cous", "pollo al curry", "peperoni arrostiti"],
          merenda: ["Yogurt greco", "cioccolato fondente"],
          cena: ["Cetriolo", "tacchino alla piastra", "pane integrale", "spinaci al vapore"]
        }
      },
      {
        day: "Domenica",
        meals: {
          colazione: ["Yogurt greco", "fiocchi di avena", "nocciole"],
          spuntino: ["1 pesca", "cioccolato fondente"],
          pranzo: ["Lattuga romana", "orzo", "astice al vapore", "asparagi al vapore"],
          merenda: ["Yogurt bianco", "frutti di bosco"],
          cena: ["Cavolo cappuccio rosso", "sogliola al forno", "pane integrale", "zucchine al vapore o grigliate"]
        }
      }
    ]
  },
  {
    week: 3,
    days: [
      {
        day: "Lunedì",
        meals: {
          colazione: ["Yogurt greco", "semi di chia", "fiocchi d'avena"],
          spuntino: ["1 kiwi", "mandorle"],
          pranzo: ["Cavolo cappuccio bianco", "orzo", "branzino al vapore", "zucchine al vapore o grigliate"],
          merenda: ["Yogurt bianco", "frutti di bosco"],
          cena: ["Finocchio crudo", "coniglio al forno", "pane integrale", "fagiolini al vapore"]
        }
      },
      {
        day: "Martedì",
        meals: {
          colazione: ["Pane integrale", "prosciutto crudo", "olio EVO"],
          spuntino: ["1 pera", "cioccolato fondente"],
          pranzo: ["Valeriana (songino)", "quinoa", "tacchino alla piastra", "broccoli al vapore"],
          merenda: ["Kefir", "mandorle"],
          cena: ["Carote alla julienne", "sogliola al vapore", "pane integrale", "asparagi al vapore"]
        }
      },
      {
        day: "Mercoledì",
        meals: {
          colazione: ["Yogurt bianco", "biscotti integrali"],
          spuntino: ["Ananas", "noci"],
          pranzo: ["Insalata mista", "farro", "pollo grigliato", "carote al vapore"],
          merenda: ["Yogurt greco", "cioccolato fondente"],
          cena: ["Cetriolo", "salmone al forno", "pane integrale", "spinaci al vapore"]
        }
      },
      {
        day: "Giovedì",
        meals: {
          colazione: ["Yogurt greco", "fiocchi d'avena", "nocciole"],
          spuntino: ["1 mela", "mandorle"],
          pranzo: ["Spinaci baby", "bresaola", "pane integrale", "melanzane grigliate"],
          merenda: ["Kefir", "frutti di bosco"],
          cena: ["Lattuga iceberg", "riso venere", "gamberetti", "zucchine trifolate"]
        }
      },
      {
        day: "Venerdì",
        meals: {
          colazione: ["Pane integrale", "prosciutto crudo", "olio EVO"],
          spuntino: ["1 kiwi", "cioccolato fondente"],
          pranzo: ["Ravanelli", "cous cous", "spigola al cartoccio", "melanzane grigliate"],
          merenda: ["Yogurt bianco", "noci"],
          cena: ["Finocchio crudo", "frittata di spinaci", "pane integrale"]
        }
      },
      {
        day: "Sabato",
        meals: {
          colazione: ["Yogurt greco", "semi di lino", "fiocchi d'avena"],
          spuntino: ["Ananas", "mandorle"],
          pranzo: ["Finocchio crudo", "pasta integrale", "tonno in vetro sgocciolato", "pomodorini"],
          merenda: ["Yogurt greco", "cioccolato fondente"],
          cena: ["Invidia belga", "tacchino alla piastra", "pane integrale", "cicoria al vapore"]
        }
      },
      {
        day: "Domenica",
        meals: {
          colazione: ["Yogurt greco", "fiocchi d'avena", "noci"],
          spuntino: ["1 pesca", "cioccolato fondente"],
          pranzo: ["Lattuga romana", "pasta integrale al pomodoro", "astice", "asparagi al vapore"],
          merenda: ["Yogurt bianco", "mandorle"],
          cena: ["Cavolo cappuccio bianco", "orata al forno", "pane integrale", "spinaci al vapore"]
        }
      }
    ]
  },
  {
    week: 4,
    days: [
      {
        day: "Lunedì",
        meals: {
          colazione: ["Pane integrale", "uova strapazzate", "olio EVO"],
          spuntino: ["1 kiwi", "nocciole"],
          pranzo: ["Cetriolo", "farro", "salmone al vapore", "spinaci al vapore"],
          merenda: ["Yogurt bianco", "frutti di bosco"],
          cena: ["Cavolo cappuccio bianco", "coniglio in umido", "pane integrale", "asparagi al vapore"]
        }
      },
      {
        day: "Martedì",
        meals: {
          colazione: ["Yogurt greco", "semi di chia", "fiocchi d'avena"],
          spuntino: ["1 mela", "cioccolato fondente"],
          pranzo: ["Lattuga romana", "cous cous", "branzino al forno", "broccoli al vapore"],
          merenda: ["Kefir", "noci"],
          cena: ["Cetriolo", "tacchino alla piastra", "pane integrale", "zucca al forno"]
        }
      },
      {
        day: "Mercoledì",
        meals: {
          colazione: ["Yogurt bianco", "biscotti integrali"],
          spuntino: ["Ananas", "mandorle"],
          pranzo: ["Valeriana (songino)", "riso venere", "pollo al curry", "carote al vapore"],
          merenda: ["Yogurt greco", "cioccolato fondente"],
          cena: ["Finocchio crudo", "uova sode", "pane integrale", "fagiolini al vapore"]
        }
      },
      {
        day: "Giovedì",
        meals: {
          colazione: ["Yogurt greco", "fiocchi d'avena", "nocciole"],
          spuntino: ["1 kiwi", "cioccolato fondente"],
          pranzo: ["Cavolo cappuccio rosso", "pasta integrale con sgombro in vetro sgocciolato", "pomodorini"],
          merenda: ["Kefir", "frutti di bosco"],
          cena: ["Cetriolo", "manzo alla griglia", "pane integrale", "broccoli al vapore"]
        }
      },
      {
        day: "Venerdì",
        meals: {
          colazione: ["Pane integrale", "prosciutto crudo", "olio EVO"],
          spuntino: ["1 pesca", "mandorle"],
          pranzo: ["Cavolo cappuccio rosso", "orzo", "orata al cartoccio", "melanzane grigliate"],
          merenda: ["Yogurt bianco", "noci"],
          cena: ["Finocchio crudo", "frittata di zucchine", "pane integrale"]
        }
      },
      {
        day: "Sabato",
        meals: {
          colazione: ["Yogurt greco", "semi di lino", "fiocchi d'avena"],
          spuntino: ["Ananas", "nocciole"],
          pranzo: ["Lattuga iceberg", "prosciutto crudo", "pane integrale", "cicoria al vapore"],
          merenda: ["Yogurt greco", "cioccolato fondente"],
          cena: ["Spinaci baby", "riso integrale", "gamberoni al vapore", "asparagi al vapore"]
        }
      },
      {
        day: "Domenica",
        meals: {
          colazione: ["Yogurt greco", "fiocchi d'avena", "mandorle"],
          spuntino: ["1 kiwi", "cioccolato fondente"],
          pranzo: ["Verdure crude", "pasta integrale", "astice", "broccoli al vapore"],
          merenda: ["Yogurt bianco", "frutti di bosco"],
          cena: ["Ravanelli", "branzino al vapore", "pane integrale", "zucchine al vapore o grigliate"]
        }
      }
    ]
  }
];

// Funzione helper per ottenere il piano della settimana corretta
export function getWeeklyPlan(weekNumber: number): WeeklyMealPlan | null {
  const normalizedWeek = ((weekNumber - 1) % 4) + 1; // Cicla da 1 a 4
  return WEEKLY_MEAL_PLANS.find(plan => plan.week === normalizedWeek) || null;
}

// Funzione per ottenere la prossima settimana da utilizzare
export function getNextWeekNumber(currentWeekCounter: number): number {
  if (currentWeekCounter === 0) return 1; // Prima volta
  return (currentWeekCounter % 4) + 1; // Cicla 1->2->3->4->1
}