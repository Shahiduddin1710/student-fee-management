import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";

export default function Reports() {
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "http://localhost:8000/api/students/reports/summary"
      );

      const data = await res.json();

      if (data.success) {
        setTotalCollected(Number(data.totalCollected) || 0);
        setTotalPending(Number(data.totalPending) || 0);
      } else {
        setError("Failed to load reports");
      }
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h2>Financial Reports</h2>
        </div>

        {loading ? (
          <p>Loading reports...</p>
        ) : error ? (
          <div className="error-msg">{error}</div>
        ) : (
          <div className="report-grid">
            <div className="report-card">
              <h4>Total Collected</h4>
              <p className="report-amount success">
                ₹{totalCollected.toLocaleString()}
              </p>
            </div>

            <div className="report-card">
              <h4>Total Pending</h4>
              <p className="report-amount warning">
                ₹{totalPending.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}