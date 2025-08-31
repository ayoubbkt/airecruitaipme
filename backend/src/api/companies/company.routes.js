import express from 'express';
import CompanyController from './company.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createCompanySchema,
  updateCompanySchema,
  addCompanyMemberSchema,
  getCompanySchema,
  createDepartmentSchema, updateDepartmentSchema, createLocationSchema, updateLocationSchema
} from './company.validation.js';
import pkg from '../../generated/prisma/index.js';
const { UserRole } = pkg;

const router = express.Router();

router.use(protect); // All company routes require authentication

router.get('/my-companies', CompanyController.getUserCompanies); // Get companies current user is part of

// router.get('/:companyId', CompanyController.getCompanyById);
router.get('/:id', protect, validate(getCompanySchema), CompanyController.getCompanyById);

router.use(protect, authorize([UserRole.ADMIN, UserRole.MEGA_ADMIN]));

router.post('/', validate(createCompanySchema), CompanyController.createCompany);
router.put('/:id', validate(updateCompanySchema), CompanyController.updateCompany);
router.post('/:companyId/members', validate(addCompanyMemberSchema), CompanyController.addMemberToCompany);

// router.post('/:companyId/members', CompanyController.addMemberToCompany);

router.get('/:companyId/members', CompanyController.getCompanyMembers);
router.delete('/:companyId/members/:memberId', CompanyController.removeMemberFromCompany);

// TODO: Add routes for Departments and Locations within a company context
// e.g., POST /:companyId/departments, GET /:companyId/departments
// e.g., POST /:companyId/locations, GET /:companyId/locations


router.get('/:companyId/departments', CompanyController.getDepartments);
router.post('/:companyId/departments', validate(createDepartmentSchema), CompanyController.createDepartment);
router.put('/:companyId/departments/:departmentId', validate(updateDepartmentSchema), CompanyController.updateDepartment);
router.delete('/:companyId/departments/:departmentId', CompanyController.deleteDepartment);

// Routes pour les emplacements
router.get('/:companyId/locations', CompanyController.getCompanyLocations);
router.post('/:companyId/locations', validate(createLocationSchema), CompanyController.addCompanyLocation);
router.put('/:companyId/locations/:locationId', validate(updateLocationSchema), CompanyController.updateCompanyLocation);
router.delete('/:companyId/locations/:locationId', CompanyController.deleteCompanyLocation);

export default router;