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

    const job = await prisma.job.create({
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
            userId: member.userId || `temp-${Date.now()}`,
            role: member.role,
            isExternalRecruiter: member.isExternalRecruiter || false,
          })),
        },
        jobWorkflow: workflowId ? { create: { workflowTemplateId: workflowId, name: `Workflow for ${title}` } } : undefined,
      },
      include: {
        company: { select: { id: true, name: true } },
        department: true,
        location: true,
        hiringTeam: { include: { user: true } },
        jobWorkflow: { include: { stages: true } },
        applicationForm: { include: { customQuestion: true } },
      },
    });
    return job;
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
    await checkCompanyAccess(userId, companyId, [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER, CompanyMemberRole.REVIEWER]);

    const { status, departmentId, locationId, page = 1, limit = 10 } = queryParams;
    const skip = (page - 1) * limit;
    
    const whereClause = { companyId };
    if (status && Object.values(JobStatus).includes(status)) whereClause.status = status;
    if (departmentId) whereClause.departmentId = departmentId;
    if (locationId) whereClause.locationId = locationId;

    const jobs = await prisma.job.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        department: { select: { name: true } },
        location: { select: { city: true, country: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalJobs = await prisma.job.count({ where: whereClause });

    return {
      data: jobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
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

    const updatedJob = await prisma.job.update({
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
        hiringTeam: {
          upsert: hiringTeam.map(member => ({
            where: { jobId_userId: { jobId, userId: member.userId || `temp-${Date.now()}` } },
            update: { role: member.role, isExternalRecruiter: member.isExternalRecruiter || false },
            create: { userId: member.userId || `temp-${Date.now()}`, role: member.role, isExternalRecruiter: member.isExternalRecruiter || false },
          })),
        },
        jobWorkflow: workflowId ? { upsert: { where: { jobId }, update: { workflowTemplateId: workflowId }, create: { workflowTemplateId: workflowId, name: `Workflow for ${title}` } } } : undefined,
      },
      include: {
        company: { select: { id: true, name: true } },
        department: true,
        location: true,
        hiringTeam: { include: { user: true } },
        jobWorkflow: { include: { stages: true } },
        applicationForm: { include: { customQuestion: true } },
      },
    });
    return updatedJob;
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
}

export default new JobService();