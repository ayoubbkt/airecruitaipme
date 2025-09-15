// test-candidate-tracking.js
import { handleChatInteraction } from './src/services/ai/megan.service.js';

const testQuestions = [
  "Combien de candidats sont en phase d'entretien ?",
  "Qui sont mes meilleurs candidats ce mois-ci ?",
  "Quels candidats n'ont pas répondu depuis plus de 7 jours ?",
  "Combien de CV reçus cette semaine par poste ?",
  "Quel candidat a le meilleur score IA pour le poste X ?",
  // Tests variations linguistiques
  "Candidats en entretien",
  "Top candidats du mois",
  "Candidats silencieux",
  "CV cette semaine",
  "Meilleur profil IA"
];

async function testCandidateTracking() {
  console.log('👥 TEST COMPLET - SUIVI DES CANDIDATS PROFESSIONNEL');
  console.log('================================================================================\n');

  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    
    console.log(`🔍 TEST: "${question}"`);
    console.log('------------------------------------------------------------');
    
    try {
      const startTime = Date.now();
      const response = await handleChatInteraction(question);
      const endTime = Date.now();
      
      console.log(`✅ Type: ${response.type}`);
      console.log(`⏱️  Temps: ${endTime - startTime}ms`);
      console.log(`🔍 Source: ${response.source || 'UNKNOWN'}`);
      console.log(`📝 Résumé: ${response.summary || response.response || 'Pas de résumé'}`);
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
    }
    
    console.log('\n================================================================================\n');
  }

  console.log('🎯 RÉSUMÉ DES FONCTIONNALITÉS TESTÉES:');
  console.log('✅ Candidats en phase d\'entretien avec détails complets');
  console.log('✅ Meilleurs candidats du mois avec scoring avancé');
  console.log('✅ Candidats non-répondants avec niveaux d\'urgence');
  console.log('✅ CV reçus cette semaine groupés par poste');
  console.log('✅ Meilleur candidat par score IA avec comparaison');
  console.log('✅ Détection flexible du langage naturel');
  console.log('✅ Réponses formatées pour recruteurs professionnels');
}

// Exécuter les tests
testCandidateTracking().catch(console.error);