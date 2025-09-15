// setupVectorDb.js
import { ChromaClient } from 'chromadb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import 'dotenv/config';

const KNOWLEDGE_BASE_PDF = './contentHr.pdf';
const COLLECTION_NAME = 'megan_hr_knowledge';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

// Configuration ChromaDB avec la nouvelle API
const client = new ChromaClient({
  host: 'localhost',
  port: 8000
});

async function main() {
  try {
    console.log("Démarrage du processus d'ingestion de la base de connaissances...");

    // 1. Supprimer l'ancienne collection si elle existe pour une mise à jour propre
    try {
      await client.deleteCollection({ name: COLLECTION_NAME });
      console.log(`Ancienne collection "${COLLECTION_NAME}" supprimée.`);
    } catch (e) {
      console.log(`La collection "${COLLECTION_NAME}" n'existait pas, création en cours.`);
    }

    // 2. Créer une nouvelle collection
    const collection = await client.createCollection({ 
      name: COLLECTION_NAME,
      embeddingFunction: {
        generate: async (texts) => {
          console.log(`Génération des embeddings pour ${texts.length} textes...`);
          try {
            const embeddings = [];
            // Traiter les textes un par un pour éviter les erreurs de batch
            for (const text of texts) {
              const result = await embeddingModel.embedContent(text);
              embeddings.push(result.embedding.values);
            }
            return embeddings;
          } catch (error) {
            console.error("Erreur lors de la génération des embeddings:", error);
            throw error;
          }
        }
      }
    });
    console.log(`Collection "${COLLECTION_NAME}" créée.`);

    // 3. Lire et extraire le texte du PDF
    const dataBuffer = await fs.readFile(KNOWLEDGE_BASE_PDF);
    const data = await pdf(dataBuffer);
    console.log("PDF lu et parsé.");

    // 4. Découper le texte en morceaux (chunks)
    const textChunks = data.text.split('\n\n').filter(chunk => chunk.trim().length > 100);
    console.log(`${textChunks.length} morceaux de texte créés.`);

    // 5. Ajouter les documents à la collection
    // ChromaDB s'occupera de générer les embeddings grâce à `embeddingFunction`
    await collection.add({
      ids: textChunks.map((_, index) => `doc_${index}`),
      documents: textChunks,
    });

    console.log("✅ Ingestion terminée ! La base de données vectorielle est prête.");

  } catch (error) {
    console.error("❌ Une erreur est survenue lors de l'ingestion :", error);
  }
}

main();
