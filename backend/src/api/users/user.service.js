import prisma from '../../config/db.js';
import { hashPassword } from '../../utils/passwordUtils.js';
import { z } from 'zod';

class UserService {
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, email: true, firstName: true, lastName: true, role: true, jobTitle: true, departmentName: true,
        profile: true, // Include UserProfile
        createdAt: true, updatedAt: true 
      }
    });
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async updateUserProfile(userId, profileData) {
    const { firstName, lastName, jobTitle, departmentName, /* other profile fields */ } = profileData;
    
    // Update User model fields
    const userUpdateData = {};
    if (firstName) userUpdateData.firstName = firstName;
    if (lastName) userUpdateData.lastName = lastName;
    if (jobTitle) userUpdateData.jobTitle = jobTitle; // Assuming these are on User model now
    if (departmentName) userUpdateData.departmentName = departmentName;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...userUpdateData,
        profile: { // Upsert UserProfile
          upsert: {
            create: {
              // Add fields specific to UserProfile model here
              // e.g., profilePicture: profileData.profilePicture
            },
            update: {
              // Add fields specific to UserProfile model here
              // e.g., profilePicture: profileData.profilePicture
            },
          },
        },
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, jobTitle: true, departmentName: true, profile: true }
    });
    return updatedUser;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      const error = new Error('Old password does not match.');
      error.statusCode = 400;
      throw error;
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
    return { message: 'Password updated successfully.' };
  }
  
  // Admin function - Get all users (with pagination)
  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    const totalUsers = await prisma.user.count();
    return {
      data: users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers
    };
  }


   
}

export default new UserService();