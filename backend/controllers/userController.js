import db from "../database/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationMail, sendOtpMail } from "../emailVerify/sendVerificationMail.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const lowerEmail = email.toLowerCase();

    if (!lowerEmail.endsWith("@vcet.edu.in")) {
      return res.status(400).json({
        success: false,
        message: "Only @vcet.edu.in email allowed",
      });
    }

    const [existing] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [lowerEmail]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = jwt.sign(
      { email: lowerEmail },
      process.env.SECRET_KEY,
      { expiresIn: "10m" }
    );

    await db.execute(
      `INSERT INTO users 
       (username,email,password,is_verified,verification_token,role,profile_completed,portal_verified) 
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        username,
        lowerEmail,
        hashedPassword,
        false,
        verificationToken,
        "admin",
        false,
        false,
      ]
    );

    await sendVerificationMail(lowerEmail, verificationToken);

    return res.status(201).json({
      success: true,
      message: "Registered successfully. Verify your email.",
    });

  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const verification = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=false`);
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?verified=expired`
        );
      }

      return res.redirect(
        `${process.env.FRONTEND_URL}/login?verified=false`
      );
    }

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [decoded.email]
    );

    if (rows.length === 0) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?verified=false`
      );
    }

    const user = rows[0];

    if (user.is_verified) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?verified=true`
      );
    }

    await db.execute(
      "UPDATE users SET is_verified = true, verification_token = NULL WHERE email = ?",
      [decoded.email]
    );

    return res.redirect(
      `${process.env.FRONTEND_URL}/login?verified=true`
    );

  } catch {
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?verified=false`
    );
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const lowerEmail = email.toLowerCase();

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [lowerEmail]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = rows[0];

    if (!user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Please verify email first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_completed: user.profile_completed,
        portal_verified: user.portal_verified,
      },
    });

  } catch {
    return res.status(500).json({ success: false });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const { branch, year } = req.body;
    const userId = req.user.user_id;

    await db.execute(
      "UPDATE users SET branch = ?, year = ?, profile_completed = true WHERE user_id = ?",
      [branch, year, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Profile completed",
    });

  } catch {
    return res.status(500).json({ success: false });
  }
};

export const enterPortal = async (req, res) => {
  try {
    const { key } = req.body;
    const userId = req.user.user_id;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (key !== process.env.PORTAL_KEY) {
      return res.status(403).json({
        success: false,
        message: "Invalid Key",
      });
    }

    await db.execute(
      "UPDATE users SET portal_verified = true WHERE user_id = ?",
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "Portal access granted",
    });

  } catch {
    return res.status(500).json({ success: false });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { oldPassword, newPassword } = req.body;

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.execute(
      "UPDATE users SET password = ? WHERE user_id = ?",
      [hashedPassword, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });

  } catch {
    return res.status(500).json({ success: false });
  }
};

export const logoutUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const lowerEmail = email.toLowerCase();

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [lowerEmail]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const user = rows[0];

    if (!user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.execute(
      "DELETE FROM password_reset_otps WHERE email = ?",
      [lowerEmail]
    );

    await db.execute(
      "INSERT INTO password_reset_otps (email, otp, expires_at) VALUES (?, ?, ?)",
      [lowerEmail, otp, expiresAt]
    );

    await sendOtpMail(lowerEmail, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });

  } catch {
    return res.status(500).json({ success: false });
  }
};

export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const lowerEmail = email.toLowerCase();

    const [rows] = await db.execute(
      "SELECT * FROM password_reset_otps WHERE email = ? ORDER BY created_at DESC LIMIT 1",
      [lowerEmail]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new one",
      });
    }

    const record = rows[0];

    if (new Date() > new Date(record.expires_at)) {
      await db.execute(
        "DELETE FROM password_reset_otps WHERE email = ?",
        [lowerEmail]
      );
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
    }

    if (record.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await db.execute(
      "UPDATE password_reset_otps SET verified = true WHERE email = ?",
      [lowerEmail]
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch {
    return res.status(500).json({ success: false });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    const lowerEmail = email.toLowerCase();

    const [rows] = await db.execute(
      "SELECT * FROM password_reset_otps WHERE email = ? AND verified = true ORDER BY created_at DESC LIMIT 1",
      [lowerEmail]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not verified. Please verify OTP first",
      });
    }

    const record = rows[0];

    if (new Date() > new Date(record.expires_at)) {
      await db.execute(
        "DELETE FROM password_reset_otps WHERE email = ?",
        [lowerEmail]
      );
      return res.status(400).json({
        success: false,
        message: "Session expired. Please start again",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.execute(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, lowerEmail]
    );

    await db.execute(
      "DELETE FROM password_reset_otps WHERE email = ?",
      [lowerEmail]
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch {
    return res.status(500).json({ success: false });
  }
};