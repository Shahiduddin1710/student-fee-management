import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { enterPortal as enterPortalService } from "../services/auth.service";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user, login, isLoading } = useAuth();

  const [portalKey, setPortalKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.portal_verified === true) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const submitKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await enterPortalService({ key: portalKey });

      if (!res?.data?.success) {
        setError("Invalid Portal Key");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      login(
        {
          ...user,
          portal_verified: true,
        },
        token
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid Portal Key"
      );
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Enter Admin Portal Key</h1>

        <form onSubmit={submitKey}>
          <input
            type="text"
            placeholder="Enter Portal Key"
            value={portalKey}
            onChange={(e) => setPortalKey(e.target.value)}
            required
          />

          <button disabled={loading}>
            {loading ? "Verifying..." : "Submit"}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}