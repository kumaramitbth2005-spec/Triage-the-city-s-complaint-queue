/**
 * emailService.js
 * Dual-Provider Transactional Email Service
 * 
 * PROVIDER PRIORITY:
 *   1. Gmail SMTP / Custom SMTP (via nodemailer)
 *      - Allows sending verification codes to ANY recipient email address in the world
 *        (any Gmail, Yahoo, Outlook, custom domains, etc.) without domain verification.
 *      - Configured via:
 *          GMAIL_USER + GMAIL_APP_PASSWORD (or EMAIL_USER + EMAIL_PASS)
 *   2. Resend API (via @resend)
 *      - Fallback if SMTP credentials are not configured, or if SMTP delivery fails.
 *      - Note: Resend free tier without a verified custom domain only sends to the
 *        account owner's email address.
 * 
 * SECURITY:
 * - Credentials kept strictly server-side (process.env)
 * - Sensitive credentials, passwords, and OTPs never logged to console
 * - Masked email logging only (e.g. a***@gmail.com)
 */

const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Mask email for safe server logging (e.g. amit@gmail.com -> a***@gmail.com)
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  if (local.length <= 1) return `*@${domain}`;
  return `${local[0]}${'*'.repeat(Math.min(local.length - 1, 4))}@${domain}`;
};

/**
 * Generate professional responsive HTML email template for Civic Complaint Triage
 */
const buildVerificationEmailHtml = ({ otp, expiryMinutes = 10 }) => {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Verify your Civic Complaint Triage account</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background-color:#ffffff;border-radius:18px;box-shadow:0 10px 30px rgba(15,23,42,0.06);overflow:hidden;border:1px solid #e2e8f0;">
          
          <!-- Brand Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 36px;text-align:left;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:42px;height:42px;background:rgba(255,255,255,0.2);border-radius:12px;text-align:center;vertical-align:middle;color:#ffffff;font-size:20px;font-weight:bold;">
                    🏛️
                  </td>
                  <td style="padding-left:14px;">
                    <div style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.4px;">Civic Complaint Triage</div>
                    <div style="color:rgba(255,255,255,0.85);font-size:12px;font-weight:500;margin-top:2px;">Automated Civic Grievance & SLA Management</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <p style="font-size:15px;color:#334155;margin:0 0 16px;line-height:1.6;">
                Hello,
              </p>
              <p style="font-size:15px;color:#334155;margin:0 0 24px;line-height:1.6;">
                We received a request to create or verify an account for Civic Complaint Triage.
              </p>
              <p style="font-size:14px;color:#64748b;margin:0 0 12px;font-weight:600;">
                Your 6-digit verification code is:
              </p>

              <!-- OTP Highlight Box -->
              <div style="background-color:#f1f5f9;border:2px dashed #cbd5e1;border-radius:14px;padding:24px 16px;text-align:center;margin:0 0 24px;">
                <div style="font-size:40px;font-weight:900;color:#4f46e5;letter-spacing:10px;font-family:'Courier New',Courier,monospace;line-height:1.1;padding-left:10px;">
                  ${otp}
                </div>
                <div style="font-size:12px;font-weight:600;color:#dc2626;margin-top:12px;">
                  ⏱ This code expires in ${expiryMinutes} minutes.
                </div>
              </div>

              <!-- Security Notice -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:10px;padding:14px 16px;margin:0 0 24px;border:1px solid #edf2f7;">
                <tr>
                  <td style="font-size:12px;color:#64748b;line-height:1.5;">
                    🔒 <strong style="color:#334155;">Security Notice:</strong> Never share this verification code with anyone. Our support team will never ask for your code.
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0 0 24px;">
                If you did not request this account, you can safely ignore this email.
              </p>

              <p style="font-size:14px;color:#334155;line-height:1.5;margin:0;font-weight:600;">
                Civic Complaint Triage Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="font-size:11px;color:#94a3b8;margin:0;line-height:1.5;">
                This is an automated administrative notification. Please do not reply directly to this email.<br/>
                © ${currentYear} Civic Complaint Triage Platform. All rights reserved.
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
 * Generate plain text email for clients not rendering HTML
 */
const buildVerificationEmailText = ({ otp, expiryMinutes = 10 }) => {
  return [
    'Hello,',
    '',
    'We received a request to create or verify an account for Civic Complaint Triage.',
    '',
    'Your 6-digit verification code is:',
    '',
    otp,
    '',
    `This code expires in ${expiryMinutes} minutes.`,
    '',
    'Security Notice: Never share this verification code with anyone.',
    'If you did not request this account, you can safely ignore this email.',
    '',
    'Civic Complaint Triage Team'
  ].join('\n');
};

/**
 * Resolve SMTP credentials from environment variables
 */
const getSmtpConfig = () => {
  const user = (process.env.GMAIL_USER || process.env.EMAIL_USER || '').trim();
  const rawPass = (process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || '').trim();
  // Strip any spaces from Google App Password (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const pass = rawPass.replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  const host = (process.env.EMAIL_HOST || 'smtp.gmail.com').trim();
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

  return { user, pass, host, port, secure };
};

/**
 * Create or reuse nodemailer transporter
 */
let cachedTransporter = null;
const getTransporter = () => {
  const config = getSmtpConfig();
  if (!config) return null;

  if (cachedTransporter) return cachedTransporter;

  if (config.host.toLowerCase().includes('gmail')) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.user,
        pass: config.pass
      }
    });
  } else {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });
  }

  return cachedTransporter;
};

/**
 * Send email via SMTP (Nodemailer)
 */
const sendViaSmtp = async ({ to, otp, expiryMinutes }) => {
  const config = getSmtpConfig();
  const transporter = getTransporter();

  if (!config || !transporter) {
    throw new Error('SMTP is not configured.');
  }

  const fromName = process.env.EMAIL_FROM_NAME || 'Civic Complaint Triage';
  const fromHeader = `"${fromName}" <${config.user}>`;
  const subject = `Your verification code is: ${otp}`;
  const html = buildVerificationEmailHtml({ otp, expiryMinutes });
  const text = buildVerificationEmailText({ otp, expiryMinutes });

  const info = await transporter.sendMail({
    from: fromHeader,
    to,
    subject,
    html,
    text,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high',
      'X-Mailer': 'CivicComplaintTriage-SMTP/1.0',
      'X-Entity-Ref-ID': `otp-${Date.now()}`
    }
  });

  return {
    success: true,
    provider: 'smtp',
    messageId: info.messageId
  };
};

/**
 * Send email via Resend API
 */
const sendViaResend = async ({ to, otp, expiryMinutes }) => {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured in environment variables.');
  }

  const resend = new Resend(apiKey);
  const senderEmail = process.env.EMAIL_FROM || 'Civic Complaint Triage <onboarding@resend.dev>';
  const subject = `Your verification code is: ${otp}`;
  const html = buildVerificationEmailHtml({ otp, expiryMinutes });
  const text = buildVerificationEmailText({ otp, expiryMinutes });

  const sendResult = await resend.emails.send({
    from: senderEmail,
    to: [to],
    subject,
    html,
    text,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high',
      'X-Mailer': 'CivicComplaintTriage-Resend/1.0',
      'X-Entity-Ref-ID': `otp-${Date.now()}`
    }
  });

  const { data, error } = sendResult || {};

  if (error) {
    const errorMsg = error.message || JSON.stringify(error);
    if (
      errorMsg.toLowerCase().includes('only send testing emails to your own email address') ||
      error.statusCode === 403
    ) {
      const helpfulErr = new Error(
        'Resend free tier only allows sending to the account owner email. To send verification emails to any Gmail address, configure EMAIL_USER and EMAIL_PASS (Gmail App Password) in your backend environment variables.'
      );
      helpfulErr.code = 'RESEND_RECIPIENT_RESTRICTED';
      helpfulErr.statusCode = 403;
      throw helpfulErr;
    }
    const err = new Error(errorMsg);
    err.code = 'RESEND_API_ERROR';
    throw err;
  }

  if (!data || !data.id) {
    throw new Error('Resend did not return a message ID.');
  }

  return {
    success: true,
    provider: 'resend',
    messageId: data.id
  };
};

/**
 * Primary dispatch function: Send verification OTP via Gmail SMTP or Resend fallback
 * @param {object} opts
 * @param {string} opts.to              - Recipient email address
 * @param {string} opts.otp             - 6-digit verification code
 * @param {number} [opts.expiryMinutes] - Expiration duration in minutes (default 10)
 */
const sendVerificationOtp = async ({ to, otp, expiryMinutes = 10 }) => {
  if (!to || !to.includes('@')) {
    throw new Error('Valid recipient email address is required.');
  }

  const cleanRecipient = to.toLowerCase().trim();
  const smtpConfig = getSmtpConfig();
  const hasResend = !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());

  if (!smtpConfig && !hasResend) {
    console.error('❌ Email service error: Neither SMTP (GMAIL_USER/EMAIL_USER) nor RESEND_API_KEY is configured.');
    throw new Error('Email delivery service is currently unconfigured. Please configure EMAIL_USER & EMAIL_PASS or RESEND_API_KEY.');
  }

  console.log(`📨 Attempting to dispatch OTP to: ${maskEmail(cleanRecipient)}`);

  // Priority 1: Gmail SMTP / Custom SMTP (supports ANY recipient email address)
  if (smtpConfig) {
    try {
      console.log(`🚀 Sending via SMTP (${smtpConfig.host}) to ${maskEmail(cleanRecipient)}...`);
      const result = await sendViaSmtp({ to: cleanRecipient, otp, expiryMinutes });
      console.log(`✅ SMTP email dispatched successfully. Message ID: ${result.messageId}`);
      return result;
    } catch (smtpErr) {
      console.warn(`⚠️ SMTP dispatch failed: ${smtpErr.message}`);
      if (hasResend) {
        console.log('🔄 Falling back to Resend API...');
      } else {
        throw smtpErr;
      }
    }
  }

  // Priority 2: Resend API (as fallback or primary if SMTP not provided)
  if (hasResend) {
    try {
      console.log(`🚀 Sending via Resend API to ${maskEmail(cleanRecipient)}...`);
      const result = await sendViaResend({ to: cleanRecipient, otp, expiryMinutes });
      console.log(`✅ Resend email dispatched successfully. ID: ${result.messageId}`);
      return result;
    } catch (resendErr) {
      console.error(`❌ Resend dispatch failed: ${resendErr.message}`);
      throw resendErr;
    }
  }

  throw new Error('All configured email dispatch methods failed.');
};

module.exports = {
  sendVerificationOtp,
  maskEmail,
  getSmtpConfig
};
