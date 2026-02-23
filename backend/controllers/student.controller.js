import express from "express";
import db from "../database/db.js";

const router = express.Router();

//add new student
router.post("/add", async (req, res) => {
  try {
    const { full_name, email, phone, branch_name, year, total_fee } = req.body;

    if (!full_name || !email || !branch_name || !year || !total_fee) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled"
      });
    }

    const [existingStudent] = await db.query(
      "SELECT student_id FROM students WHERE email = ?",
      [email]
    );

    if (existingStudent.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Student already exists with this email"
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
      [full_name, email, phone || null, branch_id, year, total_fee]
    );

    res.status(201).json({
      success: true,
      message: "Student added successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


//view students
router.get("/", async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT 
        s.student_id,
        s.full_name,
        s.email,
        s.phone,
        s.year,
        s.total_fee,
        b.branch_name,
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
        s.year,
        s.total_fee,
        b.branch_name
      ORDER BY s.student_id DESC
    `);

    res.json({
      success: true,
      students
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


//single student

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        s.student_id,
        s.full_name,
        s.email,
        s.phone,
        s.year,
        s.total_fee,
        b.branch_name,
        IFNULL(SUM(f.amount_paid), 0) AS paid,
        (s.total_fee - IFNULL(SUM(f.amount_paid), 0)) AS pending
      FROM students s
      JOIN branches b ON s.branch_id = b.branch_id
      LEFT JOIN fees f ON s.student_id = f.student_id
      WHERE s.student_id = ?
      GROUP BY 
        s.student_id,
        s.full_name,
        s.email,
        s.phone,
        s.year,
        s.total_fee,
        b.branch_name
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      student: rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


//payment records
router.post("/payment", async (req, res) => {
  try {
    const { student_id, amount, payment_mode } = req.body;

    if (!student_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "Student ID and amount are required"
      });
    }

    await db.query(
      `INSERT INTO fees 
       (student_id, amount_paid, payment_date, payment_mode)
       VALUES (?, ?, CURDATE(), ?)`,
      [student_id, amount, payment_mode || "Cash"]
    );

    res.json({
      success: true,
      message: "Payment recorded successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


export default router;