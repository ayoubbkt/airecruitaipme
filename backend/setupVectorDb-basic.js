// setupVectorDb-basic.js - Version de base pour tester ChromaDB
import { ChromaClient } from 'chromadb';
import fs from 'fs/promises';
import pdf from 'pdf-parse';

const COLLECTION_NAME = 'megan_hr_knowledge';
const PDF_PATH = './contentHr.pdf';

async function main() {
  try {
    console.log("🚀 Test basique de ChromaDB...");

    // Connexion ChromaDB
    const client = new ChromaClient({
      host: 'localhost',
      port: 8000
    });

    console.log("✅ Connexion ChromaDB établie");

    // Supprimer l'ancienne collection si elle existe
    try {
      await client.deleteCollection({ name: COLLECTION_NAME });
      console.log(`✅ Ancienne collection "${COLLECTION_NAME}" supprimée.`);
    } catch (e) {
      console.log(`ℹ️ Collection "${COLLECTION_NAME}" n'existait pas.`);
    }

    // Créer une collection SANS embedding function (utilise le défaut)
    const collection = await client.createCollection({ 
      name: COLLECTION_NAME,
      metadata: { description: "Base de connaissances RH de MegaHR" }
    });
    console.log(`✅ Collection "${COLLECTION_NAME}" créée.`);

    // Lire le PDF
    const dataBuffer = await fs.readFile(PDF_PATH);
    const data = await pdf(dataBuffer);
    console.log("✅ PDF lu et parsé");

    // Découper en chunks simples
    const textChunks = data.text.split('\n\n').filter(chunk => chunk.trim().length > 50);
    console.log(`📄 ${textChunks.length} chunks créés`);

    // Ajouter quelques chunks pour tester (pas tous pour éviter les erreurs)
    const testChunks = textChunks.slice(0, 3); // Juste 3 pour tester
    
    for (let i = 0; i < testChunks.length; i++) {
      try {
        await collection.add({
          ids: [`doc_${i}`],
          documents: [testChunks[i]],
          metadatas: [{ source: "contentHr.pdf", chunk: i }]
        });
        console.log(`✅ Chunk ${i + 1} ajouté`);
      } catch (error) {
        console.error(`❌ Erreur chunk ${i}:`, error.message);
      }
    }

    // Test de recherche
    console.log("🔍 Test de recherche...");
    const results = await collection.query({
      queryTexts: ["candidat"],
      nResults: 2
    });

    console.log("✅ Résultats de recherche:", results.documents[0].length, "documents trouvés");
    console.log("🎉 Test ChromaDB réussi !");

  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

main();