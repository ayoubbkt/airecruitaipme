import express from 'express';
import UserController from './user.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  getUserByIdSchema,
  getAllUsersSchema
} from './user.validation.js';
import pkg from '../../generated/prisma/index.js';
const { UserRole } = pkg;

const router = express.Router();

// Routes for the authenticated user acting on their own profile
router.get('/me', protect, UserController.getMyProfile);
router.put('/me', protect, validate(updateProfileSchema), UserController.updateMyProfile);
router.patch('/me/change-password', protect, validate(changePasswordSchema), UserController.changeMyPassword);

// Admin routes (example: MEGA_ADMIN can access all users)
router.get('/', protect, authorize(UserRole.MEGA_ADMIN), validate(getAllUsersSchema), UserController.getAllUsers);
router.get('/:id', protect, authorize(UserRole.MEGA_ADMIN), validate(getUserByIdSchema), UserController.getUserById);
// Add PUT /:id, DELETE /:id for admin user management if needed

export default router;