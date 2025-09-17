
import prisma from '../../../config/db.js';

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