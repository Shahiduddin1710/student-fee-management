import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login as loginService } from "../services/auth.service";
import Message from "../components/Message";
import { useAuth } from "../context/AuthContext";
import vcetImage from "../assets/vcet.png";
import "./login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();

  const infoMessage =
    params.get("verified") === "true"
      ? "Email verified successfully. Please login."
      : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "email" ? value.trim().toLowerCase() : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage(null);

    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();

    if (!email || !password) {
      setMessage({
        type: "error",
        text: "Please enter email and password.",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await loginService({ email, password });

      if (!res?.data?.success) {
        setMessage({ type: "error", text: "Invalid credentials" });
        return;
      }

      const { token, user } = res.data;

      login(user, token);

      if (!user.profile_completed) {
        navigate("/complete-profile", { replace: true });
        return;
      }

      if (user.role === "admin" && !user.portal_verified) {
        navigate("/portal-key", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });

    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div
        className="login-left"
        style={{ backgroundImage: `url(${vcetImage})` }}
      >
        <div className="login-overlay">
          <div className="login-brand">
            <h1>VCET</h1>
            <p>Unlock the Future of Education</p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>VCET Admin Portal</h2>
          <p className="login-subtitle">
            Student Fee Management System
          </p>

          {infoMessage && (
            <Message type="success" text={infoMessage} />
          )}

          <Message type={message?.type} text={message?.text} />

          <form onSubmit={submit}>
            <input
              name="email"
              type="email"
              placeholder="VCET Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="login-footer">
            <Link to="/signup">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}