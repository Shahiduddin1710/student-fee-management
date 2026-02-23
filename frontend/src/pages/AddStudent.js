import { useState } from "react";
import Layout from "../components/layout/Layout";

export default function AddStudent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    branch: "",
    year: "",
    totalFees: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent non-numeric typing in phone field
    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setMessage("");
    setError("");

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();
    const trimmedPhone = formData.phone.trim();
    const totalFeeNumber = Number(formData.totalFees);

    // Basic validation
    if (
      !trimmedName ||
      !trimmedEmail ||
      !trimmedPhone ||
      !formData.branch ||
      !formData.year ||
      !totalFeeNumber
    ) {
      setError("Please fill all fields properly.");
      return;
    }

    // Email basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Phone validation (exactly 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setError("Phone number must be exactly 10 digits and numeric only.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/students/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          branch_name: formData.branch,
          year: formData.year,
          total_fee: totalFeeNumber,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("New student added successfully");

        setFormData({
          name: "",
          email: "",
          phone: "",
          branch: "",
          year: "",
          totalFees: "",
        });

        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(data.message || "Failed to add student.");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h2>Add New Student</h2>
        </div>

        <div className="form-wrapper">
          <form className="form-card" onSubmit={handleSubmit}>
            {message && <div className="success-msg">{message}</div>}
            {error && <div className="error-msg">{error}</div>}

            <div className="form-group">
              <label>Student Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter 10 digit phone number"
                maxLength="10"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Branch</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Branch</option>
                  <option>Computer Engineering</option>
                  <option>Information Technology</option>
                  <option>Electronics and Telecommunication</option>
                </select>
              </div>

              <div className="form-group">
                <label>Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Year</option>
                  <option>FE</option>
                  <option>SE</option>
                  <option>TE</option>
                  <option>BE</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Total Fees (₹)</label>
              <input
                type="number"
                name="totalFees"
                value={formData.totalFees}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Adding..." : "Add Student"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}