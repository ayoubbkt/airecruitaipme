// test-single-priority.js
import { determineAction } from './src/services/ai/meganActions.service.js';

// Test rapide de la détection d'actions
const testQuestions = [
  "Quelles sont mes priorités aujourd'hui ?",
  "Candidats à recontacter",
  "Entretiens en retard",
  "Évaluations en attente",
  "Rappels et relances"
];

console.log("🔍 Test de détection d'actions professionnelles\n");

testQuestions.forEach(question => {
  const action = determineAction(question);
  console.log(`📝 "${question}"`);
  console.log(`➡️  Action: ${action ? action.action : 'AUCUNE'}\n`);
});