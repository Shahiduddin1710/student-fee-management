import express from "express";
import db from "../database/db.js";

const router = express.Router();

/* ==============================
   ADD STUDENT
============================== */
router.post("/add", async (req, res) => {
  try {
    const { full_name, email, phone, branch_name, year, total_fee } = req.body;

    // Basic required check
    if (!full_name || !email || !phone || !branch_name || !year || !total_fee) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Phone validation (exactly 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be exactly 10 digits and numeric only"
      });
    }

    const [existing] = await db.query(
      "SELECT student_id FROM students WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Student already exists"
      });
    }

    const [branch] = await db.query(
      "SELECT branch_id FROM branches WHERE branch_name = ?",
      [branch_name]
    );

    if (branch.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch selected"
      });
    }

    const branch_id = branch[0].branch_id;

    await db.query(
      `INSERT INTO students 
       (full_name, email, phone, branch_id, year, total_fee)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email, phone, branch_id, year, total_fee]
    );

    res.status(201).json({
      success: true,
      message: "New student added successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});


/* ==============================
   GET ALL STUDENTS
============================== */
router.get("/", async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT 
        s.student_id,
        s.full_name,
        s.email,
        s.phone,
        b.branch_name,
        s.year,
        s.total_fee,
        IFNULL(SUM(f.amount_paid), 0) AS paid,
        (s.total_fee - IFNULL(SUM(f.amount_paid), 0)) AS pending
      FROM students s
      JOIN branches b ON s.branch_id = b.branch_id
      LEFT JOIN fees f ON s.student_id = f.student_id
      GROUP BY 
        s.student_id,
        s.full_name,
        s.email,
        s.phone,
        b.branch_name,
        s.year,
        s.total_fee
      ORDER BY s.created_at DESC
    `);

    res.json({ success: true, students });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});


/* ==============================
   ADD PAYMENT
============================== */
router.post("/:id/payment", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount_paid, payment_mode } = req.body;

    const amount = Number(amount_paid);

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    const [student] = await db.query(
      "SELECT total_fee FROM students WHERE student_id = ?",
      [id]
    );

    if (student.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const [paidData] = await db.query(
      "SELECT IFNULL(SUM(amount_paid),0) AS paid FROM fees WHERE student_id = ?",
      [id]
    );

    const totalPaid = Number(paidData[0].paid);
    const totalFee = Number(student[0].total_fee);
    const pending = totalFee - totalPaid;

    if (pending <= 0) {
      return res.status(400).json({
        success: false,
        message: "Fees already fully paid"
      });
    }

    if (amount > pending) {
      return res.status(400).json({
        success: false,
        message: "Amount exceeded pending fees"
      });
    }

    await db.query(
      `INSERT INTO fees 
       (student_id, amount_paid, payment_date, payment_mode)
       VALUES (?, ?, CURDATE(), ?)`,
      [id, amount, payment_mode || "Cash"]
    );

    res.json({
      success: true,
      message: "Payment recorded successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

/* ==============================
   DELETE STUDENT
============================== */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM students WHERE student_id = ?",
      [id]
    );

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});


/* ==============================
   REPORT SUMMARY
============================== */
router.get("/reports/summary", async (req, res) => {
  try {
    const [totalFees] = await db.query(
      "SELECT IFNULL(SUM(total_fee),0) AS total FROM students"
    );

    const [totalCollected] = await db.query(
      "SELECT IFNULL(SUM(amount_paid),0) AS collected FROM fees"
    );

    const total = Number(totalFees[0].total);
    const collected = Number(totalCollected[0].collected);
    const pending = total - collected;

    res.json({
      success: true,
      totalCollected: collected,
      totalPending: pending
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

export default router;