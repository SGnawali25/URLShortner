// routes/user.js
import express from 'express';
import { signInUser, logoutUser, getAllUsers, userInfo, deleteUser} from '../controllers/user.js';
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

//delete user (admin only)
router.delete('/user/:id', isAuthenticated, isAdmin, deleteUser);

export default router;