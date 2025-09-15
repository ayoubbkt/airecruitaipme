import prisma from '../../config/db.js';
import pkg from '../../generated/prisma/index.js';
const { UserRole, CompanyMemberRole, JobStatus, EmploymentType, WorkType } = pkg;

async function checkCompanyAccess(userId, companyId, allowedRoles = [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER]) {
  
  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });

  if (!membership || !allowedRoles.includes(membership.role)) {
    const platformUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!platformUser || platformUser.role !== UserRole.MEGA_ADMIN) {
      const error = new Error('Forbidden: You do not have sufficient permissions within this company.');
      error.statusCode = 403;
      throw error;
    }
  }
  
  return membership;
}

class JobService {
  async createJob(userId, companyId, jobData) {
    await checkCompanyAccess(userId, companyId);

    const {
      title, description, employmentType, workType,
      salaryMin, salaryMax, currency, payPeriod, displaySalary = true,
      status = JobStatus.DRAFT, jobCode, departmentId, locationId,
      minYearsExperience, skills = { required: [], preferred: [] }, jobBoards = [],
      applicationFormFields, hiringTeam = [], workflowId,
    } = jobData;

    if (!Object.values(EmploymentType).includes(employmentType)) throw new Error(`Invalid employment type: ${employmentType}`);
    if (!Object.values(WorkType).includes(workType)) throw new Error(`Invalid work type: ${workType}`);
    if (!Object.values(JobStatus).includes(status)) throw new Error(`Invalid job status: ${status}`);

    return prisma.$transaction(async (tx) => {
      const job = await tx.job.create({
        data: {
          title,
          description,
          employmentType,
          workType,
          salaryMin: salaryMin ? parseFloat(salaryMin) : null,
          salaryMax: salaryMax ? parseFloat(salaryMax) : null,
          currency,
          payPeriod,
          displaySalary,
          status,
          jobCode,
          companyId,
          departmentId,
          locationId,
          minYearsExperience: minYearsExperience ? parseInt(minYearsExperience) : null,
          applicationForm: {
            create: applicationFormFields ? applicationFormFields.map((field, index) => ({
              fieldName: field.name,
              label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
              fieldType: ['resume', 'coverLetter'].includes(field.name) ? 'FILE' : 'TEXT',
              isRequired: field.required,
              order: index,
            })) : [],
          },
          hiringTeam: {
            create: hiringTeam.map(member => ({
              userId: member.userId,
              role: member.role,
              isExternalRecruiter: member.isExternalRecruiter || false,
            })),
          },
        },
      });

      if (workflowId) {
        const template = await tx.workflowTemplate.findUnique({
          where: { id: workflowId },
          include: { stages: true },
        });

        if (template) {
          const jobWorkflow = await tx.jobWorkflow.create({
            data: {
              jobId: job.id,
              workflowTemplateId: workflowId,
              name: `Workflow for ${title}`,
              stages: {
                create: template.stages.map(stage => ({
                  name: stage.name,
                  type: stage.type,
                  order: stage.order,
                  settings: stage.settings,
                })),
              },
            },
          });
        }
      }

      return tx.job.findUnique({
        where: { id: job.id },
        include: {
          company: { select: { id: true, name: true } },
          department: true,
          location: true,
          hiringTeam: { include: { user: true } },
          jobWorkflow: { include: { stages: true } },
          applicationForm: { include: { customQuestion: true } },
        },
      });
    });
  }

  async getJobById(userId, jobId) {
   
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: { select: { id: true, name: true } },
        department: true,
        location: true,
        hiringTeam: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } },
        jobWorkflow: { include: { stages: true } },
        applicationForm: { include: { customQuestion: true } },
      },
    });

    if (!job) {
      const error = new Error('Job not found.');
      error.statusCode = 404;
      throw error;
    }
    
    await checkCompanyAccess(userId, job.companyId, [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER, CompanyMemberRole.REVIEWER]);
    return job;
  }

  async getJobsByCompany(userId, companyId, queryParams) {
    console.log("queryParams in service:", queryParams);
    console.log("companyId in service:", companyId);
    console.log("userId in service:", userId);
    await checkCompanyAccess(userId, companyId, [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER, CompanyMemberRole.REVIEWER]);

  // Coerce pagination to integers (req.query provides strings)
  let { status, departmentId, locationId, page = 1, limit = 10 } = queryParams;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
    
    const whereClause = { companyId };
    if (status && Object.values(JobStatus).includes(status)) whereClause.status = status;
    if (departmentId) whereClause.departmentId = departmentId;
    if (locationId) whereClause.locationId = locationId;

    const jobs = await prisma.job.findMany({
      where: whereClause,
  skip,
  take: limitNum,
      include: {
        department: { select: { id: true, name: true } },
        location: { select: { id: true, city: true, country: true } },
        applications: {
          select: {
            id: true,
            status: true,
            currentStage: { select: { id: true, name: true, order: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

  const totalJobs = await prisma.job.count({ where: whereClause });

    // Build stats per job
    const data = jobs.map(job => {
      const apps = job.applications || [];
      const total = apps.length;
      const inReview = apps.filter(a => (a.currentStage?.name || '').toLowerCase() === 'initial review').length;
      const inProgress = apps.filter(a => ['phone screen','interview','offer'].includes((a.currentStage?.name || '').toLowerCase())).length;
      const hired = apps.filter(a => (a.currentStage?.name || '').toLowerCase() === 'hired').length;
      return {
        id: job.id,
        title: job.title,
        status: job.status,
        department: job.department ? { id: job.department.id, name: job.department.name } : null,
        location: job.location ? { id: job.location.id, city: job.location.city, country: job.location.country } : null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        stats: { inReview, inProgress, hired, total },
      };
    });

    // Meta lists (distinct)
    const departmentsMeta = [];
    const depSeen = new Set();
    const locationsMeta = [];
    const locSeen = new Set();
    const statusesMeta = new Set();
    data.forEach(j => {
      if (j.department && !depSeen.has(j.department.id)) { depSeen.add(j.department.id); departmentsMeta.push(j.department); }
      if (j.location && !locSeen.has(j.location.id)) { locSeen.add(j.location.id); locationsMeta.push(j.location); }
      statusesMeta.add(j.status);
    });

    return {
      data,
  currentPage: pageNum,
  totalPages: Math.ceil(totalJobs / limitNum),
      totalJobs,
      meta: {
        departments: departmentsMeta,
        locations: locationsMeta,
        statuses: Array.from(statusesMeta)
      }
    };
  }

  async updateJob(userId, jobId, jobData) {
    const existingJob = await prisma.job.findUnique({ where: { id: jobId } });
    if (!existingJob) {
      const error = new Error('Job not found.');
      error.statusCode = 404;
      throw error;
    }
    await checkCompanyAccess(userId, existingJob.companyId);

    const {
      title, description, employmentType, workType,
      salaryMin, salaryMax, currency, payPeriod, displaySalary,
      status, jobCode, departmentId, locationId,
      minYearsExperience, skills = { required: [], preferred: [] }, jobBoards = [],
      applicationFormFields, hiringTeam = [], workflowId,
    } = jobData;

    if (employmentType && !Object.values(EmploymentType).includes(employmentType)) throw new Error(`Invalid employment type: ${employmentType}`);
    if (workType && !Object.values(WorkType).includes(workType)) throw new Error(`Invalid work type: ${workType}`);
    if (status && !Object.values(JobStatus).includes(status)) throw new Error(`Invalid job status: ${status}`);

    return prisma.$transaction(async (tx) => {
      // Update base job fields and application form
      await tx.job.update({
        where: { id: jobId },
        data: {
          title,
          description,
          employmentType,
          workType,
          salaryMin: salaryMin ? parseFloat(salaryMin) : null,
          salaryMax: salaryMax ? parseFloat(salaryMax) : null,
          currency,
          payPeriod,
          displaySalary,
          status,
          jobCode,
          departmentId,
          locationId,
          minYearsExperience: minYearsExperience ? parseInt(minYearsExperience) : null,
          applicationForm: {
            upsert: applicationFormFields ? applicationFormFields.map((field, index) => ({
              where: { id: field.id || '' },
              update: { isRequired: field.required },
              create: { fieldName: field.name, label: field.name.charAt(0).toUpperCase() + field.name.slice(1), fieldType: ['resume', 'coverLetter'].includes(field.name) ? 'FILE' : 'TEXT', isRequired: field.required, order: index },
            })) : [],
          },
        },
      });

      // Replace hiring team safely: only existing users, no placeholder IDs
      if (Array.isArray(hiringTeam)) {
        const ids = Array.from(new Set(hiringTeam.map(m => m.userId).filter(Boolean)));
        // Validate user existence
        const existingUsers = ids.length ? await tx.user.findMany({ where: { id: { in: ids } }, select: { id: true } }) : [];
        const valid = new Set(existingUsers.map(u => u.id));
        const validMembers = hiringTeam.filter(m => m.userId && valid.has(m.userId));

        // Clear and recreate
        await tx.jobHiringMember.deleteMany({ where: { jobId } });
        if (validMembers.length) {
          await tx.jobHiringMember.createMany({
            data: validMembers.map(m => ({ jobId, userId: m.userId, role: m.role, isExternalRecruiter: !!m.isExternalRecruiter }))
          });
        }
      }

      // Upsert job workflow assignment if provided
      if (workflowId) {
        await tx.jobWorkflow.upsert({
          where: { jobId },
          update: { workflowTemplateId: workflowId },
          create: { jobId, workflowTemplateId: workflowId, name: `Workflow for ${title || existingJob.title}` },
        });
      }

      // Return full job with relations
      return tx.job.findUnique({
        where: { id: jobId },
        include: {
          company: { select: { id: true, name: true } },
          department: true,
          location: true,
          hiringTeam: { include: { user: true } },
          jobWorkflow: { include: { stages: true } },
          applicationForm: { include: { customQuestion: true } },
        },
      });
    });
  }

  async deleteJob(userId, jobId) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      const error = new Error('Job not found.');
      error.statusCode = 404;
      throw error;
    }
    await checkCompanyAccess(userId, job.companyId);

    await prisma.job.delete({ where: { id: jobId } });
    return { message: 'Job deleted successfully.' };
  }

  async addHiringMember(userId, jobId, memberData) {
    const { memberUserId, role } = memberData;
    const job = await this.getJobById(userId, jobId);

    if (!Object.values(CompanyMemberRole).includes(role)) {
      const error = new Error(`Invalid role for hiring member: ${role}`);
      error.statusCode = 400;
      throw error;
    }

    const companyMember = await prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId: job.companyId, userId: memberUserId } },
    });
    if (!companyMember) {
      const error = new Error('User to be added is not a member of this company.');
      error.statusCode = 400;
      throw error;
    }

    const existingHiringMember = await prisma.jobHiringMember.findUnique({
      where: { jobId_userId: { jobId, userId: memberUserId } },
    });
    if (existingHiringMember) {
      const error = new Error('User is already a hiring member for this job.');
      error.statusCode = 409;
      throw error;
    }

    return prisma.jobHiringMember.create({
      data: { jobId, userId: memberUserId, role },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
  }

  async removeHiringMember(userId, jobId, memberToRemoveId) {
    await this.getJobById(userId, jobId);
    try {
      await prisma.jobHiringMember.delete({
        where: { jobId_userId: { jobId, userId: memberToRemoveId } },
      });
      return { message: 'Hiring member removed successfully.' };
    } catch (e) {
      if (e.code === 'P2025') {
        const error = new Error('Hiring member not found for this job.');
        error.statusCode = 404;
        throw error;
      }
      throw e;
    }
  }

  async getHiringTeam(userId, jobId) {
    await this.getJobById(userId, jobId);
    return prisma.jobHiringMember.findMany({
      where: { jobId },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, jobTitle: true } } },
      orderBy: { user: { firstName: 'asc' } },
    });
  }

  async findByTitle(title)  {
  // Votre logique pour trouver un poste par son titre
  return db.job.findFirst({ where: { title: { contains: title, mode: 'insensitive' } } });
};
}

export default new JobService();