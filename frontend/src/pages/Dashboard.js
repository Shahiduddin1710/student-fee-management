import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/layout/Layout";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const modules = useMemo(() => {
    const baseModules = [
      {
        title: "Add Student",
        description: "Register new student and assign branch & year",
        route: "/add-student",
      },
      {
        title: "View Students",
        description: "View all registered students branch-wise",
        route: "/students",
      },
      {
        title: "Fee Management",
        description: "Record fee payments and calculate pending amount",
        route: "/fees",
      },
      {
        title: "Reports",
        description: "View total collected fees and pending fees",
        route: "/reports",
      },
    ];

    if (user?.role === "admin") return baseModules;

    return baseModules.filter(
      (module) => module.title !== "Reports"
    );
  }, [user]);

  if (!user) return null;

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user.username || "Admin"}</h1>
          <p className="dashboard-subtitle">
            Student Fee Management System
          </p>
        </div>

        <div className="dashboard-grid">
          {modules.map((module) => (
            <div
              key={module.title}
              className="dashboard-card"
              onClick={() => navigate(module.route)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(module.route);
                }
              }}
            >
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}