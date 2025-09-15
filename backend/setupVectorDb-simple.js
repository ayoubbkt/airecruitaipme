// setupVectorDb-simple.js
import { ChromaClient } from 'chromadb';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import 'dotenv/config';

const KNOWLEDGE_BASE_PDF = './contentHr.pdf';
const COLLECTION_NAME = 'megan_hr_knowledge';

// Configuration ChromaDB avec la nouvelle API
const client = new ChromaClient({
  host: 'localhost',
  port: 8000
});

async function main() {
  try {
    console.log("🚀 Démarrage de l'indexation de contentHr.pdf...");

    // 1. Supprimer l'ancienne collection si elle existe
    try {
      await client.deleteCollection({ name: COLLECTION_NAME });
      console.log(`✅ Ancienne collection "${COLLECTION_NAME}" supprimée.`);
    } catch (e) {
      console.log(`📝 La collection "${COLLECTION_NAME}" n'existait pas.`);
    }

    // 2. Créer une nouvelle collection (ChromaDB utilisera ses embeddings par défaut)
    const collection = await client.createCollection({ 
      name: COLLECTION_NAME
    });
    console.log(`✅ Collection "${COLLECTION_NAME}" créée.`);

    // 3. Lire et extraire le texte du PDF
    console.log("📖 Lecture du PDF...");
    const dataBuffer = await fs.readFile(KNOWLEDGE_BASE_PDF);
    const data = await pdf(dataBuffer);
    console.log(`✅ PDF lu: ${data.text.length} caractères extraits.`);

    // 4. Découper le texte en morceaux de taille raisonnable
    const maxChunkSize = 1000;
    const overlap = 100;
    const textChunks = [];
    
    for (let i = 0; i < data.text.length; i += maxChunkSize - overlap) {
      const chunk = data.text.slice(i, i + maxChunkSize).trim();
      if (chunk.length > 50) { // Ignorer les chunks trop petits
        textChunks.push(chunk);
      }
    }
    
    console.log(`✅ ${textChunks.length} chunks créés.`);

    // 5. Ajouter les chunks à la collection par petits lots
    const batchSize = 10;
    for (let i = 0; i < textChunks.length; i += batchSize) {
      const batch = textChunks.slice(i, i + batchSize);
      const ids = batch.map((_, idx) => `chunk_${i + idx}`);
      
      await collection.add({
        ids: ids,
        documents: batch,
        metadatas: batch.map((chunk, idx) => ({
          source: 'contentHr.pdf',
          chunk_id: i + idx,
          length: chunk.length
        }))
      });
      
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(textChunks.length/batchSize)} ajouté.`);
    }

    console.log("🎉 Indexation terminée avec succès!");
    console.log(`📊 Total: ${textChunks.length} chunks indexés dans ChromaDB.`);
    
  } catch (error) {
    console.error("❌ Erreur lors de l'indexation:", error);
  }
}

main();