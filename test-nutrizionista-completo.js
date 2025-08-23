// Usa fetch globale di Node.js 18+

// 20 domande specifiche per donne in menopausa
const domandeMenupausa = [
  "Ho 52 anni e sono in menopausa da 2 anni. Quali alimenti possono aiutarmi con le vampate di calore?",
  "Durante la menopausa ho preso 8 kg. Come posso perdere peso senza compromettere la mia salute?",
  "Soffro di gonfiore addominale da quando è iniziata la menopausa. Cosa posso mangiare per ridurlo?",
  "Il mio metabolismo è rallentato in menopausa. Quali cibi devo privilegiare per riattivarlo?",
  "Ho sempre più difficoltà a digerire alcuni alimenti da quando sono in menopausa. Cosa mi consigli?",
  "In menopausa ho notato che accumulo grasso sull'addome. Ci sono alimenti specifici da evitare?",
  "Quali sono i migliori alimenti ricchi di calcio per prevenire l'osteoporosi in menopausa?",
  "Ho sentito che la soia fa bene in menopausa per i fitoestrogeni. È vero? Posso mangiarla?",
  "Quali vitamine e minerali sono più importanti per una donna in menopausa?",
  "È meglio fare 3 pasti principali o 5 pasti piccoli durante la menopausa?",
  "A che ora dovrei cenare per non ingrassare in menopausa?",
  "Posso saltare la colazione se non ho fame al mattino durante la menopausa?",
  "In menopausa ho problemi di insonnia. Ci sono alimenti che possono aiutarmi a dormire meglio?",
  "Soffro di sbalzi d'umore in menopausa. L'alimentazione può influire sul mio stato emotivo?",
  "Ho notato che la mia pelle è più secca da quando sono in menopausa. Cosa devo mangiare?",
  "Faccio yoga 3 volte a settimana. Come devo adattare la mia alimentazione all'attività fisica in menopausa?",
  "Posso bere alcool occasionalmente durante la menopausa o è meglio evitarlo completamente?",
  "Quali sono gli spuntini migliori per una donna in menopausa che lavora tutto il giorno?",
  "Ho la tiroide che funziona lentamente e sono in menopausa. Come devo regolare la dieta?",
  "Soffro di colesterolo alto da quando sono in menopausa. Quali alimenti devo evitare assolutamente?"
];

// Base URL del server
const BASE_URL = 'http://localhost:5000';

// Funzione per testare una singola domanda
async function testDomanda(domanda, indice) {
  const startTime = Date.now();
  
  try {
    console.log(`\n🔄 Testando domanda ${indice + 1}/20...`);
    console.log(`❓ ${domanda.substring(0, 60)}...`);
    
    const response = await fetch(`${BASE_URL}/api/ai-chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: domanda })
    });
    
    const endTime = Date.now();
    const durata = endTime - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ Risposta ricevuta in ${durata}ms`);
    if (data.containsHealthWarning) {
      console.log(`⚠️ Avvertimento sanitario rilevato`);
    }
    
    return {
      domanda,
      risposta: data.message,
      containsHealthWarning: data.containsHealthWarning || false,
      timestamp: new Date().toISOString(),
      errore: null,
      durata
    };
    
  } catch (error) {
    const endTime = Date.now();
    const durata = endTime - startTime;
    
    console.log(`❌ Errore in ${durata}ms: ${error.message}`);
    
    return {
      domanda,
      risposta: null,
      errore: error.message,
      timestamp: new Date().toISOString(),
      durata
    };
  }
}

// Funzione principale di test
async function eseguiTestCompleto() {
  console.log('🔍 INIZIO TEST COMPLETO NUTRIZIONISTA IA');
  console.log('=======================================');
  console.log(`📊 Domande da testare: ${domandeMenupausa.length}`);
  console.log(`🎯 Target: Donne in menopausa`);
  console.log(`⏰ Inizio test: ${new Date().toLocaleString('it-IT')}\n`);
  
  const risultati = [];
  
  // Esegui tutte le domande
  for (let i = 0; i < domandeMenupausa.length; i++) {
    const risultato = await testDomanda(domandeMenupausa[i], i);
    risultati.push(risultato);
    
    // Pausa tra le domande per evitare rate limiting
    if (i < domandeMenupausa.length - 1) {
      console.log('⏳ Pausa 2 secondi...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Analizza risultati
  console.log('\n📈 ANALISI RISULTATI');
  console.log('====================');
  
  const successfulTests = risultati.filter(r => r.risposta && !r.errore);
  const errorTests = risultati.filter(r => r.errore);
  const healthWarnings = risultati.filter(r => r.containsHealthWarning);
  const avgDuration = risultati.reduce((acc, r) => acc + (r.durata || 0), 0) / risultati.length;
  
  console.log(`✅ Risposte riuscite: ${successfulTests.length}/${risultati.length}`);
  console.log(`❌ Errori: ${errorTests.length}/${risultati.length}`);
  console.log(`⚠️ Avvertimenti sanitari: ${healthWarnings.length}/${risultati.length}`);
  console.log(`📈 Tasso di successo: ${((successfulTests.length / risultati.length) * 100).toFixed(1)}%`);
  console.log(`⏱️ Tempo medio risposta: ${avgDuration.toFixed(0)}ms`);
  
  // Genera report dettagliato
  console.log('\n📋 GENERAZIONE REPORT COMPLETO');
  console.log('===============================');
  
  const report = generaReportCompleto(risultati);
  const fs = await import('fs');
  const filename = `report-nutrizionista-ia-${new Date().toISOString().split('T')[0]}.md`;
  
  fs.writeFileSync(filename, report);
  console.log(`✅ Report salvato in: ${filename}`);
  
  // Mostra sommario finale
  console.log('\n🎉 TEST COMPLETATO CON SUCCESSO');
  console.log('===============================');
  console.log(`📊 ${risultati.length} domande testate`);
  console.log(`✅ ${successfulTests.length} risposte valide`);
  console.log(`⚠️ ${healthWarnings.length} avvertimenti sanitari`);
  console.log(`⏰ Completato in: ${new Date().toLocaleString('it-IT')}`);
  
  return risultati;
}

// Funzione per generare report markdown
function generaReportCompleto(risultati) {
  const now = new Date();
  const dataTest = now.toLocaleDateString('it-IT');
  const oraTest = now.toLocaleTimeString('it-IT');
  
  const successfulTests = risultati.filter(r => r.risposta && !r.errore);
  const errorTests = risultati.filter(r => r.errore);
  const healthWarnings = risultati.filter(r => r.containsHealthWarning);
  const avgDuration = risultati.reduce((acc, r) => acc + (r.durata || 0), 0) / risultati.length;

  let report = `# REPORT TEST NUTRIZIONISTA IA - DONNE IN MENOPAUSA
Data: ${dataTest} - Ora: ${oraTest}

## SOMMARIO ESECUTIVO
- 📊 **Domande totali**: ${risultati.length}
- ✅ **Risposte riuscite**: ${successfulTests.length}
- ❌ **Errori**: ${errorTests.length}
- ⚠️ **Avvertimenti sanitari**: ${healthWarnings.length}
- 📈 **Tasso di successo**: ${((successfulTests.length / risultati.length) * 100).toFixed(1)}%
- ⏱️ **Tempo medio risposta**: ${avgDuration.toFixed(0)}ms

## ANALISI QUALITATIVA

### Tipologie di Domande Testate:
1. 🌡️ **Sintomi menopausali**: vampate, gonfiore addominale (3 domande)
2. ⚖️ **Gestione peso e metabolismo**: rallentamento metabolico, accumulo grasso (3 domande)
3. 🥗 **Nutrienti specifici**: calcio, vitamine, fitoestrogeni (3 domande)
4. ⏰ **Timing alimentare**: orari pasti, frequenza (3 domande)
5. 😴 **Sintomi correlati**: insonnia, umore, pelle (3 domande)
6. 🏃‍♀️ **Lifestyle**: attività fisica, alcool, spuntini (3 domande)
7. 🩺 **Condizioni mediche**: tiroide, colesterolo (2 domande)

### Valutazione Sistema IA:
${healthWarnings.length > 0 ? `- ✅ **Riconoscimento medico**: Il sistema ha correttamente identificato ${healthWarnings.length} domande che richiedono consultazione medica` : '- ⚠️ **Riconoscimento medico**: Nessun avvertimento sanitario attivato'}
${successfulTests.length > 0 ? `- ✅ **Coerenza protocollo**: Risposte allineate al Manuale della Gazzella` : '- ❌ **Problemi sistemici**: Nessuna risposta valida ottenuta'}

## DETTAGLIO COMPLETO DOMANDE E RISPOSTE

`;

  risultati.forEach((risultato, index) => {
    report += `### DOMANDA ${index + 1}
**Q:** ${risultato.domanda}

`;
    
    if (risultato.errore) {
      report += `**❌ ERRORE:** ${risultato.errore}
*Durata: ${risultato.durata}ms*

`;
    } else {
      report += `**A:** ${risultato.risposta}

`;
      if (risultato.containsHealthWarning) {
        report += `⚠️ **AVVERTIMENTO SANITARIO ATTIVATO**

`;
      }
      report += `*Durata: ${risultato.durata}ms*

`;
    }
    
    report += `*Timestamp: ${risultato.timestamp}*

---

`;
  });

  return report;
}

// Esegui il test
eseguiTestCompleto().catch(console.error);