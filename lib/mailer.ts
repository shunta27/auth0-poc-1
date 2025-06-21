import nodemailer from 'nodemailer';

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
    const apiKey = process.env.MAILTRAP_API_KEY;
    const host = process.env.MAILTRAP_SMTP_HOST;
    const port = parseInt(process.env.MAILTRAP_SMTP_PORT || '587');

    if (!apiKey || !host) {
      throw new Error('Missing Mailtrap configuration: MAILTRAP_API_KEY or MAILTRAP_SMTP_HOST');
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'api',
        pass: apiKey,
      },
    });
  }

  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();
    
    const mailOptions = {
      from: options.from || process.env.MAILTRAP_FROM_EMAIL || 'noreply@example.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
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
    subject: 'Welcome to Auth0 PoC!',
    text,
    html,
  });
}