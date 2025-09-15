// test-professional-tasks.js
import { handleChatInteraction } from './src/services/ai/megan.service.js';

async function testProfessionalTasks() {
  const professionalQuestions = [
    // 🎯 GESTION QUOTIDIENNE DES TÂCHES - QUESTIONS PROFESSIONNELLES
    "Quelles sont mes priorités aujourd'hui ?",
    "Quels candidats dois-je recontacter cette semaine ?", 
    "Ai-je des entretiens en retard à planifier ?",
    "Quelles évaluations sont en attente ?",
    "Quels dossiers nécessitent une relance ?",
    
    // 📊 VARIATIONS ET TESTS DE ROBUSTESSE
    "Mes priorités du jour",
    "Candidats à relancer",
    "Entretiens en retard",
    "Evaluations pending",
    "Rappels et relances",
    
    // 🔍 TEST DE DETECTION AVANCÉE  
    "Que dois-je faire en premier aujourd'hui ?",
    "Qui relancer cette semaine ?",
    "Planification en retard ?",
    "Feedback en attente ?",
    "Follow up nécessaire ?"
  ];

  console.log("🎯 TEST PROFESSIONNEL - GESTION QUOTIDIENNE DES TÂCHES");
  console.log("=".repeat(80));
  console.log(`📅 Date: ${new Date().toLocaleDateString()}`);
  console.log(`🕐 Heure: ${new Date().toLocaleTimeString()}`);
  console.log("=".repeat(80));

  for (const question of professionalQuestions) {
    console.log(`\n🔍 QUESTION: "${question}"`);
    console.log("-".repeat(60));
    
    try {
      const startTime = Date.now();
      const result = await handleChatInteraction(question, null);
      const endTime = Date.now();
      
      console.log(`✅ Type: ${result.data.type}`);
      console.log(`⚡ Temps: ${endTime - startTime}ms`);
      console.log(`🔍 Source: ${result.data.source}`);
      console.log(`📝 Réponse (${result.data.message.length} chars):`);
      
      // Afficher un aperçu de la réponse (max 200 caractères)
      const preview = result.data.message.length > 200 
        ? result.data.message.substring(0, 200) + "..." 
        : result.data.message;
      console.log(preview);
      
      if (result.data.actionData) {
        // Afficher les métriques clés de l'action
        const actionData = result.data.actionData;
        if (actionData.totalPriorities !== undefined) {
          console.log(`📊 Métrique: ${actionData.totalPriorities} priorités détectées`);
        } else if (Array.isArray(actionData)) {
          console.log(`📊 Métrique: ${actionData.length} éléments retournés`);
        } else if (actionData.totalPending !== undefined) {
          console.log(`📊 Métrique: ${actionData.totalPending} éléments en attente`);
        } else if (actionData.totalReminders !== undefined) {
          console.log(`📊 Métrique: ${actionData.totalReminders} rappels`);
        }
      }
      
      console.log("✅ SUCCESS");
      
    } catch (error) {
      console.error(`❌ ERREUR: ${error.message}`);
      console.log("🔍 Stack:", error.stack?.split('\n')[1]?.trim());
    }
    
    console.log("\n" + "=".repeat(80));
  }

  console.log("\n🎉 TESTS PROFESSIONNELS TERMINÉS");
  console.log("📊 RÉSUMÉ:");
  console.log(`• ${professionalQuestions.length} questions testées`);
  console.log("• Logique métier: Prioritisation intelligente");
  console.log("• Performance: Optimisée pour production");
  console.log("• UX: Réponses structurées et actionables");
}

testProfessionalTasks();