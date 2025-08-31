import prisma from '../../config/db.js';
import pkg from '../../generated/prisma/index.js';
const { UserRole, CompanyMemberRole } = pkg;

// Helper to check if user has permission to manage questions
async function checkQuestionPermission(userId, companyId, allowedRoles = [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER]) {
  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });
  const platformUser = await prisma.user.findUnique({ where: { id: userId } });

  if (platformUser?.role === UserRole.MEGA_ADMIN) return true;
  if (!membership || !allowedRoles.includes(membership.role)) {
    const error = new Error('Forbidden: You do not have permission to manage questions.');
    error.statusCode = 403;
    throw error;
  }
  return true;
}

class QuestionService {
  async getCustomQuestions(userId, companyId) {
    await checkQuestionPermission(userId, companyId);
    return prisma.question.findMany({
      where: { companyId },
      orderBy: { text: 'asc' },
      include: { options: true }
    });
  }

  async getQuestionSets(userId, companyId) {
    await checkQuestionPermission(userId, companyId);
    return prisma.questionSet.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      include: { questions: true }
    });
  }

  async createQuestion(userId, companyId, questionData) {
    await checkQuestionPermission(userId, companyId);

    const { text, responseType, visibility, options } = questionData;

    if (!text || !responseType || !visibility) {
      throw new Error('Text, responseType, and visibility are required for a question.');
    }

    const validResponseTypes = ['short_text', 'paragraph', 'yes_no', 'dropdown', 'multiple_choice', 'number', 'file'];
    if (!validResponseTypes.includes(responseType)) {
      throw new Error(`Invalid responseType: ${responseType}`);
    }

    if (!['public', 'private'].includes(visibility)) {
      throw new Error(`Invalid visibility: ${visibility}`);
    }

    if (['dropdown', 'multiple_choice'].includes(responseType) && (!options || options.length === 0)) {
      throw new Error('Options are required for dropdown or multiple_choice response types.');
    }

    return prisma.question.create({
      data: {
        companyId,
        text,
        responseType,
        visibility,
        options: options && options.length > 0 ? {
          create: options.map(option => ({ value: option }))
        } : undefined
      },
      include: { options: true }
    });
  }

  async updateQuestion(userId, companyId, id, questionData) {
    await checkQuestionPermission(userId, companyId);

    const question = await prisma.question.findUnique({
      where: { id },
      include: { options: true }
    });

    if (!question || question.companyId !== companyId) {
      const error = new Error('Question not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const { text, responseType, visibility, options } = questionData;

    if (!text || !responseType || !visibility) {
      throw new Error('Text, responseType, and visibility are required for a question.');
    }

    const validResponseTypes = ['short_text', 'paragraph', 'yes_no', 'dropdown', 'multiple_choice', 'number', 'file'];
    if (!validResponseTypes.includes(responseType)) {
      throw new Error(`Invalid responseType: ${responseType}`);
    }

    if (!['public', 'private'].includes(visibility)) {
      throw new Error(`Invalid visibility: ${visibility}`);
    }

    if (['dropdown', 'multiple_choice'].includes(responseType) && (!options || options.length === 0)) {
      throw new Error('Options are required for dropdown or multiple_choice response types.');
    }

    // Supprimer les options existantes si le type de réponse a changé ou si de nouvelles options sont fournies
    if (['dropdown', 'multiple_choice'].includes(responseType)) {
      await prisma.questionOption.deleteMany({
        where: { questionId: id }
      });
    }

    return prisma.question.update({
      where: { id },
      data: {
        text,
        responseType,
        visibility,
        options: options && options.length > 0 ? {
          create: options.map(option => ({ value: option }))
        } : undefined
      },
      include: { options: true }
    });
  }

  async deleteQuestion(userId, companyId, id) {
    await checkQuestionPermission(userId, companyId);

    const question = await prisma.question.findUnique({
      where: { id }
    });

    if (!question || question.companyId !== companyId) {
      const error = new Error('Question not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    // Vérifier si la question est utilisée dans un ensemble
    const questionSets = await prisma.questionSet.findMany({
      where: { questions: { some: { id } } }
    });

    if (questionSets.length > 0) {
      const error = new Error('Cannot delete question because it is used in one or more question sets.');
      error.statusCode = 400;
      throw error;
    }

    await prisma.question.delete({
      where: { id }
    });

    return { message: 'Question deleted successfully.' };
  }

  async createQuestionSet(userId, companyId, setData) {
    await checkQuestionPermission(userId, companyId);

    const { name, description, questionIds } = setData;

    if (!name || !questionIds || questionIds.length === 0) {
      throw new Error('Name and at least one question are required for a question set.');
    }

    // Vérifier que toutes les questions existent et appartiennent à la même entreprise
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds }, companyId }
    });

    if (questions.length !== questionIds.length) {
      throw new Error('One or more questions not found or access denied.');
    }

    return prisma.questionSet.create({
      data: {
        companyId,
        name,
        description,
        questions: {
          connect: questionIds.map(id => ({ id }))
        }
      },
      include: { questions: true }
    });
  }

  async updateQuestionSet(userId, companyId, id, setData) {
    await checkQuestionPermission(userId, companyId);

    const questionSet = await prisma.questionSet.findUnique({
      where: { id }
    });

    if (!questionSet || questionSet.companyId !== companyId) {
      const error = new Error('Question set not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const { name, description, questionIds } = setData;

    if (!name || !questionIds || questionIds.length === 0) {
      throw new Error('Name and at least one question are required for a question set.');
    }

    // Vérifier que toutes les questions existent et appartiennent à la même entreprise
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds }, companyId }
    });

    if (questions.length !== questionIds.length) {
      throw new Error('One or more questions not found or access denied.');
    }

    // Déconnecter toutes les questions existantes et connecter les nouvelles
    return prisma.questionSet.update({
      where: { id },
      data: {
        name,
        description,
        questions: {
          set: [], // Déconnecter toutes les questions existantes
          connect: questionIds.map(id => ({ id }))
        }
      },
      include: { questions: true }
    });
  }

  async deleteQuestionSet(userId, companyId, id) {
    await checkQuestionPermission(userId, companyId);

    const questionSet = await prisma.questionSet.findUnique({
      where: { id }
    });

    if (!questionSet || questionSet.companyId !== companyId) {
      const error = new Error('Question set not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    await prisma.questionSet.delete({
      where: { id }
    });

    return { message: 'Question set deleted successfully.' };
  }
}

export default new QuestionService();