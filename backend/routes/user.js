// routes/user.js
import express from 'express';
import { signInUser, logoutUser, getAllUsers, userInfo} from '../controllers/user.js';
import { isAuthenticated, isAdmin} from '../middleware/auth.js';

const router = express.Router();

// Google Sign-In / Register route
router.post('/signin', signInUser);

// Logout route
router.get('/logout', logoutUser);

// Get all users (admin only)
router.get('/users', isAuthenticated,isAdmin, getAllUsers);

//identify user 
router.get('/user/me', userInfo);

export default router;