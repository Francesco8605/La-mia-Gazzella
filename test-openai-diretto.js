import OpenAI from 'openai';

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

// Lista degli alimenti vietati nel protocollo Gazzella
const alimentiVietati = [
  'legumi', 'fagioli', 'lenticchie', 'ceci', 'piselli', 'fave',
  'latticini', 'latte', 'formaggio', 'burro', 'panna', 'yogurt greco', 'yogurt bianco',
  'quinoa', 'amaranto', 'grano saraceno', 'miglio',
  'avena', 'fiocchi di avena', 'porridge',
  'patate', 'patate dolci', 'tuberi',
  'dolci', 'zucchero raffinato', 'miele', 'sciroppi',
  'alcolici', 'vino', 'birra', 'superalcolici',
  'smoothie', 'frullati', 'centrifughe',
  'biscotti', 'crackers industriali', 'snack confezionati'
];

// Sistema prompt del nutrizionista IA basato sul Manuale della Gazzella
const systemPrompt = `Sei un nutrizionista esperto specializzato nel Metodo Gazzella per donne in menopausa.

REGOLE FONDAMENTALI:
1. Segui RIGOROSAMENTE il protocollo nutrizionale del Manuale della Gazzella
2. ALIMENTI PERMESSI: pasta integrale, riso nero, cous cous integrale, pane integrale, verdure, frutta, proteine magre, pesce, carne bianca, uova, olio EVO
3. ALIMENTI VIETATI: ${alimentiVietati.join(', ')}
4. Ogni pasto deve contenere SEMPRE: proteine + carboidrati complessi + verdure + grassi buoni
5. Per domande mediche: consiglia SEMPRE di consultare un medico

STRUTTURA RISPOSTA:
- Risposta diretta e pratica
- Suggerimenti alimentari specifici secondo Gazzella
- Avvertimento medico se necessario
- Massimo 200 parole

RICONOSCIMENTO CONDIZIONI MEDICHE:
Se la domanda riguarda: tiroide, diabete, ipertensione, colesterolo, farmaci, patologie, disturbi specifici
→ Includi: "⚠️ IMPORTANTE: Consulta il tuo medico per un piano personalizzato"`;

// Inizializza OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Funzione per testare una singola domanda
async function testDomandaOpenAI(domanda, indice) {
  const startTime = Date.now();
  
  try {
    console.log(`\n🔄 Testando domanda ${indice + 1}/20...`);
    console.log(`❓ ${domanda.substring(0, 80)}...`);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: domanda
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const endTime = Date.now();
    const durata = endTime - startTime;
    const risposta = completion.choices[0].message.content;
    
    // Controlla se contiene avvertimento sanitario
    const containsHealthWarning = risposta.includes('⚠️') || 
                                 risposta.toLowerCase().includes('medico') ||
                                 risposta.toLowerCase().includes('consultare') ||
                                 risposta.toLowerCase().includes('specialista');
    
    // Controlla compliance Gazzella (verifica che non menzioni alimenti vietati)
    const mentionsProhibited = alimentiVietati.some(alimento => 
      risposta.toLowerCase().includes(alimento.toLowerCase())
    );
    
    console.log(`✅ Risposta ricevuta in ${durata}ms`);
    if (containsHealthWarning) {
      console.log(`⚠️ Avvertimento sanitario rilevato`);
    }
    if (mentionsProhibited) {
      console.log(`❌ PROBLEMA: Menziona alimenti vietati dal protocollo Gazzella`);
    }
    
    return {
      domanda,
      risposta,
      containsHealthWarning,
      mentionsProhibitedFoods: mentionsProhibited,
      timestamp: new Date().toISOString(),
      errore: null,
      durata,
      tokensUsed: completion.usage?.total_tokens || 0
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
      durata,
      tokensUsed: 0
    };
  }
}

// Funzione principale di test
async function eseguiTestOpenAI() {
  console.log('🔍 TEST DIRETTO OPENAI NUTRIZIONISTA GAZZELLA');
  console.log('==============================================');
  console.log(`📊 Domande da testare: ${domandeMenupausa.length}`);
  console.log(`🎯 Target: Donne in menopausa`);
  console.log(`🤖 Modello: GPT-4o`);
  console.log(`⏰ Inizio test: ${new Date().toLocaleString('it-IT')}\n`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ ERRORE: OPENAI_API_KEY non configurata');
    return;
  }
  
  const risultati = [];
  
  // Esegui tutte le domande
  for (let i = 0; i < domandeMenupausa.length; i++) {
    const risultato = await testDomandaOpenAI(domandeMenupausa[i], i);
    risultati.push(risultato);
    
    // Pausa tra le domande per rispettare rate limits
    if (i < domandeMenupausa.length - 1) {
      console.log('⏳ Pausa 3 secondi...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Analizza risultati
  console.log('\n📈 ANALISI RISULTATI DETTAGLIATA');
  console.log('=================================');
  
  const successfulTests = risultati.filter(r => r.risposta && !r.errore);
  const errorTests = risultati.filter(r => r.errore);
  const healthWarnings = risultati.filter(r => r.containsHealthWarning);
  const prohibitedFoodMentions = risultati.filter(r => r.mentionsProhibitedFoods);
  const avgDuration = risultati.reduce((acc, r) => acc + (r.durata || 0), 0) / risultati.length;
  const totalTokens = risultati.reduce((acc, r) => acc + (r.tokensUsed || 0), 0);
  
  console.log(`✅ Risposte riuscite: ${successfulTests.length}/${risultati.length}`);
  console.log(`❌ Errori: ${errorTests.length}/${risultati.length}`);
  console.log(`⚠️ Avvertimenti sanitari: ${healthWarnings.length}/${risultati.length}`);
  console.log(`🚫 Alimenti vietati menzionati: ${prohibitedFoodMentions.length}/${risultati.length}`);
  console.log(`📈 Tasso di successo: ${((successfulTests.length / risultati.length) * 100).toFixed(1)}%`);
  console.log(`🎯 Compliance Gazzella: ${(((risultati.length - prohibitedFoodMentions.length) / risultati.length) * 100).toFixed(1)}%`);
  console.log(`⏱️ Tempo medio risposta: ${avgDuration.toFixed(0)}ms`);
  console.log(`🪙 Token totali utilizzati: ${totalTokens}`);
  console.log(`💰 Costo stimato: $${(totalTokens * 0.00001).toFixed(4)}`);
  
  // Genera report dettagliato
  console.log('\n📋 GENERAZIONE REPORT COMPLETO');
  console.log('===============================');
  
  const report = generaReportCompleto(risultati);
  const fs = await import('fs');
  const filename = `report-nutrizionista-openai-${new Date().toISOString().split('T')[0]}.md`;
  
  fs.writeFileSync(filename, report);
  console.log(`✅ Report salvato in: ${filename}`);
  
  // Mostra sommario finale
  console.log('\n🎉 TEST OPENAI COMPLETATO');
  console.log('=========================');
  console.log(`📊 ${risultati.length} domande testate`);
  console.log(`✅ ${successfulTests.length} risposte valide`);
  console.log(`⚠️ ${healthWarnings.length} avvertimenti sanitari`);
  console.log(`🎯 ${risultati.length - prohibitedFoodMentions.length} risposte conformi Gazzella`);
  console.log(`⏰ Completato in: ${new Date().toLocaleString('it-IT')}`);
  
  return risultati;
}

// Funzione per generare report markdown completo
function generaReportCompleto(risultati) {
  const now = new Date();
  const dataTest = now.toLocaleDateString('it-IT');
  const oraTest = now.toLocaleTimeString('it-IT');
  
  const successfulTests = risultati.filter(r => r.risposta && !r.errore);
  const errorTests = risultati.filter(r => r.errore);
  const healthWarnings = risultati.filter(r => r.containsHealthWarning);
  const prohibitedFoodMentions = risultati.filter(r => r.mentionsProhibitedFoods);
  const avgDuration = risultati.reduce((acc, r) => acc + (r.durata || 0), 0) / risultati.length;
  const totalTokens = risultati.reduce((acc, r) => acc + (r.tokensUsed || 0), 0);

  let report = `# REPORT COMPLETO NUTRIZIONISTA IA - METODO GAZZELLA
Data: ${dataTest} - Ora: ${oraTest}

## 📊 SOMMARIO ESECUTIVO
- **Modello utilizzato**: GPT-4o
- **Domande totali**: ${risultati.length}
- **Risposte riuscite**: ${successfulTests.length}
- **Errori**: ${errorTests.length}
- **Avvertimenti sanitari**: ${healthWarnings.length}
- **Alimenti vietati menzionati**: ${prohibitedFoodMentions.length}
- **Tasso di successo**: ${((successfulTests.length / risultati.length) * 100).toFixed(1)}%
- **Compliance Protocollo Gazzella**: ${(((risultati.length - prohibitedFoodMentions.length) / risultati.length) * 100).toFixed(1)}%
- **Tempo medio risposta**: ${avgDuration.toFixed(0)}ms
- **Token totali utilizzati**: ${totalTokens}
- **Costo stimato**: $${(totalTokens * 0.00001).toFixed(4)}

## 🎯 VALUTAZIONE QUALITATIVA

### Conformità al Metodo Gazzella:
${prohibitedFoodMentions.length === 0 ? '✅ **ECCELLENTE**: Nessun alimento vietato menzionato' : `⚠️ **ATTENZIONE**: ${prohibitedFoodMentions.length} risposte menzionano alimenti vietati`}

### Riconoscimento Condizioni Mediche:
${healthWarnings.length > 15 ? '✅ **ECCELLENTE**: Sistema identifica correttamente situazioni mediche' : 
  healthWarnings.length > 10 ? '⚠️ **BUONO**: Buon riconoscimento condizioni mediche' :
  '❌ **INSUFFICIENTE**: Sistema non identifica adeguatamente situazioni mediche'}

### Tipologie di Domande Testate:
1. 🌡️ **Sintomi menopausali**: vampate, gonfiore addominale
2. ⚖️ **Gestione peso e metabolismo**: rallentamento metabolico, accumulo grasso
3. 🥗 **Nutrienti specifici**: calcio, vitamine, fitoestrogeni
4. ⏰ **Timing alimentare**: orari pasti, frequenza
5. 😴 **Sintomi correlati**: insonnia, umore, pelle
6. 🏃‍♀️ **Lifestyle**: attività fisica, alcool, spuntini
7. 🩺 **Condizioni mediche**: tiroide, colesterolo

## 📋 DETTAGLIO COMPLETO DOMANDE E RISPOSTE

`;

  risultati.forEach((risultato, index) => {
    const statusIcon = risultato.errore ? '❌' : '✅';
    const warningIcon = risultato.containsHealthWarning ? '⚠️' : '';
    const prohibitedIcon = risultato.mentionsProhibitedFoods ? '🚫' : '';
    
    report += `### ${statusIcon} DOMANDA ${index + 1} ${warningIcon} ${prohibitedIcon}
**Q:** ${risultato.domanda}

`;
    
    if (risultato.errore) {
      report += `**❌ ERRORE:** ${risultato.errore}
*Durata: ${risultato.durata}ms*

`;
    } else {
      report += `**A:** ${risultato.risposta}

`;
      
      let badges = [];
      if (risultato.containsHealthWarning) {
        badges.push('⚠️ **AVVERTIMENTO SANITARIO PRESENTE**');
      }
      if (risultato.mentionsProhibitedFoods) {
        badges.push('🚫 **ALIMENTI VIETATI MENZIONATI**');
      }
      if (badges.length > 0) {
        report += badges.join(' | ') + '\n\n';
      }
      
      report += `*Durata: ${risultato.durata}ms | Token: ${risultato.tokensUsed}*

`;
    }
    
    report += `*Timestamp: ${risultato.timestamp}*

---

`;
  });

  report += `## 🎯 RACCOMANDAZIONI FINALI

### Punti di Forza:
- Tempo di risposta veloce (media ${avgDuration.toFixed(0)}ms)
- ${successfulTests.length > 18 ? 'Tasso di successo eccellente' : 'Funzionamento stabile'}
${healthWarnings.length > 10 ? '- Buon riconoscimento situazioni mediche' : ''}

### Aree di Miglioramento:
${prohibitedFoodMentions.length > 0 ? '- Rafforzare compliance protocollo Gazzella' : ''}
${healthWarnings.length < 10 ? '- Migliorare riconoscimento condizioni mediche' : ''}
${errorTests.length > 0 ? '- Ridurre errori di sistema' : ''}

### Raccomandazioni:
1. ${prohibitedFoodMentions.length > 0 ? 'Aggiornare sistema prompt per eliminare alimenti vietati' : 'Mantenere alta compliance Gazzella'}
2. ${healthWarnings.length < 15 ? 'Potenziare riconoscimento automatico condizioni mediche' : 'Mantenere sistema di allerta medico'}
3. Monitorare costantemente qualità risposte
4. Considerare fine-tuning del modello per specifiche del protocollo Gazzella
`;

  return report;
}

// Esegui il test
eseguiTestOpenAI().catch(console.error);