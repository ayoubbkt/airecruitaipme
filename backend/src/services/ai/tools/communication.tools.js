import prisma from '../../../config/db.js';

export const getPendingEmailsToSend = async ({ userId, companyId, type = 'all' }) => {
  try {
    const conditions = {
      company: { id: companyId }
    };
    
    switch (type) {
      case 'rejection':
        conditions.currentStage = { name: 'Rejected' };
        conditions.lastEmailSent = null;
        break;
      case 'followup':
        conditions.needsFollowUp = true;
        break;
      case 'offer':
        conditions.currentStage = { name: 'Offer Sent' };
        break;
      default:
        conditions.OR = [
          { currentStage: { name: 'Rejected' }, lastEmailSent: null },
          { needsFollowUp: true },
          { currentStage: { name: 'Offer Sent' } }
        ];
    }
    
    const candidates = await prisma.candidate.findMany({
      where: conditions,
      include: {
        job: { select: { title: true } },
        currentStage: true
      },
      take: 20
    });
    
    const emailsToSend = candidates.map(c => {
      let emailType = 'Suivi';
      if (c.currentStage?.name === 'Rejected') emailType = 'Refus';
      if (c.currentStage?.name === 'Offer Sent') emailType = 'Offre';
      
      return {
        candidat: `${c.firstName} ${c.lastName}`,
        email: c.email,
        poste: c.job.title,
        typeEmail: emailType,
        urgence: c.currentStage?.name === 'Offer Sent' ? 'Haute' : 'Normale'
      };
    });
    
    return JSON.stringify({
      total: emailsToSend.length,
      emailsEnAttente: emailsToSend
    });
    
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

export const getFeedbackPending = async ({ userId, companyId }) => {
  try {
    const [
      managerFeedbacks,
      candidateRatings,
      interviewNotes
    ] = await Promise.all([
      // Feedbacks managers en attente
      prisma.interview.findMany({
        where: {
          candidate: { company: { id: companyId } },
          status: 'Completed',
          managerFeedback: null,
          scheduledAt: { lt: new Date() }
        },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          job: { select: { title: true } },
          interviewer: { select: { firstName: true, lastName: true } }
        },
        take: 10
      }),
      
      // Évaluations candidats en attente
      prisma.rating.findMany({
        where: {
          userId: userId,
          completedAt: null,
          createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Plus de 24h
        },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          job: { select: { title: true } }
        }
      }),
      
      // Notes d'entretien manquantes
      prisma.interview.findMany({
        where: {
          userId: userId,
          status: 'Completed',
          notes: { equals: '' },
          scheduledAt: { lt: new Date() }
        },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          job: { select: { title: true } }
        }
      })
    ]);
    
    const feedbacks = {
      feedbacksManagers: managerFeedbacks.map(i => ({
        candidat: `${i.candidate.firstName} ${i.candidate.lastName}`,
        poste: i.job.title,
        interviewer: `${i.interviewer?.firstName} ${i.interviewer?.lastName}` || 'Non spécifié',
        dateEntretien: i.scheduledAt.toLocaleDateString('fr-FR'),
        retard: Math.floor((new Date() - i.scheduledAt) / (1000 * 60 * 60 * 24)) + ' jours'
      })),
      
      evaluationsCandidats: candidateRatings.map(r => ({
        candidat: `${r.candidate.firstName} ${r.candidate.lastName}`,
        poste: r.job.title,
        enAttente: Math.floor((new Date() - r.createdAt) / (1000 * 60 * 60 * 24)) + ' jours'
      })),
      
      notesManquantes: interviewNotes.map(i => ({
        candidat: `${i.candidate.firstName} ${i.candidate.lastName}`,
        poste: i.job.title,
        dateEntretien: i.scheduledAt.toLocaleDateString('fr-FR')
      }))
    };
    
    const total = managerFeedbacks.length + candidateRatings.length + interviewNotes.length;
    
    return JSON.stringify({
      total: total,
      feedbacksEnAttente: feedbacks
    });
    
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

export const getUnconfirmedInterviews = async ({ userId, companyId, days = 7 }) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  try {
    const unconfirmedInterviews = await prisma.interview.findMany({
      where: {
        candidate: { company: { id: companyId } },
        scheduledAt: {
          gte: new Date(),
          lte: futureDate
        },
        status: { in: ['Scheduled', 'Pending'] }
      },
      include: {
        candidate: { select: { firstName: true, lastName: true, email: true } },
        job: { select: { title: true } }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    
    const interviews = unconfirmedInterviews.map(i => ({
      candidat: `${i.candidate.firstName} ${i.candidate.lastName}`,
      email: i.candidate.email,
      poste: i.job.title,
      date: i.scheduledAt.toLocaleDateString('fr-FR'),
      heure: i.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: i.status,
      urgence: i.scheduledAt <= new Date(Date.now() + 48 * 60 * 60 * 1000) ? 'Urgent' : 'Normal'
    }));
    
    return JSON.stringify({
      total: interviews.length,
      entretiensNonConfirmes: interviews
    });
    
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

// --- Définitions des outils de communication ---
export const communicationTools = [
  {
    functionDeclarations: [
      {
        name: 'getPendingEmailsToSend',
        description: "Récupère la liste des emails en attente d'envoi (refus, suivis, offres).",
        parameters: {
          type: 'OBJECT',
          properties: {
            userId: { type: 'STRING', description: "L'ID de l'utilisateur." },
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
            type: { type: 'STRING', description: "Type d'email : 'rejection', 'followup', 'offer', 'all' (défaut)." },
          },
          required: ['userId', 'companyId'],
        },
      },
      {
        name: 'getFeedbackPending',
        description: "Identifie les feedbacks en attente (managers, évaluations candidats, notes d'entretien).",
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
        name: 'getUnconfirmedInterviews',
        description: "Récupère les entretiens non confirmés pour les prochains jours.",
        parameters: {
          type: 'OBJECT',
          properties: {
            userId: { type: 'STRING', description: "L'ID de l'utilisateur." },
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
            days: { type: 'NUMBER', description: "Nombre de jours à regarder en avant (défaut: 7)." },
          },
          required: ['userId', 'companyId'],
        },
      },
    ],
  },
];