import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";

export default function Fees() {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState({});
  const [loadingRow, setLoadingRow] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    setPageLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/students");
      const data = await res.json();

      if (data.success) {
        setStudents(data.students);
      } else {
        setError("Failed to load students");
      }
    } catch {
      setError("Server error");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (id, value) => {
    setPayments((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handlePayment = async (student) => {
    if (loadingRow) return;

    setMessage("");
    setError("");

    const amount = Number(payments[student.student_id]);
    const pending = Number(student.pending);

    if (!amount || amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (amount > pending) {
      setError("Amount exceeded pending fees");
      return;
    }

    setLoadingRow(student.student_id);

    try {
      const res = await fetch(
        `http://localhost:8000/api/students/${student.student_id}/payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount_paid: amount,
            payment_mode: "Cash",
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessage("Payment recorded successfully");

        setPayments((prev) => ({
          ...prev,
          [student.student_id]: "",
        }));

        fetchStudents();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(data.message || "Payment failed");
      }
    } catch {
      setError("Server error");
    } finally {
      setLoadingRow(null);
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h2>Fee Management</h2>
        </div>

        {message && <div className="success-msg">{message}</div>}
        {error && <div className="error-msg">{error}</div>}

        <div className="table-card">
          {pageLoading ? (
            <p>Loading students...</p>
          ) : students.length === 0 ? (
            <p>No students found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Total Fees</th>
                  <th>Paid</th>
                  <th>Pending</th>
                  <th>Pay Amount</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student.student_id}>
                    <td>{student.full_name}</td>
                    <td>{student.branch_name}</td>
                    <td>{student.year}</td>
                    <td>₹{student.total_fee}</td>
                    <td>₹{student.paid}</td>
                    <td>₹{student.pending}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        className="table-input"
                        value={payments[student.student_id] || ""}
                        onChange={(e) =>
                          handleChange(student.student_id, e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="primary-btn"
                        disabled={loadingRow === student.student_id}
                        onClick={() => handlePayment(student)}
                      >
                        {loadingRow === student.student_id
                          ? "Updating..."
                          : "Update"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}