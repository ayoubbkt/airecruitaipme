import prisma from '../../config/db.js';
import pkg from '../../generated/prisma/index.js';
const { UserRole, CompanyMemberRole, StageType } = pkg;

// Helper to check company admin access
async function checkCompanyAdminAccess(userId, companyId) {
  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });
  const platformUser = await prisma.user.findUnique({ where: { id: userId } });

  if (platformUser?.role === UserRole.MEGA_ADMIN) return true; // MEGA_ADMIN has access
  if (!membership || membership.role !== CompanyMemberRole.RECRUITING_ADMIN) {
    const error = new Error('Forbidden: You must be a Recruiting Admin for this company.');
    error.statusCode = 403;
    throw error;
  }
  return true;
}

// Helper to check company access for non-admin features
async function checkCompanyAccess(userId, companyId, allowedRoles) {
  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });
  const platformUser = await prisma.user.findUnique({ where: { id: userId } });
  if (platformUser?.role === UserRole.MEGA_ADMIN) return true;
  if (!membership || !allowedRoles.includes(membership.role)) {
    const error = new Error('Forbidden: You do not have access to this company.');
    error.statusCode = 403;
    throw error;
  }
  return true;
}

class WorkflowService {
  // --- Workflow Templates (Company Level) ---
  async createWorkflowTemplate(userId, companyId, templateData) {
    await checkCompanyAdminAccess(userId, companyId);
  let { name, stages, isDefault = false } = templateData; // stages: [{ name, type, order, settings, visibilityToReviewers }]

    if (!name) {
        const error = new Error('Template name is required.');
        error.statusCode = 400;
        throw error;
    }
    // If no stages provided, copy from company's default or use preset
    if (!stages || !Array.isArray(stages) || stages.length === 0) {
      const defaultTpl = await prisma.workflowTemplate.findFirst({
        where: { companyId, isDefault: true },
        include: { stages: { orderBy: { order: 'asc' } } },
      });
  if (defaultTpl && defaultTpl.stages.length >= 9) {
        stages = defaultTpl.stages.map((s) => ({
          name: s.name,
          type: s.type,
          order: s.order,
          settings: s.settings || {},
          visibilityToReviewers: s.visibilityToReviewers || false,
          isDefault: s.isDefault || false,
          canBeDeleted: s.canBeDeleted,
        }));
      } else {
        // fallback preset matching requested UI
        stages = [
          { name: 'Leads', type: StageType.LEADS, order: 0, isDefault: true, canBeDeleted: false },
          { name: 'Applicants', type: StageType.APPLIED, order: 1, isDefault: true, canBeDeleted: false },
          { name: 'Short List Review', type: StageType.REVIEW, order: 2, canBeDeleted: true },
          { name: 'Screening Call', type: StageType.INTERVIEW, order: 3, canBeDeleted: true },
          { name: 'Initial Interview', type: StageType.INTERVIEW, order: 4, canBeDeleted: true },
          { name: 'Review', type: StageType.REVIEW, order: 5, canBeDeleted: true },
          { name: 'Offer', type: StageType.OFFER, order: 6, canBeDeleted: true },
          { name: 'Disqualified', type: StageType.DISQUALIFIED, order: 7, isDefault: true, canBeDeleted: false },
          { name: 'Archived', type: StageType.ARCHIVED, order: 8, isDefault: true, canBeDeleted: false },
        ];
      }
    }
    
    // Validate stage types and order
  stages.forEach(stage => {
        if (!stage.name || !stage.type || stage.order === undefined) {
            const error = new Error('Each stage must have a name, type, and order.');
            error.statusCode = 400;
            throw error;
        }
        if (!Object.values(StageType).includes(stage.type)) {
            const error = new Error(`Invalid stage type: ${stage.type}`);
            error.statusCode = 400;
            throw error;
        }
    });

    // Attempt to create; if duplicate name for the company, append a number suffix automatically
    const attemptCreate = async (templateName) => prisma.workflowTemplate.create({
      data: {
        name: templateName,
        companyId,
        isDefault,
        stages: {
          create: stages.map(s => ({
            name: s.name,
            type: s.type,
            order: s.order,
            settings: s.settings || {},
            visibilityToReviewers: s.visibilityToReviewers || false,
            isDefault: s.isDefault || false,
            canBeDeleted: s.canBeDeleted === undefined ? true : s.canBeDeleted
          }))
        }
      },
      include: { stages: { orderBy: { order: 'asc' } } }
    });

    try {
      return await attemptCreate(name);
    } catch (e) {
      if (e.code === 'P2002' && e.meta?.target?.includes('companyId') && e.meta?.target?.includes('name')) {
        // generate a unique name by appending an incrementing suffix
        let suffix = 2;
        while (true) {
          const candidate = `${name} ${suffix}`;
          const exists = await prisma.workflowTemplate.findFirst({ where: { companyId, name: candidate }, select: { id: true } });
          if (!exists) {
            return await attemptCreate(candidate);
          }
          suffix += 1;
          if (suffix > 100) throw e; // safety break
        }
      }
      throw e;
    }
  }

  async getWorkflowTemplateById(userId, companyId, templateId) {
    await checkCompanyAdminAccess(userId, companyId);
     
    const template = await prisma.workflowTemplate.findUnique({
      where: { id: templateId, companyId }, // Ensure it belongs to the company
      include: { stages: { orderBy: { order: 'asc' } } }
    });
    if (!template) {
      const error = new Error('Workflow template not found or not accessible.');
      error.statusCode = 404;
      throw error;
    }
    return template;
  }
  
  async getWorkflowTemplatesByCompany(userId, companyId) {
    await checkCompanyAdminAccess(userId, companyId);
    return prisma.workflowTemplate.findMany({
        where: { companyId },
        include: { _count: { select: { stages: true } }, stages: { orderBy: { order: 'asc' }, take: 3 } }, // Preview a few stages
        orderBy: { name: 'asc' }
    });
  }

  async updateWorkflowTemplate(userId, companyId, templateId, updateData) {
    await checkCompanyAdminAccess(userId, companyId);
    const { name, stages, isDefault } = updateData; // stages can be complex to update

    // For simplicity, this update focuses on name and isDefault.
    // Updating stages would require more logic (add, remove, reorder, update existing).
    // A common pattern is to delete existing stages and recreate them if the structure changes significantly.
    
    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (isDefault !== undefined) dataToUpdate.isDefault = isDefault;

    // If stages are provided, handle them (this is a simplified version)
    if (stages && Array.isArray(stages)) {
        // Basic validation for stages
        stages.forEach(stage => {
            if (!stage.name || !stage.type || stage.order === undefined) {
                throw new Error('Each stage in update must have a name, type, and order.');
            }
            if (!Object.values(StageType).includes(stage.type)) {
                throw new Error(`Invalid stage type: ${stage.type}`);
            }
        });

        // Transaction to update template and its stages
        return prisma.$transaction(async (tx) => {
            const updatedTemplate = await tx.workflowTemplate.update({
                where: { id: templateId, companyId },
                data: dataToUpdate,
            });

            // Delete existing stages and recreate (simplistic approach)
            await tx.workflowStageTemplate.deleteMany({ where: { workflowTemplateId: templateId } });
            await tx.workflowStageTemplate.createMany({
                data: stages.map(s => ({
                    workflowTemplateId: templateId,
                    name: s.name,
                    type: s.type,
                    order: s.order,
                    settings: s.settings || {},
                    visibilityToReviewers: s.visibilityToReviewers || false,
                    isDefault: s.isDefault || false,
                    canBeDeleted: s.canBeDeleted === undefined ? true : s.canBeDeleted
                }))
            });
            
            return tx.workflowTemplate.findUnique({
                where: { id: templateId },
                include: { stages: { orderBy: { order: 'asc' } } }
            });
        });
    } else {
        return prisma.workflowTemplate.update({
            where: { id: templateId, companyId },
            data: dataToUpdate,
            include: { stages: { orderBy: { order: 'asc' } } }
        });
    }
  }

  async deleteWorkflowTemplate(userId, companyId, templateId) {
    await checkCompanyAdminAccess(userId, companyId);
    // Check if template is in use by any JobWorkflow before deleting, or handle cascading deletes.
    // For now, direct delete:
    try {
        return prisma.workflowTemplate.delete({
            where: { id: templateId, companyId }
        });
    } catch (e) {
        if (e.code === 'P2025') {
            const error = new Error('Workflow template not found or not accessible.');
            error.statusCode = 404;
            throw error;
        }
        throw e;
    }
  }

  async addStageToTemplate(userId, companyId, templateId, stageData) {
    await checkCompanyAdminAccess(userId, companyId);
    const { name, type, order, settings, visibilityToReviewers, isDefault, canBeDeleted } = stageData;
    if (!name || !type) {
      const error = new Error('Stage name and type are required.');
      error.statusCode = 400;
      throw error;
    }
    if (!Object.values(StageType).includes(type)) {
      const error = new Error(`Invalid stage type: ${type}`);
      error.statusCode = 400;
      throw error;
    }
    // Determine order: next after max
    const last = await prisma.workflowStageTemplate.findFirst({
      where: { workflowTemplateId: templateId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const nextOrder = order ?? ((last?.order ?? -1) + 1);
    const created = await prisma.workflowStageTemplate.create({
      data: {
        workflowTemplateId: templateId,
        name,
        type,
        order: nextOrder,
        settings: settings || {},
        visibilityToReviewers: visibilityToReviewers ?? false,
        isDefault: !!isDefault,
        canBeDeleted: canBeDeleted === undefined ? true : !!canBeDeleted,
      },
    });
    return created;
  }

  async reorderTemplateStages(userId, companyId, templateId, orderArray) {
    await checkCompanyAdminAccess(userId, companyId);
    if (!Array.isArray(orderArray) || orderArray.length === 0) {
      const error = new Error('Order array is required.');
      error.statusCode = 400;
      throw error;
    }
    // Validate that all IDs belong to the template and arrays match exactly
    const stages = await prisma.workflowStageTemplate.findMany({ where: { workflowTemplateId: templateId }, select: { id: true, order: true } });
    const currentIds = stages.map(s => s.id);
    const stageIdsSet = new Set(currentIds);
    if (orderArray.length !== currentIds.length) {
      const error = new Error('Order array must include all stage IDs.');
      error.statusCode = 400;
      throw error;
    }
    for (const id of orderArray) {
      if (!stageIdsSet.has(id)) {
        const error = new Error(`Stage ${id} does not belong to template.`);
        error.statusCode = 400;
        throw error;
      }
    }
    // Two-phase update to avoid unique (workflowTemplateId, order) conflicts
    await prisma.$transaction(async (tx) => {
      // Phase 1: assign unique temporary orders to all current stages
      for (let i = 0; i < currentIds.length; i += 1) {
        const id = currentIds[i];
        await tx.workflowStageTemplate.update({ where: { id }, data: { order: 1000 + i } });
      }
      // Phase 2: set final normalized order based on the requested array
      for (let idx = 0; idx < orderArray.length; idx += 1) {
        const id = orderArray[idx];
        await tx.workflowStageTemplate.update({ where: { id }, data: { order: idx } });
      }
    });
    return prisma.workflowStageTemplate.findMany({ where: { workflowTemplateId: templateId }, orderBy: { order: 'asc' } });
  }

  async ensureAndGetDefaultTemplate(userId, companyId) {
    await checkCompanyAdminAccess(userId, companyId);
    const existing = await prisma.workflowTemplate.findFirst({
      where: { companyId, isDefault: true },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
    if (existing) return existing;
    // Create default with requested stages
    return prisma.workflowTemplate.create({
      data: {
        name: 'Workflow par défaut',
        companyId,
        isDefault: true,
        stages: {
          create: [
            { name: 'Leads', type: StageType.LEADS, order: 0, isDefault: true, canBeDeleted: false },
            { name: 'Applicants', type: StageType.APPLIED, order: 1, isDefault: true, canBeDeleted: false },
            { name: 'Short List Review', type: StageType.REVIEW, order: 2 },
            { name: 'Screening Call', type: StageType.INTERVIEW, order: 3 },
            { name: 'Initial Interview', type: StageType.INTERVIEW, order: 4 },
            { name: 'Review', type: StageType.REVIEW, order: 5 },
            { name: 'Offer', type: StageType.OFFER, order: 6 },
            { name: 'Disqualified', type: StageType.DISQUALIFIED, order: 7, isDefault: true, canBeDeleted: false },
            { name: 'Archived', type: StageType.ARCHIVED, order: 8, isDefault: true, canBeDeleted: false },
          ],
        },
      },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
  }

  // --- Job Workflow Instance ---
  // This would typically be created when a job is created, or assigned later.
  async assignWorkflowToJob(userId, companyId, jobId, templateId) {
    await checkCompanyAdminAccess(userId, companyId); // User needs company admin rights

    const job = await prisma.job.findUnique({ where: { id: jobId, companyId } });
    if (!job) {
      const error = new Error('Job not found or does not belong to this company.');
      error.statusCode = 404;
      throw error;
    }

    const template = await prisma.workflowTemplate.findUnique({
      where: { id: templateId, companyId },
      include: { stages: true }
    });
    if (!template) {
      const error = new Error('Workflow template not found or does not belong to this company.');
      error.statusCode = 404;
      throw error;
    }

    // Create or update JobWorkflow
    return prisma.jobWorkflow.upsert({
      where: { jobId },
      create: {
        jobId,
        workflowTemplateId: templateId,
        name: `Workflow for ${job.title} (from ${template.name})`,
        stages: {
          create: template.stages.map(ts => ({
            name: ts.name,
            type: ts.type,
            order: ts.order,
            settings: ts.settings // Copy settings from template
          }))
        }
      },
      update: { // If re-assigning, clear old stages and create new ones
        workflowTemplateId: templateId,
        name: `Workflow for ${job.title} (from ${template.name})`,
        stages: {
          deleteMany: {}, // Delete existing job-specific stages
          create: template.stages.map(ts => ({
            name: ts.name,
            type: ts.type,
            order: ts.order,
            settings: ts.settings
          }))
        }
      },
      include: { stages: { orderBy: { order: 'asc' } } }
    });
  }

  async getJobWorkflow(userId, jobId) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { companyId: true } });
    if (!job) {
      const error = new Error('Job not found.');
      error.statusCode = 404;
      throw error;
    }
    // User needs to be at least a reviewer in the company to see the job's workflow
    await checkCompanyAccess(userId, job.companyId, [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER, CompanyMemberRole.REVIEWER]);

    const jobWorkflow = await prisma.jobWorkflow.findUnique({
      where: { jobId },
      include: { stages: { orderBy: { order: 'asc' } } }
    });
    if (!jobWorkflow) {
      const error = new Error('No workflow assigned to this job.');
      error.statusCode = 404;
      throw error;
    }
    return jobWorkflow;
  }

  async updateJobWorkflowStageSettings(userId, jobId, jobWorkflowStageId, newSettings) {
    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { companyId: true } });
     if (!job) {
      const error = new Error('Job not found.');
      error.statusCode = 404;
      throw error;
    }
    await checkCompanyAdminAccess(userId, job.companyId); // Only company admins can change stage settings

    return prisma.jobWorkflowStage.update({
        where: { id: jobWorkflowStageId /* Add check for jobWorkflowId to ensure it's for the correct job */ },
        data: { settings: newSettings }, // newSettings should be a JSON object
    });
  }

  // TODO: moveCandidateToStage(applicationId, targetStageId) - complex, involves application updates
}

export default new WorkflowService();