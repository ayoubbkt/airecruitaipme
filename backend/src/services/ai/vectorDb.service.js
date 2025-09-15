// src/services/ai/vectorDb.service.js
import { ChromaClient } from 'chromadb';
import path from 'path';
import { getEmbedding } from './gemini.service.js';

const COLLECTION_NAME = 'megan_hr_knowledge';

// Configuration ChromaDB avec gestion d'erreur améliorée
let client;
let collection;

const initializeClient = () => {
  try {
    // Utiliser la même configuration qui fonctionne dans setupVectorDb-basic.js
    client = new ChromaClient({
      host: 'localhost',
      port: 8000
    });
    console.log("✅ ChromaDB client initialisé (localhost:8000)");
  } catch (error) {
    console.warn("❌ ChromaDB non disponible, utilisation du mode fallback:", error.message);
    client = null;
  }
};

const getCollection = async () => {
  if (!client) {
    initializeClient();
  }
  
  if (!client) {
    throw new Error("ChromaDB client non disponible");
  }

  if (!collection) {
    try {
      collection = await client.getCollection({ 
        name: COLLECTION_NAME,
        embeddingFunction: { 
          generate: async (texts) => {
            // Placeholder pour ChromaDB
            return texts.map(() => []);
          }
        }
      });
    } catch (error) {
      console.warn("Collection ChromaDB non trouvée, création...");
      // Tenter de créer la collection
      collection = await client.createCollection({ 
        name: COLLECTION_NAME,
        embeddingFunction: { 
          generate: async (texts) => {
            return texts.map(() => []);
          }
        }
      });
    }
  }
  return collection;
};

export const findRelevantDocuments = async (query, nResults = 5) => {
  try {
    const coll = await getCollection();
    const queryEmbedding = await getEmbedding(query);
    
    const results = await coll.query({
      queryEmbeddings: [queryEmbedding],
      nResults,
    });

    if (!results.documents[0] || results.documents[0].length === 0) {
      throw new Error("Aucun document trouvé");
    }

    // Filtrer et retourner les meilleurs résultats
    const documents = results.documents[0];
    const distances = results.distances[0];
    const metadatas = results.metadatas[0];
    
    // Trier par pertinence et prendre les 3 meilleurs
    const relevantDocs = documents
      .map((doc, index) => ({
        content: doc,
        distance: distances[index],
        metadata: metadatas[index]
      }))
      .filter(item => item.distance < 1.2) // Seuil de pertinence plus permissif
      .slice(0, 3) // Prendre seulement les 3 meilleurs
      .map(item => item.content);

    if (relevantDocs.length === 0) {
      console.log("⚠️ Aucun document très pertinent, utilisation des meilleurs disponibles");
      // Prendre les 2 meilleurs résultats même s'ils ne passent pas le seuil
      const fallbackDocs = documents
        .map((doc, index) => ({
          content: doc,
          distance: distances[index]
        }))
        .slice(0, 2)
        .map(item => item.content);
      
      return fallbackDocs.join('\n\n');
    }

    // Limiter la taille totale du contexte
    const maxContextLength = 2000;
    let context = '';
    
    for (const doc of relevantDocs) {
      if (context.length + doc.length > maxContextLength) {
        // Ajouter une partie du document si possible
        const remainingSpace = maxContextLength - context.length;
        if (remainingSpace > 100) {
          context += doc.substring(0, remainingSpace - 10) + '...\n\n';
        }
        break;
      }
      context += doc + '\n\n';
    }

    return context.trim();
    
  } catch (error) {
    console.error("Erreur lors de la recherche vectorielle:", error);
    
    // Fallback amélioré selon le type de requête
    if (query.toLowerCase().includes('candidat')) {
      return `⚠️ CONTEXTE LIMITÉ: Base de connaissances partiellement accessible.

Pour créer un candidat dans MegaHR:
- Les candidats sont généralement créés automatiquement lorsqu'ils postulent à une offre
- Les recruteurs externes peuvent ajouter des candidats spécifiques aux postes
- Gestion possible via la section "Candidates" pour modifications en masse
- Profils comprennent: informations personnelles, CV, expérience, évaluations

Consultez la documentation complète dans contentHr.pdf pour plus de détails.`;
    }
    
    return `⚠️ FALLBACK TEMPORAIRE: ChromaDB indisponible
Le système devrait utiliser le contenu de contentHr.pdf pour une réponse précise.`;
  }
};
