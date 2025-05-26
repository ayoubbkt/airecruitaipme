// src/api/auth/auth.routes.js
import express from 'express';
import AuthController from './auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js'; // Importez le middleware
import { registerSchema, loginSchema } from './auth.validation.js'; // Importez les schémas

const router = express.Router();

router.post('/register', validate(registerSchema), AuthController.register); // Utilisez le middleware
router.post('/login', validate(loginSchema), AuthController.login);       // Utilisez le middleware
router.get('/me', protect, AuthController.getMe);

export default router;