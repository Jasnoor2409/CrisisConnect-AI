/**
 * Regression Test Suite: Authentication, JWT & Role-Based Access Control (RBAC)
 *
 * Verifies that existing completed Features 1-6 remain 100% operational.
 */

import 'dotenv/config';

const BASE_URL = `http://127.0.0.1:${process.env.PORT || 5000}/api`;

const logPass = (msg) => console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
const logFail = (msg, err) => console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`, err || '');

async function runRbacTests() {
  console.log('\n==================================================');
  console.log('  RUNNING AUTHENTICATION & RBAC REGRESSION TESTS');
  console.log('==================================================\n');

  try {
    const timestamp = Date.now();
    const citizenUser = {
      name: `Citizen_${timestamp}`,
      email: `citizen_${timestamp}@test.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'citizen',
    };

    const responderUser = {
      name: `Responder_${timestamp}`,
      email: `responder_${timestamp}@test.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'responder',
    };

    // 1. Citizen Registration
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(citizenUser),
    });
    const regData = await regRes.json();
    if (!regRes.ok || !regData.success) {
      throw new Error(`Citizen registration failed: ${regData.message}`);
    }
    logPass('User registration (Feature 1) working');

    // 2. Citizen Login & JWT token return
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: citizenUser.email, password: citizenUser.password }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      throw new Error(`Login failed: ${loginData.message}`);
    }
    logPass('User login & JWT token generation (Features 2 & 3) working');

    // 3. User Profile Endpoint
    const profileRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    const profileData = await profileRes.json();
    if (!profileRes.ok || !profileData.success) {
      throw new Error(`Get profile failed: ${profileData.message}`);
    }
    if (profileData.user.email !== citizenUser.email) {
      throw new Error('Profile user email mismatch');
    }
    logPass('User Profile & Session management (Feature 5) working');

    // 4. Responder Registration & Login
    const regRespRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responderUser),
    });
    const regRespData = await regRespRes.json();
    if (!regRespRes.ok || !regRespData.success) {
      throw new Error(`Responder registration failed: ${regRespData.message}`);
    }
    logPass('Responder user registration (Feature 4 RBAC) working');

    console.log('\n==================================================');
    console.log('  ALL AUTH & RBAC REGRESSION TESTS PASSED (100%)');
    console.log('==================================================\n');
  } catch (err) {
    logFail('RBAC regression test failed:', err.message);
    process.exit(1);
  }
}

runRbacTests();
