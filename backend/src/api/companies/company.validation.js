import { z } from 'zod';
import pkg from '../../generated/prisma/index.js';
const { CompanyMemberRole } = pkg;

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Company name must be at least 2 characters')
      .max(100, 'Company name must not exceed 100 characters')
      .regex(/^[a-zA-Z0-9\s&-_.]+$/, 'Company name contains invalid characters'),
    website: z.string()
      .url('Invalid website URL format')
      .regex(/^https?:\/\//, 'Website must start with http:// or https://')
      .optional(),
    phoneNumber: z.string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format. Must follow E.164 format')
      .optional(),
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must not exceed 1000 characters')
      .optional(),
    departments: z.array(z.string()
      .min(2, 'Department name must be at least 2 characters')
      .max(50, 'Department name must not exceed 50 characters'))
      .min(1, 'At least one department is required')
      .max(20, 'Maximum 20 departments allowed')
      .optional(),
    industry: z.string()
      .min(2, 'Industry must be at least 2 characters')
      .max(50, 'Industry must not exceed 50 characters')
      .optional(),
    size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'])
      .optional(),
    location: z.object({
      address: z.string().min(5, 'Address must be at least 5 characters').optional(),
      city: z.string().min(2, 'City must be at least 2 characters').optional(),
      country: z.string().length(2, 'Country must be a 2-letter ISO code'),
      postalCode: z.string().regex(/^[A-Z0-9-\s]{3,10}$/, 'Invalid postal code format').optional(),
    }).optional(),
  }),
});

export const updateCompanySchema = createCompanySchema.partial();

export const addCompanyMemberSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    role: z.nativeEnum(CompanyMemberRole),
  }),
  params: z.object({
    companyId: z.string().min(1, 'Company ID is required'),
  }),
});

export const getCompanySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Company ID is required'),
  }),
});