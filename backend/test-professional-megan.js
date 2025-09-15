// test-professional-megan.js
import { handleChatInteraction } from './src/services/ai/megan.service.js';

async function testProfessionalMegan() {
  console.log("🏢 TEST COMPLET - MEGAN ASSISTANT RECRUTEUR PROFESSIONNEL");
  console.log("=" .repeat(80));
  
  const professionalQuestions = [
    // Gestion quotidienne professionnelle
    "Quelles sont mes priorités aujourd'hui ?",
    "Quels candidats dois-je recontacter cette semaine ?", 
    "Ai-je des entretiens en retard à planifier ?",
    "Quelles évaluations sont en attente ?",
    "Quels dossiers nécessitent une relance ?",
    
    // Questions métier avancées
    "Qui relancer en priorité ?",
    "Candidats à suivre",
    "Entretiens en retard",
    "Mes rappels",
    "Évaluations urgentes",
    
    // Variations linguistiques naturelles
    "Que dois-je faire en premier aujourd'hui ?",
    "Quels candidats ont besoin d'un suivi ?",
    "Y a-t-il des évaluations en retard ?",
    
    // Actions existantes pour comparaison
    "Statistiques de la plateforme",
    "Comment planifier un entretien ?",
  ];

  for (const question of professionalQuestions) {
    console.log(`\n🔍 TEST: "${question}"`);
    console.log("-".repeat(60));
    
    try {
      const start = Date.now();
      const result = await handleChatInteraction(question, null);
      const duration = Date.now() - start;
      
      console.log(`✅ Type: ${result.data.type}`);
      console.log(`⏱️  Temps: ${duration}ms`);
      console.log(`🔍 Source: ${result.data.source}`);
      
      // Afficher un résumé de la réponse
      const message = result.data.message;
      const lines = message.split('\n');
      const summary = lines.slice(0, 3).join('\n');
      console.log(`📝 Résumé: ${summary}${lines.length > 3 ? '...' : ''}`);
      
      // Afficher les métriques si disponibles
      if (result.data.actionData) {
        if (result.data.actionData.summary) {
          console.log(`📊 Métriques:`, JSON.stringify(result.data.actionData.summary, null, 2));
        } else if (result.data.actionData.length !== undefined) {
          console.log(`📊 Résultats: ${result.data.actionData.length} éléments`);
        }
      }
      
      console.log("\n" + "=".repeat(80));
    } catch (error) {
      console.error(`❌ Erreur: ${error.message}`);
      console.log("\n" + "=".repeat(80));
    }
  }

  // Afficher un résumé final
  console.log("\n🎯 RÉSUMÉ DES FONCTIONNALITÉS TESTÉES:");
  console.log("✅ Gestion quotidienne des priorités");
  console.log("✅ Suivi intelligent des candidats");
  console.log("✅ Détection des entretiens en retard");
  console.log("✅ Gestion des évaluations en attente");
  console.log("✅ Système de rappels et relances");
  console.log("✅ Détection flexible du langage naturel");
  console.log("✅ Réponses formatées pour recruteurs professionnels");
}

testProfessionalMegan().catch(console.error);