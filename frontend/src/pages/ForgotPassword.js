import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Message from "../components/Message";
import AuthLayout from "../auth/AuthLayout";
import "../auth/auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage(null);

    const lowerEmail = email.trim().toLowerCase();

    if (!lowerEmail) {
      setMessage({ type: "error", text: "Please enter your email." });
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/forgot-password`,
        { email: lowerEmail }
      );

      if (res.data.success) {
        navigate(`/verify-otp/${encodeURIComponent(lowerEmail)}`);
      } else {
        setMessage({ type: "error", text: res.data.message });
      }

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to send OTP. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your VCET email to receive a reset OTP"
      footer={
        <>
          Remember your password?{" "}
          <Link to="/login" className="link">
            Login
          </Link>
        </>
      }
    >
      <Message type={message?.type} text={message?.text} />

      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="VCET Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>
    </AuthLayout>
  );
}
