import prisma from '../../config/db.js';
import jwt from 'jsonwebtoken';
import config from '../../config/index.js';
import { hashPassword, comparePassword } from '../../utils/passwordUtils.js';
import { UserRole } from '../../generated/prisma/index.js';

class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName, role = UserRole.STANDARD } = userData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error = new Error('User with this email already exists.');
      error.statusCode = 409; // Conflict
      throw error;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role, // Assurez-vous que 'role' est une valeur valide de UserRole
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true } // Exclure le mot de passe
    });
    return user;
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const error = new Error('Invalid credentials.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid credentials.');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
    
    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = user; // Exclure le mot de passe
    return { user: userWithoutPassword, token };
  }
}

export default new AuthService();