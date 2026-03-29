import {
  sendWelcomeEmail,
  sendRecruiterVisitEmail,
} from "../emails/emailHandlers.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, username, email, password } = req.body;

  try {
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Normalize username: remove spaces and convert to lowercase
    const normalizedUsername = username.replace(/\s+/g, "").toLowerCase();

    // check if email is valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({
      username: normalizedUsername,
    });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username: normalizedUsername,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Persist user first, then issue auth cookie
      const savedUser = await newUser.save();
      generateToken(savedUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
      const realIp =
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.socket.remoteAddress;

      try {
        await sendWelcomeEmail(
          savedUser.email,
          savedUser.fullName,
          ENV.CLIENT_URL,
          realIp,
        );
      } catch (error) {
        console.error("Error sending welcome email:", error);
      }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    // never tell the client which one is incorrect: password or email

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic)
      return res.status(400).json({ message: "Profile pic is required" });

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true },
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Recruiter Guest Access (Demo Login)
 * - Only works if user is NOT already authenticated
 * - Generates temporary credentials for recruiter demo
 * - User can be deleted/ignored in analytics later
 * - NO welcome email is sent
 */
export const recruiterGuest = async (req, res) => {
  try {
    // Check if user is already authenticated via cookie
    const existingToken = req.cookies.jwt;
    if (existingToken) {
      return res.status(400).json({
        message:
          "Already authenticated. Please logout first to access guest login.",
      });
    }

    // Generate unique temporary username with timestamp
    const timestamp = Date.now();
    const tempUsername = `recruiter_${timestamp}`;
    const tempEmail = `recruiter_${timestamp}@guest.demo`;

    // Generate random secure password (min 6 chars per model)
    // Using crypto for stronger randomness
    const crypto = await import("crypto");
    const randomPassword = crypto.randomBytes(12).toString("hex");

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    // Create guest recruiter user
    const guestUser = new User({
      fullName: `Recruiter Demo ${timestamp}`,
      username: tempUsername,
      email: tempEmail,
      password: hashedPassword,
      role: "recruiter",
      isGuest: true,
      profilePic:
        "https://th.bing.com/th/id/OIP.K5amgKKXE0mlLRBzgVVl-wHaHa?w=211&h=212&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3",
    });

    // Save to database
    const savedUser = await guestUser.save();

    // Generate JWT token (reuse existing function)
    generateToken(savedUser._id, res);

    // Send recruiter visit notification email
    try {
      await sendRecruiterVisitEmail(savedUser.fullName);
    } catch (error) {
      console.error("Error sending recruiter visit email:", error);
      // Don't block the login process if email fails
    }

    // Return user data (same format as login/signup response)
    // Note: We do NOT return the password
    res.status(201).json({
      _id: savedUser._id,
      fullName: savedUser.fullName,
      username: savedUser.username,
      email: savedUser.email,
      profilePic: savedUser.profilePic,
      role: savedUser.role,
      isGuest: savedUser.isGuest,
    });
  } catch (error) {
    console.error("Error in recruiterGuest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
