import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const SendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"AquaMart" <${process.env.EMAIL}>`,
      to,
      subject: "Reset Your Password - OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding:20px;">
          <h2>Password Reset Request</h2>

          <p>Hello,</p>

          <p>Your One Time Password (OTP) for resetting your password is:</p>

          <h1 style="letter-spacing:5px; color:#0ea5e9;">
            ${otp}
          </h1>

          <p>This OTP is valid for <b>5 minutes</b>.</p>

          <p>If you didn't request this password reset, you can safely ignore this email.</p>

          <br/>

          <p>Thanks,</p>
          <p><b>AquaMart Team</b></p>
        </div>
      `,
    });

    console.log("OTP email sent successfully.");
  } catch (error) {
    console.error("Email Error:", error);
    throw error;
  }
};