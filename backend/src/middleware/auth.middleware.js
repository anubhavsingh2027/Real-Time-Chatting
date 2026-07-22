import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const ALLOWED_DETAILS_EMAIL = "anubhavsingh2106@gmail.com";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token)
      return res
        .status(401)
        .json({
          message: `Unauthorized - No token provided `,
          data: req.cookies,
        });

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({ message: "Unauthorized - Invalid token" });

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requireDetailsAccess = (req, res, next) => {
  if (!req.user?.email) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (req.user.email.toLowerCase() !== ALLOWED_DETAILS_EMAIL.toLowerCase()) {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
};
