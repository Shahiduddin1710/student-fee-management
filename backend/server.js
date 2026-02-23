import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoute from "./routes/userRoute.js";
import studentRoutes from "./routes/student.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/auth", userRoute);
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Fee Management API Running ",
  });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
