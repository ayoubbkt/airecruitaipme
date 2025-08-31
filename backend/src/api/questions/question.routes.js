import express from 'express';
import QuestionController from './question.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

// Questions and Question Sets (scoped by company)
router.get('/companies/:companyId/questions/custom', QuestionController.getCustomQuestions);
router.get('/companies/:companyId/questions/sets', QuestionController.getQuestionSets);
router.post('/companies/:companyId/questions', QuestionController.createQuestion);
router.put('/companies/:companyId/questions/:id', QuestionController.updateQuestion);
router.delete('/companies/:companyId/questions/:id', QuestionController.deleteQuestion);
router.post('/companies/:companyId/questions/sets', QuestionController.createQuestionSet);
router.put('/companies/:companyId/questions/sets/:id', QuestionController.updateQuestionSet);
router.delete('/companies/:companyId/questions/sets/:id', QuestionController.deleteQuestionSet);
export default router;