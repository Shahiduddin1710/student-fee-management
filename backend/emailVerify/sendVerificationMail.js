import SibApiV3Sdk from "sib-api-v3-sdk";
import "dotenv/config";

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const client = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendVerificationMail = async (email, token) => {
  const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify/${token}`;

  await client.sendTransacEmail({
    sender: { name: "VCET Portal", email: process.env.BREVO_SENDER_EMAIL },
    to: [{ email }],
    subject: "Verify Your VCET Account",
    htmlContent: `
      <div style="background:#f4f6f9;padding:30px;font-family:Arial">
        <div style="max-width:500px;margin:auto;background:#ffffff;padding:30px;border-radius:8px">
          <h2 style="color:#0A58CA;text-align:center">Vidyavardhini College of Engineering</h2>
          <p style="font-size:15px;color:#333">Thank you for registering for the Student Fee Management Portal.</p>
          <p>Please click the button below to verify your email address.</p>
          <div style="text-align:center;margin:25px 0;">
            <a href="${verifyLink}" style="background:#2563eb;color:white;padding:12px 25px;text-decoration:none;border-radius:6px;font-weight:bold;">
              Verify Email
            </a>
          </div>
          <p style="font-size:13px;color:#666">This link will expire in 10 minutes.</p>
          <hr style="margin:25px 0;border:none;border-top:1px solid #ddd"/>
          <p style="font-size:12px;color:#888;text-align:center">© ${new Date().getFullYear()} VCET. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

export const sendOtpMail = async (email, otp) => {
  await client.sendTransacEmail({
    sender: { name: "VCET Portal", email: process.env.BREVO_SENDER_EMAIL },
    to: [{ email }],
    subject: "Password Reset OTP - VCET Portal",
    htmlContent: `
      <div style="background:#f4f6f9;padding:30px;font-family:Arial">
        <div style="max-width:500px;margin:auto;background:#ffffff;padding:30px;border-radius:8px">
          <h2 style="color:#0A58CA;text-align:center">Vidyavardhini College of Engineering</h2>
          <p style="font-size:15px;color:#333">You requested to reset your password for the Student Fee Management Portal.</p>
          <p style="font-size:15px;color:#333">Use the OTP below to reset your password:</p>
          <div style="text-align:center;margin:30px 0;">
            <span style="background:#f1f5f9;border:2px dashed #2563eb;color:#1e3a8a;font-size:36px;font-weight:bold;letter-spacing:12px;padding:16px 28px;border-radius:10px;display:inline-block;">
              ${otp}
            </span>
          </div>
          <p style="font-size:13px;color:#666;text-align:center">This OTP will expire in <strong>10 minutes</strong>.</p>
          <p style="font-size:13px;color:#999;text-align:center">If you did not request a password reset, please ignore this email.</p>
          <hr style="margin:25px 0;border:none;border-top:1px solid #ddd"/>
          <p style="font-size:12px;color:#888;text-align:center">© ${new Date().getFullYear()} VCET. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};