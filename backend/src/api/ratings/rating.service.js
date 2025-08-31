import prisma from '../../config/db.js';
import { UserRole, CompanyMemberRole, RatingCardType } from '../../generated/prisma/index.js';

// Helper (similar to workflow service)
async function checkCompanyAdminAccess(userId, companyId) {
  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });
  const platformUser = await prisma.user.findUnique({ where: { id: userId } });

  if (platformUser?.role === UserRole.MEGA_ADMIN) return true;
  if (!membership || membership.role !== CompanyMemberRole.RECRUITING_ADMIN) {
    const error = new Error('Forbidden: You must be a Recruiting Admin for this company.');
    error.statusCode = 403;
    throw error;
  }
  return true;
}

// Helper to check if user can rate (is part of hiring team for the application's job)
async function checkRatingPermission(raterId, applicationId) {
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        select: { 
            jobId: true, 
            job: { select: { companyId: true, hiringTeam: { where: { userId: raterId } } } } 
        }
    });

    if (!application) {
        const error = new Error('Application not found.');
        error.statusCode = 404;
        throw error;
    }
    if (!application.job.hiringTeam || application.job.hiringTeam.length === 0) {
        // Also check if user is a MEGA_ADMIN or a Company Recruiting Admin for that company
        const companyAdminAccess = await prisma.companyMember.findFirst({
            where: { userId: raterId, companyId: application.job.companyId, role: CompanyMemberRole.RECRUITING_ADMIN }
        });
        const platformUser = await prisma.user.findUnique({ where: { id: raterId } });
        if (!companyAdminAccess && platformUser?.role !== UserRole.MEGA_ADMIN) {
            const error = new Error('Forbidden: You are not part of the hiring team for this job or lack admin privileges.');
            error.statusCode = 403;
            throw error;
        }
    }
    return application.jobId;
}


class RatingService {
  // --- Rating Card Templates (Company Level) ---
  async createRatingCardTemplate(userId, companyId, templateData) {
    await checkCompanyAdminAccess(userId, companyId);
    const { name, description, type = RatingCardType.BASIC, categories, isDefault = false } = templateData;
    // categories: [{ name, description, order }]

    if (!name) throw new Error('Template name is required.');
    if (type === RatingCardType.CATEGORIZED && (!categories || categories.length === 0)) {
      throw new Error('Categorized rating cards must have at least one category.');
    }
    if (type === 'CATEGORIZED') {
      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        const error = new Error('Au moins une catégorie est requise pour une fiche catégorisée');
        error.statusCode = 400;
        throw error;
      }
      for (const category of categories) {
        if (!category.name || category.name.trim() === '') {
          const error = new Error('Chaque catégorie doit avoir un nom non vide');
          error.statusCode = 400;
          throw error;
        }
        if (category.order == null || typeof category.order !== 'number') {
          const error = new Error('Chaque catégorie doit avoir un ordre valide');
          error.statusCode = 400;
          throw error;
        }
      }
    }

    return prisma.ratingCardTemplate.create({
      data: {
        name,
        description,
        companyId,
        type,
        isDefault,
        categories: type === RatingCardType.CATEGORIZED && categories ? {
          create: categories.map(cat => ({
            name: cat.name,
            description: cat.description,
            order: cat.order
          }))
        } : undefined
      },
      include: { categories: { orderBy: { order: 'asc' } } }
    });
  }

  async getRatingCardTemplatesByCompany(userId, companyId) {
    await checkCompanyAdminAccess(userId, companyId);
    return prisma.ratingCardTemplate.findMany({
      where: { companyId },
      include: { _count: { select: { categories: true } } },
      orderBy: { name: 'asc' }
    });
  }
  
  async getRatingCardTemplateById(userId, companyId, templateId) {
    await checkCompanyAdminAccess(userId, companyId);
    const template = await prisma.ratingCardTemplate.findUnique({
        where: { id: templateId, companyId },
        include: { categories: { orderBy: { order: 'asc' } } }
    });
    if (!template) {
        const error = new Error('Rating card template not found or not accessible.');
        error.statusCode = 404;
        throw error;
    }
    return template;
  }

  async updateRatingCardTemplate(userId, companyId, templateId, updateData) {
    await checkCompanyAdminAccess(userId, companyId);
    const { name, description, type, categories, isDefault } = updateData;
    // Simplified update: doesn't handle deep category updates well.
    // For full category updates, might need to delete and recreate categories.
    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (description) dataToUpdate.description = description;
    if (type) dataToUpdate.type = type;
    if (isDefault !== undefined) dataToUpdate.isDefault = isDefault;

    // Handle categories update (simplified: delete old, create new if provided)
    if (type === RatingCardType.CATEGORIZED && categories && Array.isArray(categories)) {
        categories.forEach(cat => {
            if(!cat.name || cat.order === undefined) throw new Error('Each category in update must have a name and order.');
        });
        return prisma.$transaction(async (tx) => {
            const updatedTemplate = await tx.ratingCardTemplate.update({
                where: { id: templateId, companyId },
                data: dataToUpdate
            });
            await tx.ratingCategory.deleteMany({ where: { ratingCardTemplateId: templateId } });
            if (categories.length > 0) {
                await tx.ratingCategory.createMany({
                    data: categories.map(cat => ({
                        ratingCardTemplateId: templateId,
                        name: cat.name,
                        description: cat.description,
                        order: cat.order
                    }))
                });
            }
            return tx.ratingCardTemplate.findUnique({
                where: { id: templateId },
                include: { categories: { orderBy: { order: 'asc' } } }
            });
        });
    } else if (type === RatingCardType.BASIC) { // If switching to BASIC, remove categories
        return prisma.$transaction(async (tx) => {
            const updatedTemplate = await tx.ratingCardTemplate.update({
                where: { id: templateId, companyId },
                data: { ...dataToUpdate, type: RatingCardType.BASIC }
            });
            await tx.ratingCategory.deleteMany({ where: { ratingCardTemplateId: templateId } });
            return tx.ratingCardTemplate.findUnique({
                where: { id: templateId },
                include: { categories: { orderBy: { order: 'asc' } } } // Should be empty
            });
        });
    } else {
         return prisma.ratingCardTemplate.update({
            where: { id: templateId, companyId },
            data: dataToUpdate,
            include: { categories: { orderBy: { order: 'asc' } } }
        });
    }
  }

  async deleteRatingCardTemplate(userId, companyId, templateId) {
    await checkCompanyAdminAccess(userId, companyId);
    // Check if in use by any CandidateRating before deleting.
    try {
        return prisma.ratingCardTemplate.delete({
            where: { id: templateId, companyId }
        });
    } catch (e) {
        if (e.code === 'P2025') {
            const error = new Error('Rating card template not found or not accessible.');
            error.statusCode = 404;
            throw error;
        }
        throw e;
    }
  }

  // --- Candidate Ratings ---
  async submitCandidateRating(raterId, applicationId, ratingData) {
    const jobId = await checkRatingPermission(raterId, applicationId); // Also gets jobId

    const { ratingCardTemplateId, overallScore, comments, categoryScores, jobWorkflowStageId } = ratingData;
    // categoryScores: [{ ratingCategoryId, score, comments }]

    if (!ratingCardTemplateId || overallScore === undefined || !jobWorkflowStageId) {
      throw new Error('ratingCardTemplateId, overallScore, and jobWorkflowStageId are required.');
    }
    if (overallScore < 1 || overallScore > 5) throw new Error('Overall score must be between 1 and 5.');

    const ratingCardTemplate = await prisma.ratingCardTemplate.findUnique({ where: { id: ratingCardTemplateId } });
    if (!ratingCardTemplate) throw new Error('Rating card template not found.');

    if (ratingCardTemplate.type === RatingCardType.CATEGORIZED && (!categoryScores || categoryScores.length === 0)) {
      throw new Error('Category scores are required for a categorized rating card.');
    }
    
    if (categoryScores) {
        for (const cs of categoryScores) {
            if (cs.score < 1 || cs.score > 5) throw new Error(`Category score for ${cs.ratingCategoryId} must be between 1 and 5.`);
            const categoryExists = await prisma.ratingCategory.findFirst({ where: { id: cs.ratingCategoryId, ratingCardTemplateId }});
            if (!categoryExists) throw new Error(`Category ${cs.ratingCategoryId} does not belong to template ${ratingCardTemplateId}.`);
        }
    }

    return prisma.candidateRating.create({
      data: {
        applicationId,
        raterId,
        jobWorkflowStageId, // Stage at which rating is given
        ratingCardTemplateId,
        overallScore,
        comments,
        categoryScores: ratingCardTemplate.type === RatingCardType.CATEGORIZED && categoryScores ? {
          create: categoryScores.map(cs => ({
            ratingCategoryId: cs.ratingCategoryId,
            score: cs.score,
            comments: cs.comments
          }))
        } : undefined
      },
      include: {
        rater: { select: { id: true, firstName: true, lastName: true } },
        ratingCardTemplate: { select: { name: true, type: true } },
        categoryScores: { include: { ratingCategory: { select: { name: true } } } }
      }
    });
  }

  async getRatingsForApplication(userId, applicationId) {
    // User needs to be part of hiring team or admin for the job's company
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        select: { job: { select: { companyId: true } } }
    });
    if (!application) throw new Error('Application not found.');
    await checkCompanyAdminAccess(userId, application.job.companyId, [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER, CompanyMemberRole.REVIEWER]);


    return prisma.candidateRating.findMany({
      where: { applicationId },
      include: {
        rater: { select: { id: true, firstName: true, lastName: true, email: true } },
        ratingCardTemplate: { select: { name: true, type: true } },
        categoryScores: { include: { ratingCategory: { select: { name: true } } } }
      },
      orderBy: { submittedAt: 'desc' }
    });
  }
}

export default new RatingService();