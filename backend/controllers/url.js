// controllers/url.js
import { Url } from "../models/url.js";
import { nanoid } from "nanoid";

// Create short URL
export const createShortUrl = async (req, res) => {
  console.log(`createShortUrl called. ${req.body}`);
  try {
    const { originalUrl } = req.body;

    let shortCode;
    let isUnique = false;

    for (let i = 0; i < 5; i++) {
      // retry 5 times
      shortCode = nanoid(6);
      const existing = await Url.findOne({ shortCode });
      if (!existing) {
        isUnique = true;
        break;
      }
    }

    if (!isUnique) {
      return res
        .status(500)
        .json({ message: "Failed to generate unique short code" });
    }

    const url = await Url.create({
      originalUrl,
      shortCode,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      message: "Short URL created",
      shortUrl: `http://localhost:4000/${shortCode}`,
      url,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Redirect to original URL based on short code
export const redirectToOriginalUrl = async (req, res) => {
  console.log(`redirectToOriginalUrl called. ${JSON.stringify(req.params)}`);
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: "URL not found for shortcode." });
    }

    // Redirect to original URL
    res.redirect(url.originalUrl);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Verify short code
export const verifyShortCode = async (req, res) => {
  console.log(`verify shortcode called. ${JSON.stringify(req.params)}`);
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: "URL not found for shortcode." });
    }

    res.status(200).json({ message: "Short code is valid", url });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete URL (admin only)
export const deleteUrl = async (req, res) => {
  console.log(`delete url called. ${JSON.stringify(req.params)}`);
  try {
    const { id } = req.params;

    const url = await Url.findByIdAndDelete(id);
    if (!url) return res.status(404).json({ message: "URL not found" });

    res.status(200).json({ message: "URL deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get URLs for dashboard (role-based)
export const getDashboardUrls = async (req, res) => {
  console.log("getDashboardUrls called.");
  try {
    let urls;
    if (!req.user) {
      return res.status(200).json({ urls: [] });
    }
    if (req.user.role === "admin") {
      // Admin: get all URLs with creator info
      urls = await Url.find().populate("createdBy", "name email");
    } else {
      // User: get only their URLs
      urls = await Url.find({ createdBy: req.user._id });
    }

    res.status(200).json({ urls });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all URLs by a specific user
export const getUserUrls = async (req, res) => {
  console.log(`get user urls called. ${JSON.stringify(req.params)}`);
  try {
    const { userId } = req.params;
    const urls = await Url.find({ createdBy: userId });
    res.status(200).json({ urls });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
