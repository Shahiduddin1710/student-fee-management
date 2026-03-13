import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Message from "../components/Message";
import AuthLayout from "../auth/AuthLayout";
import "../auth/auth.css";

export default function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { email } = useParams();
  const decodedEmail = decodeURIComponent(email);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setMessage({ type: "error", text: "Please enter the complete 6-digit OTP." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/verify-otp`,
        { email: decodedEmail, otp: otpString }
      );

      if (res.data.success) {
        navigate(`/reset-password/${encodeURIComponent(decodedEmail)}`);
      } else {
        setMessage({ type: "error", text: res.data.message });
      }

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "OTP verification failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendLoading || countdown > 0) return;

    setResendLoading(true);
    setMessage(null);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/forgot-password`,
        { email: decodedEmail }
      );

      if (res.data.success) {
        setMessage({ type: "success", text: "New OTP sent to your email." });
        setOtp(["", "", "", "", "", ""]);
        setCountdown(60);
        inputRefs.current[0]?.focus();
      } else {
        setMessage({ type: "error", text: res.data.message });
      }

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to resend OTP.",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify OTP"
      subtitle={`Enter the 6-digit OTP sent to ${decodedEmail}`}
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
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="otp-box"
            />
          ))}
        </div>

        <button disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <div className="resend-section">
        {countdown > 0 ? (
          <p className="resend-timer">Resend OTP in {countdown}s</p>
        ) : (
          <button
            className="resend-btn"
            onClick={resendOtp}
            disabled={resendLoading}
          >
            {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        )}
      </div>
    </AuthLayout>
  );
}
