// Updated authController.js for Google Sign-In using credentials token
import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';


// Helper function to generate JWT and send in cookie
const sendToken = (user, statusCode, message, res) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });

  res.status(statusCode)
     .cookie('token', token, { httpOnly: true })
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
    console.log(`Token: ${token}`);
    if (!token) {
      return res.status(200).json({ user: null});
    }
    console.log(`JWT_SECRET: ${process.env.JWT_SECRET}`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(200).json({ user: null });
    }

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