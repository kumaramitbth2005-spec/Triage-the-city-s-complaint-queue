/**
 * emailService.js
 * Production-ready transactional email service.
 * Supports:
 * 1. Resend API (via RESEND_API_KEY or EMAIL_API_KEY)
 * 2. SMTP / Gmail / Custom Mail Server (via EMAIL_USER & EMAIL_PASS / nodemailer)
 * 3. Safe development fallback with simulated delivery
 * 
 * SECURITY:
 * - Credentials kept strictly server-side
 * - Sensitive credentials & OTPs never logged to console in production
 * - Masked email logging only
 */

const nodemailer = require('nodemailer');
const axios = require('axios');

// Mask email for safe server logging (e.g. amit@gmail.com -> a***@gmail.com)
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  if (local.length <= 1) return `*@${domain}`;
  return `${local[0]}${'*'.repeat(Math.min(local.length - 1, 4))}@${domain}`;
};

/**
 * Generate responsive professional HTML email template
 */
const buildVerificationEmailHtml = ({ name, otp, expiryMinutes = 5 }) => {
  const displayName = name ? name.split(' ')[0] : 'there';
  const appName = process.env.APP_NAME || 'Nexus AI';
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Verify your email address - ${appName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:20px;box-shadow:0 10px 30px rgba(15,23,42,0.08);overflow:hidden;border:1px solid #e2e8f0;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:36px 40px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:12px;text-align:center;vertical-align:middle;color:#ffffff;font-size:20px;font-weight:bold;">
                    ⚡
                  </td>
                  <td style="padding-left:12px;text-align:left;">
                    <div style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.5px;line-height:1.1;">${appName}</div>
                    <div style="color:rgba(255,255,255,0.8);font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-top:2px;">Civic Complaint Triage Platform</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 12px;letter-spacing:-0.5px;">Verify your email address</h1>
              <p style="font-size:14px;color:#475569;margin:0 0 24px;line-height:1.6;">
                Hello <strong style="color:#1e293b;">${displayName}</strong>,
              </p>
              <p style="font-size:14px;color:#475569;margin:0 0 28px;line-height:1.6;">
                Thank you for signing up with <strong style="color:#1e293b;">${appName}</strong>. Please use the 6-digit verification code below to confirm your email and activate your account:
              </p>

              <!-- OTP Highlight Box -->
              <div style="background:#f8fafc;border:2px dashed #cbd5e1;border-radius:16px;padding:28px 20px;text-align:center;margin:0 0 28px;">
                <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">
                  Your Verification Code
                </div>
                <div style="font-size:44px;font-weight:900;color:#4f46e5;letter-spacing:14px;font-family:'Courier New',Courier,monospace;line-height:1.1;padding-left:14px;">
                  ${otp}
                </div>
                <div style="font-size:12px;font-weight:600;color:#e11d48;margin-top:14px;">
                  ⏱ This code will expire in ${expiryMinutes} minutes
                </div>
              </div>

              <!-- Security Warning -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:12px;padding:16px;margin:0 0 24px;">
                <tr>
                  <td style="font-size:12px;color:#64748b;line-height:1.5;">
                    🔒 <strong style="color:#334155;">Security Notice:</strong> Never share this verification code with anyone. Our support team will never ask for your code.
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:0;">
                If you did not request this verification code, you can safely ignore this email. No changes will be made to your account.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="font-size:12px;color:#94a3b8;margin:0 0 6px;line-height:1.5;">
                Nexus AI · Automated Civic Grievance Triage & SLA Management
              </p>
              <p style="font-size:11px;color:#cbd5e1;margin:0;">
                © ${currentYear} Nexus AI. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Send email via Resend REST API
 */
const sendViaResend = async ({ apiKey, from, to, subject, html, text }) => {
  const endpoint = 'https://api.resend.com/emails';
  const payload = {
    from: from || 'Nexus AI <onboarding@resend.dev>',
    to: [to],
    subject,
    html,
    text
  };

  const response = await axios.post(endpoint, payload, {
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  return response.data;
};

/**
 * Send email via SMTP / Nodemailer
 */
const sendViaSmtp = async ({ host, port, user, pass, from, to, subject, html, text }) => {
  const smtpHost = host || 'smtp.gmail.com';
  const smtpPort = port ? parseInt(port, 10) : 587;
  const secure = smtpPort === 465;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' }
  });

  const mailOptions = {
    from: from || `"Nexus AI – Civic Triage" <${user}>`,
    to,
    subject,
    text,
    html
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Send an email OTP verification message to the user's email.
 * @param {object} opts
 * @param {string} opts.to             - Recipient email address
 * @param {string} opts.name           - User's name
 * @param {string} opts.otp            - Plain 6-digit OTP code
 * @param {number} [opts.expiryMinutes] - Expiration duration in minutes (default 5)
 */
const sendVerificationOtp = async ({ to, name, otp, expiryMinutes = 5 }) => {
  if (!to || !to.includes('@')) {
    throw new Error('Valid recipient email address is required.');
  }

  const resendApiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;
  const emailFrom = process.env.EMAIL_FROM || (emailUser ? `"Nexus AI" <${emailUser}>` : undefined);

  const subject = 'Verify your email address';
  const displayName = name ? name.split(' ')[0] : 'there';
  const textContent = [
    `Hello ${displayName},`,
    '',
    'Your email verification code is:',
    '',
    `   ${otp}`,
    '',
    `This code will expire in ${expiryMinutes} minutes.`,
    '',
    'If you did not request this verification code, you can safely ignore this email.',
    '',
    'Regards,',
    'Nexus AI Civic Complaint Triage Team'
  ].join('\n');

  const htmlContent = buildVerificationEmailHtml({ name, otp, expiryMinutes });

  console.log(`📧 Sending verification OTP to ${maskEmail(to)}...`);

  // 1. Try Resend API if API key is provided
  if (resendApiKey && resendApiKey.trim() !== '') {
    try {
      const res = await sendViaResend({
        apiKey: resendApiKey,
        from: emailFrom || 'Nexus AI <onboarding@resend.dev>',
        to,
        subject,
        html: htmlContent,
        text: textContent
      });
      console.log(`✅ [Resend] Verification email dispatched to ${maskEmail(to)} (ID: ${res?.id || 'ok'})`);
      return { success: true, provider: 'resend', id: res?.id };
    } catch (resendErr) {
      console.error('⚠️ Resend API delivery failed:', resendErr.response?.data || resendErr.message);
      // If SMTP is also configured, try SMTP fallback
      if (!emailUser || !emailPass) {
        throw new Error(`Email delivery failed: ${resendErr.response?.data?.message || resendErr.message}`);
      }
    }
  }

  // 2. Try SMTP (Gmail / Custom SMTP) if configured
  if (emailUser && emailPass) {
    try {
      const info = await sendViaSmtp({
        host: emailHost,
        port: emailPort,
        user: emailUser,
        pass: emailPass,
        from: emailFrom,
        to,
        subject,
        html: htmlContent,
        text: textContent
      });
      console.log(`✅ [SMTP] Verification email sent to ${maskEmail(to)} (MessageId: ${info?.messageId})`);
      return { success: true, provider: 'smtp', messageId: info?.messageId };
    } catch (smtpErr) {
      console.error('⚠️ SMTP email delivery failed:', smtpErr.message);
      throw new Error(`Email delivery failed via SMTP: ${smtpErr.message}`);
    }
  }

  // 3. Development / Sandbox fallback (when no API key or SMTP is configured in dev)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`ℹ️ [DEV SIMULATION] No EMAIL_API_KEY or EMAIL_USER configured in .env.`);
    console.log(`ℹ️ [DEV SIMULATION] Verification OTP for ${maskEmail(to)}: [${otp}] (expires in ${expiryMinutes}m)`);
    return { success: true, provider: 'simulation', simulated: true };
  }

  // In production, require at least one valid provider
  throw new Error('No email provider configured. Please set RESEND_API_KEY or EMAIL_USER/EMAIL_PASS in backend environment variables.');
};

module.exports = { 
  sendVerificationOtp,
  maskEmail
};
