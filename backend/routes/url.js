// routes/url.js
import express from 'express';
import { createShortUrl,redirectToOriginalUrl, deleteUrl, getDashboardUrls, verifyShortCode } from '../controllers/url.js';
import { isAuthenticated, identifyUser} from '../middleware/auth.js';

const router = express.Router();

// Anyone can create a short URL
router.post('/shorten', identifyUser, createShortUrl);


// Dashboard route (authenticated users only)
router.get('/dashboard', identifyUser, getDashboardUrls);

// Admin can delete a URL
router.delete('/url/:id', isAuthenticated, deleteUrl);


router.get('/verify/:shortCode', verifyShortCode);

router.get('/:shortCode', redirectToOriginalUrl);


export default router;