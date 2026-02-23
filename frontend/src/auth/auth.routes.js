import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import VerifyOtp from "../pages/VerifyOtp";
import ResetPassword from "../pages/ResetPassword";
import VerifyEmailSent from "../pages/VerifyEmailSent";

export const authRoutes = [
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/verify-otp/:email", element: <VerifyOtp /> },
  { path: "/reset-password/:email", element: <ResetPassword /> },
  { path: "/verify-email", element: <VerifyEmailSent /> }
];