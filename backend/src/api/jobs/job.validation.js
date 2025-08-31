import { z } from 'zod';
import pkg from '../../generated/prisma/index.js';
const { EmploymentType, WorkType, JobStatus, CompanyMemberRole } = pkg;

export const createJobSchema = z.object({
  body: z.object({
    title: z.string()
      .min(5, 'Job title must be at least 5 characters')
      .max(100, 'Job title must not exceed 100 characters')
      .regex(/^[\w\s-]+$/, 'Job title contains invalid characters'),
    description: z.string()
      .min(50, 'Job description must be at least 50 characters')
      .max(5000, 'Job description must not exceed 5000 characters'),
    employmentType: z.nativeEnum(EmploymentType, { errorMap: () => ({ message: 'Invalid employment type' }) }),
    workType: z.nativeEnum(WorkType, { errorMap: () => ({ message: 'Invalid work type' }) }),
    salaryMin: z.number()
      .positive('Minimum salary must be positive')
      .min(1000, 'Minimum salary must be at least 1000')
      .nullable()
      .optional(),
    salaryMax: z.number()
      .positive('Maximum salary must be positive')
      .nullable()
      .optional(),
    currency: z.string()
      .regex(/^[A-Z]{3}$/, 'Currency must be a 3-letter ISO code')
      .optional(),
    payPeriod: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'ANNUAL']).optional(),
    displaySalary: z.boolean().optional(),
    status: z.nativeEnum(JobStatus, { errorMap: () => ({ message: 'Invalid job status' }) }).optional(),
    departmentId: z.string().optional(),
    locationId: z.string().optional(),
    minYearsExperience: z.number()
      .int()
      .min(0)
      .nullable()
      .optional(),
    requiredSkills: z.array(z.string().min(2).max(30)).optional(),
    preferredSkills: z.array(z.string().min(2).max(30)).optional(),
    applicationFields: z.record(z.object({ required: z.boolean() })).optional(),
    hiringTeam: z.array(z.object({
      userId: z.string().optional(),
      role: z.nativeEnum(CompanyMemberRole),
      isExternalRecruiter: z.boolean().optional().default(false),
    })).optional(),
    workflowId: z.string().optional(),
    jobBoards: z.array(z.object({
      id: z.string().optional(),
      price: z.number().optional().default(0),
    })).optional(),
    jobCode: z.string()
      .max(50, 'Job code must not exceed 50 characters')
      .regex(/^[\w-]+$/,'Job code contains invalid characters')
      .optional(),
  }).refine(data => {
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMax > data.salaryMin;
    }
    return true;
  }, {
    message: 'Maximum salary must be greater than minimum salary',
    path: ['salaryMax'],
  }),
});

export const updateJobSchema = createJobSchema.partial();

export const getJobsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.nativeEnum(JobStatus).optional(),
    companyId: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const getJobByIdSchema = z.object({
  params: z.object({
    companyId: z.string().regex(/^[a-z0-9]{25}$/, 'Invalid company ID format'),
    jobId: z.string().regex(/^[a-z0-9]{25}$/, 'Invalid job ID format'),
  }),
});