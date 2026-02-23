import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId || deleteLoading) return;

    setDeleteLoading(true);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:8000/api/students/${deleteId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (data.success) {
        setStudents((prev) =>
          prev.filter((student) => student.student_id !== deleteId)
        );
        setMessage("Student deleted successfully");
        setDeleteId(null);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError("Failed to delete student");
      }
    } catch {
      setError("Server error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <Layout>
      <div className="students-container">
        <div className="page-header">
          <h2>View All Students</h2>
        </div>

        {message && <div className="success-msg">{message}</div>}
        {error && <div className="error-msg">{error}</div>}

        <div className="table-card">
          {loading ? (
            <p>Loading students...</p>
          ) : students.length === 0 ? (
            <p>No students found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Total Fees</th>
                  <th>Paid</th>
                  <th>Pending</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => {
                  const total = Number(student.total_fee);
                  const paid = Number(student.paid);
                  const pending = Number(student.pending);

                  let status = "Partial";

                  if (pending === 0 && total > 0) {
                    status = "Paid";
                  } else if (paid === 0) {
                    status = "Unpaid";
                  }

                  return (
                    <tr key={student.student_id}>
                      <td>{student.full_name}</td>
                      <td>{student.email}</td>
                      <td>{student.phone || "-"}</td>
                      <td>{student.branch_name}</td>
                      <td>{student.year}</td>
                      <td>₹{formatCurrency(total)}</td>
                      <td>₹{formatCurrency(paid)}</td>
                      <td>₹{formatCurrency(pending)}</td>
                      <td>
                        <span className={`status ${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="danger-btn"
                          onClick={() =>
                            setDeleteId(student.student_id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {deleteId && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this record?</p>

              <div className="modal-actions">
                <button
                  className="danger-btn"
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => setDeleteId(null)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}