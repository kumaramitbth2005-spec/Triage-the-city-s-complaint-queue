/**
 * test_resend_direct.js
 * Test the direct connection from Backend -> Resend API -> Recipient Gmail.
 * Usage: node test_resend_direct.js [recipient@gmail.com]
 */
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { sendVerificationOtp, maskEmail } = require('./src/services/emailService');
const crypto = require('crypto');

async function testDirectResend() {
  console.log('========================================================');
  console.log('🧪 DIRECT RESEND API CONNECTION TEST');
  console.log('========================================================');

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Civic Complaint Triage <onboarding@resend.dev>';
  const targetEmail = process.argv[2] || process.env.TEST_GMAIL || 'amitbth2005@gmail.com';

  console.log(`1. Checking Environment Variables:`);
  console.log(`   - RESEND_API_KEY configured: ${apiKey ? 'YES (Key present)' : 'NO (MISSING)'}`);
  console.log(`   - EMAIL_FROM: ${fromEmail}`);
  console.log(`   - Target Recipient: ${maskEmail(targetEmail)}`);

  if (!apiKey) {
    console.error('\n❌ FAILURE: RESEND_API_KEY is not defined in backend/.env!');
    console.error('Please configure RESEND_API_KEY in backend/.env before running this test.');
    process.exit(1);
  }

  const testOtp = String(crypto.randomInt(100000, 1000000));
  console.log(`\n2. Dispatching Test Verification Email via Resend...`);

  try {
    const result = await sendVerificationOtp({
      to: targetEmail,
      otp: testOtp,
      expiryMinutes: 10
    });

    console.log('\n========================================================');
    console.log('✅ RESEND API ACCEPTED THE EMAIL REQUEST SUCCESSFULLY!');
    console.log('========================================================');
    console.log(`Provider: ${result.provider}`);
    console.log(`Resend Message ID: ${result.id}`);
    console.log(`Recipient: ${targetEmail}`);
    console.log('\nCheck the recipient Gmail inbox (or spam folder) for the verification code.');
    process.exit(0);
  } catch (err) {
    console.log('\n========================================================');
    console.error('❌ RESEND API DELIVERY REJECTED / FAILED:');
    console.log('========================================================');
    console.error(`Error Message: ${err.message}`);
    process.exit(1);
  }
}

testDirectResend();
