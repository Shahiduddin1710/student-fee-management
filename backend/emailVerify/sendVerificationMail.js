import nodemailer from "nodemailer";
import "dotenv/config";

export const sendVerificationMail = async (email, token) => {
  try {
    const verifyLink = `http://localhost:8000/api/auth/verify/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `VCET Portal <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Verify Your VCET Account",
      html: `
        <div style="background:#f4f6f9;padding:30px;font-family:Arial">
          <div style="max-width:500px;margin:auto;background:#ffffff;padding:30px;border-radius:8px">
            <h2 style="color:#0A58CA;text-align:center">
              Vidyavardhini College of Engineering
            </h2>

            <p style="font-size:15px;color:#333">
              Thank you for registering for the Student Fee Management Portal.
            </p>

            <p>Please click the button below to verify your email address.</p>

            <div style="text-align:center;margin:25px 0;">
              <a href="${verifyLink}"
                style="background:#2563eb;color:white;padding:12px 25px;text-decoration:none;border-radius:6px;font-weight:bold;">
                Verify Email
              </a>
            </div>

            <p style="font-size:13px;color:#666">
              This link will expire in 10 minutes.
            </p>

            <hr style="margin:25px 0;border:none;border-top:1px solid #ddd"/>

            <p style="font-size:12px;color:#888;text-align:center">
              © ${new Date().getFullYear()} VCET. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

  } catch (error) {
    console.error("Mail sending failed:", error.message);
    throw error;
  }
};