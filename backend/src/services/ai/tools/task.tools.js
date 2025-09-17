import prisma from '../../../config/db.js';




export const getTodaysTasks = async ({ userId, companyId }) => {
  // Cette fonction a déjà été définie dans notification.tools.js
  // On peut la déplacer ici ou la garder là-bas selon la logique
  return await import('./notification.tools.js').then(module => 
    module.getTodaysTasks({ userId, companyId })
  );
};

export const createReminder = async ({ userId, candidateId, reminderDate, message }) => {
  try {
    const reminder = await prisma.reminder.create({
      data: {
        userId: userId,
        candidateId: candidateId,
        reminderDate: new Date(reminderDate),
        message: message,
        status: 'PENDING'
      },
      include: {
        candidate: { select: { firstName: true, lastName: true } }
      }
    });
    
    return JSON.stringify({
      message: `Rappel créé pour ${reminder.candidate.firstName} ${reminder.candidate.lastName}`,
      date: reminder.reminderDate.toLocaleDateString('fr-FR'),
      contenu: reminder.message
    });
  } catch (error) {
    return `Erreur lors de la création du rappel : ${error.message}`;
  }
};

export const getOverdueTasks = async ({ userId, companyId }) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  try {
    const [
      overdueInterviews,
      overdueFollowUps,
      overdueEvaluations
    ] = await Promise.all([
      prisma.interview.findMany({
        where: {
          userId: userId,
          scheduledAt: { lt: today },
          status: { in: ['Scheduled', 'Pending'] }
        },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          job: { select: { title: true } }
        }
      }),
      
      prisma.candidate.findMany({
        where: {
          company: { id: companyId },
          nextFollowUp: { lt: today },
          currentStage: { name: { notIn: ['Rejected', 'Hired', 'Withdrawn'] } }
        },
        include: {
          job: { select: { title: true } }
        }
      }),
      
      prisma.rating.findMany({
        where: {
          userId: userId,
          dueDate: { lt: today },
          completedAt: null
        },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          job: { select: { title: true } }
        }
      })
    ]);
    
    const overdueTasks = {
      entretiensEnRetard: overdueInterviews.map(i => ({
        candidat: `${i.candidate.firstName} ${i.candidate.lastName}`,
        poste: i.job.title,
        datePrevue: i.scheduledAt.toLocaleDateString('fr-FR'),
        retard: Math.floor((today - i.scheduledAt) / (1000 * 60 * 60 * 24)) + ' jours'
      })),
      
      relancesEnRetard: overdueFollowUps.map(c => ({
        candidat: `${c.firstName} ${c.lastName}`,
        poste: c.job.title,
        datePrevue: c.nextFollowUp.toLocaleDateString('fr-FR'),
        retard: Math.floor((today - c.nextFollowUp) / (1000 * 60 * 60 * 24)) + ' jours'
      })),
      
      evaluationsEnRetard: overdueEvaluations.map(r => ({
        candidat: `${r.candidate.firstName} ${r.candidate.lastName}`,
        poste: r.job.title,
        datePrevue: r.dueDate.toLocaleDateString('fr-FR'),
        retard: Math.floor((today - r.dueDate) / (1000 * 60 * 60 * 24)) + ' jours'
      }))
    };
    
    const total = overdueInterviews.length + overdueFollowUps.length + overdueEvaluations.length;
    
    return JSON.stringify({
      total: total,
      tachesEnRetard: overdueTasks
    });
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

// --- Définitions des outils de tâches ---
export const taskTools = [
  {
    functionDeclarations: [
      {
        name: 'getTodaysTasks',
        description: "Récupère toutes les tâches prioritaires pour aujourd'hui.",
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
        name: 'createReminder',
        description: "Crée un rappel pour suivre un candidat ou une tâche.",
        parameters: {
          type: 'OBJECT',
          properties: {
            userId: { type: 'STRING', description: "L'ID de l'utilisateur." },
            candidateId: { type: 'STRING', description: "L'ID du candidat concerné." },
            reminderDate: { type: 'STRING', description: "Date du rappel au format ISO." },
            message: { type: 'STRING', description: "Message du rappel." },
          },
          required: ['userId', 'candidateId', 'reminderDate', 'message'],
        },
      },
      {
        name: 'getOverdueTasks',
        description: "Récupère toutes les tâches en retard (entretiens, suivis, évaluations).",
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