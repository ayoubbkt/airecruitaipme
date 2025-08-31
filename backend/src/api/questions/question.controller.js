import QuestionService from './question.service.js';

class QuestionController {
  async getCustomQuestions(req, res, next) {
    try {
      const { companyId } = req.params;
      const questions = await QuestionService.getCustomQuestions(req.user.id, companyId);
      res.status(200).json(questions);
    } catch (error) {
      next(error);
    }
  }

  async getQuestionSets(req, res, next) {
    try {
      const { companyId } = req.params;
      const sets = await QuestionService.getQuestionSets(req.user.id, companyId);
      res.status(200).json(sets);
    } catch (error) {
      next(error);
    }
  }

  async createQuestion(req, res, next) {
    try {
      const { companyId } = req.params;
      const question = await QuestionService.createQuestion(req.user.id, companyId, req.body);
      res.status(201).json({ message: 'Question created.', data: question });
    } catch (error) {
      next(error);
    }
  }

  async updateQuestion(req, res, next) {
    try {
      const { companyId, id } = req.params;
      const updatedQuestion = await QuestionService.updateQuestion(req.user.id, companyId, id, req.body);
      res.status(200).json({ message: 'Question updated.', data: updatedQuestion });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req, res, next) {
    try {
      const { companyId, id } = req.params;
      const result = await QuestionService.deleteQuestion(req.user.id, companyId, id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createQuestionSet(req, res, next) {
    try {
      const { companyId } = req.params;
      const set = await QuestionService.createQuestionSet(req.user.id, companyId, req.body);
      res.status(201).json({ message: 'Question set created.', data: set });
    } catch (error) {
      next(error);
    }
  }

  async updateQuestionSet(req, res, next) {
    try {
      const { companyId, id } = req.params;
      const updatedSet = await QuestionService.updateQuestionSet(req.user.id, companyId, id, req.body);
      res.status(200).json({ message: 'Question set updated.', data: updatedSet });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestionSet(req, res, next) {
    try {
      const { companyId, id } = req.params;
      const result = await QuestionService.deleteQuestionSet(req.user.id, companyId, id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new QuestionController();