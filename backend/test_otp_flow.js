/**
 * Comprehensive test script for Email Verification & OTP system
 */
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Email Verification & OTP Test Suite...');
  const testEmail = `test_civic_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test Operator';

  try {
    // 0. Connect DB for direct assertion
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not found in .env');
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
      console.log('📦 Test runner connected to database directly.');
    }

    // 1. Health check
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check:', health.data.status, '| DB:', health.data.database);

    // 2. Test Register -> Should trigger OTP and return requiresVerification: true
    console.log('\n--- 1. Testing Registration Flow ---');
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name: testName,
      email: testEmail,
      password: testPassword,
      role: 'operator'
    });
    console.log('✅ Register Response:', regRes.data);
    if (!regRes.data.requiresVerification) throw new Error('Expected requiresVerification: true');

    // 3. Test Login before verification -> Should be blocked with 403 / EMAIL_NOT_VERIFIED
    console.log('\n--- 2. Testing Login for Unverified Account (Must be Blocked) ---');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: testEmail,
        password: testPassword
      });
      throw new Error('Unverified login should have failed!');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.error?.code === 'EMAIL_NOT_VERIFIED') {
        console.log('✅ Correctly blocked unverified login (Status 403):', err.response.data.error.message);
      } else {
        throw err;
      }
    }

    // 4. Test Resend Cooldown -> Should be blocked if requested immediately (< 60s)
    console.log('\n--- 3. Testing Resend Cooldown Protection ---');
    try {
      await axios.post(`${API_URL}/auth/resend-verification-code`, {
        email: testEmail
      });
      throw new Error('Resend should be blocked by cooldown!');
    } catch (err) {
      if (err.response?.status === 429 && err.response?.data?.error?.code === 'COOLDOWN') {
        console.log('✅ Cooldown correctly enforced (Status 429):', err.response.data.error.message);
      } else {
        throw err;
      }
    }

    // 5. Test Verify with Wrong OTP -> Should reject and decrement attempts
    console.log('\n--- 4. Testing Invalid OTP Code Verification ---');
    try {
      await axios.post(`${API_URL}/auth/verify-email`, {
        email: testEmail,
        otp: '000000'
      });
      throw new Error('Wrong OTP should have failed!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'OTP_MISMATCH') {
        console.log('✅ Wrong OTP rejected (Status 400):', err.response.data.error.message);
      } else {
        throw err;
      }
    }

    // 6. Inject known OTP to test correct verification
    const knownOtp = '654321';
    const knownHash = await bcrypt.hash(knownOtp, 10);
    await User.updateOne(
      { email: testEmail },
      { verificationOtpHash: knownHash, verificationOtpExpiresAt: new Date(Date.now() + 5 * 60 * 1000) }
    );

    // 7. Test Verify with Correct OTP -> Should activate account and return JWT token
    console.log('\n--- 5. Testing Correct OTP Verification ---');
    const verifyRes = await axios.post(`${API_URL}/auth/verify-email`, {
      email: testEmail,
      otp: knownOtp
    });
    console.log('✅ OTP Verified Successfully:', verifyRes.data.message);
    console.log('✅ Token Issued:', verifyRes.data.token ? 'Yes (JWT Valid)' : 'No');
    console.log('✅ User emailVerified state:', verifyRes.data.user?.emailVerified);

    // 8. Test Re-Verifying Already Verified Account -> Should reject cleanly
    console.log('\n--- 6. Testing Already Verified Re-attempt ---');
    try {
      await axios.post(`${API_URL}/auth/verify-email`, {
        email: testEmail,
        otp: knownOtp
      });
      throw new Error('Already verified account should not accept OTP!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'ALREADY_VERIFIED') {
        console.log('✅ Cleanly rejected already verified account:', err.response.data.error.message);
      } else {
        throw err;
      }
    }

    // 9. Test Login for Verified Account -> Should succeed immediately
    console.log('\n--- 7. Testing Login After Email Verification ---');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    console.log('✅ Verified Login Succeeded! User:', loginRes.data.user.name, '| Role:', loginRes.data.user.role);

    // 10. Clean up test user & close connection
    await User.deleteOne({ email: testEmail });
    await mongoose.connection.close();
    console.log('\n🧹 Test user cleaned up.');

    console.log('\n🎉 ALL 7 TEST SCENARIOS PASSED WITH 100% SUCCESS!\n');
    process.exit(0);

  } catch (err) {
    console.error('❌ Test failed:', err.response?.data || err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Wait 1 second before executing test
setTimeout(runTests, 1000);
