import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/index.js';
import errorHandler from './middleware/errorHandler.middleware.js';
import path from 'path';

// Importation des routes (à créer)
import authRoutes from './api/auth/auth.routes.js';
import userRoutes from './api/users/user.routes.js';
import companyRoutes from './api/companies/company.routes.js';
import jobRoutes from './api/jobs/job.routes.js';
import workflowRoutes from './api/workflows/workflow.routes.js';
import ratingRoutes from './api/ratings/rating.routes.js';
import messagingRoutes from './api/messaging/messaging.routes.js';
import schedulingRoutes from './api/scheduling/scheduling.routes.js';
import careersPageRoutes from './api/careersPage/careersPage.routes.js';
import notificationRoutes from './api/notifications/notification.routes.js';
import aiMeganRoutes from './api/aiMegan/aiMegan.routes.js';
import integrationRoutes from './api/integrations/integration.routes.js';
import CompanyController from './api/companies/company.controller.js'; // Ajouté
import messageTemplateRoutes from './api/messaging/messageTemplate.routes.js';
import questionRoutes from './api/questions/question.routes.js';
import candidateRoutes from './api/candidates/candidate.routes.js';

import { protect } from './middleware/auth.middleware.js'; // Ajouté

const app = express();

// Middleware de base
app.use(cors()); // Gérer les requêtes Cross-Origin Resource Sharing
app.use(helmet()); // Sécuriser les en-têtes HTTP
app.use(express.json()); // Parser les requêtes JSON
app.use(express.urlencoded({ extended: true })); // Parser les requêtes URL-encoded

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Journalisation des requêtes HTTP en mode développement
}

// Routes de l'API
app.get('/health', (req, res) => res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() }));
app.get('/api/v1/my-companies', protect, async (req, res) => {
  try {
    const companies = await CompanyController.getUserCompanies(req.user.id); // Utilise l'ID de l'utilisateur authentifié
    res.status(200).json({ data: companies });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des entreprises', error: error.message });
  }
});
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/workflows', workflowRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/messaging', messagingRoutes);
app.use('/api/v1/scheduling', schedulingRoutes);
app.use('/api/v1/careers-page', careersPageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/ai-megan', aiMeganRoutes);
app.use('/api/v1/integrations', integrationRoutes);
app.use('/api/v1/messagingTemplate', messageTemplateRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'API is ' });
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Gestionnaire d'erreurs global (doit être le dernier middleware)
app.use(errorHandler);

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ message: `Not Found - ${req.method} ${req.originalUrl}` });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app; // Utile pour les tests