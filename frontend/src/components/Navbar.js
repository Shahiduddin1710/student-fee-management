import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated || !user) return null;

  const canAccessDashboard =
    user.portal_verified && user.profile_completed;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <div
        className="navbar-brand"
        onClick={() =>
          canAccessDashboard
            ? navigate("/dashboard")
            : navigate("/complete-profile")
        }
      >
        VCET Portal
      </div>

      <div className="navbar-links">
        {canAccessDashboard && (
          <button
            className={
              location.pathname === "/dashboard"
                ? "active"
                : ""
            }
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
        )}

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}