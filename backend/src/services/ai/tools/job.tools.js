// src/services/ai/tools/job.tools.js
import JobService from '../../../api/jobs/job.service.js';
import CandidateService from '../../../api/candidates/candidate.service.js';

// --- Fonctions d'exécution ---
// Ce sont les fonctions qui font le vrai travail en appelant vos services existants.

export const getJobDetails = async ({ jobTitle }) => {
  console.log(`TOOL: Exécution de getJobDetails pour le titre: ${jobTitle}`);
  const job = await JobService.findByTitle(jobTitle); // Vous devez créer cette méthode dans JobService
  if (!job) return `Je n'ai trouvé aucun poste avec le titre "${jobTitle}".`;
  return JSON.stringify(job); // On retourne les données en JSON pour que l'IA puisse les lire
};

export const getCandidatesByStage = async ({ jobTitle, stageName }) => {
  console.log(`TOOL: Exécution de getCandidatesByStage pour "${jobTitle}" au stage "${stageName}"`);
  const candidates = await CandidateService.findByJobAndStage(jobTitle, stageName);
  console.log("CANDIDATES FOUND:", candidates);
  if (!candidates || candidates.length === 0) {
    return `Aucun candidat trouvé pour le poste "${jobTitle}" à l'étape "${stageName}".`;
  }
  const candidateNames = candidates.map(c => `${c.firstName} ${c.lastName}`).join(', ');
  return `Les candidats sont : ${candidateNames}.`;
};

// --- Définitions des outils pour Gemini ---
// C'est la "documentation" que Gemini va lire pour savoir quels outils il peut utiliser.

export const jobTools = [
  {
    functionDeclarations: [
      {
        name: 'getJobDetails',
        description: "Récupère les détails complets d'une offre d'emploi en fonction de son titre.",
        parameters: {
          type: 'OBJECT',
          properties: {
            jobTitle: { type: 'STRING', description: "Le titre exact du poste à rechercher." },
          },
          required: ['jobTitle'],
        },
      },
      {
        name: 'getCandidatesByStage',
        description: "Liste les noms des candidats pour un poste spécifique à une étape donnée du workflow (ex: 'Screening', 'Interview').",
        parameters: {
          type: 'OBJECT',
          properties: {
            jobTitle: { type: 'STRING', description: "Le titre du poste." },
            stageName: { type: 'STRING', description: "Le nom de l'étape du workflow." },
          },
          required: ['jobTitle', 'stageName'],
        },
      },
    ],
  },
];
