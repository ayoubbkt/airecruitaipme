import { z } from 'zod';
import pkg from '../../generated/prisma/index.js';
const { RatingCardType } = pkg;

export const createRatingTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Template name is required'),
    type: z.nativeEnum(RatingCardType),
    description: z.string().optional(),
    categories: z.array(z.object({
      name: z.string().min(1, 'Category name is required'),
      weight: z.number().min(0).max(100),
      criteria: z.array(z.string()),
    })),
  }),
});

export const submitCandidateRatingSchema = z.object({
  params: z.object({
    candidateId: z.string().min(1, 'Candidate ID is required'),
  }),
  body: z.object({
    templateId: z.string().min(1, 'Template ID is required'),
    overallScore: z.number().min(0).max(5),
    recommendation: z.string().min(1, 'Recommendation is required'),
    categoryScores: z.array(z.object({
      categoryId: z.string().min(1, 'Category ID is required'),
      score: z.number().min(0).max(5),
      comments: z.string().optional(),
    })),
    comments: z.string().optional(),
  }),
});