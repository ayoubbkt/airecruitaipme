import express from 'express';
import CareersPageController from './careersPage.controller.js';
import { protect } from '../../middleware/auth.middleware.js'; // Needed for management routes

const router = express.Router();

// Management routes (require auth) - typically scoped by company
// e.g., /api/v1/companies/:companyId/careers-page/settings
router.get('/companies/:companyId/settings', protect, CareersPageController.getMyCompanyCareersPageSettings);
router.put('/companies/:companyId/settings', protect, CareersPageController.updateMyCompanyCareersPageSettings);

// Public route for candidates to view a company's careers page
// The :companyIdOrSubdomain would be used to identify the company
// e.g., careers.megahr.com/mycompany or mycompany.megahr.com or /public/careers/companyId123
router.get('/public/:companyIdOrSubdomain', CareersPageController.getPublicCareersPageInfo);

export default router;