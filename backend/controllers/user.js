// Updated authController.js for Google Sign-In using credentials token
import { User } from '../models/user.js';
import { Url } from '../models/url.js';
import { getRedisClient } from '../utils/redis.js';
import jwt from 'jsonwebtoken';


// Helper function to generate JWT and send in cookie
const sendToken = (user, statusCode, message, res) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });

  res.status(statusCode)
     .cookie('token', token, { httpOnly: true, secure: true, sameSite: 'None' })
     .json({ success: true, message, user });
};

// Register / Sign-In user using Google credentials
// api/v2/signin
export const signInUser = async (req, res, next) => {
  console.log(`signInUser called.`);
  try {
    if (req.body.credential) {
      const credentials = jwt.decode(req.body.credential);
      const email = credentials.email;

      let user = await User.findOne({ email });

      if (!user) {
        // Create new user
        user = await User.create({
          name: credentials.name,
          email: credentials.email,
          avatar: { url: credentials.picture },
          googleSignIn: true,
        });

        return sendToken(user, 201, 'User registered successfully', res);
      }

      // User exists, login
      sendToken(user, 200, 'User logged in successfully', res);
    } else {
      return res.status(400).json({ message: 'No credential provided' });
    }
  } catch (err) {
    next(err);
  }
};

// Logout user
// api/v2/logout
export const logoutUser = (req, res) => {
  console.log('logoutUser called.');
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

//identify user
export const userInfo = async (req, res, next) => {
  console.log('userInfo called.');
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(200).json({ user: null});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 1️⃣ Check Redis cache first
    const redis = await getRedisClient();
    const cachedUser = await redis.get(`user:${userId}`);
    if (cachedUser) {
      console.log("🔵 Returning user from Redis cache");
      return res.status(200).json({ user: JSON.parse(cachedUser) });
    }
    console.log("⚪ User not found in Redis cache, fetching from MongoDB");
    // 2️⃣ If not cached, fetch from MongoDB
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(200).json({ user: null });
    }

    // 3️⃣ Store the user data in Redis for faster next time
    await redis.setEx(
      `user:${userId}`,
      3600,                         // TTL (1 hour)
      JSON.stringify(user)
    );

    console.log("🟢 User stored in Redis cache");

    res.status(200).json({ user });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Get all users (Admin only)
export const getAllUsers = async (req, res, next) => {
  console.log('getAllUsers called.');
  try {
    const users = await User.find().select('-password'); // exclude password for security
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin or owner)
export const deleteUser = async (req, res) => {
  console.log(`deleteUser called. ${JSON.stringify(req.params)}`);
  try {
    const { id } = req.params;

    // Find the user
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found", status: "false" });
    }

    // Prevent self-deletion
    if (req.user._id.toString() === id) {
      return res.status(403).json({
        message: "You cannot delete your own account",
        status: "false",
      });
    }

    // Delete all URLs created by this user
    const urls = await Url.find({ createdBy: id });
    await Url.deleteMany({ createdBy: id });
    
    // Delete the user
    await User.findByIdAndDelete(id);

    // Remove user and url from redis cache
    const redis = await getRedisClient();
    // Delete cached user info
    await redis.del(`user:${id}`);
    console.log(`🗑️ User ${id} removed from Redis cache`);

    // Delete cached URLs for this user (if cached as url:<shortId>)
    const urlKeys = urls.map((u) => `url:${u.shortCode}`);
    if (urlKeys.length > 0) {
      const deletedUrlCount = await redis.del(...urlKeys);
      console.log(`Found ${urlKeys.length} Deleted ${deletedUrlCount} URL(s) from Redis cache`);
    }

    res.status(200).json({ message: "User and their URLs deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
