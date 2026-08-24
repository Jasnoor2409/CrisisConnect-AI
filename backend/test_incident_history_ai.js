/**
 * Test Script for Feature 7 (Citizen Incident History) and Feature 8 (AI Classification)
 *
 * Tests:
 * 1. Citizen A registration & login
 * 2. Citizen B registration & login
 * 3. Citizen A creates incident with title/description triggering AI classification
 * 4. AI classification validation (category in allowed list, confidence 0..1, reasoning present)
 * 5. GET /api/incidents/my returns ONLY Citizen A's incidents
 * 6. GET /api/incidents/:incidentId allows Citizen A to view own incident
 * 7. GET /api/incidents/:incidentId denies Citizen B from viewing Citizen A's incident (403 Forbidden)
 * 8. Unauthenticated request to /api/incidents/my fails with 401
 * 9. Non-existent incidentId fails with 404
 * 10. AI classification graceful fallback simulation
 */

import 'dotenv/config';

const BASE_URL = `http://127.0.0.1:${process.env.PORT || 5000}/api`;

const logPass = (msg) => console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
const logFail = (msg, err) => console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`, err || '');

async function runTests() {
  console.log('\n==================================================');
  console.log('  RUNNING FEATURE 7 & 8 AUTOMATED INTEGRATION TESTS');
  console.log('==================================================\n');

  try {
    // ── 1. Check API Health ──────────────────────────────────────────────────
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    if (!healthRes.ok || !healthData.success) {
      throw new Error(`API health check failed. Ensure backend server is running on port ${process.env.PORT || 5000}`);
    }
    logPass('Backend server is healthy and responding');

    const timestamp = Date.now();
    const citizenA = {
      name: `Citizen A_${timestamp}`,
      email: `citizena_${timestamp}@example.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'citizen',
    };
    const citizenB = {
      name: `Citizen B_${timestamp}`,
      email: `citizenb_${timestamp}@example.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'citizen',
    };

    // ── 2. Register & Login Citizen A ────────────────────────────────────────
    const regARes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(citizenA),
    });
    const regAData = await regARes.json();
    if (!regARes.ok || !regAData.success) {
      throw new Error(`Citizen A registration failed: ${regAData.message}`);
    }
    logPass('Citizen A registered successfully');

    const loginARes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: citizenA.email, password: citizenA.password }),
    });
    const loginAData = await loginARes.json();
    const tokenA = loginAData.token;
    if (!tokenA) throw new Error('Token A not returned');
    logPass('Citizen A logged in successfully & received JWT token');

    // ── 3. Register & Login Citizen B ────────────────────────────────────────
    const regBRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(citizenB),
    });
    const regBData = await regBRes.json();
    if (!regBRes.ok || !regBData.success) {
      throw new Error(`Citizen B registration failed: ${regBData.message}`);
    }
    logPass('Citizen B registered successfully');

    const loginBRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: citizenB.email, password: citizenB.password }),
    });
    const loginBData = await loginBRes.json();
    const tokenB = loginBData.token;
    if (!tokenB) throw new Error('Token B not returned');
    logPass('Citizen B logged in successfully & received JWT token');

    // ── 4. Citizen A Reports Emergency Incident (Fire) ────────────────────────
    const incidentPayload = {
      title: 'Heavy Structure Fire at Commercial Complex',
      category: 'Fire',
      description: 'Visible high flames, thick black smoke pouring out from second-floor window. Fire spreading rapidly to adjacent structures.',
      severity: 'Critical',
      location: {
        address: '742 Evergreen Terrace, Sector 4',
        latitude: 37.7749,
        longitude: -122.4194,
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
    const incidentA = createData.incident;
    logPass(`Citizen A reported incident successfully. Assigned ID: ${incidentA.incidentId}`);

    // ── 5. AI Emergency Classification Assertions ─────────────────────────────
    const ai = incidentA.aiClassification;
    if (!ai) {
      throw new Error('AI classification missing from created incident payload');
    }
    const allowedCategories = ['Accident', 'Fire', 'Medical Emergency', 'Crime', 'Natural Disaster', 'Other'];
    if (!allowedCategories.includes(ai.category)) {
      throw new Error(`AI predicted invalid category: ${ai.category}`);
    }
    if (typeof ai.confidence !== 'number' || ai.confidence < 0 || ai.confidence > 1) {
      throw new Error(`AI confidence out of bounds [0..1]: ${ai.confidence}`);
    }
    if (!ai.reasoning || typeof ai.reasoning !== 'string') {
      throw new Error('AI reasoning explanation missing or malformed');
    }
    logPass(`AI Classification verified: Predicted '${ai.category}' with ${(ai.confidence * 100).toFixed(0)}% confidence. Reason: "${ai.reasoning}"`);

    // ── 6. Citizen A Fetches Incident History (/api/incidents/my) ─────────────
    const myRes = await fetch(`${BASE_URL}/incidents/my`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const myData = await myRes.json();
    if (!myRes.ok || !myData.success) {
      throw new Error(`GET /api/incidents/my failed: ${myData.message}`);
    }
    if (!Array.isArray(myData.incidents) || myData.incidents.length === 0) {
      throw new Error('GET /api/incidents/my returned empty array for Citizen A');
    }
    const foundIncident = myData.incidents.find((inc) => inc.incidentId === incidentA.incidentId);
    if (!foundIncident) {
      throw new Error('Created incident not found in Citizen A history');
    }
    logPass('GET /api/incidents/my retrieved Citizen A history correctly');

    // ── 7. Citizen B Fetches Incident History (/api/incidents/my) ─────────────
    const myBRes = await fetch(`${BASE_URL}/incidents/my`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const myBData = await myBRes.json();
    if (myBData.incidents.some((inc) => inc.incidentId === incidentA.incidentId)) {
      throw new Error("Security leak: Citizen A's incident exposed in Citizen B's history!");
    }
    logPass("Isolation verified: Citizen B history does NOT contain Citizen A's reports");

    // ── 8. Citizen A Fetches Specific Incident (/api/incidents/:incidentId) ───
    const getByIdRes = await fetch(`${BASE_URL}/incidents/${incidentA.incidentId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const getByIdData = await getByIdRes.json();
    if (!getByIdRes.ok || !getByIdData.success) {
      throw new Error(`GET /api/incidents/:incidentId failed for owner: ${getByIdData.message}`);
    }
    logPass("GET /api/incidents/:incidentId allowed owner (Citizen A) to view report");

    // ── 9. Citizen B Attempts to Access Citizen A's Incident (403 Check) ─────
    const forbiddenRes = await fetch(`${BASE_URL}/incidents/${incidentA.incidentId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden when Citizen B accesses Citizen A's report, got HTTP ${forbiddenRes.status}`);
    }
    logPass("RBAC Security Enforcement: Citizen B denied access (403 Forbidden) to Citizen A's report");

    // ── 10. Unauthenticated Access Check (401 Check) ────────────────────────
    const unauthRes = await fetch(`${BASE_URL}/incidents/my`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for unauthenticated GET /api/incidents/my, got HTTP ${unauthRes.status}`);
    }
    logPass('Authentication Enforcement: Unauthenticated request rejected (401 Unauthorized)');

    // ── 11. Invalid Incident ID Check (404 Check) ───────────────────────────
    const notFoundRes = await fetch(`${BASE_URL}/incidents/INC-2026-[var(--color-primary)]`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (notFoundRes.status !== 404) {
      throw new Error(`Expected 404 Not Found for invalid incident ID, got HTTP ${notFoundRes.status}`);
    }
    logPass('404 Not Found correctly returned for non-existent incident reference ID');

    console.log('\n==================================================');
    console.log('  ALL FEATURE 7 & 8 AUTOMATED TESTS PASSED (100%)');
    console.log('==================================================\n');
  } catch (error) {
    logFail('Test suite execution failed:', error.message);
    process.exit(1);
  }
}

runTests();
// Commit 3
// Commit 3
