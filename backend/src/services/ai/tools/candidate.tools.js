// import CandidateService from '../../../api/candidates/candidate.service.js';
// import { db } from '../../../config/prisma.js';
import prisma from '../../../config/db.js';

// --- Fonctions d'exécution ---

export const getCandidatesByStage = async ({ jobId, stageName, companyId }) => {
  try {
    const candidates = await prisma.candidate.findMany({
      where: {
        jobId: jobId,
        company: { id: companyId },
        currentStage: { name: { contains: stageName, mode: 'insensitive' } }
      },
      include: {
        currentStage: true,
        files: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    if (!candidates || candidates.length === 0) {
      return `Aucun candidat trouvé en phase "${stageName}" pour ce poste.`;
    }
    
    const candidateList = candidates.map(c => ({
      nom: `${c.firstName} ${c.lastName}`,
      email: c.email,
      phone: c.phoneNumber,
      stage: c.currentStage?.name,
      derniereActivite: c.updatedAt.toLocaleDateString('fr-FR'),
      score: c.ai_screening_score || 'Non évalué'
    }));
    
    return JSON.stringify({
      total: candidates.length,
      candidats: candidateList
    });
  } catch (error) {
    return `Erreur lors de la recherche des candidats : ${error.message}`;
  }
};

export const getCandidatesWithoutResponse = async ({ days = 7, companyId, userId }) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  try {
    const candidates = await prisma.candidate.findMany({
      where: {
        company: { id: companyId },
        updatedAt: { lt: cutoffDate },
        currentStage: {
          name: { not: { in: ['Rejected', 'Hired', 'Withdrawn'] } }
        }
      },
      include: {
        job: { select: { title: true } },
        currentStage: true
      },
      orderBy: { updatedAt: 'asc' }
    });
    
    if (candidates.length === 0) {
      return `Excellent ! Tous vos candidats ont eu une réponse récente.`;
    }
    
    const candidateList = candidates.map(c => ({
      nom: `${c.firstName} ${c.lastName}`,
      poste: c.job.title,
      derniereActivite: c.updatedAt.toLocaleDateString('fr-FR'),
      joursSansReponse: Math.floor((new Date() - c.updatedAt) / (1000 * 60 * 60 * 24))
    }));
    
    return JSON.stringify({
      total: candidates.length,
      candidatsEnAttente: candidateList
    });
  } catch (error) {
    return `Erreur lors de la recherche : ${error.message}`;
  }
};

export const getCandidatesInNegotiation = async ({ companyId }) => {
  try {
    const candidates = await prisma.candidate.findMany({
      where: {
        company: { id: companyId },
        currentStage: {
          name: { in: ['Offer Sent', 'Negotiation', 'Contract', 'Pre-hire'] }
        }
      },
      include: {
        job: { select: { title: true } },
        currentStage: true
      }
    });
    
    return JSON.stringify({
      total: candidates.length,
      candidats: candidates.map(c => ({
        nom: `${c.firstName} ${c.lastName}`,
        poste: c.job.title,
        etape: c.currentStage.name,
        email: c.email
      }))
    });
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

export const getBestCandidatesThisMonth = async ({ companyId, limit = 10 }) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  try {
    const candidates = await prisma.candidate.findMany({
      where: {
        company: { id: companyId },
        createdAt: { gte: startOfMonth },
        ai_screening_score: { not: null }
      },
      include: {
        job: { select: { title: true } }
      },
      orderBy: { ai_screening_score: 'desc' },
      take: parseInt(limit)
    });
    
    return JSON.stringify({
      meilleursCandidats: candidates.map(c => ({
        nom: `${c.firstName} ${c.lastName}`,
        poste: c.job.title,
        score: c.ai_screening_score,
        resume: c.ai_screening_summary || 'Pas de résumé disponible'
      }))
    });
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

// --- Définitions des outils ---
export const candidateTools = [
  {
    functionDeclarations: [
      {
        name: 'getCandidatesByStage',
        description: "Récupère les candidats d'un poste à une étape spécifique du processus de recrutement.",
        parameters: {
          type: 'OBJECT',
          properties: {
            jobId: { type: 'STRING', description: "L'ID du poste." },
            stageName: { type: 'STRING', description: "Le nom de l'étape (ex: Interview, Screening)." },
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
          },
          required: ['jobId', 'stageName', 'companyId'],
        },
      },
      {
        name: 'getCandidatesWithoutResponse',
        description: "Trouve les candidats qui n'ont pas eu de réponse depuis X jours.",
        parameters: {
          type: 'OBJECT',
          properties: {
            days: { type: 'NUMBER', description: "Nombre de jours sans réponse (défaut: 7)." },
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
            userId: { type: 'STRING', description: "L'ID de l'utilisateur." },
          },
          required: ['companyId', 'userId'],
        },
      },
      {
        name: 'getCandidatesInNegotiation',
        description: "Récupère les candidats en phase de négociation ou de contractualisation.",
        parameters: {
          type: 'OBJECT',
          properties: {
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
          },
          required: ['companyId'],
        },
      },
      {
        name: 'getBestCandidatesThisMonth',
        description: "Récupère les meilleurs candidats du mois selon le score IA.",
        parameters: {
          type: 'OBJECT',
          properties: {
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
            limit: { type: 'NUMBER', description: "Nombre maximum de candidats à retourner (défaut: 10)." },
          },
          required: ['companyId'],
        },
      },
    ],
  },
];