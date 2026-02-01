/**
 * Authentication Middleware
 * JWT token verification and user authentication
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'karma-ops-default-secret-change-me';

/**
 * Middleware to authenticate JWT token
 * Checks for token in cookies or Authorization header
 */
export const authenticateToken = (req, res, next) => {
  // Get token from cookie or Authorization header
  const tokenFromCookie = req.cookies?.token;
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    return res.status(403).json({ error: 'Invalid token' });
  }
};

/**
 * Generate JWT token for a user
 * @param {Object} user - User object with id and username
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req, res, next) => {
  const tokenFromCookie = req.cookies?.token;
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.split(' ')[1];

  const token = tokenFromCookie || tokenFromHeader;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid but don't fail - just continue without user
    }
  }

  next();
};

export default { authenticateToken, generateToken, optionalAuth };
