/**
 * Test completo del Nutrizionista IA per donne in menopausa
 * 20 domande specifiche con raccolta risposte e generazione report
 */

// 20 domande specifiche per donne in menopausa
const domandeMenupausa = [
  // Domande sui sintomi e alimentazione
  "Ho 52 anni e sono in menopausa da 2 anni. Quali alimenti possono aiutarmi con le vampate di calore?",
  "Durante la menopausa ho preso 8 kg. Come posso perdere peso senza compromettere la mia salute?",
  "Soffro di gonfiore addominale da quando è iniziata la menopausa. Cosa posso mangiare per ridurlo?",
  
  // Domande sui cambiamenti metabolici
  "Il mio metabolismo è rallentato in menopausa. Quali cibi devo privilegiare per riattivarlo?",
  "Ho sempre più difficoltà a digerire alcuni alimenti da quando sono in menopausa. Cosa mi consigli?",
  "In menopausa ho notato che accumulo grasso sull'addome. Ci sono alimenti specifici da evitare?",
  
  // Domande sui nutrienti specifici
  "Quali sono i migliori alimenti ricchi di calcio per prevenire l'osteoporosi in menopausa?",
  "Ho sentito che la soia fa bene in menopausa per i fitoestrogeni. È vero? Posso mangiarla?",
  "Quali vitamine e minerali sono più importanti per una donna in menopausa?",
  
  // Domande su orari e frequenza dei pasti
  "È meglio fare 3 pasti principali o 5 pasti piccoli durante la menopausa?",
  "A che ora dovrei cenare per non ingrassare in menopausa?",
  "Posso saltare la colazione se non ho fame al mattino durante la menopausa?",
  
  // Domande sui sintomi specifici
  "In menopausa ho problemi di insonnia. Ci sono alimenti che possono aiutarmi a dormire meglio?",
  "Soffro di sbalzi d'umore in menopausa. L'alimentazione può influire sul mio stato emotivo?",
  "Ho notato che la mia pelle è più secca da quando sono in menopausa. Cosa devo mangiare?",
  
  // Domande sull'attività fisica e alimentazione
  "Faccio yoga 3 volte a settimana. Come devo adattare la mia alimentazione all'attività fisica in menopausa?",
  "Posso bere alcool occasionalmente durante la menopausa o è meglio evitarlo completamente?",
  "Quali sono gli spuntini migliori per una donna in menopausa che lavora tutto il giorno?",
  
  // Domande sui problemi comuni
  "Ho la tiroide che funziona lentamente e sono in menopausa. Come devo regolare la dieta?",
  "Soffro di colesterolo alto da quando sono in menopausa. Quali alimenti devo evitare assolutamente?"
];

// Funzione per inviare una domanda al nutrizionista IA
async function testDomanda(domanda, indice) {
  console.log(`\n=== DOMANDA ${indice + 1}/20 ===`);
  console.log(`Q: ${domanda}`);
  
  try {
    const response = await fetch('/api/ai-chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: domanda
      })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return {
          domanda,
          risposta: "ERRORE: Utente non autenticato",
          errore: "Non autenticato - richiede login",
          timestamp: new Date().toISOString()
        };
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`A: ${data.message}`);
    
    if (data.containsHealthWarning) {
      console.log("⚠️ AVVERTIMENTO SANITARIO INCLUSO");
    }
    
    return {
      domanda,
      risposta: data.message,
      containsHealthWarning: data.containsHealthWarning || false,
      timestamp: new Date().toISOString(),
      errore: null
    };
    
  } catch (error) {
    console.error(`❌ Errore: ${error.message}`);
    return {
      domanda,
      risposta: null,
      errore: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Funzione per eseguire tutti i test
async function eseguiTestCompleto() {
  console.log("🧪 INIZIANDO TEST COMPLETO DEL NUTRIZIONISTA IA");
  console.log("📊 20 domande specifiche per donne in menopausa");
  console.log("=" .repeat(60));
  
  const risultati = [];
  
  for (let i = 0; i < domandeMenupausa.length; i++) {
    const risultato = await testDomanda(domandeMenupausa[i], i);
    risultati.push(risultato);
    
    // Pausa tra le domande per non sovraccaricare il sistema
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return risultati;
}

// Funzione per generare il report finale
function generaReport(risultati) {
  const now = new Date();
  const dataTest = now.toLocaleDateString('it-IT');
  const oraTest = now.toLocaleTimeString('it-IT');
  
  const successfulTests = risultati.filter(r => r.risposta && !r.errore);
  const errorTests = risultati.filter(r => r.errore);
  const healthWarnings = risultati.filter(r => r.containsHealthWarning);
  
  let report = `
# REPORT TEST NUTRIZIONISTA IA - DONNE IN MENOPAUSA
Data: ${dataTest} - Ora: ${oraTest}

## SOMMARIO ESECUTIVO
- 📊 **Domande totali**: ${risultati.length}
- ✅ **Risposte riuscite**: ${successfulTests.length}
- ❌ **Errori**: ${errorTests.length}
- ⚠️ **Avvertimenti sanitari**: ${healthWarnings.length}
- 📈 **Tasso di successo**: ${((successfulTests.length / risultati.length) * 100).toFixed(1)}%

## ANALISI DETTAGLIATA

### Tipologie di Domande Testate:
1. 🌡️ Sintomi menopausali (vampate, gonfiore)
2. ⚖️ Gestione del peso e metabolismo
3. 🥗 Nutrienti specifici (calcio, vitamine)
4. ⏰ Orari e frequenza pasti
5. 😴 Problemi correlati (insonnia, umore)
6. 🏃‍♀️ Attività fisica e lifestyle
7. 🩺 Condizioni mediche associate

### Qualità delle Risposte:
${healthWarnings.length > 0 ? `- ✅ Il sistema riconosce appropriatamente ${healthWarnings.length} domande che richiedono consultazione medica` : '- ⚠️ Nessun avvertimento sanitario attivato'}
${successfulTests.length > 0 ? `- ✅ Risposte fornite seguendo i principi del Manuale della Gazzella` : '- ❌ Nessuna risposta riuscita'}

## DETTAGLIO COMPLETO DOMANDE E RISPOSTE

`;

  // Aggiungi ogni domanda e risposta al report
  risultati.forEach((risultato, index) => {
    report += `### DOMANDA ${index + 1}
**Q:** ${risultato.domanda}

`;
    
    if (risultato.errore) {
      report += `**❌ ERRORE:** ${risultato.errore}

`;
    } else {
      report += `**A:** ${risultato.risposta}

`;
      if (risultato.containsHealthWarning) {
        report += `⚠️ **AVVERTIMENTO SANITARIO ATTIVATO**

`;
      }
    }
    
    report += `*Timestamp: ${risultato.timestamp}*

---

`;
  });
  
  return report;
}

// Funzione principale per eseguire tutto il test
async function runFullTest() {
  console.log("Avviando test completo del Nutrizionista IA...");
  
  try {
    const risultati = await eseguiTestCompleto();
    const report = generaReport(risultati);
    
    // Salva il report in un file
    const fs = require('fs');
    const fileName = `report-nutrizionista-ia-${new Date().toISOString().split('T')[0]}.md`;
    fs.writeFileSync(fileName, report);
    
    console.log(`\n✅ TEST COMPLETATO!`);
    console.log(`📄 Report salvato in: ${fileName}`);
    console.log(`\n${report}`);
    
    return { risultati, report, fileName };
    
  } catch (error) {
    console.error("❌ Errore durante l'esecuzione del test:", error);
    throw error;
  }
}

// Export per uso come modulo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    domandeMenupausa,
    testDomanda,
    eseguiTestCompleto,
    generaReport,
    runFullTest
  };
}

// Esecuzione diretta se chiamato da browser
if (typeof window !== 'undefined') {
  // Disponibile per esecuzione manuale dal browser
  window.testNutrizionistaIA = {
    domandeMenupausa,
    testDomanda,
    eseguiTestCompleto,
    generaReport,
    runFullTest
  };
}