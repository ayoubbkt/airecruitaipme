import { z } from 'zod';

export const createRatingSchema = z.object({
  body: z.object({
    candidateId: z.string()
      .uuid('Invalid candidate ID format'),
    recruiterId: z.string()
      .uuid('Invalid recruiter ID format'),
    score: z.number()
      .min(0, 'Score must be at least 0')
      .max(5, 'Score must not exceed 5')
      .multipleOf(0.5, 'Score must be a multiple of 0.5'),
    feedback: z.string()
      .min(10, 'Feedback must be at least 10 characters')
      .max(2000, 'Feedback must not exceed 2000 characters'),
    category: z.enum(['INTERVIEW', 'TECHNICAL_TEST', 'SOFT_SKILLS', 'OVERALL'], {
      errorMap: () => ({ message: 'Invalid rating category' })
    }),
    jobId: z.string()
      .uuid('Invalid job ID format'),
    criteria: z.array(
      z.object({
        name: z.string()
          .min(3, 'Criterion name must be at least 3 characters')
          .max(50, 'Criterion name must not exceed 50 characters'),
        score: z.number()
          .min(0, 'Criterion score must be at least 0')
          .max(5, 'Criterion score must not exceed 5')
          .multipleOf(0.5, 'Criterion score must be a multiple of 0.5'),
        weight: z.number()
          .min(1, 'Weight must be at least 1')
          .max(5, 'Weight must not exceed 5'),
        comment: z.string()
          .max(500, 'Criterion comment must not exceed 500 characters')
          .optional(),
      })
    )
    .min(1, 'At least one criterion is required')
    .max(10, 'Maximum 10 criteria allowed'),
    strengths: z.array(z.string()
      .min(3, 'Each strength must be at least 3 characters')
      .max(100, 'Each strength must not exceed 100 characters'))
      .max(5, 'Maximum 5 strengths allowed')
      .optional(),
    weaknesses: z.array(z.string()
      .min(3, 'Each weakness must be at least 3 characters')
      .max(100, 'Each weakness must not exceed 100 characters'))
      .max(5, 'Maximum 5 weaknesses allowed')
      .optional(),
    recommendations: z.string()
      .max(1000, 'Recommendations must not exceed 1000 characters')
      .optional(),
    interviewDate: z.string()
      .datetime('Invalid interview date format')
      .refine(date => new Date(date) <= new Date(), 'Interview date cannot be in the future')
      .optional(),
  })
  .refine(data => {
    // Verify that the overall score matches the weighted average of criteria scores
    if (data.criteria && data.criteria.length > 0) {
      const totalWeight = data.criteria.reduce((sum, c) => sum + c.weight, 0);
      const weightedScore = data.criteria.reduce((sum, c) => sum + (c.score * c.weight), 0) / totalWeight;
      return Math.abs(weightedScore - data.score) <= 0.5;
    }
    return true;
  }, {
    message: 'Overall score must be consistent with criteria scores',
    path: ['score'],
  }),
});

export const updateRatingSchema = createRatingSchema.partial();

export const getRatingSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Rating ID is required'),
  }),
});

export const getRatingsSchema = z.object({
  query: z.object({
    candidateId: z.string().optional(),
    recruiterId: z.string().optional(),
    jobId: z.string().optional(),
    category: z.enum(['INTERVIEW', 'TECHNICAL_TEST', 'SOFT_SKILLS', 'OVERALL']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
