// setupVectorDb-full.js - Indexation complète de contentHr.pdf
import { ChromaClient } from 'chromadb';
import fs from 'fs/promises';
import pdf from 'pdf-parse';

const COLLECTION_NAME = 'megan_hr_knowledge';
const PDF_PATH = './contentHr.pdf';

async function main() {
  try {
    console.log("🚀 Indexation complète de contentHr.pdf...");

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

    // Créer une nouvelle collection
    const collection = await client.createCollection({ 
      name: COLLECTION_NAME,
      metadata: { 
        description: "Base de connaissances RH complète de MegaHR",
        source: "contentHr.pdf",
        created: new Date().toISOString()
      }
    });
    console.log(`✅ Collection "${COLLECTION_NAME}" créée.`);

    // Lire le PDF
    const dataBuffer = await fs.readFile(PDF_PATH);
    const data = await pdf(dataBuffer);
    console.log("✅ PDF lu et parsé");
    console.log(`📄 Contenu du PDF: ${data.text.length} caractères`);

    // Découper en chunks optimisés pour les RH
    const chunks = [];
    
    // Méthode 1: Découpage par paragraphes
    const paragraphs = data.text.split('\n\n').filter(chunk => chunk.trim().length > 30);
    
    // Méthode 2: Découpage par sections (si il y a des titres)
    const sections = data.text.split(/\n(?=[A-Z][^a-z]*\n)/g).filter(chunk => chunk.trim().length > 50);
    
    // Combiner et nettoyer
    [...paragraphs, ...sections].forEach((chunk, index) => {
      const cleanChunk = chunk.trim().replace(/\s+/g, ' ');
      if (cleanChunk.length > 50 && cleanChunk.length < 2000) {
        chunks.push({
          id: `chunk_${chunks.length}`,
          text: cleanChunk,
          source: 'contentHr.pdf',
          type: index < paragraphs.length ? 'paragraph' : 'section'
        });
      }
    });

    console.log(`📦 ${chunks.length} chunks optimisés créés`);

    // Indexer tous les chunks
    const batchSize = 10; // Traiter par petits lots
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      try {
        await collection.add({
          ids: batch.map(chunk => chunk.id),
          documents: batch.map(chunk => chunk.text),
          metadatas: batch.map(chunk => ({
            source: chunk.source,
            type: chunk.type,
            index: i + batch.indexOf(chunk),
            length: chunk.text.length
          }))
        });
        
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)} indexé (chunks ${i + 1}-${Math.min(i + batchSize, chunks.length)})`);
      } catch (error) {
        console.error(`❌ Erreur batch ${i}:`, error.message);
      }
    }

    // Tests de recherche pour valider
    console.log("\n🔍 Tests de validation...");
    
    const testQueries = [
      "candidat",
      "entretien", 
      "recrutement",
      "évaluation",
      "processus"
    ];

    for (const query of testQueries) {
      try {
        const results = await collection.query({
          queryTexts: [query],
          nResults: 3
        });
        console.log(`✅ "${query}": ${results.documents[0].length} résultats trouvés`);
      } catch (error) {
        console.error(`❌ Erreur recherche "${query}":`, error.message);
      }
    }

    console.log("\n🎉 Indexation complète terminée avec succès !");
    console.log(`📊 Total: ${chunks.length} chunks indexés dans ChromaDB`);

  } catch (error) {
    console.error("❌ Erreur lors de l'indexation:", error.message);
    process.exit(1);
  }
}

main();