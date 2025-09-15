// test-action-detection.js
import { determineAction } from './src/services/ai/meganActions.service.js';

const testPhrases = [
  "Quelles sont mes tâches aujourd'hui ?",
  "EST CE QUE JAI DES TACHE A REALISE AUJOURDUIT ?",
  "Ai-je des activités à faire aujourd'hui ?", 
  "Que dois-je faire aujourd'hui ?",
  "Mes tâches du jour",
  "Qu'est-ce que j'ai comme tâches aujourd'hui ?",
  "Peux-tu me donner les statistiques ?",
  "combien de candidats ?",
  "Je veux planifier un entretien",
  "Recherche candidat Smith"
];

console.log("🔍 Test de détection d'actions améliorée\n");

testPhrases.forEach(phrase => {
  const action = determineAction(phrase);
  console.log(`📝 "${phrase}"`);
  console.log(`➡️  Action: ${action ? action.action : 'AUCUNE'}\n`);
});