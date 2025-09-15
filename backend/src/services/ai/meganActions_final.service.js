// src/services/ai/meganActions.service.js
import db from '../../config/db.js';

/**
 * Actions que Megan peut effectuer en accédant à la base de données
 */

export const meganActions = {
  // ============================================================================
  // 📋 GESTION QUOTIDIENNE DES TÂCHES - VERSION PRODUCTION
  // ============================================================================

  /**
   * 🎯 Récupère les priorités du jour pour un recruteur
   * Logique métier: Entretiens urgents > Évaluations en retard > Relances importantes
   */
  async getTodayPriorities(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let userIdString = userId ? userId.toString() : (await db.user.findFirst())?.id;
    if (!userIdString) throw new Error('Utilisateur non trouvé');

    // 1. Entretiens du jour (priorité absolue)
    const todayInterviews = await db.meeting.findMany({
      where: {
        organizerId: userIdString,
        startTime: { gte: today, lt: tomorrow },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      },
      include: {
        candidate: { select: { firstName: true, lastName: true, email: true } },
        job: { select: { title: true, company: { select: { name: true } } } }
      },
      orderBy: { startTime: 'asc' }
    });

    // 2. Évaluations en retard (>48h) - utiliser les activités existantes
    const overdueEvaluations = await db.activity.findMany({
      where: {
        type: 'AI_SCREENING', // Utiliser un type existant
        createdAt: { lt: yesterday },
        performedBy: userIdString
      },
      include: {
        candidate: { select: { firstName: true, lastName: true, email: true } }
      },
      take: 5
    });

    // 3. Candidats à recontacter (sans activité depuis 3+ jours)
    const candidatesToFollow = await db.candidate.findMany({
      where: {
        applications: {
          some: {
            job: { 
              hiringTeam: {
                some: { userId: userIdString }
              }
            },
            status: 'ACTIVE'
          }
        },
        activities: {
          none: {
            createdAt: { gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
          }
        }
      },
      include: {
        applications: {
          where: { 
            job: { 
              hiringTeam: {
                some: { userId: userIdString }
              }
            }
          },
          include: { job: { select: { title: true } } }
        }
      },
      take: 5
    });

    // 4. Applications nécessitant une action
    const overdueApplications = await db.application.findMany({
      where: {
        job: { 
          hiringTeam: {
            some: { userId: userIdString }
          }
        },
        currentStage: { 
          type: { in: ['APPLIED', 'AI_SCREENING', 'REVIEW'] } 
        },
        updatedAt: { lt: yesterday }
      },
      include: {
        candidate: { select: { firstName: true, lastName: true, email: true } },
        job: { select: { title: true } },
        currentStage: { select: { name: true, type: true } }
      },
      take: 3
    });

    return {
      summary: {
        todayInterviews: todayInterviews.length,
        overdueEvaluations: overdueEvaluations.length,
        candidatesToFollow: candidatesToFollow.length,
        overdueApplications: overdueApplications.length
      },
      priorities: {
        urgent: todayInterviews,
        overdue: overdueEvaluations,
        followUp: candidatesToFollow,
        applications: overdueApplications
      },
      totalPriorities: todayInterviews.length + overdueEvaluations.length + candidatesToFollow.length + overdueApplications.length
    };
  },

  // ============================================================================
  // 📅 PLANIFICATION ET ORGANISATION - VERSION PRODUCTION
  // ============================================================================

  /**
   * 📋 Planifier un entretien avec un candidat spécifique
   * Logique métier: Recherche candidat + création meeting + notification
   */
  async scheduleSpecificInterview(userId, candidateName, dateTime, jobId = null, meetingType = 'VIDEO_CALL') {
    let userIdString = userId ? userId.toString() : (await db.user.findFirst())?.id;
    
    if (!candidateName || !dateTime) {
      throw new Error('Nom du candidat et date/heure requis');
    }

    // 1. Rechercher le candidat par nom (flexible)
    const candidates = await db.candidate.findMany({
      where: {
        OR: [
          { 
            firstName: { 
              contains: candidateName, 
              mode: 'insensitive' 
            } 
          },
          { 
            lastName: { 
              contains: candidateName, 
              mode: 'insensitive' 
            } 
          },
          {
            // Recherche combinée prénom + nom
            AND: [
              {
                OR: [
                  { firstName: { contains: candidateName.split(' ')[0] || '', mode: 'insensitive' } },
                  { lastName: { contains: candidateName.split(' ')[0] || '', mode: 'insensitive' } }
                ]
              }
            ]
          }
        ],
        // Candidat doit avoir une application active
        applications: {
          some: {
            job: { 
              hiringTeam: {
                some: { userId: userIdString }
              }
            },
            status: 'ACTIVE'
          }
        }
      },
      include: {
        applications: {
          where: { 
            job: { 
              hiringTeam: {
                some: { userId: userIdString }
              }
            },
            status: 'ACTIVE'
          },
          include: { 
            job: { 
              select: { 
                id: true, 
                title: true,
                company: { select: { name: true } }
              } 
            },
            currentStage: { select: { name: true, type: true } }
          },
          orderBy: { updatedAt: 'desc' }
        }
      }
    });

    if (candidates.length === 0) {
      return {
        success: false,
        error: `Aucun candidat trouvé avec le nom "${candidateName}" dans vos postes actifs`,
        suggestions: await this.searchCandidates(candidateName, 3)
      };
    }

    // 2. Sélectionner le candidat le plus pertinent
    const targetCandidate = candidates[0];
    const application = jobId 
      ? targetCandidate.applications.find(app => app.job.id === jobId.toString())
      : targetCandidate.applications[0];

    if (!application) {
      return {
        success: false,
        error: `Candidat trouvé mais pas d'application active pour le poste spécifié`,
        candidate: targetCandidate
      };
    }

    // 3. Valider la date/heure
    const scheduledDateTime = new Date(dateTime);
    if (isNaN(scheduledDateTime.getTime())) {
      throw new Error('Format de date/heure invalide');
    }

    if (scheduledDateTime < new Date()) {
      return {
        success: false,
        error: 'Impossible de planifier un entretien dans le passé',
        requestedDateTime: dateTime
      };
    }

    // 4. Vérifier les conflits
    const existingMeetings = await db.meeting.findMany({
      where: {
        organizerId: userIdString,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        startTime: {
          gte: new Date(scheduledDateTime.getTime() - 30 * 60 * 1000), // 30 min avant
          lte: new Date(scheduledDateTime.getTime() + 30 * 60 * 1000)  // 30 min après
        }
      }
    });

    const hasConflict = existingMeetings.length > 0;

    // 5. Créer l'entretien
    try {
      const meeting = await db.meeting.create({
        data: {
          candidateId: targetCandidate.id,
          jobId: application.job.id,
          organizerId: userIdString,
          title: `Entretien ${meetingType} - ${targetCandidate.firstName} ${targetCandidate.lastName}`,
          description: `Entretien planifié via Megan AI pour le poste ${application.job.title} chez ${application.job.company.name}`,
          startTime: scheduledDateTime,
          endTime: new Date(scheduledDateTime.getTime() + 60 * 60 * 1000), // 1 heure
          status: 'SCHEDULED',
          meetingType
        },
        include: {
          candidate: { select: { firstName: true, lastName: true, email: true } },
          job: { select: { title: true, company: { select: { name: true } } } }
        }
      });

      // 6. Créer l'activité associée
      await db.activity.create({
        data: {
          candidateId: targetCandidate.id,
          type: 'MEETING_SCHEDULED',
          description: `🤖 Megan a planifié un entretien ${meetingType} pour le ${scheduledDateTime.toLocaleString('fr-FR')}`,
          performedBy: userIdString
        }
      });

      return {
        success: true,
        meeting,
        candidate: targetCandidate,
        application,
        hasConflict,
        conflictDetails: hasConflict ? existingMeetings : null,
        nextSteps: [
          'Envoyer invitation email au candidat',
          'Préparer les questions d\'entretien',
          'Réviser le CV et la lettre de motivation'
        ]
      };

    } catch (error) {
      throw new Error(`Erreur lors de la création de l'entretien: ${error.message}`);
    }
  },

  /**
   * ⏰ Analyser les créneaux disponibles pour planifier plusieurs entretiens
   * Logique métier: Analyse du planning + suggestions intelligentes
   */
  async getAvailableTimeSlots(userId, numberOfInterviews = 3, daysAhead = 7) {
    let userIdString = userId ? userId.toString() : (await db.user.findFirst())?.id;
    
    const today = new Date();
    const endDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    // 1. Récupérer tous les meetings existants
    const existingMeetings = await db.meeting.findMany({
      where: {
        organizerId: userIdString,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        startTime: { gte: today, lte: endDate }
      },
      select: {
        startTime: true,
        endTime: true,
        title: true
      },
      orderBy: { startTime: 'asc' }
    });

    // 2. Définir les heures de travail (9h-18h, Lun-Ven)
    const workingHours = { start: 9, end: 18 };
    const workingDays = [1, 2, 3, 4, 5]; // Lundi à Vendredi

    // 3. Générer tous les créneaux possibles (slots de 1h)
    const allPossibleSlots = [];
    for (let day = 1; day <= daysAhead; day++) {
      const currentDate = new Date(today.getTime() + day * 24 * 60 * 60 * 1000);
      
      if (workingDays.includes(currentDate.getDay())) {
        for (let hour = workingHours.start; hour < workingHours.end; hour++) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, 0, 0, 0);
          
          const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
          
          allPossibleSlots.push({
            start: slotStart,
            end: slotEnd,
            dayName: slotStart.toLocaleDateString('fr-FR', { weekday: 'long' }),
            timeSlot: `${hour}h00-${hour + 1}h00`
          });
        }
      }
    }

    // 4. Filtrer les créneaux libres
    const availableSlots = allPossibleSlots.filter(slot => {
      return !existingMeetings.some(meeting => {
        const meetingStart = new Date(meeting.startTime);
        const meetingEnd = new Date(meeting.endTime);
        
        // Vérifier s'il y a chevauchement
        return (slot.start < meetingEnd && slot.end > meetingStart);
      });
    });

    // 5. Grouper par jour et suggérer les meilleurs créneaux
    const slotsByDay = availableSlots.reduce((acc, slot) => {
      const dayKey = slot.start.toDateString();
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(slot);
      return acc;
    }, {});

    // 6. Suggestions intelligentes
    const suggestions = [];
    const preferredHours = [9, 10, 11, 14, 15, 16]; // Heures préférées pour les entretiens

    Object.entries(slotsByDay).forEach(([day, slots]) => {
      const preferredSlots = slots.filter(slot => 
        preferredHours.includes(slot.start.getHours())
      );
      
      if (preferredSlots.length > 0) {
        suggestions.push({
          date: day,
          dayName: slots[0].dayName,
          availableSlots: slots.length,
          recommendedSlots: preferredSlots.slice(0, 3),
          allSlots: slots
        });
      }
    });

    // 7. Calculer la faisabilité
    const totalAvailableSlots = availableSlots.length;
    const canScheduleAll = totalAvailableSlots >= numberOfInterviews;

    return {
      requestedInterviews: numberOfInterviews,
      daysAnalyzed: daysAhead,
      totalAvailableSlots,
      canScheduleAll,
      suggestions: suggestions.slice(0, 5), // Top 5 jours
      conflictingMeetings: existingMeetings.length,
      nextAvailableSlot: availableSlots[0] || null,
      analysis: {
        bestDays: suggestions.slice(0, 3).map(s => s.dayName),
        averageSlotsPerDay: Math.round(totalAvailableSlots / workingDays.length),
        recommendedStrategy: canScheduleAll 
          ? 'Planification possible cette semaine'
          : 'Étaler sur plusieurs semaines recommandé'
      }
    };
  },

  /**
   * 📅 Entretiens prévus la semaine prochaine
   * Logique métier: Planning complet + préparation + métriques
   */
  async getNextWeekInterviews(userId) {
    let userIdString = userId ? userId.toString() : (await db.user.findFirst())?.id;
    
    // 1. Calculer les dates de la semaine prochaine
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (8 - today.getDay())); // Prochain lundi
    nextMonday.setHours(0, 0, 0, 0);
    
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    nextSunday.setHours(23, 59, 59, 999);

    // 2. Récupérer tous les entretiens de la semaine prochaine
    const nextWeekInterviews = await db.meeting.findMany({
      where: {
        organizerId: userIdString,
        startTime: { gte: nextMonday, lte: nextSunday },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      },
      include: {
        candidate: { 
          select: { 
            id: true,
            firstName: true, 
            lastName: true, 
            email: true, 
            phoneNumber: true,
            ai_screening_score: true,
            resumeUrl: true
          } 
        },
        job: { 
          select: { 
            id: true,
            title: true,
            company: { select: { name: true } }
          } 
        }
      },
      orderBy: { startTime: 'asc' }
    });

    // 3. Grouper par jour
    const interviewsByDay = {};
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    nextWeekInterviews.forEach(interview => {
      const interviewDate = new Date(interview.startTime);
      const dayKey = interviewDate.toDateString();
      const dayName = daysOfWeek[interviewDate.getDay()];
      
      if (!interviewsByDay[dayKey]) {
        interviewsByDay[dayKey] = {
          dayName,
          date: interviewDate.toLocaleDateString('fr-FR'),
          interviews: []
        };
      }
      
      interviewsByDay[dayKey].interviews.push({
        ...interview,
        timeSlot: interviewDate.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duration: Math.round((new Date(interview.endTime) - new Date(interview.startTime)) / (60 * 1000)) // en minutes
      });
    });

    // 4. Statistiques et métriques
    const totalInterviews = nextWeekInterviews.length;
    const uniqueCandidates = new Set(nextWeekInterviews.map(i => i.candidate.id)).size;
    const averageScore = nextWeekInterviews.length > 0 
      ? Math.round(
          nextWeekInterviews
            .map(i => i.candidate.ai_screening_score || 0)
            .reduce((sum, score) => sum + score, 0) / nextWeekInterviews.length
        )
      : 0;

    // 5. Jour le plus chargé
    const busiestDay = Object.values(interviewsByDay)
      .sort((a, b) => b.interviews.length - a.interviews.length)[0];

    // 6. Préparations nécessaires
    const preparationNeeded = await Promise.all(
      nextWeekInterviews.slice(0, 5).map(async (interview) => {
        // Vérifier si le candidat a des notes récentes
        const recentActivities = await db.activity.count({
          where: {
            candidateId: interview.candidate.id,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        });

        return {
          candidateName: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
          interviewTime: interview.timeSlot,
          jobTitle: interview.job.title,
          preparationStatus: recentActivities > 0 ? 'READY' : 'NEEDS_PREP',
          actions: recentActivities > 0 
            ? ['Réviser notes récentes', 'Préparer questions spécifiques']
            : ['Étudier CV', 'Préparer questions', 'Réviser description poste']
        };
      })
    );

    return {
      weekPeriod: {
        start: nextMonday.toLocaleDateString('fr-FR'),
        end: nextSunday.toLocaleDateString('fr-FR')
      },
      summary: {
        totalInterviews,
        uniqueCandidates,
        averageScore,
        busiestDay: busiestDay ? `${busiestDay.dayName} (${busiestDay.interviews.length} entretiens)` : 'Aucun'
      },
      schedule: Object.values(interviewsByDay),
      preparationNeeded,
      recommendations: [
        totalInterviews > 5 ? '⚠️ Semaine chargée - prévoir du temps de préparation' : '✅ Charge de travail gérable',
        averageScore > 75 ? '🎯 Excellents candidats cette semaine' : '📋 Candidats à potentiel mixte',
        uniqueCandidates < totalInterviews ? '🔄 Plusieurs entretiens pour certains candidats' : '👥 Candidats uniques'
      ]
    };
  },

  /**
   * 🕒 Bloquer des créneaux pour les évaluations
   * Logique métier: Créer des blocs de temps dédiés aux évaluations sans candidat spécifique
   */
  async blockEvaluationTime(userId, dayOfWeek, startTime, durationHours = 2, description = 'Bloc évaluation candidates') {
    let userIdString = userId ? userId.toString() : (await db.user.findFirst())?.id;
    
    // 1. Calculer la prochaine occurrence du jour demandé
    const today = new Date();
    const daysOfWeek = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const targetDayIndex = daysOfWeek.indexOf(dayOfWeek.toLowerCase());
    
    if (targetDayIndex === -1) {
      throw new Error('Jour de la semaine invalide. Utilisez : lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche');
    }

    let targetDate = new Date(today);
    const todayIndex = today.getDay();
    const daysUntilTarget = (targetDayIndex - todayIndex + 7) % 7;
    
    if (daysUntilTarget === 0 && today.getHours() >= parseInt(startTime)) {
      // Si c'est aujourd'hui mais l'heure est passée, prendre la semaine prochaine
      targetDate.setDate(today.getDate() + 7);
    } else {
      targetDate.setDate(today.getDate() + daysUntilTarget);
    }

    // 2. Définir l'heure de début et de fin
    const [hour, minute = 0] = startTime.split('h').map(Number);
    const blockStart = new Date(targetDate);
    blockStart.setHours(hour, minute, 0, 0);
    
    const blockEnd = new Date(blockStart.getTime() + durationHours * 60 * 60 * 1000);

    // 3. Vérifier les conflits existants
    const conflictingMeetings = await db.meeting.findMany({
      where: {
        organizerId: userIdString,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        OR: [
          {
            startTime: { gte: blockStart, lt: blockEnd }
          },
          {
            endTime: { gt: blockStart, lte: blockEnd }
          },
          {
            AND: [
              { startTime: { lte: blockStart } },
              { endTime: { gte: blockEnd } }
            ]
          }
        ]
      },
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        job: { select: { title: true } }
      }
    });

    if (conflictingMeetings.length > 0) {
      return {
        success: false,
        error: 'Conflit détecté avec des entretiens existants',
        conflicts: conflictingMeetings.map(meeting => ({
          candidateName: meeting.candidate ? `${meeting.candidate.firstName} ${meeting.candidate.lastName}` : 'Non spécifié',
          jobTitle: meeting.job ? meeting.job.title : 'Non spécifié',
          startTime: meeting.startTime,
          endTime: meeting.endTime
        })),
        suggestions: [
          'Décaler d\'une heure',
          'Choisir un autre jour',
          'Réduire la durée du bloc'
        ]
      };
    }

    // 4. Créer le bloc d'évaluation
    try {
      const evaluationBlock = await db.meeting.create({
        data: {
          organizerId: userIdString,
          title: `📝 ${description}`,
          description: `Bloc de temps réservé pour les évaluations (${durationHours}h) - Créé par Megan AI`,
          startTime: blockStart,
          endTime: blockEnd,
          status: 'SCHEDULED',
          meetingType: 'EVALUATION_BLOCK'
        }
      });

      // 5. Créer une activité pour traçabilité
      await db.activity.create({
        data: {
          type: 'CALENDAR_BLOCKED',
          description: `🤖 Megan a bloqué ${durationHours}h pour les évaluations le ${blockStart.toLocaleDateString('fr-FR')} à ${startTime}`,
          performedBy: userIdString
        }
      });

      return {
        success: true,
        block: evaluationBlock,
        details: {
          dayName: daysOfWeek[targetDayIndex],
          date: blockStart.toLocaleDateString('fr-FR'),
          timeSlot: `${hour}h${minute.toString().padStart(2, '0')}-${blockEnd.getHours()}h${blockEnd.getMinutes().toString().padStart(2, '0')}`,
          duration: `${durationHours} heure${durationHours > 1 ? 's' : ''}`
        },
        recommendations: [
          'Préparer les dossiers à évaluer',
          'Bloquer les notifications pendant ce créneau',
          'Prévoir une liste de candidats prioritaires'
        ]
      };

    } catch (error) {
      throw new Error(`Erreur lors de la création du bloc d'évaluation: ${error.message}`);
    }
  },

  /**
   * 🔔 Programmer un rappel pour relancer un candidat
   * Logique métier: Créer un reminder programmé avec notification automatique
   */
  async scheduleFollowUpReminder(userId, candidateName, reminderDate, reminderType = 'FOLLOW_UP', customMessage = null) {
    let userIdString = userId ? userId.toString() : (await db.user.findFirst())?.id;
    
    if (!candidateName || !reminderDate) {
      throw new Error('Nom du candidat et date de rappel requis');
    }

    // 1. Rechercher le candidat
    const candidates = await db.candidate.findMany({
      where: {
        OR: [
          { firstName: { contains: candidateName, mode: 'insensitive' } },
          { lastName: { contains: candidateName, mode: 'insensitive' } }
        ],
        applications: {
          some: {
            job: { 
              hiringTeam: {
                some: { userId: userIdString }
              }
            },
            status: 'ACTIVE'
          }
        }
      },
      include: {
        applications: {
          where: { 
            job: { 
              hiringTeam: {
                some: { userId: userIdString }
              }
            },
            status: 'ACTIVE'
          },
          include: { 
            job: { select: { title: true, company: { select: { name: true } } } },
            currentStage: { select: { name: true, type: true } }
          }
        }
      }
    });

    if (candidates.length === 0) {
      return {
        success: false,
        error: `Candidat "${candidateName}" non trouvé dans vos postes actifs`,
        suggestions: await this.searchCandidates(candidateName, 3)
      };
    }

    const candidate = candidates[0];
    const application = candidate.applications[0];

    // 2. Valider la date de rappel
    const reminderDateTime = new Date(reminderDate);
    if (isNaN(reminderDateTime.getTime())) {
      throw new Error('Format de date invalide pour le rappel');
    }

    if (reminderDateTime < new Date()) {
      return {
        success: false,
        error: 'Impossible de programmer un rappel dans le passé',
        requestedDate: reminderDate
      };
    }

    // 3. Définir le type de rappel et le message
    const reminderTypes = {
      'FOLLOW_UP': 'Relance candidat',
      'INTERVIEW_PREP': 'Préparation entretien',
      'DECISION_DEADLINE': 'Délai de décision',
      'CONTRACT_SEND': 'Envoi contrat',
      'REFERENCE_CHECK': 'Vérification références'
    };

    const reminderTitle = reminderTypes[reminderType] || 'Rappel candidat';
    const defaultMessage = customMessage || `Relancer ${candidate.firstName} ${candidate.lastName} pour ${application.job.title}`;

    // 4. Créer le rappel comme un meeting spécial
    try {
      const reminder = await db.meeting.create({
        data: {
          candidateId: candidate.id,
          jobId: application.job.id,
          organizerId: userIdString,
          title: `🔔 ${reminderTitle} - ${candidate.firstName} ${candidate.lastName}`,
          description: `Rappel programmé: ${defaultMessage}\n\nÉtape actuelle: ${application.currentStage.name}\nPoste: ${application.job.title}`,
          startTime: reminderDateTime,
          endTime: new Date(reminderDateTime.getTime() + 15 * 60 * 1000), // 15 minutes
          status: 'SCHEDULED',
          meetingType: 'REMINDER'
        },
        include: {
          candidate: { select: { firstName: true, lastName: true, email: true } },
          job: { select: { title: true, company: { select: { name: true } } } }
        }
      });

      // 5. Créer l'activité de rappel
      await db.activity.create({
        data: {
          candidateId: candidate.id,
          type: 'REMINDER_SCHEDULED',
          description: `🤖 Megan a programmé un rappel "${reminderTitle}" pour le ${reminderDateTime.toLocaleDateString('fr-FR')} à ${reminderDateTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
          performedBy: userIdString
        }
      });

      return {
        success: true,
        reminder,
        candidate,
        application,
        details: {
          reminderType,
          scheduledFor: reminderDateTime.toLocaleString('fr-FR'),
          message: defaultMessage,
          daysFromNow: Math.ceil((reminderDateTime - new Date()) / (24 * 60 * 60 * 1000))
        },
        suggestedActions: [
          'Préparer email de relance',
          'Vérifier dernière interaction',
          'Mettre à jour statut candidat'
        ]
      };

    } catch (error) {
      throw new Error(`Erreur lors de la création du rappel: ${error.message}`);
    }
  },

  // ============================================================================
  // 🔍 FONCTIONS UTILITAIRES
  // ============================================================================

  /**
   * 🔍 Rechercher des candidats par nom (fonction utilitaire)
   */
  async searchCandidates(searchTerm, limit = 5) {
    const candidates = await db.candidate.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      },
      take: limit
    });

    return candidates;
  }

};