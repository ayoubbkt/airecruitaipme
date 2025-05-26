import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import prisma from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Attach user to request object, excluding password
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          // Include other fields you might need from the user object
        }
      });

      if (!req.user) {
        return res.status(401).json({ message: 'User not found for this token.' });
      }
      next();
    } catch (error) {
      console.error('Authentication error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role-based authorization
// roles can be a single role string or an array of role strings
export const authorize = (roles) => {
  return (req, res, next) => {
    const userRoles = Array.isArray(roles) ? roles : [roles];
    if (!req.user || !req.user.role || !userRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required role' });
    }
    next();
  };
};