// src/services/ai/megan.service.js
import { startChat, runConversation, generateJson, generateText  } from './gemini.service.js';
import { findRelevantDocuments } from './vectorDb.service.js';
import db from '../../config/db.js'; // Assurez-vous que ceci pointe vers votre configuration Prisma
// Importer TOUTES les fonctions d'exécution des outils.
// C'est crucial pour pouvoir les appeler par leur nom.
import * as jobToolFunctions from './tools/job.tools.js';
import * as taskToolFunctions from './tools/task.tools.js';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';

export const extractResumeContent = async (resumeUrl) => {
    if (!resumeUrl) return null;

    try {
      const filePath = path.join(process.cwd(), resumeUrl);
      const fileExtension = path.extname(resumeUrl).toLowerCase();

      if (fileExtension === '.txt') {
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
      } else if (fileExtension === '.pdf') {
        // Pour les PDF, installer pdf-parse si nécessaire
        try {
          const mod = await import('pdf-parse');
          const pdfParse = mod.default || mod;
          const buffer = await fs.readFile(filePath);
          const data = await pdfParse(buffer);
          return data.text;
        } catch (error) {
          console.error('Error parsing PDF:', error);
          return `Fichier PDF disponible: ${path.basename(resumeUrl)}`;
        }
      } else {
        return `Fichier CV disponible: ${path.basename(resumeUrl)}\nType: ${fileExtension}`;
      }
    } catch (error) {
      console.error('Error extracting resume content:', error);
      return `Erreur lors de la lecture du CV. Fichier: ${path.basename(resumeUrl)}`;
    }
  }
// Créer un objet unique qui mappe les noms des fonctions à leur implémentation.
const availableTools = {
  ...jobToolFunctions,
  ...taskToolFunctions,
};

const chatSystemInstruction = {
  parts: [{text: `
    Tu es Megan, un assistant IA expert pour l'application de recrutement "MegaHR". Ton but est d'aider les recruteurs en étant efficace, professionnelle et amicale.
    Tu as deux capacités principales :
    1.  Répondre aux questions générales sur l'utilisation de l'application ("comment faire...?") en te basant EXCLUSIVEMENT sur le CONTEXTE qui t'est fourni. Si l'information n'est pas dans le contexte, dis poliment que tu ne sais pas.
    2.  Utiliser des OUTILS pour interagir avec la base de données de l'application afin de répondre à des questions spécifiques sur les données (ex: "qui sont les candidats pour le poste X ?", "quelles sont mes tâches aujourd'hui ?") ou pour exécuter des actions.

    Processus de décision :
    -   Analyse d'abord la requête de l'utilisateur.
    -   Si la requête concerne des candidats, des jobs, ou des étapes du workflow, UTILISE TOUJOURS les OUTILS appropriés pour obtenir la réponse, même si tu penses connaître la réponse.
    -   Si c'est une question générale sur le fonctionnement, utilise le CONTEXTE.
    -   Ne formule la réponse finale pour l'utilisateur qu'après avoir obtenu toutes les informations nécessaires (soit du contexte, soit des outils).
    -   Ne mentionne jamais les mots "outil", "fonction" ou "API" à l'utilisateur. Parle naturellement. Par exemple, au lieu de "J'exécute l'outil getTodaysTasks", dis "Je regarde votre agenda pour aujourd'hui...".
  `}]
};

const screeningSystemInstruction = `
  Tu es Megan, une IA experte en recrutement. Ta tâche est d'analyser le CV d'un candidat par rapport à une description de poste.
  Tu dois fournir une analyse concise et objective sous forme d'un objet JSON.
  Le JSON doit contenir :
  - "score": un score entier de 0 à 100 basé sur l'adéquation globale.
  - "summary": un résumé de 2-3 phrases sur le profil du candidat.
  - "pros": une liste de 3 points forts clés du candidat pour ce poste.
  - "cons": une liste de 2 points faibles ou zones de questionnement.
`;

// En production, il est recommandé de gérer une instance de chat par utilisateur
// et de sauvegarder/restaurer l'historique depuis une base de données (ex: Redis ou votre DB SQL/NoSQL).
// Pour la simplicité, nous créons un cache en mémoire.
const userChatSessions = new Map();

function getChatSession(userId) {
  if (!userChatSessions.has(userId)) {
    console.log(`Création d'une nouvelle session de chat pour l'utilisateur ${userId}`);
    userChatSessions.set(userId, startChat(chatSystemInstruction));
  }
  return userChatSessions.get(userId);
}

export const handleChatInteraction = async (userInput, userId) => {
  const chat = getChatSession(userId);

  // 1. D'abord, chercher du contexte pertinent pour les questions générales (RAG)
  const context = await findRelevantDocuments(userInput);
  const promptWithContext = `
    CONTEXTE:
    ---
    ${context || "Aucune information contextuelle trouvée pour cette question."}
    ---
    REQUÊTE DE L'UTILISATEUR: "${userInput}"
  `;

  // 2. Lancer la conversation avec Gemini en utilisant le contexte
  let response = await runConversation(chat, promptWithContext);

  // 3. Boucle de gestion des outils : continue tant que Gemini demande d'appeler des fonctions
  while (true) {
  let functionCalls;
  if (typeof response.functionCalls === 'function') {
    functionCalls = await response.functionCalls();
  } else {
    functionCalls = response.functionCalls;
  }

  if (!functionCalls || !Array.isArray(functionCalls) || functionCalls.length === 0) {
    break;
  }

  console.log("Gemini demande d'utiliser les outils :", functionCalls.map(fc => fc.name));

  // Prépare les appels aux fonctions en parallèle
  const toolPromises = functionCalls.map(async (call) => {
    const functionToCall = availableTools[call.name];
    if (!functionToCall) {
      console.error(`Outil inconnu demandé par l'IA: ${call.name}`);
      return {
        functionResponse: { name: call.name, response: { content: `Erreur: L'outil ${call.name} n'existe pas.` } }
      };
    }
    const args = call.args;
    if (call.name === 'getTodaysTasks') {
      args.userId = userId;
    }
    const result = await functionToCall(args);
    return {
      functionResponse: { name: call.name, response: { content: result } },
    };
  });

  // 4. Exécuter tous les appels d'outils et récupérer leurs résultats
  const toolResponses = await Promise.all(toolPromises);

  // 5. Renvoyer les résultats des outils à Gemini pour qu'il puisse formuler la réponse finale
  response = await runConversation(chat, JSON.stringify(toolResponses));
}

  // 6. Une fois la boucle terminée, la réponse est le texte final formulé par Gemini
  let finalText = typeof response.text === 'function' ? await response.text() : response.text;
  if (typeof finalText !== 'string') {
    finalText = JSON.stringify(finalText);
  }
  return { success: true,
    data: {
      message: finalText
    } };
};

// --- Les autres fonctions de Megan Service ---
// performAiScreening, performAiNoteTaking, etc. restent inchangées car elles ne font pas partie du chat interactif.
// (Le code de ces fonctions que j'ai fourni précédemment est toujours valide)

export const handleNoteTaking = async (transcript) => {
    try {
        // Utiliser Gemini AI pour générer des notes intelligentes
        const summary = await generateText(transcript, noteTakingSystemInstruction);

        const response = {
            success: true,
            data: {
                notes: {
                    summary: summary,
                    keyPoints: summary.split('\n').filter(line => line.includes('•') || line.includes('-')).slice(0, 3),
                    actionItems: summary.split('\n').filter(line => line.toLowerCase().includes('action')).slice(0, 2),
                    participants: "Analysé par Megan AI",
                    duration: `Estimé à ${Math.ceil(transcript.split(' ').length / 150)} minutes`,
                    originalTranscript: transcript.substring(0, 200) + (transcript.length > 200 ? '...' : '')
                },
                id: `notes-${Date.now()}`,
                timestamp: new Date().toISOString(),
                message: "Notes générées avec succès par Megan AI"
            }
        };

        return response;

    } catch (error) {
        console.error('Erreur dans handleNoteTaking:', error);
        // Fallback en cas d'erreur avec Gemini
        const wordCount = transcript.split(' ').length;
        
        const notes = {
            summary: `Résumé généré automatiquement à partir d'une transcription de ${wordCount} mots. Le contenu principal traite des éléments mentionnés dans la discussion.`,
            keyPoints: [
                "Points principaux extraits de la transcription",
                "Éléments importants identifiés dans la conversation",
                "Sujets abordés durant l'échange"
            ],
            actionItems: [
                "Actions à suivre identifiées",
                "Prochaines étapes à planifier"
            ],
            participants: "Participants mentionnés dans la transcription",
            duration: `Estimé à ${Math.ceil(wordCount / 150)} minutes`,
            originalTranscript: transcript.substring(0, 200) + (transcript.length > 200 ? '...' : '')
        };

        return {
            success: true,
            data: {
                notes: notes,
                id: `notes-${Date.now()}`,
                timestamp: new Date().toISOString(),
                message: "Notes générées avec succès (mode fallback)"
            }
        };
    }
};
export const performAiScreening = async (candidateId, jobId, userId = null) => {
  console.log("🔍 Début du screening IA pour candidat:", candidateId, "et job:", jobId);
  
  // Récupérer les données depuis votre base de données
  const candidate = await db.candidate.findUnique({ 
    where: { id: candidateId }, 
    include: { files: true } 
  });
  const job = await db.job.findUnique({ where: { id: jobId } });

  console.log("📋 Candidate trouvé:", candidate ? "✅" : "❌");
  console.log("💼 Job trouvé:", job ? "✅" : "❌");
  console.log("📄 Nombre de fichiers:", candidate?.files?.length || 0);
  const resumeContent = await extractResumeContent(candidate.resumeUrl);
  if (!candidate || !job || !resumeContent) {
    throw new Error(`Données manquantes: candidat=${!!candidate}, job=${!!job}, CV=${!!resumeContent}`);
  }
  
  // Si pas de fichiers, utiliser les informations de base du candidat
//   let resumeText = '';
//   if (candidate.files && candidate.files.length > 0) {
//     // Pour l'instant, utiliser le nom du fichier et les infos disponibles
//     const resumeFile = candidate.files.find(f => 
//       f.fileName.toLowerCase().includes('cv') || 
//       f.fileName.toLowerCase().includes('resume') ||
//       f.fileType?.includes('pdf')
//     ) || candidate.files[0];
    
//     resumeText = `Fichier CV: ${resumeFile.fileName}
// Type: ${resumeFile.fileType || 'Non spécifié'}
// Taille: ${resumeFile.fileSize || 'Non spécifié'} bytes`;
//   }
  
//   // Utiliser les informations disponibles du candidat
//   const candidateInfo = `
// Nom: ${candidate.firstName} ${candidate.lastName}
// Email: ${candidate.email}
// Téléphone: ${candidate.phoneNumber || 'Non spécifié'}
// ${candidate.coverLetterText ? `Lettre de motivation: ${candidate.coverLetterText}` : ''}
// ${resumeText}
// `;
  
// console.log("📄 Texte du CV/Infos du candidat:", candidateInfo);
//   
// console.log("💼 Description du poste:", jobDescription);
  const jobDescription = job.description || job.title || 'Description non disponible';

  const prompt = `
    Job Description:
    ---
    ${jobDescription}
    ---
    Candidate Information:
    ---
    ${resumeContent}
    ---
  `;

  console.log("🧠 Appel à Gemini AI pour le screening...");
  const screeningResult = await generateJson(prompt, screeningSystemInstruction);
  console.log("✅ Résultat du screening:", screeningResult);
  
  // Enregistrer le résultat dans la base de données
  await db.candidate.update({
    where: { id: candidateId },
    data: {
      ai_screening_score: screeningResult.score,
      ai_screening_summary: screeningResult.summary,
      ai_screening_pros: screeningResult.pros.join('\n'),
      ai_screening_cons: screeningResult.cons.join('\n'),
    },
  });

  // Créer une activité pour Megan dans le feed avec un userId valide
  try {
    // Utiliser l'ID du premier utilisateur disponible ou l'userId passé en paramètre
    let performerId = userId;
    if (!performerId) {
      const firstUser = await db.user.findFirst();
      performerId = firstUser?.id;
    }

    if (performerId) {
      await db.activity.create({
        data: {
          candidateId: candidateId,
          type: 'AI_SCREENING',
          description: `🤖 Megan (HR Assistant) a terminé l'analyse IA du candidat. Score: ${screeningResult.score}/100. ${screeningResult.summary}`,
          performedBy: performerId,
        }
      });
      console.log("📝 Activité créée avec succès dans le feed");
    } else {
      console.log("⚠️ Impossible de créer l'activité: aucun utilisateur trouvé");
    }
  } catch (activityError) {
    console.error("❌ Erreur lors de la création de l'activité:", activityError);
  }

  console.log(`✅ AI Screening terminé pour le candidat ${candidateId}`);
  return screeningResult;
};

export const performAiNoteTaking = async (transcript, candidateId, jobId) => {
    const summary = await generateText(transcript, noteTakingSystemInstruction);

    // Enregistrer la note dans la base de données
    await db.interviewNote.create({
        data: {
            candidateId,
            jobId,
            content: summary,
        }
    });
    console.log(`Note d'entretien enregistrée pour le candidat ${candidateId}`);
    return { summary };
};