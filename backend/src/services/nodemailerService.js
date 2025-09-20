import nodemailer from "nodemailer";

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ Missing EMAIL_USER or EMAIL_PASS in .env file");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Gmail connection failed:", error.message);
  } else {
    console.log("✅ Email service is configured correctly.");
  }
});

const sendOtpEmail = async (email, otp) => {
  try {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Verification Code</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
      font-family: Arial, sans-serif;
      -webkit-text-size-adjust: none;
    }
    .container {
      max-width: 500px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      padding: 30px;
      text-align: center;
    }
    .logo {
      font-size: 22px;
      font-weight: bold;
      color: #4CAF50;
      margin-bottom: 15px;
    }
    h2 {
      color: #333333;
      margin: 10px 0;
    }
    p {
      color: #555555;
      font-size: 15px;
      line-height: 1.5;
    }
    .otp {
      display: inline-block;
      font-size: 28px;
      letter-spacing: 12px;
      font-weight: bold;
      color: #2c3e50;
      background: #f0f0f0;
      padding: 10px 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer {
      font-size: 12px;
      color: #7f8c8d;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🔒 WhatsApp Clone</div>
    <h2>Email Verification</h2>
    <p>Use the following 6-digit code to verify your email address:</p>
    <div class="otp">${otp}</div>
    <p>This code will expire in <strong>5 minutes</strong>. Please do not share it with anyone.</p>
    <div class="footer">
      If you didn’t request this code, you can safely ignore this email.
    </div>
  </div>
</body>
</html>
`;

    await transporter.sendMail({
      from: `"WhatsApp Web" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your WhatsApp Verification Code",
      html,
    });

    console.log(`✅ OTP email sent to ${email}`);
  } catch (err) {
    console.error("❌ Failed to send OTP email:", err.message);
    throw err;
  }
};

export { sendOtpEmail };
