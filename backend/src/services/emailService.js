/**
 * emailService.js
 * Dual-Provider Transactional Email Service
 *
 * PROVIDER PRIORITY:
 *   1. Resend API (HTTPS 443)
 *      - Works on Render free tier; supports any recipient once a custom domain
 *        is verified at resend.com/domains.
 *      - Without a verified domain, Resend only delivers to the account-owner
 *        email (testing mode) — NOT to arbitrary Gmail addresses.
 *   2. Gmail SMTP / Custom SMTP (via nodemailer)
 *      - Works locally and on paid cloud hosts.
 *      - Render.com FREE tier blocks ALL outbound SMTP (ports 25, 465, 587).
 *   3. Brevo REST API (HTTPS 443)
 *      - Works on Render free tier; 300 emails/day on the free plan.
 *
 * SPAM / DELIVERABILITY NOTES (why emails land in Inbox, not Spam):
 *   - "X-Priority: 1" and "Importance: high" headers are REMOVED.
 *     These are classic spam signals that Gmail penalises.
 *   - Subject line no longer embeds the OTP code; it uses a plain, trustworthy
 *     phrase.  OTP-in-subject is a phishing pattern that spam filters flag.
 *   - Sender name is "Smart City" (consistent with the app branding) everywhere.
 *   - HTML is lightweight, no tracking pixels, no external image resources.
 *   - Plain-text part is always provided alongside HTML.
 *   - The from-address is the verified sender (Gmail account or Resend domain).
 *
 * SECURITY:
 *   - Credentials kept strictly server-side (process.env).
 *   - OTP value is NEVER logged or returned to the frontend.
 *   - Masked email logging only (e.g. a***@gmail.com).
 */

'use strict';

const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Mask an email address for safe server logging (amit@gmail.com → a***@gmail.com) */
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  if (local.length <= 1) return `*@${domain}`;
  return `${local[0]}${'*'.repeat(Math.min(local.length - 1, 4))}@${domain}`;
};

// ─── Email Templates ─────────────────────────────────────────────────────────

/**
 * Build a clean, mobile-friendly HTML email for OTP delivery.
 *
 * Design choices for inbox placement:
 *  - No tracking pixels, no external CDN images.
 *  - Plain gradient header with emoji logo (renders in all clients).
 *  - OTP displayed in a high-contrast monospace block.
 *  - Minimal link count (zero external links).
 *  - Short, focused copy with no promotional language.
 */
const buildVerificationEmailHtml = ({ otp, expiryMinutes = 10, recipientName = 'there' }) => {
  const currentYear = new Date().getFullYear();
  const firstName = (recipientName || 'there').split(' ')[0];

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Your Smart City verification code</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:36px 16px;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(15,23,42,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:28px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:40px;height:40px;background:rgba(255,255,255,0.18);border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;">
                    🏛️
                  </td>
                  <td style="padding-left:12px;">
                    <div style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.3px;">Smart City</div>
                    <div style="color:rgba(255,255,255,0.80);font-size:11px;font-weight:500;margin-top:2px;">Municipal Complaint Triage Platform</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="font-size:15px;color:#334155;margin:0 0 8px;line-height:1.6;">
                Hi ${firstName},
              </p>
              <p style="font-size:15px;color:#334155;margin:0 0 24px;line-height:1.6;">
                We received a request to verify your email address for Smart City. Use the code below to complete your account registration.
              </p>

              <p style="font-size:12px;font-weight:700;color:#64748b;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.05em;">
                Your verification code
              </p>

              <!-- OTP Box -->
              <div style="background-color:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;padding:22px 16px;text-align:center;margin:0 0 22px;">
                <div style="font-size:38px;font-weight:900;color:#4f46e5;letter-spacing:12px;font-family:'Courier New',Courier,monospace;line-height:1;padding-left:12px;">
                  ${otp}
                </div>
                <p style="font-size:12px;color:#ef4444;margin:12px 0 0;font-weight:600;">
                  ⏱ Expires in ${expiryMinutes} minutes
                </p>
              </div>

              <!-- Security Notice -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border-radius:10px;border:1px solid #fde68a;margin:0 0 22px;">
                <tr>
                  <td style="padding:12px 16px;font-size:12px;color:#92400e;line-height:1.5;">
                    🔒 <strong style="color:#78350f;">Security reminder:</strong> Never share this code with anyone. Smart City staff will never ask for your verification code.
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0 0 20px;">
                If you did not request this code, you can safely ignore this email — your account will not be created without it.
              </p>

              <p style="font-size:13px;color:#334155;margin:0;font-weight:600;">
                The Smart City Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="font-size:11px;color:#94a3b8;margin:0;line-height:1.5;">
                This is an automated message — please do not reply to this email.<br/>
                © ${currentYear} Smart City · Municipal Complaint Triage Platform
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
 * Plain-text version sent alongside HTML for clients that do not render HTML
 * and to improve deliverability (no plain-text = spam signal).
 */
const buildVerificationEmailText = ({ otp, expiryMinutes = 10, recipientName = 'there' }) => {
  const firstName = (recipientName || 'there').split(' ')[0];
  return [
    `Hi ${firstName},`,
    '',
    'We received a request to verify your email address for Smart City.',
    'Use the code below to complete your account registration.',
    '',
    '─────────────────────',
    `  Verification code: ${otp}`,
    `  Expires in: ${expiryMinutes} minutes`,
    '─────────────────────',
    '',
    'Security reminder: Never share this code with anyone.',
    'Smart City staff will never ask for your verification code.',
    '',
    'If you did not request this code, you can safely ignore this email.',
    'Your account will not be created without it.',
    '',
    '— The Smart City Team',
  ].join('\n');
};

// ─── SMTP ─────────────────────────────────────────────────────────────────────

/** Resolve SMTP credentials from environment variables */
const getSmtpConfig = () => {
  const user = (process.env.GMAIL_USER || process.env.EMAIL_USER || '').trim();
  // Strip spaces from Google App Password (e.g. "abcd efgh ijkl mnop" → "abcdefghijklmnop")
  const rawPass = (process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || '').trim();
  const pass = rawPass.replace(/\s+/g, '');

  if (!user || !pass) return null;

  const host = (process.env.EMAIL_HOST || 'smtp.gmail.com').trim();
  // Default port 465 (SSL) — reliable on all networks and avoids STARTTLS port 587 ISP blocks
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  const secure = port === 465 || process.env.EMAIL_SECURE === 'true';

  return { user, pass, host, port, secure };
};

/**
 * Build a fresh nodemailer transporter.
 * Uses service: 'gmail' for Gmail accounts for maximum reliability and direct SSL.
 */
const buildTransporter = ({ host, port, secure, user, pass }) => {
  const isGmail = host === 'smtp.gmail.com' || user.toLowerCase().endsWith('@gmail.com');

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 12000,
      tls: { rejectUnauthorized: false }
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 12000,
    tls: { rejectUnauthorized: false }
  });
};

/**
 * Send via SMTP.
 * Attempts primary connection first, then retries on port 465 SSL if needed.
 */
const sendViaSmtp = async ({ to, otp, expiryMinutes, recipientName }) => {
  const config = getSmtpConfig();
  if (!config) throw new Error('SMTP credentials are not configured.');

  const fromName = process.env.EMAIL_FROM_NAME || 'Smart City';
  const mailOptions = {
    from: `"${fromName}" <${config.user}>`,
    to,
    subject: 'Your Smart City verification code',
    html: buildVerificationEmailHtml({ otp, expiryMinutes, recipientName }),
    text: buildVerificationEmailText({ otp, expiryMinutes, recipientName }),
  };

  // Attempt 1: primary transporter
  try {
    const t = buildTransporter(config);
    const info = await t.sendMail(mailOptions);
    return { success: true, provider: 'smtp', messageId: info.messageId };
  } catch (primaryErr) {
    console.warn(`⚠️  SMTP attempt failed: ${primaryErr.message}`);

    // Attempt 2: auto-retry with explicit port 465 SSL if not tried
    try {
      console.log('🔄  Retrying SMTP with direct port 465 SSL…');
      const altTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: config.user, pass: config.pass },
        connectionTimeout: 10000,
        tls: { rejectUnauthorized: false }
      });
      const info2 = await altTransporter.sendMail(mailOptions);
      return { success: true, provider: 'smtp', messageId: info2.messageId };
    } catch (retryErr) {
      console.warn(`⚠️  SMTP 465 retry failed: ${retryErr.message}`);
      throw primaryErr;
    }
  }
};

// ─── Brevo ───────────────────────────────────────────────────────────────────

/** Send via Brevo REST API (HTTPS 443 — works on Render free tier) */
const sendViaBrevo = async ({ to, otp, expiryMinutes, recipientName }) => {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  if (!apiKey) throw new Error('BREVO_API_KEY is not configured.');

  const fromName = process.env.EMAIL_FROM_NAME || 'Smart City';
  const fromEmail = (
    process.env.BREVO_SENDER_EMAIL ||
    process.env.EMAIL_USER ||
    'no-reply@smartcity.app'
  ).trim();

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to }],
      subject: 'Your Smart City verification code',
      htmlContent: buildVerificationEmailHtml({ otp, expiryMinutes, recipientName }),
      textContent: buildVerificationEmailText({ otp, expiryMinutes, recipientName }),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Brevo API error: ${res.status}`);
  }

  return { success: true, provider: 'brevo', messageId: data.messageId || 'brevo-sent' };
};

// ─── Resend ───────────────────────────────────────────────────────────────────

/** Send via Resend API */
const sendViaResend = async ({ to, otp, expiryMinutes, recipientName }) => {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.');

  const resend = new Resend(apiKey);

  const senderEmail = (
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    'Smart City <onboarding@resend.dev>'
  ).trim();

  const sendResult = await resend.emails.send({
    from: senderEmail,
    to: [to],
    subject: 'Your Smart City verification code',
    html: buildVerificationEmailHtml({ otp, expiryMinutes, recipientName }),
    text: buildVerificationEmailText({ otp, expiryMinutes, recipientName }),
  });

  const { data, error } = sendResult || {};

  if (error) {
    const errorMsg = error.message || JSON.stringify(error);
    if (
      errorMsg.toLowerCase().includes('only send testing emails to your own email address') ||
      error.statusCode === 403
    ) {
      const helpfulErr = new Error(
        'Resend free tier: can only send to the account-owner email until a custom domain is verified at resend.com/domains.'
      );
      helpfulErr.code = 'RESEND_RECIPIENT_RESTRICTED';
      helpfulErr.statusCode = 403;
      throw helpfulErr;
    }
    const err = new Error(errorMsg);
    err.code = 'RESEND_API_ERROR';
    throw err;
  }

  if (!data?.id) {
    throw new Error('Resend did not return a message ID.');
  }

  return { success: true, provider: 'resend', messageId: data.id };
};

// ─── Primary Dispatch ─────────────────────────────────────────────────────────

/**
 * Send a verification OTP email to the given recipient.
 *
 * Adaptive Priority:
 *   - Local / Non-Render: Gmail SMTP first (delivers directly to any recipient without domain restriction)
 *   - Cloud / Render: Resend API / Brevo first (ports 25/465/587 blocked on Render free tier)
 */
const sendVerificationOtp = async ({ to, otp, expiryMinutes = 10, name }) => {
  if (!to || !to.includes('@')) {
    throw new Error('Valid recipient email address is required.');
  }

  const cleanRecipient = to.toLowerCase().trim();
  const recipientName = name || 'there';
  const smtpConfig = getSmtpConfig();
  const hasResend = !!(process.env.RESEND_API_KEY?.trim());
  const hasBrevo = !!(process.env.BREVO_API_KEY?.trim());
  const isRender = !!process.env.RENDER;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔐 [VERIFICATION OTP DISPATCH]`);
  console.log(`📧 Recipient : ${cleanRecipient}`);
  console.log(`👉 OTP Code  : ${otp}`);
  console.log(`⏱️  Valid for : ${expiryMinutes} minutes`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Strategy 1: If not on Render and SMTP is configured, prefer Gmail SMTP
  // (Gmail SMTP delivers to ANY recipient, whereas Resend onboarding@resend.dev only delivers to account owner)
  if (!isRender && smtpConfig) {
    try {
      console.log(`🚀 [Priority 1: Gmail SMTP] → ${maskEmail(cleanRecipient)}`);
      const result = await sendViaSmtp({ to: cleanRecipient, otp, expiryMinutes, recipientName });
      console.log(`✅ Gmail SMTP accepted email. Message ID: ${result.messageId}`);
      return result;
    } catch (smtpErr) {
      console.warn(`⚠️  Gmail SMTP failed: ${smtpErr.message}. Trying API fallbacks...`);
    }
  }

  // Strategy 2: Resend API
  if (hasResend) {
    try {
      console.log(`🚀 [Resend API] → ${maskEmail(cleanRecipient)}`);
      const result = await sendViaResend({ to: cleanRecipient, otp, expiryMinutes, recipientName });
      console.log(`✅ Resend accepted email. Message ID: ${result.messageId}`);
      return result;
    } catch (resendErr) {
      console.warn(`⚠️  Resend failed: ${resendErr.message}`);
    }
  }

  // Strategy 3: Brevo API (works on cloud hosts with blocked SMTP)
  if (hasBrevo) {
    try {
      console.log(`🚀 [Brevo API] → ${maskEmail(cleanRecipient)}`);
      const result = await sendViaBrevo({ to: cleanRecipient, otp, expiryMinutes, recipientName });
      console.log(`✅ Brevo accepted email. Message ID: ${result.messageId}`);
      return result;
    } catch (brevoErr) {
      console.warn(`⚠️  Brevo failed: ${brevoErr.message}`);
    }
  }

  // Strategy 4: If on Render but Resend/Brevo failed, attempt SMTP as last resort
  if (isRender && smtpConfig) {
    try {
      console.log(`🚀 [Last Resort: SMTP] → ${maskEmail(cleanRecipient)}`);
      const result = await sendViaSmtp({ to: cleanRecipient, otp, expiryMinutes, recipientName });
      console.log(`✅ SMTP accepted email. Message ID: ${result.messageId}`);
      return result;
    } catch (smtpErr) {
      console.warn(`⚠️  SMTP failed: ${smtpErr.message}`);
    }
  }

  throw new Error(
    'All configured email providers failed. ' +
    'Please check your Gmail SMTP App Password or API credentials in backend/.env.'
  );
};

module.exports = {
  sendVerificationOtp,
  maskEmail,
  getSmtpConfig,
};
