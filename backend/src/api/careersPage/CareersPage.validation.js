import { z } from 'zod';

export const updateCareersPageSettingsSchema = z.object({
  body: z.object({
    companyId: z.string().min(1, 'Company ID is required'),
    brandingSettings: z.object({
      primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
      secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
      logo: z.string().url().optional(),
      bannerImage: z.string().url().optional(),
      companyDescription: z.string().optional(),
      cultura: z.array(z.string()).optional(),
    }).optional(),
    displaySettings: z.object({
      showSalaryRange: z.boolean().optional(),
      showBenefits: z.boolean().optional(),
      showLocation: z.boolean().optional(),
      customFields: z.array(z.object({
        name: z.string(),
        value: z.string(),
      })).optional(),
    }).optional(),
  }),
});