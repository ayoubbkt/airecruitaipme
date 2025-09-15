// test-megan-actions.js
import { handleChatInteraction } from './src/services/ai/megan.service.js';

async function testMeganActions() {
  const testQuestions = [
    "Quelles sont mes tâches aujourd'hui ?",
    "EST CE QUE JAI DES TACHE A REALISE AUJOURDUIT ?", // Test de la phrase problématique
    "Peux-tu me donner les statistiques de la plateforme ?",
    "Je veux planifier un entretien",
    "Recherche les candidats avec le nom Smith",
    "Comment évaluer un candidat ?", // Question normale de documentation
  ];

  for (const question of testQuestions) {
    console.log(`\n🔍 TEST: "${question}"`);
    console.log("=".repeat(60));
    
    try {
      const result = await handleChatInteraction(question, null); // userId = null pour récupérer automatiquement
      console.log(`✅ Type: ${result.data.type}`);
      console.log(`📝 Réponse: ${result.data.message}`);
      
      if (result.data.actionData) {
        console.log(`📊 Données d'action:`, JSON.stringify(result.data.actionData, null, 2));
      }
      
      console.log("\n" + "-".repeat(80));
    } catch (error) {
      console.error(`❌ Erreur: ${error.message}`);
    }
  }
}

testMeganActions();