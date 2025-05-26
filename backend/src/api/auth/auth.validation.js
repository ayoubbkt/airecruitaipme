// src/api/auth/auth.validation.js
import { z } from 'zod';
import { UserRole } from '../../generated/prisma/index.js'; // Assurez-vous que UserRole est bien exporté ou accessible
console.log('UserRole:', UserRole);
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: z.nativeEnum(UserRole).optional(), // Valide que le rôle est une des valeurs de l'enum UserRole
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});