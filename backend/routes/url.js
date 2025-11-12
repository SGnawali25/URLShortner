// routes/url.js
import express from 'express';
import { createShortUrl,redirectToOriginalUrl, deleteUrl, getDashboardUrls, getUserUrls, verifyShortCode } from '../controllers/url.js';
import { isAuthenticated, isAdmin, identifyUser} from '../middleware/auth.js';

const router = express.Router();

// Anyone can create a short URL
router.post('/shorten', identifyUser, createShortUrl);


// Dashboard route (authenticated users only)
router.get('/dashboard', identifyUser, getDashboardUrls);

// Admin can delete a URL
router.delete('/url/:id', isAuthenticated, isAdmin, deleteUrl);

// Get all URLs by a specific user (authenticated users only)
router.get('/urls/user/:userId', isAuthenticated,isAdmin, getUserUrls);

router.get('/verify/:shortCode', identifyUser, verifyShortCode);

router.get('/:shortCode', redirectToOriginalUrl);


export default router;