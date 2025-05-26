// src/api/auth/auth.controller.js
import AuthService from './auth.service.js';

class AuthController {
  async register(req, res, next) {
    try {
      // La validation a déjà été faite par le middleware
      const user = await AuthService.register(req.body);
      res.status(201).json({
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      console.log('Login attempt with email:', email);
      console.log('Login attempt with password:', password);
      // La validation a déjà été faite par le middleware
      const { user, token } = await AuthService.login(email, password);
      res.status(200).json({
        message: 'Login successful',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      if (!req.user) {
        const error = new Error('User not found or not authenticated.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Current user data fetched successfully',
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();