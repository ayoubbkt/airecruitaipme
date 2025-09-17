
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

// ======================================================
// 4. NOUVEAUX OUTILS AI - TÂCHES ET NOTIFICATIONS
// ======================================================

// backend/src/services/ai/tools/notification.tools.js
import { db } from '../../../config/database.js';

export const getTodaysTasks = async ({ userId, companyId }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  try {
    // Rechercher les tâches de différents types
    const [
      interviews,
      candidatesToContact,
      pendingEvaluations,
      overdueResponses
    ] = await Promise.all([
      // Entretiens du jour
      prisma.interview.findMany({
        where: {
          userId: userId,
          scheduledAt: {
            gte: today,
            lt: tomorrow
          }
        },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          job: { select: { title: true } }
        }
      }),
      
      // Candidats à recontacter
      prisma.candidate.findMany({
        where: {
          company: { id: companyId },
          nextFollowUp: {
            gte: today,
            lt: tomorrow
          }
        },
        include: {
          job: { select: { title: true } }
        }
      }),
      
      // Évaluations en attente
      prisma.rating.findMany({
        where: {
          userId: userId,
          completedAt: null,
          createdAt: { lt: today }
        },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          job: { select: { title: true } }
        }
      }),
      
      // Réponses en retard
      prisma.candidate.findMany({
        where: {
          company: { id: companyId },
          lastContactedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          currentStage: {
            name: { notIn: ['Rejected', 'Hired', 'Withdrawn'] }
          }
        },
        include: {
          job: { select: { title: true } }
        },
        take: 5
      })
    ]);
    
    const tasks = {
      entretiens: interviews.map(i => ({
        heure: i.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        candidat: `${i.candidate.firstName} ${i.candidate.lastName}`,
        poste: i.job.title,
        type: i.type || 'Entretien'
      })),
      
      candidatsARecontacter: candidatesToContact.map(c => ({
        nom: `${c.firstName} ${c.lastName}`,
        poste: c.job.title,
        raison: 'Suivi planifié'
      })),
      
      evaluationsEnAttente: pendingEvaluations.map(r => ({
        candidat: `${r.candidate.firstName} ${r.candidate.lastName}`,
        poste: r.job.title,
        jours: Math.floor((today - r.createdAt) / (1000 * 60 * 60 * 24))
      })),
      
      reponsesEnRetard: overdueResponses.map(c => ({
        nom: `${c.firstName} ${c.lastName}`,
        poste: c.job.title,
        derniereActivite: c.lastContactedAt ? c.lastContactedAt.toLocaleDateString('fr-FR') : 'Jamais'
      }))
    };
    
    const totalTasks = interviews.length + candidatesToContact.length + 
                     pendingEvaluations.length + overdueResponses.length;
    
    if (totalTasks === 0) {
      return "Excellente nouvelle ! Vous n'avez pas de tâches urgentes pour aujourd'hui. Profitez-en pour anticiper ou vous former !";
    }
    
    return JSON.stringify({
      total: totalTasks,
      priorites: tasks
    });
    
  } catch (error) {
    return `Erreur lors de la récupération des tâches : ${error.message}`;
  }
};

export const getWeeklyInterviews = async ({ userId, companyId }) => {
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  
  try {
    const interviews = await prisma.interview.findMany({
      where: {
        userId: userId,
        scheduledAt: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      },
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        job: { select: { title: true } }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    
    const groupedByDay = interviews.reduce((acc, interview) => {
      const day = interview.scheduledAt.toLocaleDateString('fr-FR', { weekday: 'long' });
      if (!acc[day]) acc[day] = [];
      acc[day].push({
        heure: interview.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        candidat: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
        poste: interview.job.title,
        status: interview.status || 'Confirmé'
      });
      return acc;
    }, {});
    
    return JSON.stringify({
      total: interviews.length,
      planningHebdomadaire: groupedByDay
    });
    
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

// --- Définitions des outils de notification ---
export const notificationTools = [
  {
    functionDeclarations: [
      {
        name: 'getTodaysTasks',
        description: "Récupère toutes les tâches prioritaires pour aujourd'hui incluant entretiens, suivis candidats, évaluations.",
        parameters: {
          type: 'OBJECT',
          properties: {
            userId: { type: 'STRING', description: "L'ID de l'utilisateur." },
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
          },
          required: ['userId', 'companyId'],
        },
      },
      {
        name: 'getWeeklyInterviews',
        description: "Récupère le planning des entretiens pour la semaine en cours.",
        parameters: {
          type: 'OBJECT',
          properties: {
            userId: { type: 'STRING', description: "L'ID de l'utilisateur." },
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
          },
          required: ['userId', 'companyId'],
        },
      },
    ],
  },
];

// ======================================================
// 5. NOUVEAUX OUTILS AI - ANALYTICS ET RAPPORTS
// ======================================================

// backend/src/services/ai/tools/analytics.tools.js
import { db } from '../../../config/database.js';

export const getRecruitmentMetrics = async ({ companyId, period = 'month' }) => {
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }
  
  try {
    const [
      totalCandidates,
      hiredCandidates,
      rejectedCandidates,
      interviews,
      jobs
    ] = await Promise.all([
      prisma.candidate.count({
        where: {
          company: { id: companyId },
          createdAt: { gte: startDate }
        }
      }),
      
      prisma.candidate.count({
        where: {
          company: { id: companyId },
          currentStage: { name: 'Hired' },
          updatedAt: { gte: startDate }
        }
      }),
      
      prisma.candidate.count({
        where: {
          company: { id: companyId },
          currentStage: { name: 'Rejected' },
          updatedAt: { gte: startDate }
        }
      }),
      
      prisma.interview.count({
        where: {
          candidate: { company: { id: companyId } },
          scheduledAt: { gte: startDate }
        }
      }),
      
      prisma.job.findMany({
        where: {
          company: { id: companyId },
          createdAt: { gte: startDate }
        },
        include: {
          _count: {
            select: { candidates: true }
          }
        }
      })
    ]);
    
    const conversionRate = totalCandidates > 0 ? 
      ((hiredCandidates / totalCandidates) * 100).toFixed(1) : 0;
    
    const avgCandidatesPerJob = jobs.length > 0 ? 
      (totalCandidates / jobs.length).toFixed(1) : 0;
    
    return JSON.stringify({
      periode: period,
      metriques: {
        candidaturesTotales: totalCandidates,
        embauches: hiredCandidates,
        refus: rejectedCandidates,
        entretiens: interviews,
        tauxConversion: `${conversionRate}%`,
        candidaturesParPoste: avgCandidatesPerJob,
        postesOuverts: jobs.length
      }
    });
    
  } catch (error) {
    return `Erreur lors du calcul des métriques : ${error.message}`;
  }
};

export const getDifficultPositions = async ({ companyId, minDays = 60 }) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - minDays);
  
  try {
    const difficultJobs = await prisma.job.findMany({
      where: {
        company: { id: companyId },
        status: 'OPEN',
        createdAt: { lt: cutoffDate }
      },
      include: {
        _count: {
          select: { 
            candidates: true,
            candidates: {
              where: { currentStage: { name: 'Hired' } }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    const analysis = difficultJobs.map(job => {
      const daysSinceCreated = Math.floor((new Date() - job.createdAt) / (1000 * 60 * 60 * 24));
      return {
        titre: job.title,
        ouvertDepuis: `${daysSinceCreated} jours`,
        candidatures: job._count.candidates,
        embauches: job._count.candidates, // À corriger selon votre modèle
        difficulte: candidatures < 5 ? 'Très difficile' : 
                   candidatures < 15 ? 'Difficile' : 'Modéré'
      };
    });
    
    return JSON.stringify({
      postesProblematiques: analysis
    });
    
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

// --- Définitions des outils d'analytics ---
export const analyticsTools = [
  {
    functionDeclarations: [
      {
        name: 'getRecruitmentMetrics',
        description: "Calcule les métriques de recrutement pour une période donnée (taux conversion, embauches, etc.).",
        parameters: {
          type: 'OBJECT',
          properties: {
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
            period: { type: 'STRING', description: "Période d'analyse : 'week', 'month', 'quarter' (défaut: month)." },
          },
          required: ['companyId'],
        },
      },
      {
        name: 'getDifficultPositions',
        description: "Identifie les postes difficiles à pourvoir (ouverts depuis longtemps, peu de candidatures).",
        parameters: {
          type: 'OBJECT',
          properties: {
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
            minDays: { type: 'NUMBER', description: "Nombre minimum de jours pour considérer un poste comme difficile (défaut: 60)." },
          },
          required: ['companyId'],
        },
      },
      {
        name: 'getCandidateSourceAnalysis',
        description: "Analyse l'efficacité des différentes sources de candidatures.",
        parameters: {
          type: 'OBJECT',
          properties: {
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
            period: { type: 'STRING', description: "Période d'analyse (défaut: month)." },
          },
          required: ['companyId'],
        },
      },
    ],
  },
];

export const getCandidateSourceAnalysis = async ({ companyId, period = 'month' }) => {
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }
  
  try {
    const candidates = await prisma.candidate.findMany({
      where: {
        company: { id: companyId },
        createdAt: { gte: startDate }
      },
      include: {
        currentStage: true
      }
    });
    
    const sourceAnalysis = candidates.reduce((acc, candidate) => {
      const source = candidate.source || 'Non spécifié';
      if (!acc[source]) {
        acc[source] = {
          total: 0,
          hired: 0,
          interviewed: 0
        };
      }
      
      acc[source].total++;
      if (candidate.currentStage?.name === 'Hired') {
        acc[source].hired++;
      }
      if (['Interview', 'Final Interview'].includes(candidate.currentStage?.name)) {
        acc[source].interviewed++;
      }
      
      return acc;
    }, {});
    
    const analysis = Object.entries(sourceAnalysis).map(([source, data]) => ({
      source,
      candidatures: data.total,
      entretiens: data.interviewed,
      embauches: data.hired,
      tauxConversion: data.total > 0 ? ((data.hired / data.total) * 100).toFixed(1) + '%' : '0%',
      efficacite: data.hired > 0 ? 'Très efficace' : 
                 data.interviewed > 0 ? 'Modérément efficace' : 'Peu efficace'
    }));
    
    return JSON.stringify({
      periode: period,
      sourcesCandidatures: analysis
    });
    
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};