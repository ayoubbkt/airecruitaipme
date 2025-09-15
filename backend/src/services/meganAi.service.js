// backend/src/services/meganAi.service.js
import axios from 'axios';
import prisma from '../config/db.js';

class MeganAiService {
  constructor() {
    this.intercomApi = axios.create({
      baseURL: 'https://api.intercom.io',
      headers: {
        'Authorization': `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Intercom-Version': '2.8'
      }
    });
  }

  // Chat général avec Megan
  async chatWithMegan(userId, message, context = {}) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { companyMemberships: { include: { company: true } } }
      });

      const prompt = this.buildPrompt(message, context, user);

      const conversation = await this.intercomApi.post('/conversations', {
        from: {
          type: 'user',
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          user_id: user.id
        },
        body: prompt,
        custom_attributes: {
          megan_context: context.type || 'general',
          user_id: userId,
          candidate_id: context.candidateId || null,
          job_id: context.jobId || null,
          meeting_id: context.meetingId || null
        }
      });

      // Sauvegarder en base
      await prisma.meganConversation.create({
        data: {
          id: conversation.data.id,
          userId,
          intercomConversationId: conversation.data.id,
          context: context,
          status: 'active'
        }
      });

      return {
        conversationId: conversation.data.id,
        status: 'started'
      };

    } catch (error) {
      console.error('Erreur chat Megan:', error);
      throw error;
    }
  }

  // AI Screening
  async performAiScreening(userId, jobId, candidateData) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { aiScreeningConfig: true, company: true }
    });

    if (!job?.aiScreeningConfig?.isEnabled) {
      throw new Error('AI Screening non activé pour ce poste');
    }

    const prompt = `ANALYSE CANDIDAT POUR SCREENING:

CANDIDAT:
- Nom: ${candidateData.name}
- Email: ${candidateData.email}
- Expérience: ${candidateData.experience || 'Non précisée'}
- Compétences: ${candidateData.skills?.join(', ') || 'Non précisées'}

POSTE:
- Titre: ${job.title}
- Description: ${job.description}
- Compétences requises: ${job.requiredSkills?.join(', ') || 'Non spécifiées'}

INSTRUCTIONS:
1. Donne un score de 0 à 100
2. Liste 3 points forts maximum
3. Liste 3 points faibles maximum  
4. Recommande: ACCEPTER, REJETER, ou ENTRETIEN
5. Génère 3 questions d'entretien personnalisées

Format ta réponse de manière structurée.`;

    return await this.chatWithMegan(userId, prompt, {
      type: 'ai_screening',
      jobId,
      candidateId: candidateData.id
    });
  }

  // AI Scheduling
  async performAiScheduling(userId, jobId, candidateId, schedulingData) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { aiSchedulingConfig: true }
    });

    if (!job?.aiSchedulingConfig?.isEnabled) {
      throw new Error('AI Scheduling non activé pour ce poste');
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    const prompt = `PLANIFIE UN ENTRETIEN:

CANDIDAT: ${candidate.name} (${candidate.email})
POSTE: ${job.title}
TYPE: ${schedulingData.interviewType || 'Entretien général'}
DURÉE: ${schedulingData.duration || 60} minutes
INTERVIEWEURS: ${schedulingData.interviewers?.join(', ') || 'À définir'}

INSTRUCTIONS:
1. Propose 3 créneaux dans les 7 prochains jours
2. Génère un email de convocation professionnel
3. Liste les préparatifs nécessaires
4. Configure les rappels automatiques

Organise tout de manière professionnelle.`;

    return await this.chatWithMegan(userId, prompt, {
      type: 'ai_scheduling',
      jobId,
      candidateId
    });
  }

  // AI Note Taking
  async performAiNoteTaking(userId, meetingId, transcription) {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { 
        aiNoteTakingConfig: true,
        application: { include: { candidate: true, job: true } }
      }
    });

    if (!meeting?.aiNoteTakingConfig?.isEnabled) {
      throw new Error('AI Note Taking non activé pour ce meeting');
    }

    const prompt = `ANALYSE CETTE TRANSCRIPTION D'ENTRETIEN:

DÉTAILS:
- Candidat: ${meeting.application?.candidate?.name || 'N/A'}
- Poste: ${meeting.application?.job?.title || 'N/A'}
- Durée: ${meeting.duration || 'Non précisée'} minutes

TRANSCRIPTION:
${transcription}

INSTRUCTIONS:
1. Résume en 3-4 points clés maximum
2. Évalue les compétences techniques (sur 10)
3. Évalue les soft skills (sur 10)
4. Note le fit culturel (sur 10)
5. Recommande: CONTINUER, REJETER, ou SECOND_ENTRETIEN
6. Liste 2-3 action items maximum

Sois concis et objectif.`;

    const result = await this.chatWithMegan(userId, prompt, {
      type: 'ai_note_taking',
      meetingId,
      candidateId: meeting.application?.candidateId
    });

    // Sauvegarder les notes
    await prisma.meetingNote.create({
      data: {
        meetingId,
        content: transcription,
        aiProcessed: true,
        conversationId: result.conversationId,
        createdBy: userId
      }
    });

    return result;
  }

  // Construction du prompt selon contexte
  buildPrompt(message, context, user) {
    const basePersonality = `Tu es Megan, assistant IA RH de ${user.companyMemberships[0]?.company?.name || 'cette entreprise'}. Tu es professionnelle, concise et experte en recrutement. Tu réponds en français.`;

    switch (context.type) {
      case 'ai_screening':
      case 'ai_scheduling':  
      case 'ai_note_taking':
        return `${basePersonality}\n\n${message}`;
      
      default:
        return `${basePersonality}\n\nMESSAGE: ${message}\n\nJe peux t'aider avec:\n- Analyse de candidats\n- Planification d'entretiens\n- Prise de notes d'entretiens\n- Questions RH générales\n\nComment puis-je t'assister?`;
    }
  }

  // Traitement des webhooks Intercom
  async processWebhookResponse(webhookData) {
    try {
      const { type, data } = webhookData;

      if (type === 'conversation.operator.replied') {
        const conversation = data.item;
        const message = conversation.conversation_message;

        if (message?.author?.type === 'bot') {
          await this.handleMeganResponse(conversation.id, message.body, conversation.custom_attributes);
        }
      }
    } catch (error) {
      console.error('Erreur traitement webhook:', error);
    }
  }

  async handleMeganResponse(conversationId, response, attributes) {
    try {
      const context = attributes?.megan_context;
      
      // Mettre à jour le log
      await prisma.aIInteractionLog.updateMany({
        where: {
          userId: attributes?.user_id,
          inputType: `megan_${context}`,
          output: null
        },
        data: {
          output: response.substring(0, 1000),
          responseTime: 5000 // Simulé pour l'exemple
        }
      });

      // Traitement spécialisé
      if (context === 'ai_screening') {
        await this.saveScreeningResults(response, attributes);
      } else if (context === 'ai_note_taking') {
        await this.saveNoteResults(response, attributes);
      }

    } catch (error) {
      console.error('Erreur traitement réponse:', error);
    }
  }

  async saveScreeningResults(response, attributes) {
    try {
      // Parser la réponse pour extraire score, recommandation, etc.
      const scoreMatch = response.match(/score[:\s]*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
      
      const strengthsMatch = response.match(/points?\s+forts?[:\s]*\n?(.*?)(?:\n\n|points?\s+faibles?)/is);
      const strengths = strengthsMatch ? strengthsMatch[1].trim().split('\n').filter(s => s.trim()) : [];

      await prisma.candidateAnalysis.create({
        data: {
          candidateId: attributes.candidate_id,
          jobId: attributes.job_id,
          score: score,
          strengths: strengths,
          weaknesses: [],
          recommendation: 'review',
          aiResponse: response,
          analysisType: 'ai_screening',
          createdBy: attributes.user_id
        }
      });
    } catch (error) {
      console.error('Erreur sauvegarde screening:', error);
    }
  }

  async saveNoteResults(response, attributes) {
    try {
      await prisma.meeting.update({
        where: { id: attributes.meeting_id },
        data: {
          aiSummary: response,
          aiDecision: 'review'
        }
      });
    } catch (error) {
      console.error('Erreur sauvegarde notes:', error);
    }
  }
}

export default new MeganAiService();