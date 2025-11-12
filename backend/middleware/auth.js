// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

// Middleware to check if user is logged in and set req.user
export const isAuthenticated = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // attach user object to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to identify user if token is present
export const identifyUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      req.user = null; 
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user
    next();
  } catch (err) {
    req.user = null; // treat as guest on error
    next();
  }
};

// Middleware to check if user has admin role
export const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });

  
};
