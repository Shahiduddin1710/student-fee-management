import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup as signupService } from "../services/auth.service";
import Message from "../components/Message";
import vcetImage from "../assets/vcet.png";
import "./login.css";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "email"
          ? value.trim().toLowerCase()
          : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage(null);

    const username = form.username.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();

    if (!username || !email || !password) {
      setMessage({
        type: "error",
        text: "All fields are required.",
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await signupService({
        username,
        email,
        password,
      });

      if (!res?.data?.success) {
        setMessage({
          type: "error",
          text: res.data?.message || "Signup failed",
        });
        return;
      }

      navigate("/verify-email", { replace: true });

    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Signup failed. Please try again.",
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
          <h2>VCET Admin Registration</h2>
          <p className="login-subtitle">
            Student Fee Management System
          </p>

          <Message type={message?.type} text={message?.text} />

          <form onSubmit={submit}>
            <input
              name="username"
              placeholder="Full Name"
              value={form.username}
              onChange={handleChange}
              required
            />

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
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="login-footer">
            <Link to="/login">
              Already registered? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}