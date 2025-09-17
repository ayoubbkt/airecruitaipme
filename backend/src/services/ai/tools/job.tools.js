
import prisma from '../../../config/db.js';

export const getJobDetails = async ({ jobTitle, companyId }) => {
  try {
    const job = await prisma.job.findFirst({
      where: {
        title: { contains: jobTitle, mode: 'insensitive' },
        company: { id: companyId }
      },
      include: {
        _count: {
          select: { candidates: true }
        },
        workflow: {
          include: { stages: true }
        }
      }
    });
    
    if (!job) {
      return `Aucun poste trouvé avec le titre "${jobTitle}".`;
    }
    
    const jobInfo = {
      titre: job.title,
      description: job.description || 'Non spécifiée',
      statut: job.status,
      dateCreation: job.createdAt.toLocaleDateString('fr-FR'),
      nombreCandidatures: job._count.candidates,
      etapesWorkflow: job.workflow?.stages?.map(s => s.name) || ['Workflow non défini'],
      salaire: job.salaryRange || 'Non spécifié',
      experience: job.minYearsExperience ? `${job.minYearsExperience}+ ans` : 'Non spécifié'
    };
    
    return JSON.stringify(jobInfo);
  } catch (error) {
    return `Erreur lors de la récupération du poste : ${error.message}`;
  }
};

export const getJobsWithMostCandidates = async ({ companyId, limit = 10 }) => {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        company: { id: companyId },
        status: 'OPEN'
      },
      include: {
        _count: {
          select: { candidates: true }
        }
      },
      orderBy: {
        candidates: { _count: 'desc' }
      },
      take: parseInt(limit)
    });
    
    const jobList = jobs.map(job => ({
      titre: job.title,
      candidatures: job._count.candidates,
      dateCreation: job.createdAt.toLocaleDateString('fr-FR'),
      statut: job.status
    }));
    
    return JSON.stringify({
      postesPopulaires: jobList
    });
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

export const getUrgentJobs = async ({ companyId, days = 30 }) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);
  
  try {
    const urgentJobs = await prisma.job.findMany({
      where: {
        company: { id: companyId },
        status: 'OPEN',
        OR: [
          { isUrgent: true },
          { deadline: { lte: cutoffDate } },
          { priority: 'HIGH' }
        ]
      },
      include: {
        _count: {
          select: { candidates: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { deadline: 'asc' }
      ]
    });
    
    const jobs = urgentJobs.map(job => ({
      titre: job.title,
      urgence: job.isUrgent ? 'Très urgent' : 'Urgent',
      deadline: job.deadline ? job.deadline.toLocaleDateString('fr-FR') : 'Non définie',
      candidatures: job._count.candidates,
      priorite: job.priority || 'Normale'
    }));
    
    return JSON.stringify({
      total: jobs.length,
      postesUrgents: jobs
    });
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

export const getJobsOverBudget = async ({ companyId }) => {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        company: { id: companyId },
        status: 'OPEN',
        recruitmentBudget: { not: null },
        recruitmentSpent: { not: null }
      },
      include: {
        _count: {
          select: { candidates: true }
        }
      }
    });
    
    const overBudgetJobs = jobs.filter(job => 
      job.recruitmentSpent > job.recruitmentBudget
    ).map(job => ({
      titre: job.title,
      budget: `${job.recruitmentBudget}€`,
      depense: `${job.recruitmentSpent}€`,
      depassement: `${job.recruitmentSpent - job.recruitmentBudget}€`,
      pourcentage: `${Math.round((job.recruitmentSpent / job.recruitmentBudget) * 100)}%`
    }));
    
    return JSON.stringify({
      total: overBudgetJobs.length,
      postesDepassement: overBudgetJobs
    });
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

// --- Définitions des outils jobs mises à jour ---
export const jobTools = [
  {
    functionDeclarations: [
      {
        name: 'getJobDetails',
        description: "Récupère les détails complets d'une offre d'emploi.",
        parameters: {
          type: 'OBJECT',
          properties: {
            jobTitle: { type: 'STRING', description: "Le titre du poste à rechercher." },
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
          },
          required: ['jobTitle', 'companyId'],
        },
      },
      {
        name: 'getCandidatesByStage',
        description: "Liste les candidats pour un poste à une étape spécifique.",
        parameters: {
          type: 'OBJECT',
          properties: {
            jobTitle: { type: 'STRING', description: "Le titre du poste." },
            stageName: { type: 'STRING', description: "Le nom de l'étape du workflow." },
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
          },
          required: ['jobTitle', 'stageName', 'companyId'],
        },
      },
      {
        name: 'getJobsWithMostCandidates',
        description: "Récupère les postes avec le plus de candidatures.",
        parameters: {
          type: 'OBJECT',
          properties: {
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
            limit: { type: 'NUMBER', description: "Nombre maximum de postes à retourner (défaut: 10)." },
          },
          required: ['companyId'],
        },
      },
      {
        name: 'getUrgentJobs',
        description: "Récupère les postes urgents à pourvoir.",
        parameters: {
          type: 'OBJECT',
          properties: {
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
            days: { type: 'NUMBER', description: "Horizon en jours pour considérer l'urgence (défaut: 30)." },
          },
          required: ['companyId'],
        },
      },
      {
        name: 'getJobsOverBudget',
        description: "Identifie les postes qui ont dépassé leur budget de recrutement.",
        parameters: {
          type: 'OBJECT',
          properties: {
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
          },
          required: ['companyId'],
        },
      },
    ],
  },
];