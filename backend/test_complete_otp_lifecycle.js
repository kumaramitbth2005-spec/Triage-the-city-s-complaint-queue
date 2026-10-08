/**
 * test_complete_otp_lifecycle.js
 * Comprehensive automated verification test for all OTP lifecycle states.
 */
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const API_URL = 'http://localhost:5000/api';

async function runLifecycleTests() {
  console.log('========================================================');
  console.log('🧪 TESTING COMPLETE OTP SECURITY & LIFECYCLE PIPELINE');
  console.log('========================================================');

  const testEmail = `lifecycle_test_${Date.now()}@testtriage.org`;
  const testPassword = 'Password123!';
  const testName = 'Lifecycle Test User';

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI missing in .env');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

    // Step 1: Create a pending unverified user in DB
    console.log('\n--- Test 1: Setup Unverified User in Database ---');
    const correctOtp = '583214';
    const otpHash = await bcrypt.hash(correctOtp, 10);
    const passwordHash = await bcrypt.hash(testPassword, 10);

    const user = await User.create({
      name: testName,
      email: testEmail,
      passwordHash,
      role: 'operator',
      emailVerified: false,
      verificationOtpHash: otpHash,
      verificationOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      verificationOtpAttempts: 0,
      verificationLastSentAt: new Date()
    });
    console.log(`✅ Unverified user created: ${testEmail}`);

    // Step 2: Attempt Login Before Verification (Must be Blocked)
    console.log('\n--- Test 2: Block Login for Unverified Account ---');
    try {
      await axios.post(`${API_URL}/auth/login`, { email: testEmail, password: testPassword });
      throw new Error('Should not allow login when emailVerified is false');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.error?.code === 'EMAIL_NOT_VERIFIED') {
        console.log('✅ Blocked with HTTP 403:', err.response.data.error.message);
      } else {
        throw err;
      }
    }

    // Step 3: Resend Cooldown Test
    console.log('\n--- Test 3: Backend Resend Cooldown Protection ---');
    try {
      await axios.post(`${API_URL}/auth/resend-verification-code`, { email: testEmail });
      throw new Error('Should block resend before cooldown expires');
    } catch (err) {
      if (err.response?.status === 429 && err.response?.data?.error?.code === 'COOLDOWN') {
        console.log('✅ Cooldown enforced with HTTP 429:', err.response.data.error.message);
      } else {
        throw err;
      }
    }

    // Step 4: Invalid Format OTP (not 6 digits)
    console.log('\n--- Test 4: Reject Invalid OTP Format ---');
    try {
      await axios.post(`${API_URL}/auth/verify-email`, { email: testEmail, otp: '123' });
      throw new Error('Should reject non-6-digit OTP');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'INVALID_FORMAT') {
        console.log('✅ Rejected invalid format with HTTP 400:', err.response.data.error.message);
      } else {
        throw err;
      }
    }

    // Step 5: Incorrect OTP attempt tracking
    console.log('\n--- Test 5: Incorrect OTP Attempt Tracking ---');
    try {
      await axios.post(`${API_URL}/auth/verify-email`, { email: testEmail, otp: '000000' });
      throw new Error('Should reject incorrect OTP');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'OTP_MISMATCH') {
        console.log('✅ Wrong OTP rejected:', err.response.data.error.message);
      } else {
        throw err;
      }
    }

    // Step 6: Test Max Attempts Lockout (5 attempts)
    console.log('\n--- Test 6: Brute-Force Defense Lockout (5 attempts) ---');
    await User.updateOne({ email: testEmail }, { verificationOtpAttempts: 4 });
    try {
      await axios.post(`${API_URL}/auth/verify-email`, { email: testEmail, otp: '000000' });
      throw new Error('Should lock out on 5th failure');
    } catch (err) {
      if (err.response?.status === 429 && err.response?.data?.error?.code === 'TOO_MANY_ATTEMPTS') {
        console.log('✅ Lockout triggered with HTTP 429:', err.response.data.error.message);
      } else {
        throw err;
      }
    }

    const lockedUser = await User.findOne({ email: testEmail });
    if (lockedUser.verificationOtpHash) {
      throw new Error('OTP hash should be cleared on lockout');
    }
    console.log('✅ OTP hash invalidated in database after brute-force lockout.');

    // Step 7: Test Expired OTP
    console.log('\n--- Test 7: Expired OTP Invalidation ---');
    await User.updateOne(
      { email: testEmail },
      { 
        verificationOtpHash: otpHash, 
        verificationOtpExpiresAt: new Date(Date.now() - 1000), // expired 1s ago
        verificationOtpAttempts: 0 
      }
    );
    try {
      await axios.post(`${API_URL}/auth/verify-email`, { email: testEmail, otp: correctOtp });
      throw new Error('Should reject expired OTP');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'OTP_EXPIRED') {
        console.log('✅ Expired OTP rejected with HTTP 400:', err.response.data.error.message);
      } else {
        throw err;
      }
    }

    // Step 8: Correct OTP Verification Flow
    console.log('\n--- Test 8: Successful OTP Verification ---');
    await User.updateOne(
      { email: testEmail },
      { 
        verificationOtpHash: otpHash, 
        verificationOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), 
        verificationOtpAttempts: 0 
      }
    );

    const verifyRes = await axios.post(`${API_URL}/auth/verify-email`, {
      email: testEmail,
      otp: correctOtp
    });
    console.log('✅ Verification succeeded:', verifyRes.data.message);
    console.log('✅ JWT Token received:', verifyRes.data.token ? 'YES (Valid)' : 'NO');
    console.log('✅ User emailVerified state:', verifyRes.data.user.emailVerified);

    const verifiedDbUser = await User.findOne({ email: testEmail });
    if (!verifiedDbUser.emailVerified || verifiedDbUser.verificationOtpHash) {
      throw new Error('Database state incorrect: OTP must be wiped and emailVerified true');
    }
    console.log('✅ Verified state verified in MongoDB: emailVerified=true, otpHash=undefined');

    // Step 9: Re-verification on already verified user (Must Reject)
    console.log('\n--- Test 9: Re-verification of Verified User ---');
    try {
      await axios.post(`${API_URL}/auth/verify-email`, { email: testEmail, otp: correctOtp });
      throw new Error('Should reject already verified account');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'ALREADY_VERIFIED') {
        console.log('✅ Already verified rejected:', err.response.data.error.message);
      } else {
        throw err;
      }
    }

    // Step 10: Login Succeeded Post-Verification
    console.log('\n--- Test 10: Verified Account Login ---');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    console.log('✅ Login succeeded! User authenticated:', loginRes.data.user.name, 'Token issued.');

    // Cleanup
    await User.deleteOne({ email: testEmail });
    await mongoose.connection.close();
    console.log('\n🧹 Test user cleaned up.');

    console.log('\n========================================================');
    console.log('🎉 ALL 10 OTP SECURITY & LIFECYCLE TESTS PASSED (100%)');
    console.log('========================================================\n');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Test execution failed:', err.response?.data || err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runLifecycleTests();
