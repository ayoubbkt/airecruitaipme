// src/services/ai/gemini.service.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../config/index.js';

// Importer les définitions de tous les outils disponibles
import { jobTools } from './tools/job.tools.js';

import { taskTools } from './tools/task.tools.js';
import {candidateTools} from './tools/candidate.tools.js';
// Vous ajouterez ici les futurs outils (ex: import { schedulingTools } from './tools/scheduling.tools.js';)

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// Combiner tous les ensembles d'outils en une seule liste pour Gemini
const allTools = [...jobTools, ...taskTools, ...candidateTools];

// Initialiser le modèle en lui fournissant la liste complète des outils



const models = {
  flash: genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-latest",
  tools: allTools,}),
  embedding: genAI.getGenerativeModel({ model: "text-embedding-004" }),
};
/**
 * Démarre une nouvelle session de chat avec un historique.
 * @param {object} systemInstruction - L'instruction système pour guider l'IA.
 * @returns {GenerativeChatSession} - L'instance de la session de chat.
 */
export const startChat = (systemInstruction) => {
  return models.flash.startChat({
    systemInstruction,
    // L'historique sera géré automatiquement par la session de chat.
  });
};

/**
 * Envoie un message dans une session de chat existante et attend la réponse de Gemini.
 * @param {GenerativeChatSession} chat - La session de chat active.
 * @param {string} userInput - Le message de l'utilisateur.
 * @returns {object} - La réponse brute de l'API Gemini.
 */
export const runConversation = async (chat, userInput) => {
  const result = await chat.sendMessage(userInput);
  console.log('Gemini response:', result.response);
  return result.response;
};

export const getEmbedding = async (text) => {
  const result = await models.embedding.embedContent(text);
  return result.embedding.values;
};

export const generateText = async (prompt, systemInstruction) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    systemInstruction,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const generateJson = async (prompt, systemInstruction) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    systemInstruction,
    generationConfig: { responseMimeType: "application/json" }
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
};

