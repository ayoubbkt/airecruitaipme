import prisma from '../../../config/db.js';




export const checkAvailableSlots = async ({ userId, date, duration = 60 }) => {
  try {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(8, 0, 0, 0); // 8h00
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(18, 0, 0, 0); // 18h00
    
    // Récupérer les entretiens existants
    const existingInterviews = await prisma.interview.findMany({
      where: {
        userId: userId,
        scheduledAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    
    // Générer les créneaux disponibles
    const slots = [];
    let currentTime = new Date(startOfDay);
    
    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      
      // Vérifier si le créneau est libre
      const isAvailable = !existingInterviews.some(interview => {
        const interviewStart = new Date(interview.scheduledAt);
        const interviewEnd = new Date(interviewStart.getTime() + (interview.duration || 60) * 60000);
        
        return (currentTime < interviewEnd && slotEnd > interviewStart);
      });
      
      if (isAvailable && slotEnd <= endOfDay) {
        slots.push({
          debut: currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          fin: slotEnd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          disponible: true
        });
      }
      
      currentTime.setMinutes(currentTime.getMinutes() + 30); // Créneaux de 30 min
    }
    
    if (slots.length === 0) {
      return `Aucun créneau disponible le ${targetDate.toLocaleDateString('fr-FR')}. Votre agenda est complet.`;
    }
    
    return JSON.stringify({
      date: targetDate.toLocaleDateString('fr-FR'),
      creneauxDisponibles: slots.slice(0, 8) // Limiter à 8 créneaux
    });
    
  } catch (error) {
    return `Erreur lors de la vérification des créneaux : ${error.message}`;
  }
};

export const scheduleInterview = async ({ candidateId, userId, dateTime, duration = 60, type = 'Interview' }) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { job: true }
    });
    
    if (!candidate) {
      return `Candidat non trouvé avec l'ID ${candidateId}.`;
    }
    
    const scheduledAt = new Date(dateTime);
    
    const interview = await prisma.interview.create({
      data: {
        candidateId: candidateId,
        jobId: candidate.jobId,
        userId: userId,
        scheduledAt: scheduledAt,
        duration: duration,
        type: type,
        status: 'Scheduled'
      }
    });
    
    // Créer une activité
    await prisma.activity.create({
      data: {
        candidateId: candidateId,
        type: 'INTERVIEW_SCHEDULED',
        description: `Entretien ${type} planifié pour le ${scheduledAt.toLocaleDateString('fr-FR')} à ${scheduledAt.toLocaleTimeString('fr-FR')}`,
        performedBy: userId,
      }
    });
    
    return JSON.stringify({
      message: `Entretien planifié avec succès pour ${candidate.firstName} ${candidate.lastName}`,
      details: {
        candidat: `${candidate.firstName} ${candidate.lastName}`,
        poste: candidate.job.title,
        date: scheduledAt.toLocaleDateString('fr-FR'),
        heure: scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        duree: `${duration} minutes`,
        type: type
      }
    });
    
  } catch (error) {
    return `Erreur lors de la planification : ${error.message}`;
  }
};

export const getUpcomingDeadlines = async ({ userId, companyId, days = 7 }) => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  
  try {
    const [
      upcomingInterviews,
      candidatesFollowUp,
      pendingTasks
    ] = await Promise.all([
      prisma.interview.findMany({
        where: {
          userId: userId,
          scheduledAt: {
            gte: now,
            lte: futureDate
          },
          status: { in: ['Scheduled', 'Confirmed'] }
        },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          job: { select: { title: true } }
        },
        orderBy: { scheduledAt: 'asc' }
      }),
      
      prisma.candidate.findMany({
        where: {
          company: { id: companyId },
          nextFollowUp: {
            gte: now,
            lte: futureDate
          }
        },
        include: {
          job: { select: { title: true } }
        }
      }),
      
      prisma.rating.findMany({
        where: {
          userId: userId,
          completedAt: null,
          dueDate: {
            gte: now,
            lte: futureDate
          }
        },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          job: { select: { title: true } }
        }
      })
    ]);
    
    const deadlines = {
      entretiens: upcomingInterviews.map(i => ({
        date: i.scheduledAt.toLocaleDateString('fr-FR'),
        heure: i.scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        candidat: `${i.candidate.firstName} ${i.candidate.lastName}`,
        poste: i.job.title,
        type: i.type || 'Entretien',
        urgence: i.scheduledAt <= new Date(now.getTime() + 24 * 60 * 60 * 1000) ? 'Urgent' : 'Normal'
      })),
      
      suivis: candidatesFollowUp.map(c => ({
        date: c.nextFollowUp.toLocaleDateString('fr-FR'),
        candidat: `${c.firstName} ${c.lastName}`,
        poste: c.job.title,
        action: 'Relance candidat'
      })),
      
      evaluations: pendingTasks.map(r => ({
        date: r.dueDate ? r.dueDate.toLocaleDateString('fr-FR') : 'À faire',
        candidat: `${r.candidate.firstName} ${r.candidate.lastName}`,
        poste: r.job.title,
        action: 'Évaluation candidat'
      }))
    };
    
    const totalDeadlines = upcomingInterviews.length + candidatesFollowUp.length + pendingTasks.length;
    
    return JSON.stringify({
      periode: `${days} prochains jours`,
      total: totalDeadlines,
      echeances: deadlines
    });
    
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

// --- Définitions des outils de planification ---
export const planningTools = [
  {
    functionDeclarations: [
      {
        name: 'checkAvailableSlots',
        description: "Vérifie les créneaux disponibles pour une date donnée.",
        parameters: {
          type: 'OBJECT',
          properties: {
            userId: { type: 'STRING', description: "L'ID de l'utilisateur." },
            date: { type: 'STRING', description: "Date au format YYYY-MM-DD." },
            duration: { type: 'NUMBER', description: "Durée en minutes (défaut: 60)." },
          },
          required: ['userId', 'date'],
        },
      },
      {
        name: 'scheduleInterview',
        description: "Planifie un entretien avec un candidat.",
        parameters: {
          type: 'OBJECT',
          properties: {
            candidateId: { type: 'STRING', description: "L'ID du candidat." },
            userId: { type: 'STRING', description: "L'ID de l'utilisateur." },
            dateTime: { type: 'STRING', description: "Date et heure au format ISO." },
            duration: { type: 'NUMBER', description: "Durée en minutes (défaut: 60)." },
            type: { type: 'STRING', description: "Type d'entretien (ex: Phone, Video, On-site)." },
          },
          required: ['candidateId', 'userId', 'dateTime'],
        },
      },
      {
        name: 'getUpcomingDeadlines',
        description: "Récupère toutes les échéances à venir (entretiens, suivis, évaluations).",
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