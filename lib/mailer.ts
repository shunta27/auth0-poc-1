import nodemailer from "nodemailer";
import { generateEmailVerificationToken } from "./jwt";

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const user = process.env.MAILTRAP_SMTP_USER;
    const password = process.env.MAILTRAP_SMTP_PASSWORD;
    const host = process.env.MAILTRAP_SMTP_HOST;
    const port = parseInt(process.env.MAILTRAP_SMTP_PORT || "587");

    if (!user && !password && !host) {
      throw new Error(
        "No email configuration found. Please set MAILTRAP_SMTP_USER, MAILTRAP_SMTP_PASSWORD, and MAILTRAP_SMTP_HOST environment variables."
      );
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: user,
        pass: password,
      },
    });
  }

  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from:
        options.from ||
        process.env.MAILTRAP_FROM_EMAIL ||
        "noreply@example.com",
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Auth0 PoC!</h2>
      <p>Hi ${userName},</p>
      <p>Welcome to our application! Your account has been successfully created.</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p>You can now log in to your account and start using our services.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 14px;">
        This is an automated message from Auth0 PoC application.
      </p>
    </div>
  `;

  const text = `
    Welcome to Auth0 PoC!

    Hi ${userName},

    Welcome to our application! Your account has been successfully created.
    Email: ${userEmail}

    You can now log in to your account and start using our services.

    This is an automated message from Auth0 PoC application.
  `;

  return await sendEmail({
    to: userEmail,
    subject: "Welcome to Auth0 PoC!",
    text,
    html,
  });
}

export async function sendEmailVerification(
  userEmail: string,
  userName: string
): Promise<boolean> {
  try {
    const token = generateEmailVerificationToken(userEmail);
    const verifyUrl = `${process.env.EMAIL_VERIFY_URL}?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">Verify Your Email Address</h1>
          <p style="color: #666; font-size: 16px;">Complete your account setup</p>
        </div>

        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
          <p style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Hi ${userName},</p>
          <p style="margin: 0 0 15px 0; color: #333; line-height: 1.6;">
            Thank you for creating an account with Auth0 PoC. To complete your registration and verify your email address, please click the button below:
          </p>
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>Email:</strong> ${userEmail}
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}"
             style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Verify Email Address
          </a>
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Security Note:</strong> This verification link will expire in 24 hours for your security.
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            If you didn't create this account, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
            This is an automated message from Auth0 PoC application.
          </p>
        </div>
      </div>
    `;

    const text = `
      Verify Your Email Address - Auth0 PoC

      Hi ${userName},

      Thank you for creating an account with Auth0 PoC. To complete your registration and verify your email address, please click the link below:

      ${verifyUrl}

      Email: ${userEmail}

      Security Note: This verification link will expire in 24 hours for your security.

      If you didn't create this account, you can safely ignore this email.

      This is an automated message from Auth0 PoC application.
    `;

    const isLocal = process.env.NODE_ENV !== "production";
    const recipientEmail = isLocal
      ? process.env.TEST_EMAIL || userEmail
      : userEmail;

    return await sendEmail({
      to: recipientEmail,
      subject: "Verify Your Email Address - Auth0 PoC",
      text,
      html,
    });
  } catch (error) {
    console.error("Failed to send email verification:", error);
    return false;
  }
}
