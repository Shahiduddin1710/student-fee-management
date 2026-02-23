import express from "express";
import {
  registerUser,
  verification,
  loginUser,
  logoutUser,
  completeProfile,
  enterPortal,
  changePassword,
} from "../controllers/userController.js";

import { isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
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

export default router;