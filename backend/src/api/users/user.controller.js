import UserService from './user.service.js';
import pkg from '@prisma/client';
const { UserRole } = pkg;

class UserController {
  async getMyProfile(req, res, next) { // User gets their own profile
    try {
      const user = await UserService.getUserById(req.user.id);
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateMyProfile(req, res, next) { // User updates their own profile
    try {
      // TODO: Add validation for req.body
      const updatedUser = await UserService.updateUserProfile(req.user.id, req.body);
      res.status(200).json({ message: 'Profile updated successfully', data: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async changeMyPassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      // TODO: Add validation (e.g. newPassword complexity)
      if (!oldPassword || !newPassword) {
        const error = new Error('Old and new passwords are required.');
        error.statusCode = 400;
        throw error;
      }
      const result = await UserService.changePassword(req.user.id, oldPassword, newPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Admin specific
  async getUserById(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  }
  
  async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const users = await UserService.getAllUsers(page, limit);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();