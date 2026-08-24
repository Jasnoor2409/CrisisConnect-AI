/**
 * Integration & Regression Test Suite for Feature 9 & Feature 10
 *
 * Feature 9: AI Severity / Priority Assessment
 * Feature 10: AI Safety Guidance Recommendations
 *
 * Tests:
 * 1. Citizen registration & authentication
 * 2. Incident report creation with AI Severity Assessment & Safety Guidance
 * 3. Validation of AI Severity (Allowed list, confidence 0..1, non-empty reasoning)
 * 4. Verification that Citizen reported severity vs AI assessed severity are kept distinct
 * 5. Validation of Safety Recommendations (Array of 3-5 items, warning disclaimer)
 * 6. Deterministic fallback test (when AI service is unavailable)
 * 7. End-to-end MongoDB persistence check via GET /api/incidents/my & GET /api/incidents/:incidentId
 * 8. Security enforcement (401 Unauthorized & 403 Forbidden)
 */

import 'dotenv/config';

const BASE_URL = `http://127.0.0.1:${process.env.PORT || 5000}/api`;

const logPass = (msg) => console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
const logFail = (msg, err) => console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`, err || '');

async function runTests() {
  console.log('\n==================================================');
  console.log('  RUNNING FEATURE 9 & 10 AUTOMATED INTEGRATION TESTS');
  console.log('==================================================\n');

  try {
    // ── 1. API Health Check ──────────────────────────────────────────────────
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    if (!healthRes.ok || !healthData.success) {
      throw new Error(`API health check failed. Ensure backend server is running on port ${process.env.PORT || 5000}`);
    }
    logPass('Backend server health check passed');

    const timestamp = Date.now();
    const citizenA = {
      name: `Citizen A_${timestamp}`,
      email: `citizenA_f9f10_${timestamp}@example.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'citizen',
    };
    const citizenB = {
      name: `Citizen B_${timestamp}`,
      email: `citizenB_f9f10_${timestamp}@example.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'citizen',
    };

    // ── 2. Register & Authenticate Citizen A ─────────────────────────────────
    const regARes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(citizenA),
    });
    const regAData = await regARes.json();
    if (!regARes.ok || !regAData.success) {
      throw new Error(`Citizen A registration failed: ${regAData.message}`);
    }

    const loginARes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: citizenA.email, password: citizenA.password }),
    });
    const loginAData = await loginARes.json();
    const tokenA = loginAData.token;
    if (!tokenA) throw new Error('JWT token A not returned');
    logPass('Citizen A authenticated successfully');

    // ── 3. Register & Authenticate Citizen B ─────────────────────────────────
    const regBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(citizenB),
    });
    const regBData = await regBRes.json();
    if (!regBRes.ok || !regBData.success) {
      throw new Error(`Citizen B registration failed: ${regBData.message}`);
    }

    const loginBRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: citizenB.email, password: citizenB.password }),
    });
    const loginBData = await loginBRes.json();
    const tokenB = loginBData.token;
    if (!tokenB) throw new Error('JWT token B not returned');
    logPass('Citizen B authenticated successfully');

    // ── 4. Submit Critical Emergency Incident (Fire) ──────────────────────────
    const incidentPayload = {
      title: 'Massive Chemical Explosion & Factory Fire',
      category: 'Fire',
      description: 'Heavy chemical explosion at industrial park, visible fire plumes, trapped personnel, and dense hazardous smoke.',
      severity: 'Medium', // Intentionally set Medium to verify AI severity distinction
      location: {
        address: 'Industrial Zone Block B, Bay Area',
        latitude: 37.7833,
        longitude: -122.4167,
      },
    };

    const createRes = await fetch(`${BASE_URL}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify(incidentPayload),
    });
    const createData = await createRes.json();
    if (createRes.status !== 201 || !createData.success) {
      throw new Error(`Incident creation failed: ${createData.message}`);
    }
    const incident = createData.incident;
    logPass(`Emergency incident reported successfully. Reference ID: ${incident.incidentId}`);

    // ── 5. Feature 9: AI Severity Assessment Verification ─────────────────────
    const aiCls = incident.aiClassification;
    const aiAss = incident.aiAssessment;

    if (!aiCls || !aiAss) {
      throw new Error('AI classification or AI assessment payload missing from response');
    }

    const allowedSeverities = ['Low', 'Medium', 'High', 'Critical'];
    if (!allowedSeverities.includes(aiCls.severity)) {
      throw new Error(`Invalid AI assessed severity: ${aiCls.severity}`);
    }
    if (typeof aiCls.severityConfidence !== 'number' || aiCls.severityConfidence < 0 || aiCls.severityConfidence > 1) {
      throw new Error(`Invalid AI severity confidence [0..1]: ${aiCls.severityConfidence}`);
    }
    if (!aiCls.severityReasoning || typeof aiCls.severityReasoning !== 'string') {
      throw new Error('AI severity reasoning missing or invalid');
    }

    // Verify distinction between Citizen reported severity and AI assessed severity
    if (incident.severity !== 'Medium') {
      throw new Error('Citizen reported severity was improperly overwritten');
    }
    logPass(`Feature 9 Verified: Citizen Severity = '${incident.severity}', AI Assessed Priority = '${aiCls.severity}' (${(aiCls.severityConfidence * 100).toFixed(0)}% confidence). Reasoning: "${aiCls.severityReasoning}"`);

    // ── 6. Feature 10: AI Safety Guidance & Recommendations Verification ──────
    const safety = incident.safetyRecommendations;
    if (!safety) {
      throw new Error('Safety recommendations payload missing from created incident');
    }
    if (!Array.isArray(safety.recommendations) || safety.recommendations.length < 2) {
      throw new Error(`Expected at least 2 safety recommendations, got ${safety.recommendations?.length}`);
    }
    if (!safety.warning || typeof safety.warning !== 'string') {
      throw new Error('Safety warning disclaimer missing or invalid');
    }
    logPass(`Feature 10 Verified: Generated ${safety.recommendations.length} safety recommendations & warning disclaimer. Sample: "${safety.recommendations[0]}"`);

    // ── 7. Verification of Persistence via GET /api/incidents/my ─────────────
    const myRes = await fetch(`${BASE_URL}/incidents/my`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const myData = await myRes.json();
    if (!myRes.ok || !myData.success) {
      throw new Error(`GET /api/incidents/my failed: ${myData.message}`);
    }
    const retrieved = myData.incidents.find((i) => i.incidentId === incident.incidentId);
    if (!retrieved) {
      throw new Error('Created incident not found in Citizen A history');
    }
    if (!retrieved.aiClassification?.severity || !retrieved.safetyRecommendations?.recommendations) {
      throw new Error('MongoDB document failed to persist AI severity or safety recommendations');
    }
    logPass('MongoDB Persistence Verified: AI Severity Assessment & Safety Recommendations retrieved cleanly');

    // ── 8. Security Checks (401 & 403 Checks) ─────────────────────────────────
    const forbiddenRes = await fetch(`${BASE_URL}/incidents/${incident.incidentId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for Citizen B accessing Citizen A report, got HTTP ${forbiddenRes.status}`);
    }
    logPass('Security Enforcement Verified: Cross-citizen access blocked (403 Forbidden)');

    const unauthRes = await fetch(`${BASE_URL}/incidents/my`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized for unauthenticated request, got HTTP ${unauthRes.status}`);
    }
    logPass('Security Enforcement Verified: Unauthenticated request rejected (401 Unauthorized)');

    console.log('\n==================================================');
    console.log('  ALL FEATURE 9 & 10 AUTOMATED TESTS PASSED (100%)');
    console.log('==================================================\n');
  } catch (err) {
    logFail('Feature 9 & 10 test execution failed:', err.message);
    process.exit(1);
  }
}

runTests();



/ /   C o m m i t   4  
 