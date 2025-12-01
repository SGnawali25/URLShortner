// controllers/url.js
import { Url } from "../models/url.js";
import { nanoid } from "nanoid";
import { getRedisClient } from '../utils/redis.js';


//test url is valid or not
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Create short URL
export const createShortUrl = async (req, res) => {
  console.log(`createShortUrl called. ${JSON.stringify(req.body)}`);
  try {
    const { originalUrl } = req.body;

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ message: "Invalid URL format" , status :"false" });
    }

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
        .json({ message: "Failed to generate unique short code", status:"false" });
    }

    const url = await Url.create({
      originalUrl,
      shortCode,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      message: "Short URL created",
      url,
      status:"true"
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
    
    //Check Redis cache first
    const redis = await getRedisClient();
    const cachedUrl = await redis.get(`url:${shortCode}`);
    if (cachedUrl) {
      console.log("🔵 Returning url from Redis cache");
      return res.status(200).json({ message: "Short code is valid", url: JSON.parse(cachedUrl) , status:"true"});
    }
    console.log("⚪ Url not found in Redis cache, fetching from MongoDB");
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: "URL not found for shortcode." , status:"false"});
    }

    //Store the user data in Redis for faster next time
    await redis.setEx(
      `url:${shortCode}`,
      3600,                         // TTL (1 hour)
      JSON.stringify(url)
    );

    res.status(200).json({ message: "Short code is valid", url , status:"true"});
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message , status:"false"});
  }
};

// Delete URL (admin or owner)
export const deleteUrl = async (req, res) => {
  console.log(`deleteUrl called. ${JSON.stringify(req.params)}`);
  try {
    const { id } = req.params;

    const url = await Url.findById(id);
    if (!url) return res.status(404).json({ message: "URL not found" });

    // Only allow admin or creator
    if (req.user.role !== "admin" && url.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not allowed to delete this URL" });
    }

    const redis = await getRedisClient();
    const result = await redis.del(`url:${url.shortCode}`);
    console.log(`${result} number of keys deleted from redis.`); // number of keys deleted

    await Url.findByIdAndDelete(id);

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


