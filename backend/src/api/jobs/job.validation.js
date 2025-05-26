import { z } from 'zod';
import pkg from '../../generated/prisma/index.js';
const { EmploymentType, WorkType, JobStatus } = pkg;

export const createJobSchema = z.object({
  body: z.object({
    title: z.string()
      .min(5, 'Job title must be at least 5 characters')
      .max(100, 'Job title must not exceed 100 characters')
      .regex(/^[\w\s-]+$/, 'Job title contains invalid characters'),
    description: z.string()
      .min(50, 'Job description must be at least 50 characters')
      .max(5000, 'Job description must not exceed 5000 characters'),
    employmentType: z.nativeEnum(EmploymentType, {
      errorMap: () => ({ message: 'Invalid employment type' })
    }),
    workType: z.nativeEnum(WorkType, {
      errorMap: () => ({ message: 'Invalid work type' })
    }),
    salaryMin: z.number()
      .positive('Minimum salary must be positive')
      .min(1000, 'Minimum salary must be at least 1000')
      .optional(),
    salaryMax: z.number()
      .positive('Maximum salary must be positive')
      .optional(),
    currency: z.string()
      .regex(/^[A-Z]{3}$/, 'Currency must be a 3-letter ISO code')
      .optional(),
    departmentName: z.string()
      .min(2, 'Department name must be at least 2 characters')
      .max(50, 'Department name must not exceed 50 characters')
      .optional(),
    location: z.object({
      city: z.string().min(2, 'City must be at least 2 characters').optional(),
      country: z.string().length(2, 'Country must be a 2-letter ISO code'),
      remote: z.boolean().optional(),
      timezone: z.string().regex(/^[A-Z][a-z]+\/[A-Z][a-z]+$/, 'Invalid timezone format').optional(),
    }).optional(),
    requirements: z.array(
      z.string()
        .min(5, 'Each requirement must be at least 5 characters')
        .max(200, 'Each requirement must not exceed 200 characters')
    )
      .min(1, 'At least one requirement is required')
      .max(15, 'Maximum 15 requirements allowed'),
    responsibilities: z.array(
      z.string()
        .min(5, 'Each responsibility must be at least 5 characters')
        .max(200, 'Each responsibility must not exceed 200 characters')
    )
      .min(1, 'At least one responsibility is required')
      .max(15, 'Maximum 15 responsibilities allowed'),
    skills: z.array(
      z.string()
        .min(2, 'Each skill must be at least 2 characters')
        .max(30, 'Each skill must not exceed 30 characters')
    )
      .min(1, 'At least one skill is required')
      .max(20, 'Maximum 20 skills allowed')
      .optional(),
    experienceLevel: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER'])
      .optional(),
    deadline: z.string()
      .datetime('Invalid deadline date format')
      .refine(date => new Date(date) > new Date(), 'Deadline must be in the future')
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
    id: z.string().min(1, 'Job ID is required'),
  }),
});