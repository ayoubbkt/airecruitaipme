// backend/src/api/aiMegan/aiMegan.controller.js (REMPLACER COMPLÈTEMENT)
import AiMeganService from './aiMegan.service.js';
import MeganAiService from '../../services/meganAi.service.js';

class AiMeganController {
  // === FONCTIONS EXISTANTES (garder) ===
  async getAIBusinessPreferences(req, res, next) {
    try {
      const { companyId } = req.params;
      const prefs = await AiMeganService.getAIBusinessPreferences(req.user.id, companyId);
      res.status(200).json({ data: prefs });
    } catch (error) {
      next(error);
    }
  }

  async updateAIBusinessPreferences(req, res, next) {
    try {
      const { companyId } = req.params;
      const prefs = await AiMeganService.updateAIBusinessPreferences(req.user.id, companyId, req.body);
      res.status(200).json({ message: 'AI Business Preferences updated.', data: prefs });
    } catch (error) {
      next(error);
    }
  }

  async getAICommunicationPreferences(req, res, next) {
    try {
      const { companyId } = req.params;
      const prefs = await AiMeganService.getAICommunicationPreferences(req.user.id, companyId);
      res.status(200).json({ data: prefs });
    } catch (error) {
      next(error);
    }
  }

  async updateAICommunicationPreferences(req, res, next) {
    try {
      const { companyId } = req.params;
      const prefs = await AiMeganService.updateAICommunicationPreferences(req.user.id, companyId, req.body);
      res.status(200).json({ message: 'AI Communication Preferences updated.', data: prefs });
    } catch (error) {
      next(error);
    }
  }

  async configureAIScreening(req, res, next) {
    try {
      const { jobId } = req.params;
      const config = await AiMeganService.configureAIScreening(req.user.id, jobId, req.body);
      res.status(200).json({ message: 'AI Screening configured.', data: config });
    } catch (error) {
      next(error);
    }
  }

  async getAIScreeningConfig(req, res, next) {
    try {
      const { jobId } = req.params;
      const config = await AiMeganService.getAIScreeningConfig(req.user.id, jobId);
      res.status(200).json({ data: config });
    } catch (error) {
      next(error);
    }
  }

  async configureAIScheduling(req, res, next) {
    try {
      const { jobId } = req.params;
      const config = await AiMeganService.configureAIScheduling(req.user.id, jobId, req.body);
      res.status(200).json({ message: 'AI Scheduling configured.', data: config });
    } catch (error) {
      next(error);
    }
  }

  async getAISchedulingConfig(req, res, next) {
    try {
      const { jobId } = req.params;
      const config = await AiMeganService.getAISchedulingConfig(req.user.id, jobId);
      res.status(200).json({ data: config });
    } catch (error) {
      next(error);
    }
  }

  async configureAINoteTaking(req, res, next) {
    try {
      const { meetingId } = req.params;
      const config = await AiMeganService.configureAINoteTaking(req.user.id, meetingId, req.body);
      res.status(200).json({ message: 'AI Note Taking configured.', data: config });
    } catch (error) {
      next(error);
    }
  }

  async getAINoteTakingConfig(req, res, next) {
    try {
      const { meetingId } = req.params;
      const config = await AiMeganService.getAINoteTakingConfig(req.user.id, meetingId);
      res.status(200).json({ data: config });
    } catch (error) {
      next(error);
    }
  }

  async logAIInteraction(req, res, next) {
    try {
      const logData = { ...req.body, userId: req.body.userId || req.user?.id };
      const log = await AiMeganService.logAIInteraction(logData);
      res.status(201).json({ message: 'AI interaction logged.', data: log });
    } catch (error) {
      next(error);
    }
  }

  async getAIInteractionLogs(req, res, next) {
    try {
      const logs = await AiMeganService.getAIInteractionLogs(req.user.id, req.query);
      res.status(200).json(logs);
    } catch (error) {
      next(error);
    }
  }

  // === NOUVELLES FONCTIONS MEGAN ===
  
  // Chat avec Megan
  async chatWithMegan(req, res, next) {
    try {
      const { message, context = {} } = req.body;
      
      if (!message?.trim()) {
        return res.status(400).json({ error: 'Message requis' });
      }

      const result = await MeganAiService.chatWithMegan(req.user.id, message.trim(), context);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  // AI Screening
  async executeAIScreening(req, res, next) {
    try {
      const { jobId, candidateId } = req.params;
      const { candidateData } = req.body;

      const result = await MeganAiService.performAiScreening(req.user.id, jobId, candidateData);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  // AI Scheduling  
  async executeAIScheduling(req, res, next) {
    try {
      const { jobId, candidateId } = req.params;
      const schedulingData = req.body;

      const result = await MeganAiService.performAiScheduling(req.user.id, jobId, candidateId, schedulingData);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  // AI Note Taking
  async executeAINoteTaking(req, res, next) {
    try {
      const { meetingId } = req.params;
      const { transcription } = req.body;

      if (!transcription?.trim()) {
        return res.status(400).json({ error: 'Transcription requise' });
      }

      const result = await MeganAiService.performAiNoteTaking(req.user.id, meetingId, transcription.trim());

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  // Webhook Intercom
  // backend/src/api/aiMegan/aiMegan.controller.js
async handleIntercomWebhook(req, res, next) {
  try {
    console.log('📨 Webhook reçu:', req.body);
    
    // SKIP validation signature en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔓 Mode développement - validation signature ignorée');
    } else {
      // Validation normale en production
      const signature = req.headers['x-hub-signature-256'];
      if (!this.validateWebhookSignature(req)) {
        return res.status(401).json({ error: 'Signature webhook invalide' });
      }
    }

    const webhookData = req.body;
    
    // Traitement asynchrone
    setImmediate(async () => {
      try {
        await MeganAiService.processWebhookResponse(webhookData);
        console.log('✅ Webhook traité avec succès');
      } catch (error) {
        console.error('❌ Erreur traitement webhook:', error);
      }
    });

    res.status(200).json({ 
      received: true, 
      timestamp: new Date().toISOString(),
      dev_mode: process.env.NODE_ENV === 'development'
    });

  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

  // Conversations
  async getConversations(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const conversations = await prisma.meganConversation.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      });

      const total = await prisma.meganConversation.count({
        where: { userId: req.user.id }
      });

      res.status(200).json({
        success: true,
        data: {
          conversations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async getConversationStatus(req, res, next) {
    try {
      const { conversationId } = req.params;

      const conversation = await prisma.meganConversation.findUnique({
        where: { 
          id: conversationId,
          userId: req.user.id 
        }
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      res.status(200).json({
        success: true,
        data: conversation
      });

    } catch (error) {
      next(error);
    }
  }
}

export default new AiMeganController();