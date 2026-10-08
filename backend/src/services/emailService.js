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
  // Default to port 465 (SSL) — Render.com and most cloud hosts block 587 (STARTTLS) outbound
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  // Port 465 always uses SSL; 587/25 use STARTTLS (secure:false)
  const secure = port === 465 || process.env.EMAIL_SECURE === 'true';

  return { user, pass, host, port, secure };
};

/**
 * Build a fresh nodemailer transporter for the given port/secure config.
 * We deliberately do NOT cache the transporter — caching prevents the
 * automatic port-465 fallback from working when 587 is blocked.
 */
const buildTransporter = ({ host, port, secure, user, pass }) =>
  nodemailer.createTransport({
    host,
    port,
    secure,                     // true for 465 SSL, false for 587/25 STARTTLS
    auth: { user, pass },
    connectionTimeout: 10000,   // 10 s — cloud SMTP handshakes can be slow
    greetingTimeout: 10000,
    socketTimeout: 12000,
    tls: { rejectUnauthorized: false }  // avoids SNI issues on some cloud providers
  });

/**
 * Send email via SMTP (Nodemailer).
 * Strategy:
 *   1. Try the port specified in env (default 465).
 *   2. If that port fails AND it isn't 465, automatically retry on port 465 (SSL).
 *      This makes Gmail work on Render free-tier even when EMAIL_PORT=587 is set.
 */
const sendViaSmtp = async ({ to, otp, expiryMinutes }) => {
  const config = getSmtpConfig();
  if (!config) throw new Error('SMTP is not configured.');

  const fromName = process.env.EMAIL_FROM_NAME || 'Civic Complaint Triage';
  const mailOptions = {
    from: `"${fromName}" <${config.user}>`,
    to,
    subject: `Your verification code is: ${otp}`,
    html: buildVerificationEmailHtml({ otp, expiryMinutes }),
    text: buildVerificationEmailText({ otp, expiryMinutes }),
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high',
      'X-Mailer': 'CivicComplaintTriage-SMTP/1.0',
      'X-Entity-Ref-ID': `otp-${Date.now()}`
    }
  };

  // --- Attempt 1: configured port (from env, default 465) ---
  try {
    const t = buildTransporter(config);
    const info = await t.sendMail(mailOptions);
    return { success: true, provider: 'smtp', messageId: info.messageId };
  } catch (primaryErr) {
    console.warn(`⚠️  SMTP port ${config.port} failed: ${primaryErr.message}`);

    // --- Attempt 2: automatic port-465 SSL retry (works on Render free tier) ---
    if (config.port !== 465) {
      console.log('🔄  Retrying SMTP on port 465 (SSL)…');
      const altConfig = { ...config, port: 465, secure: true };
      const t2 = buildTransporter(altConfig);
      const info2 = await t2.sendMail(mailOptions);   // throws on failure → caught upstream
      return { success: true, provider: 'smtp', messageId: info2.messageId };
    }

    throw primaryErr;
  }
};

/**
 * Send email via Brevo REST API (HTTPS port 443 - works on Render Free Tier to ANY email)
 */
const sendViaBrevo = async ({ to, otp, expiryMinutes }) => {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured in environment variables.');
  }

  const fromName = process.env.EMAIL_FROM_NAME || 'Civic Complaint Triage';
  const fromEmail = (process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'no-reply@civictriage.gov').trim();
  const subject = `Your verification code is: ${otp}`;
  const htmlContent = buildVerificationEmailHtml({ otp, expiryMinutes });
  const textContent = buildVerificationEmailText({ otp, expiryMinutes });

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Brevo API error: ${res.status}`);
  }

  return {
    success: true,
    provider: 'brevo',
    messageId: data.messageId || 'brevo-sent'
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

  // Sender address — set RESEND_FROM_EMAIL after verifying your domain on resend.com/domains
  // e.g. RESEND_FROM_EMAIL="Civic Triage <noreply@yourdomain.com>"
  // Until domain is verified, only sending to the Resend account-owner email works (testing mode).
  const senderEmail = (process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'Civic Complaint Triage <onboarding@resend.dev>').trim();
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
        'Resend free tier only allows sending to the account owner email. External recipient restricted.'
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
 * Primary dispatch function: Send verification OTP
 * 
 * PROVIDER PRIORITY (optimised for Render free tier):
 *   1. Resend API (HTTPS 443) — works on Render free tier; supports any recipient
 *      once a custom domain is verified in the Resend dashboard.
 *      Without a verified domain it only sends to the account-owner email (testing).
 *   2. Gmail SMTP (port 587 / 465) — works locally and on paid cloud hosts.
 *      Render free tier blocks all outbound SMTP ports.
 *   3. Brevo REST API (HTTPS 443) — works on Render free tier; 300 emails/day free.
 *
 * @param {object} opts
 * @param {string} opts.to              - Recipient email address
 * @param {string} opts.otp             - 6-digit verification code (never returned to frontend)
 * @param {number} [opts.expiryMinutes] - Expiration in minutes (default 10)
 */
const sendVerificationOtp = async ({ to, otp, expiryMinutes = 10 }) => {
  if (!to || !to.includes('@')) {
    throw new Error('Valid recipient email address is required.');
  }

  const cleanRecipient = to.toLowerCase().trim();
  const smtpConfig = getSmtpConfig();
  const hasResend = !!(process.env.RESEND_API_KEY?.trim());
  const hasBrevo  = !!(process.env.BREVO_API_KEY?.trim());

  console.log(`📨 Attempting to dispatch OTP to: ${maskEmail(cleanRecipient)}`);

  // Priority 1: Resend API (HTTPS 443 — works on Render free tier)
  // Sends to ANY recipient once a custom domain is verified on resend.com/domains
  if (hasResend) {
    try {
      console.log(`🚀 Sending via Resend API to ${maskEmail(cleanRecipient)}...`);
      const result = await sendViaResend({ to: cleanRecipient, otp, expiryMinutes });
      console.log(`✅ Resend email dispatched successfully. ID: ${result.messageId}`);
      return result;
    } catch (resendErr) {
      console.warn(`⚠️ Resend dispatch failed: ${resendErr.message}`);
      // If Resend explicitly says the recipient is restricted (unverified domain),
      // fall through to SMTP. Don't give up yet.
    }
  }

  // Priority 2: Gmail SMTP / Custom SMTP
  // Works locally (port 587) and on paid VPS/cloud hosts that allow outbound SMTP.
  // NOTE: Render free tier blocks ALL outbound SMTP — both port 587 and 465.
  if (smtpConfig) {
    try {
      console.log(`🚀 Sending via SMTP (${smtpConfig.host}:${smtpConfig.port}) to ${maskEmail(cleanRecipient)}...`);
      const result = await sendViaSmtp({ to: cleanRecipient, otp, expiryMinutes });
      console.log(`✅ SMTP email dispatched successfully. Message ID: ${result.messageId}`);
      return result;
    } catch (smtpErr) {
      console.warn(`⚠️ SMTP dispatch failed: ${smtpErr.message}`);
    }
  }

  // Priority 3: Brevo REST API (HTTPS 443 — works on Render free tier, any recipient)
  if (hasBrevo) {
    try {
      console.log(`🚀 Sending via Brevo REST API to ${maskEmail(cleanRecipient)}...`);
      const result = await sendViaBrevo({ to: cleanRecipient, otp, expiryMinutes });
      console.log(`✅ Brevo email dispatched successfully. ID: ${result.messageId}`);
      return result;
    } catch (brevoErr) {
      console.warn(`⚠️ Brevo dispatch failed: ${brevoErr.message}`);
    }
  }

  throw new Error('All configured email dispatch methods failed. Please configure SMTP (Gmail), Brevo, or Resend credentials in environment variables.');
};

module.exports = {
  sendVerificationOtp,
  maskEmail,
  getSmtpConfig
};
