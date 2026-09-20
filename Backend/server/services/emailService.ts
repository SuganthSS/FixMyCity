import nodemailer from 'nodemailer';

// Helper: Get Gmail SMTP transporter using process.env
const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Startup check helper to log SMTP status.
 */
export const checkSmtpStatus = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  if (user && pass) {
    console.log('✓ Gmail SMTP configured');
  } else {
    console.warn('⚠ Gmail SMTP not configured (Missing EMAIL_USER or EMAIL_PASSWORD)');
  }
};

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Core sendEmail helper.
 * Sends emails via Gmail SMTP (Nodemailer) or logs gracefully when credentials are missing.
 */
export const sendEmail = async ({ to, subject, html, from }: SendEmailOptions) => {
  const transporter = getTransporter();
  const sender = from || process.env.EMAIL_USER || 'FixMyCity <no-reply@fixmycity.org>';

  if (!transporter) {
    console.warn('[emailService] Gmail SMTP is not configured. Email dispatch logged in fallback mode:');
    console.warn(`[emailService] To: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.warn(`[emailService] Subject: ${subject}`);
    return {
      success: true,
      simulated: true,
      message: 'Email dispatch simulated (Gmail SMTP not configured).',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      html,
    });

    console.log(`[emailService] Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[emailService] Failed to send email via Gmail SMTP:', error);
    return { success: false, error: error.message || error };
  }
};

/**
 * Base FixMyCity HTML Email Layout
 */
const getBaseTemplate = (title: string, bodyContent: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 32px auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: #0f172a;
      padding: 32px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      text-decoration: none;
    }
    .logo-badge {
      color: #10b981;
    }
    .content {
      padding: 40px 32px;
    }
    .h1 {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .p {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-block;
      background-color: #0f172a;
      color: #ffffff !important;
      font-weight: 600;
      font-size: 15px;
      padding: 14px 28px;
      border-radius: 12px;
      text-decoration: none;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #475569;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">FixMy<span class="logo-badge">City</span></div>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} FixMyCity. Empowering cleaner and safer communities.</p>
      <p>This is an automated operational notification, please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * 1. Welcome Email Template
 */
export const sendWelcomeEmail = async (email: string, name: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const subject = 'Welcome to FixMyCity!';
  const html = getBaseTemplate(
    subject,
    `
    <h1 class="h1">Welcome aboard, ${name}!</h1>
    <p class="p">Thank you for joining <strong>FixMyCity</strong>. Your account has been successfully created.</p>
    <p class="p">With FixMyCity, you can report civic issues like potholes, streetlights, garbage, and water leaks directly to public authorities and track their resolution in real-time.</p>
    <div style="text-align: center;">
      <a href="${frontendUrl}/report" class="btn">Report Your First Issue</a>
    </div>
    <p class="p">Together, we can build a better, cleaner city.</p>
    `
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * 2. Password Reset Email Template
 */
export const sendPasswordResetEmail = async ({ email, name, resetToken }: { email: string; name: string; resetToken: string }) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
  const subject = 'Reset Your FixMyCity Password';
  const html = getBaseTemplate(
    subject,
    `
    <h1 class="h1">Hello ${name},</h1>
    <p class="p">We received a request to reset the password for your FixMyCity account.</p>
    <p class="p">Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <p class="p">If you did not request a password reset, you can safely ignore this email.</p>
    <p class="p" style="font-size: 13px; color: #94a3b8; word-break: break-all;">
      Or copy and paste this link into your browser:<br/>
      <a href="${resetUrl}">${resetUrl}</a>
    </p>
    `
  );

  return sendEmail({ to: email, subject, html });
};

/**
 * 3. General / Notification Email Template
 */
export const sendNotificationEmail = async ({ email, name, title, message, actionUrl, actionText }: {
  email: string;
  name: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}) => {
  const subject = `[FixMyCity] ${title}`;
  const actionButton = actionUrl && actionText ? `
    <div style="text-align: center;">
      <a href="${actionUrl}" class="btn">${actionText}</a>
    </div>
  ` : '';

  const html = getBaseTemplate(
    title,
    `
    <h1 class="h1">Hello ${name},</h1>
    <p class="p">${message}</p>
    ${actionButton}
    `
  );

  return sendEmail({ to: email, subject, html });
};
