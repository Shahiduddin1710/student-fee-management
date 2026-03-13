import express from "express";
import {
  registerUser,
  verification,
  loginUser,
  logoutUser,
  completeProfile,
  enterPortal,
  changePassword,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
} from "../controllers/userController.js";

import { isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  validate,
} from "../validators/userValidate.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.get("/verify/:token", verification);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", isAuthenticated, logoutUser);

router.put("/complete-profile", isAuthenticated, completeProfile);
router.post("/enter-portal", isAuthenticated, enterPortal);
router.put(
  "/change-password",
  isAuthenticated,
  validate(changePasswordSchema),
  changePassword
);

router.post("/forgot-password", validate(forgotPasswordSchema), sendForgotPasswordOtp);
router.post("/verify-otp", validate(verifyOtpSchema), verifyForgotPasswordOtp);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;