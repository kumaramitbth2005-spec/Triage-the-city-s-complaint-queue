/**
 * emailService.js
 * Production-ready transactional email service using Resend Email API.
 * 
 * SECURITY:
 * - Credentials kept strictly server-side (process.env.RESEND_API_KEY)
 * - Sensitive credentials, passwords, and OTPs never logged to console
 * - Masked email logging only (e.g. a***@gmail.com)
 * - Never returns success without confirmation from Resend API
 */

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
                We received a request to create an account for Civic Complaint Triage.
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
    'We received a request to create an account for Civic Complaint Triage.',
    '',
    'Your 6-digit verification code is:',
    '',
    otp,
    '',
    `This code expires in ${expiryMinutes} minutes.`,
    '',
    'If you did not request this account, you can safely ignore this email.',
    '',
    'Civic Complaint Triage Team'
  ].join('\n');
};

/**
 * Send an email OTP verification message to the user's email via Resend Email API.
 * @param {object} opts
 * @param {string} opts.to              - Recipient email address (e.g. user's Gmail)
 * @param {string} opts.otp             - Plain 6-digit OTP code
 * @param {number} [opts.expiryMinutes] - Expiration duration in minutes (default 10)
 */
const sendVerificationOtp = async ({ to, otp, expiryMinutes = 10 }) => {
  if (!to || !to.includes('@')) {
    throw new Error('Valid recipient email address is required.');
  }

  const cleanRecipient = to.toLowerCase().trim();
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    console.error('Resend email delivery error');
    console.error('Error name: MissingConfigurationError');
    console.error('Error message: RESEND_API_KEY is not configured in environment variables.');
    throw new Error('Email delivery service is currently unavailable. Please configure RESEND_API_KEY.');
  }

  const senderEmail = process.env.EMAIL_FROM || 'Civic Complaint Triage <onboarding@resend.dev>';
  const subject = `Your verification code is: ${otp}`;
  const htmlContent = buildVerificationEmailHtml({ otp, expiryMinutes });
  const textContent = buildVerificationEmailText({ otp, expiryMinutes });

  console.log('OTP email request started');
  console.log(`Recipient: ${maskEmail(cleanRecipient)}`);
  console.log('Provider: Resend');

  let resend;
  try {
    resend = new Resend(apiKey.trim());
  } catch (initErr) {
    console.error('Resend email delivery error');
    console.error(`Error name: ${initErr.name || 'InitializationError'}`);
    console.error(`Error message: ${initErr.message}`);
    throw new Error('Email could not be sent. Please try again later.');
  }

  let sendResult;
  try {
    sendResult = await resend.emails.send({
      from: senderEmail,
      to: [cleanRecipient],
      subject,
      html: htmlContent,
      text: textContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'CivicComplaintTriage-Mailer/1.0',
        'Reply-To': 'noreply@resend.dev',
        'X-Entity-Ref-ID': `otp-${Date.now()}`
      }
    });
  } catch (networkErr) {
    console.error('Resend email delivery error');
    console.error(`Error name: ${networkErr.name || 'NetworkError'}`);
    console.error(`Error message: ${networkErr.message}`);
    if (networkErr.status || networkErr.statusCode) {
      console.error(`HTTP status: ${networkErr.status || networkErr.statusCode}`);
    }
    throw new Error('Email could not be sent. Please try again later.');
  }

  const { data, error } = sendResult || {};

  if (error) {
    console.error('Resend email delivery error');
    console.error(`Error name: ${error.name || 'ResendError'}`);
    console.error(`Error message: ${error.message}`);
    if (error.statusCode) {
      console.error(`HTTP status: ${error.statusCode}`);
    }
    throw new Error('Email could not be sent. Please try again later.');
  }

  if (!data || !data.id) {
    console.error('Resend email delivery error');
    console.error('Error name: MissingMessageIdError');
    console.error('Error message: Resend did not return a message ID.');
    throw new Error('Email could not be sent. Please try again later.');
  }

  console.log('Send request completed');
  console.log(`Provider message ID: ${data.id}`);

  return {
    success: true,
    provider: 'resend',
    id: data.id
  };
};

module.exports = { 
  sendVerificationOtp,
  maskEmail
};
