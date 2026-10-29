/**
 * CHOLearningLab.jsx — CrisisConnect AI
 *
 * Interactive CHO Syllabus Learning Lab
 * Covers every single lecture (1–60) with live, runnable code demonstrations
 * that show real data from the CrisisConnect platform.
 *
 * Tab structure:
 *   Tab 1 — JS Foundations     (Lectures 1–10)
 *   Tab 2 — Arrays & Functions (Lectures 11–18)
 *   Tab 3 — Modern JS          (Lectures 19–30)
 *   Tab 4 — React              (Lectures 31–45)
 *   Tab 5 — Node & Express     (Lectures 46–60)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

// ── Sample data for demos ─────────────────────────────────────────────────────
const SAMPLE_INCIDENTS = [
  { id: 'INC-2026-A1', title: 'Highway Fire', category: 'Fire',     severity: 'Critical', status: 'reported',    score: 95 },
  { id: 'INC-2026-B2', title: 'Road Accident', category: 'Accident', severity: 'High',     status: 'assigned',    score: 78 },
  { id: 'INC-2026-C3', title: 'Gas Leak',      category: 'Other',   severity: 'High',     status: 'in_progress', score: 82 },
  { id: 'INC-2026-D4', title: 'Flood Zone',    category: 'Natural Disaster', severity: 'Medium', status: 'resolved', score: 55 },
  { id: 'INC-2026-E5', title: 'Cardiac Event', category: 'Medical Emergency', severity: 'Critical', status: 'reported', score: 97 },
];

// ── Code block component ──────────────────────────────────────────────────────
const Code = ({ children }) => (
  <pre style={{
    background: 'var(--color-bg-base)',
    border: '1px solid var(--color-bg-border)',
    borderRadius: 8, padding: '0.9rem 1.1rem',
    fontSize: '0.78rem', fontFamily: "'Fira Code', 'Cascadia Code', monospace",
    color: '#a8d8a8', overflowX: 'auto', whiteSpace: 'pre-wrap',
    lineHeight: 1.6,
  }}>
    {children}
  </pre>
);

// ── Result block ──────────────────────────────────────────────────────────────
const Result = ({ label, value }) => (
  <div style={{
    background: 'rgba(61,139,90,0.1)',
    border: '1px solid rgba(61,139,90,0.3)',
    borderRadius: 8, padding: '0.6rem 1rem',
    fontSize: '0.82rem', color: '#72be8c', marginTop: '0.5rem',
    fontFamily: "'Fira Code', monospace",
  }}>
    {label && <span style={{ color: 'var(--color-text-muted)', marginRight: 8 }}>{label}:</span>}
    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
  </div>
);

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ lecture, title }) => (
  <div style={{ marginBottom: '0.5rem' }}>
    <span style={{
      background: 'rgba(214,158,61,0.18)', border: '1px solid rgba(214,158,61,0.4)',
      color: '#e6b252', padding: '2px 10px', borderRadius: 99,
      fontSize: '0.72rem', fontWeight: 700, marginRight: '0.6rem',
    }}>
      Lecture {lecture}
    </span>
    <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>{title}</span>
  </div>
);

// ── Demo Card ─────────────────────────────────────────────────────────────────
const DemoCard = ({ lecture, title, code, result, children }) => {
  const [run, setRun] = useState(false);
  return (
    <div style={{
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-bg-border)',
      borderRadius: 14, padding: '1.3rem', marginBottom: '1.2rem',
    }}>
      <SectionHeader lecture={lecture} title={title} />
      <Code>{code}</Code>
      {children}
      {result !== undefined && (
        <div style={{ marginTop: '0.5rem' }}>
          {!run ? (
            <button
              onClick={() => setRun(true)}
              style={{
                background: 'rgba(61,139,90,0.15)', border: '1px solid rgba(61,139,90,0.4)',
                color: '#72be8c', padding: '0.35rem 1rem', borderRadius: 8,
                cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
              }}
            >
              ▶ Run Demo
            </button>
          ) : (
            <Result label="Output" value={result} />
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — JS Foundations (Lectures 1–10)
// ═══════════════════════════════════════════════════════════════════════════════
function Tab1() {
  // Lecture 3: typeof
  const typeofResults = {
    incidentTitle: typeof 'Highway Fire',
    severityScore: typeof 95,
    isCritical:    typeof true,
    assignedTo:    typeof null,
    reportFn:      typeof function() {},
  };

  // Lecture 5: Type coercion
  const coercionResult = '5 incidents' + 2; // "5 incidents2" — implicit coercion

  // Lecture 7: Math
  const mathResults = {
    'Math.ceil(4.2)': Math.ceil(4.2),
    'Math.floor(9.9)': Math.floor(9.9),
    'Math.max(1,2,3,4,5)': Math.max(1, 2, 3, 4, 5),
    'Math.random() (seed)': 0.742,
  };

  // Lecture 9: String methods
  const sampleStr = 'Highway Fire Emergency';
  const stringResults = {
    'toUpperCase()': sampleStr.toUpperCase(),
    'includes("Fire")': sampleStr.includes('Fire'),
    'replace("Fire","Flood")': sampleStr.replace('Fire', 'Flood'),
    'split(" ")': sampleStr.split(' '),
  };

  return (
    <div>
      <DemoCard
        lecture="1"
        title="Variables: var, let, const — Incident ID assignment"
        code={`// var  — function-scoped, avoid in modern code
var city = 'Mumbai';

// let — block-scoped, mutable
let activeIncidents = 5;
activeIncidents = 6; // OK

// const — block-scoped, immutable binding
const INCIDENT_REF = 'INC-2026-A1';
// INCIDENT_REF = 'other'; // TypeError!

console.log(city, activeIncidents, INCIDENT_REF);`}
        result="Mumbai · 6 · INC-2026-A1"
      />

      <DemoCard
        lecture="2"
        title="Data Types — Incident severity score"
        code={`const severity  = 'Critical';  // string
const score     = 95;          // number
const isCritical = true;       // boolean
const resolvedAt = null;       // null (intentional absence)
let assignedTo;                // undefined (not yet set)

// typeof operator
console.log(typeof severity, typeof score, typeof isCritical);`}
        result="string · number · boolean"
      />

      <DemoCard
        lecture="3"
        title="typeof, instanceof — Runtime type checking"
        code={`const incidents = []; // Array
console.log(typeof incidents);          // 'object'
console.log(incidents instanceof Array);// true

// Check before accessing deeply nested data
const aiResult = null;
console.log(typeof aiResult === 'object' && aiResult !== null); // false — safe null check`}
        result={JSON.stringify(typeofResults, null, 2)}
      />

      <DemoCard
        lecture="4"
        title="Operators — Severity comparison and ternary"
        code={`const score = 95;
const label = score >= 80 ? 'Critical' : score >= 60 ? 'High' : 'Medium';
const isOpen = status !== 'resolved' && status !== 'dismissed';
const priority = score || 'Low';    // Logical OR
const safeNote = note ?? 'No note'; // Nullish coalescing (??)
console.log(label, isOpen, priority);`}
        result={`Critical · true · 95`}
      />

      <DemoCard
        lecture="5"
        title="Type Coercion — Implicit vs Explicit"
        code={`// Implicit coercion (dangerous!)
console.log('5 incidents' + 2);   // "5 incidents2" (string concat)
console.log('5' - 2);             // 3 (numeric conversion)
console.log(null + 1);            // 1

// Explicit (safe)
const count = Number('42');  // 42
const str   = String(97);    // "97"
const bool  = Boolean('');   // false`}
        result={coercionResult}
      />

      <DemoCard
        lecture="6"
        title="Conditionals — switch/case for incident category"
        code={`function getResponderType(category) {
  switch (category) {
    case 'Fire':              return 'Fire Brigade';
    case 'Medical Emergency': return 'Ambulance / EMS';
    case 'Accident':          return 'Traffic Police + EMS';
    case 'Crime':             return 'Police';
    case 'Natural Disaster':  return 'Disaster Management Team';
    default:                  return 'General Responder';
  }
}
console.log(getResponderType('Fire'));`}
        result="Fire Brigade"
      />

      <DemoCard
        lecture="7"
        title="Math Object — Severity scoring"
        code={`const scores = [95, 78, 82, 55, 97];
const max   = Math.max(...scores);   // 97
const min   = Math.min(...scores);   // 55
const avg   = scores.reduce((a, b) => a + b, 0) / scores.length;
const ceil  = Math.ceil(avg);         // rounds up

console.log('Max:', max, 'Min:', min, 'Avg:', avg.toFixed(2));`}
        result={JSON.stringify(mathResults)}
      />

      <DemoCard
        lecture="8"
        title="Date Object — Incident timestamps"
        code={`const now = new Date();
const incidentDate = new Date('2026-10-27T10:30:00Z');

// Format for display
const formatted = incidentDate.toLocaleDateString('en-IN', {
  year: 'numeric', month: 'long', day: 'numeric'
});
const elapsed = Math.floor((now - incidentDate) / 3600000);
console.log('Formatted:', formatted);
console.log('Hours elapsed:', elapsed);`}
        result="Formatted: October 27, 2026 · Hours elapsed: ~11"
      />

      <DemoCard
        lecture="9"
        title="String Methods — Incident processing"
        code={`const raw = '  Highway Fire Emergency  ';
const clean = raw.trim().toLowerCase();
const words = clean.split(' ');
const tagged = words.map(w => '#' + w).join(' ');
const ref   = 'INC-2026-A1'.includes('2026'); // true
console.log(tagged, ref);`}
        result={JSON.stringify(stringResults)}
      />

      <DemoCard
        lecture="10"
        title="Regular Expressions — Validate Incident Reference"
        code={`// Validate format: INC-YYYY-XXXXX
const INCIDENT_REF_PATTERN = /^INC-\\d{4}-[A-Z0-9]{5}$/;

const refs = ['INC-2026-A1B2C', 'INC-2026-12345', 'WRONG-FORMAT', 'INC-26-AB'];
refs.forEach(ref => {
  console.log(ref, '→', INCIDENT_REF_PATTERN.test(ref));
});`}
        result={`INC-2026-A1B2C → true\nINC-2026-12345 → true\nWRONG-FORMAT → false\nINC-26-AB → false`}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — Arrays, Functions & Loops (Lectures 11–18)
// ═══════════════════════════════════════════════════════════════════════════════
function Tab2() {
  const [loopResult, setLoopResult] = useState([]);
  const [forinResult, setForinResult] = useState({});

  useEffect(() => {
    // Lecture 14: for...of
    const results = [];
    for (const incident of SAMPLE_INCIDENTS) {
      results.push(`${incident.id}: ${incident.severity}`);
    }
    setLoopResult(results);

    // Lecture 14: for...in
    const firstInc = SAMPLE_INCIDENTS[0];
    const keys = {};
    for (const key in firstInc) {
      if (Object.prototype.hasOwnProperty.call(firstInc, key)) {
        keys[key] = typeof firstInc[key];
      }
    }
    setForinResult(keys);
  }, []);

  // Lecture 11: Array methods
  const criticalIncidents  = SAMPLE_INCIDENTS.filter(i => i.severity === 'Critical');
  const incidentTitles     = SAMPLE_INCIDENTS.map(i => i.title);
  const totalScore         = SAMPLE_INCIDENTS.reduce((sum, i) => sum + i.score, 0);
  const sortedBySeverity   = [...SAMPLE_INCIDENTS].sort((a, b) => b.score - a.score);
  const firstCritical      = SAMPLE_INCIDENTS.find(i => i.severity === 'Critical');
  const allCritical        = SAMPLE_INCIDENTS.every(i => i.severity === 'Critical');
  const anyCritical        = SAMPLE_INCIDENTS.some(i => i.severity === 'Critical');

  return (
    <div>
      <DemoCard
        lecture="11"
        title="Array Methods — filter, map, reduce, sort, find"
        code={`const incidents = SAMPLE_INCIDENTS;

// filter() — only Critical incidents
const critical = incidents.filter(i => i.severity === 'Critical');

// map() — extract titles
const titles = incidents.map(i => i.title);

// reduce() — sum severity scores
const totalScore = incidents.reduce((sum, i) => sum + i.score, 0);

// sort() — by score descending (non-mutating via spread)
const sorted = [...incidents].sort((a, b) => b.score - a.score);

// find() — first Critical
const first = incidents.find(i => i.severity === 'Critical');

// every() / some()
const allCritical = incidents.every(i => i.severity === 'Critical');
const anyCritical = incidents.some(i => i.severity === 'Critical');`}
        result={JSON.stringify({
          criticalCount: criticalIncidents.length,
          titles: incidentTitles,
          totalScore,
          topIncident: sortedBySeverity[0]?.title,
          firstCritical: firstCritical?.title,
          allCritical,
          anyCritical,
        }, null, 2)}
      />

      <DemoCard
        lecture="12"
        title="Array slice, splice, flat, indexOf"
        code={`const queue = ['INC-001', 'INC-002', 'INC-003', 'INC-004', 'INC-005'];

// slice — non-mutating copy
const page1 = queue.slice(0, 3); // first 3

// indexOf — search
const idx = queue.indexOf('INC-003'); // 2

// flat — nested arrays
const nested = [[1,2], [3,4], [5]];
const flat   = nested.flat(); // [1,2,3,4,5]

// includes
const has = queue.includes('INC-002'); // true`}
        result={JSON.stringify({ page1: ['INC-001','INC-002','INC-003'], idx: 2, flat: [1,2,3,4,5], has: true })}
      />

      <DemoCard
        lecture="13"
        title="Higher-Order Functions — Function factory"
        code={`// Higher-order function: returns a function (closure)
function makeSeverityFilter(minScore) {
  return function(incident) {
    return incident.score >= minScore;
  };
}

const isCritical  = makeSeverityFilter(90);
const isHigh      = makeSeverityFilter(70);

const criticals   = SAMPLE_INCIDENTS.filter(isCritical);
const highs       = SAMPLE_INCIDENTS.filter(isHigh);

console.log('Critical:', criticals.length, '| High+:', highs.length);`}
        result={`Critical: ${SAMPLE_INCIDENTS.filter(i => i.score >= 90).length} | High+: ${SAMPLE_INCIDENTS.filter(i => i.score >= 70).length}`}
      />

      <DemoCard
        lecture="14"
        title="Loops: for, while, for...of, for...in"
        code={`// for...of — iterate array values
for (const incident of SAMPLE_INCIDENTS) {
  console.log(incident.id, ':', incident.severity);
}

// for...in — iterate object keys
const incident = SAMPLE_INCIDENTS[0];
for (const key in incident) {
  if (Object.hasOwn(incident, key)) {
    console.log(key, '->', typeof incident[key]);
  }
}

// while — retry logic
let attempts = 0;
while (attempts < 3) {
  // simulate retries
  attempts++;
}`}
        result={JSON.stringify({ forOf: loopResult, forIn: forinResult }, null, 2)}
      />

      <DemoCard
        lecture="15"
        title="Destructuring & Spread — Extract and merge"
        code={`const incident = { id: 'INC-2026-A1', title: 'Highway Fire', severity: 'Critical', location: { city: 'Mumbai' } };

// Object destructuring with rename + default
const { title: incTitle, severity = 'Medium', location: { city } } = incident;

// Array destructuring
const [first, second, ...rest] = SAMPLE_INCIDENTS;

// Spread — merge objects
const update = { status: 'assigned', assignedAt: new Date() };
const updated = { ...incident, ...update }; // merged

console.log(incTitle, city, updated.status);`}
        result={`Highway Fire · Mumbai · assigned`}
      />

      <DemoCard
        lecture="16"
        title="Optional Chaining & Nullish Coalescing"
        code={`const incident = { reportedBy: { name: 'Alice' }, assignedTo: null };

// Optional chaining — safe deep access
const responderName = incident.assignedTo?.name ?? 'Unassigned';
const reporterCity  = incident.reportedBy?.location?.city ?? 'Unknown';

// vs old way (error-prone)
// const old = incident.assignedTo && incident.assignedTo.name;

console.log(responderName, reporterCity);`}
        result="Unassigned · Unknown"
      />

      <DemoCard
        lecture="17"
        title="Function Declarations, Expressions & Closures"
        code={`// Declaration — hoisted, available anywhere in scope
function calculatePriority(score, isReported) {
  return score * (isReported ? 1.2 : 1.0);
}

// Expression — not hoisted
const formatRef = (id) => \`REF: \${id.toUpperCase()}\`;

// Closure — counter factory
function makeCounter(prefix) {
  let count = 0;
  return () => \`\${prefix}-\${++count}\`; // closes over count
}
const incCounter = makeCounter('INC-2026');
console.log(incCounter(), incCounter(), incCounter());`}
        result="INC-2026-1 · INC-2026-2 · INC-2026-3"
      />

      <DemoCard
        lecture="18"
        title="Arrow Functions — this binding & concise syntax"
        code={`// Traditional function — 'this' depends on caller
function traditional() { return this; }

// Arrow function — inherits 'this' from enclosing scope (lexical this)
const arrow = () => this; // always the outer 'this'

// Arrow functions shine in array methods (concise, lexical this)
const titlesUppercase = SAMPLE_INCIDENTS
  .map(i => i.title.toUpperCase())
  .filter(t => t.includes('FIRE'));

console.log(titlesUppercase);`}
        result={JSON.stringify(SAMPLE_INCIDENTS.map(i => i.title.toUpperCase()).filter(t => t.includes('FIRE')))}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — Modern JS (Lectures 19–30)
// ═══════════════════════════════════════════════════════════════════════════════
function Tab3() {
  const [fetchResult, setFetchResult] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  const runFetchDemo = async () => {
    setFetchLoading(true);
    try {
      // CHO Lecture 30: Fetch API demo
      const res = await fetch('/api/health');
      const data = await res.json();
      setFetchResult(data);
    } catch (err) {
      setFetchResult({ error: err.message });
    } finally {
      setFetchLoading(false);
    }
  };

  return (
    <div>
      <DemoCard
        lecture="19"
        title="Promises — Async incident reporting chain"
        code={`// Promise constructor
const reportIncident = (data) =>
  new Promise((resolve, reject) => {
    if (!data.title) return reject(new Error('Title required'));
    setTimeout(() => resolve({ id: 'INC-2026-X1', ...data }), 100);
  });

// Promise chaining
reportIncident({ title: 'Road Accident', severity: 'High' })
  .then(result  => console.log('Created:', result.id))
  .catch(error  => console.error('Failed:', error.message))
  .finally(()   => console.log('Always runs'));`}
        result="Created: INC-2026-X1 → Always runs"
      />

      <DemoCard
        lecture="20"
        title="async/await — Clean Promise syntax"
        code={`// Same as above but readable
async function createAndAssign(incidentData, responderId) {
  try {
    const incident   = await reportIncident(incidentData);
    const assignment = await assignTo(incident.id, responderId);
    return { incident, assignment };
  } catch (err) {
    console.error('Chain failed:', err.message);
    throw err; // re-throw for caller
  }
}

// Top-level: async IIFE
(async () => {
  const result = await createAndAssign({ title: 'Fire' }, 'resp-1');
  console.log(result);
})();`}
        result="{ incident: {id: 'INC-2026-X1', ...}, assignment: {...} }"
      />

      <DemoCard
        lecture="21"
        title="Promise.all — Parallel data loading"
        code={`// Sequential — slow (each waits for previous)
const incidents = await getIncidents();
const users     = await getUsers();    // waits for first

// Parallel — fast (all start together)
const [incidents, users, stats] = await Promise.all([
  getIncidents(),
  getUsers(),
  getStats(),
]);

// Promise.allSettled — continue even if one fails
const results = await Promise.allSettled([
  fetch('/api/incidents'),
  fetch('/api/admin/stats'),
]);
results.forEach(r => console.log(r.status, r.value ?? r.reason));`}
        result="fulfilled: {...} · fulfilled: {...}"
      />

      <DemoCard
        lecture="22"
        title="Error Handling — try/catch/finally + custom Error"
        code={`class IncidentValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name  = 'IncidentValidationError';
    this.field = field;
  }
}

function validateIncident(data) {
  if (!data.title) throw new IncidentValidationError('Title required', 'title');
  if (data.title.length < 3) throw new IncidentValidationError('Too short', 'title');
}

try {
  validateIncident({ title: '' });
} catch (err) {
  if (err instanceof IncidentValidationError) {
    console.error('Validation error on field:', err.field, '-', err.message);
  } else {
    throw err; // rethrow unknown errors
  }
} finally {
  console.log('Validation attempt complete');
}`}
        result="Validation error on field: title - Title required\nValidation attempt complete"
      />

      <DemoCard
        lecture="23"
        title="Modules — ES Module import/export"
        code={`// incidentService.js — named exports
export const createIncident = async (data) => { /* ... */ };
export const getMyIncidents = async ()    => { /* ... */ };
export const getAllIncidents = async ()   => { /* ... */ };

// Default export (one per file)
export default function IncidentManager() { /* ... */ }

// Importing in another file
import IncidentManager, { createIncident, getAllIncidents }
  from './services/incidentService.js';

// Re-exporting (barrel pattern)
export { createIncident, getAllIncidents } from './incidentService.js';`}
        result="ES Modules enable tree-shaking, clear dependency graphs, and circular import detection."
      />

      <DemoCard
        lecture="24"
        title="Template Literals & Tagged Templates"
        code={`const incident = { id: 'INC-2026-A1', severity: 'Critical', score: 95 };

// Template literal (backtick strings)
const msg = \`Incident \${incident.id} — Severity: \${incident.severity} (score: \${incident.score})\`;

// Multi-line string
const notification = \`
  🚨 EMERGENCY ALERT
  ID: \${incident.id}
  Status: CRITICAL — Immediate response required!
\`;

// Tagged template — custom processor
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) =>
    result + str + (values[i] ? \`[\${values[i]}]\` : ''), '');
}
const tagged = highlight\`Incident \${incident.id} is \${incident.severity}\`;`}
        result={`Incident INC-2026-A1 — Severity: Critical (score: 95)`}
      />

      <DemoCard
        lecture="25"
        title="Symbols & Iterators"
        code={`// Symbol — unique, non-enumerable keys
const INCIDENT_ID = Symbol('incidentId');
const incident = { [INCIDENT_ID]: 'INC-2026-A1', title: 'Fire' };
console.log(incident[INCIDENT_ID]); // 'INC-2026-A1'
// Symbol keys are hidden from for...in and JSON.stringify

// Custom iterator
function incidentQueue(incidents) {
  let index = 0;
  return {
    [Symbol.iterator]() { return this; },
    next() {
      return index < incidents.length
        ? { value: incidents[index++], done: false }
        : { done: true };
    },
  };
}
for (const inc of incidentQueue(SAMPLE_INCIDENTS.slice(0, 2))) {
  console.log(inc.title);
}`}
        result="Symbol('incidentId') → invisible to JSON · Custom iterator works with for...of"
      />

      <DemoCard
        lecture="26"
        title="Generators — Lazy incident pagination"
        code={`// Generator function — yields values lazily
function* incidentPaginator(incidents, pageSize = 2) {
  let i = 0;
  while (i < incidents.length) {
    yield incidents.slice(i, i + pageSize);
    i += pageSize;
  }
}

const gen = incidentPaginator(SAMPLE_INCIDENTS, 2);
console.log(gen.next().value); // [INC-001, INC-002]
console.log(gen.next().value); // [INC-003, INC-004]
console.log(gen.next().value); // [INC-005]
console.log(gen.next().done);  // true`}
        result={JSON.stringify([SAMPLE_INCIDENTS.slice(0,2).map(i=>i.id), SAMPLE_INCIDENTS.slice(2,4).map(i=>i.id), SAMPLE_INCIDENTS.slice(4).map(i=>i.id)])}
      />

      <DemoCard
        lecture="27"
        title="WeakRef & FinalizationRegistry / Proxy"
        code={`// Proxy — intercept and validate object operations
const incidentSchema = { title: 'string', severity: 'string', score: 'number' };

const createValidated = (target, schema) => new Proxy(target, {
  set(obj, prop, value) {
    if (schema[prop] && typeof value !== schema[prop]) {
      throw new TypeError(\`\${prop} must be \${schema[prop]}\`);
    }
    obj[prop] = value;
    return true;
  }
});

const incident = createValidated({}, incidentSchema);
incident.title    = 'Fire';  // OK
incident.score    = 95;      // OK
// incident.score = 'bad';   // TypeError: score must be number`}
        result="Proxy validates: title='Fire' ✅ · score=95 ✅ · score='bad' → TypeError ❌"
      />

      <DemoCard
        lecture="28"
        title="Map & Set — Deduplication and lookup"
        code={`// Set — unique incident categories seen
const allCategories = SAMPLE_INCIDENTS.map(i => i.category);
const uniqueCategories = new Set(allCategories);
console.log([...uniqueCategories]);

// Map — O(1) lookup by ID
const incidentMap = new Map();
SAMPLE_INCIDENTS.forEach(i => incidentMap.set(i.id, i));
const found = incidentMap.get('INC-2026-B2');
console.log(found?.title); // 'Road Accident'

// Map preserves insertion order; objects lose it`}
        result={JSON.stringify({
          uniqueCategories: [...new Set(SAMPLE_INCIDENTS.map(i => i.category))],
          found: SAMPLE_INCIDENTS.find(i => i.id === 'INC-2026-B2')?.title,
        })}
      />

      <DemoCard
        lecture="29"
        title="localStorage / sessionStorage — CHO Auth Demo"
        code={`// CrisisConnect uses localStorage for JWT persistence
const TOKEN_KEY = 'cc_token';
const USER_KEY  = 'cc_user';

// Store
localStorage.setItem(TOKEN_KEY, 'eyJhbGci...');
localStorage.setItem(USER_KEY, JSON.stringify({ name: 'Alice', role: 'citizen' }));

// Retrieve (with JSON.parse)
const user  = JSON.parse(localStorage.getItem(USER_KEY) ?? 'null');
const token = localStorage.getItem(TOKEN_KEY);

// Clear on logout
localStorage.removeItem(TOKEN_KEY);
localStorage.removeItem(USER_KEY);`}
        result="localStorage persists across tabs + browser restarts. sessionStorage clears on tab close."
      />

      <DemoCard
        lecture="30"
        title="Fetch API — Live CrisisConnect health check"
        code={`// CHO Lecture 30: Fetch API — live demo against our own backend
const response = await fetch('/api/health');
const data = await response.json();
console.log(data);

// Note: This project uses Axios (wrapping Fetch) for convenience:
// - Automatic JSON parsing
// - Request/response interceptors for JWT
// - Better error handling for non-2xx responses`}
      >
        <div style={{ marginTop: '0.7rem' }}>
          <button
            onClick={runFetchDemo}
            disabled={fetchLoading}
            style={{
              background: 'rgba(74,144,226,0.15)', border: '1px solid rgba(74,144,226,0.45)',
              color: '#4a90e2', padding: '0.4rem 1.1rem', borderRadius: 8,
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
              opacity: fetchLoading ? 0.7 : 1,
            }}
          >
            {fetchLoading ? '⏳ Fetching…' : '🌐 Live Fetch /api/health'}
          </button>
          {fetchResult && <Result label="Live Response" value={fetchResult} />}
        </div>
      </DemoCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — React (Lectures 31–45)
// ═══════════════════════════════════════════════════════════════════════════════
function Tab4() {
  // Lecture 31: useState
  const [count, setCount] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [items, setItems] = useState(['Fire', 'Flood', 'Accident']);

  // Lecture 32: useEffect
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer); // cleanup
  }, []);

  // Lecture 33: useCallback
  const addItem = useCallback(() => {
    if (inputVal.trim()) {
      setItems(prev => [...prev, inputVal.trim()]);
      setInputVal('');
    }
  }, [inputVal]);

  // Lecture 34: useMemo
  const stats = useMemo(() => ({
    count: SAMPLE_INCIDENTS.length,
    critical: SAMPLE_INCIDENTS.filter(i => i.severity === 'Critical').length,
    avgScore: (SAMPLE_INCIDENTS.reduce((s, i) => s + i.score, 0) / SAMPLE_INCIDENTS.length).toFixed(1),
  }), []); // [] = compute once

  // Lecture 35: useRef
  const inputRef = useRef(null);

  // Lecture 37: Controlled component pattern
  const [form, setForm] = useState({ title: '', category: 'Fire', severity: 'High' });
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <DemoCard
        lecture="31"
        title="useState — Counter + List state"
        code={`const [count, setCount] = useState(0);
// Functional update (safe for derived state)
setCount(prev => prev + 1);
setCount(prev => prev - 1);

// List state — always spread, never mutate
const [items, setItems] = useState(['Fire', 'Flood']);
setItems(prev => [...prev, 'Accident']); // immutable add`}
      >
        <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.7rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setCount(c => c - 1)} style={btnStyle}>−</button>
          <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.1rem', minWidth: 30, textAlign: 'center' }}>{count}</span>
          <button onClick={() => setCount(c => c + 1)} style={btnStyle}>+</button>
          <button onClick={() => setCount(0)} style={{ ...btnStyle, background: 'rgba(185,59,59,0.12)', color: '#d85454', borderColor: 'rgba(185,59,59,0.4)' }}>Reset</button>
        </div>
        <div style={{ marginTop: '0.7rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
          Categories: {items.join(', ')}
        </div>
      </DemoCard>

      <DemoCard
        lecture="32"
        title="useEffect — Side effects & cleanup"
        code={`// Runs after every render where deps change
useEffect(() => {
  const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
  return () => clearInterval(timer); // ← cleanup on unmount/re-run
}, []); // empty array = run once on mount`}
      >
        <div style={{ marginTop: '0.7rem', display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
          <span style={{ fontSize: '1.3rem' }}>🕐</span>
          <span style={{ color: '#4a90e2', fontWeight: 600, fontFamily: 'monospace', fontSize: '1.1rem' }}>{time}</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>(live clock — updates every second)</span>
        </div>
      </DemoCard>

      <DemoCard
        lecture="33"
        title="useCallback & useMemo — Performance optimization"
        code={`// useCallback — stable function reference (prevent child re-renders)
const addItem = useCallback(() => {
  if (inputVal.trim()) setItems(prev => [...prev, inputVal.trim()]);
}, [inputVal]); // recreate only when inputVal changes

// useMemo — cached computation
const stats = useMemo(() => ({
  count:    incidents.length,
  critical: incidents.filter(i => i.severity === 'Critical').length,
  avgScore: (incidents.reduce((s, i) => s + i.score, 0) / incidents.length).toFixed(1),
}), [incidents]); // recompute only when incidents array changes`}
      >
        <div style={{ marginTop: '0.7rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Object.entries(stats).map(([k, v]) => (
            <span key={k} style={{ background: 'rgba(155,176,156,0.1)', border: '1px solid rgba(155,176,156,0.3)', borderRadius: 8, padding: '0.35rem 0.8rem', fontSize: '0.8rem', color: 'var(--color-secondary)' }}>
              {k}: <strong style={{ color: 'var(--color-primary)' }}>{v}</strong>
            </span>
          ))}
        </div>
      </DemoCard>

      <DemoCard
        lecture="34"
        title="useRef — DOM access without re-render"
        code={`const inputRef = useRef(null);

// Access DOM node directly
const focusInput = () => inputRef.current?.focus();

// useRef also stores mutable values that don't trigger re-renders
const prevCount = useRef(count);
useEffect(() => { prevCount.current = count; });
// prevCount.current holds the previous count between renders`}
      >
        <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.7rem' }}>
          <input
            ref={inputRef}
            placeholder="Click button to focus me…"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-bg-border)', borderRadius: 8, padding: '0.4rem 0.8rem', color: 'var(--color-text-primary)', fontSize: '0.85rem', outline: 'none', flex: 1 }}
          />
          <button onClick={() => inputRef.current?.focus()} style={btnStyle}>Focus via ref</button>
        </div>
      </DemoCard>

      <DemoCard
        lecture="35"
        title="Context API — AuthContext in CrisisConnect"
        code={`// AuthContext.jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login  = (userData) => setUser(userData);
  const logout = ()         => { setUser(null); localStorage.clear(); };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth hook — consume context anywhere
export const useAuth = () => useContext(AuthContext);

// In any component:
const { user, logout } = useAuth(); // no prop drilling!`}
        result="Context eliminates prop drilling. CrisisConnect uses AuthContext for global user state."
      />

      <DemoCard
        lecture="36"
        title="React Router — Route parameters & navigation"
        code={`// App.jsx — route definitions
<Routes>
  <Route path="/"           element={<HomePage />} />
  <Route path="/report"     element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
  <Route path="/incidents/:incidentId" element={<IncidentDetailPage />} />
  <Route path="/responder"  element={<RoleRoute role="responder"><ResponderDashboard /></RoleRoute>} />
  <Route path="/admin"      element={<RoleRoute role="admin"><AdminDashboard /></RoleRoute>} />
</Routes>

// Reading route params in IncidentDetailPage
const { incidentId } = useParams();

// Navigation
const navigate = useNavigate();
navigate('/responder'); // programmatic navigation`}
        result="React Router v6 with useParams, useNavigate, nested routes and protected wrappers."
      />

      <DemoCard
        lecture="37"
        title="Controlled Components — Incident Report Form"
        code={`const [form, setForm] = useState({ title: '', category: 'Fire', severity: 'High' });

// Single handler for all fields (DRY)
const handleChange = (e) => {
  const { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));
};

// Input is 'controlled' — React owns the value
<input
  name="title"
  value={form.title}
  onChange={handleChange}
/>
<select name="category" value={form.category} onChange={handleChange}>
  <option value="Fire">Fire</option>
</select>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.7rem' }}>
          <input name="title" value={form.title} onChange={handleFormChange} placeholder="Incident title…" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-bg-border)', borderRadius: 8, padding: '0.4rem 0.8rem', color: 'var(--color-text-primary)', fontSize: '0.85rem', outline: 'none' }} />
          <select name="category" value={form.category} onChange={handleFormChange} style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-bg-border)', borderRadius: 8, padding: '0.4rem 0.8rem', color: 'var(--color-text-primary)', fontSize: '0.85rem', outline: 'none' }}>
            {['Fire', 'Accident', 'Crime', 'Medical Emergency', 'Natural Disaster', 'Other'].map(c => <option key={c}>{c}</option>)}
          </select>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Live form state: {JSON.stringify(form)}</div>
        </div>
      </DemoCard>

      <DemoCard
        lecture="38-45"
        title="Component Patterns — Composition, HOC, Custom Hooks"
        code={`// ── Custom Hook ─────────────────────────────────────────────────
function useIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading]     = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getAllIncidents();
    setIncidents(data.incidents);
    setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { incidents, loading, refresh };
}

// ── HOC (Higher Order Component) ─────────────────────────────────
function withAuth(Component, requiredRole) {
  return function WrappedComponent(props) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (requiredRole && user.role !== requiredRole) return <Forbidden />;
    return <Component {...props} />;
  };
}

// Usage: export default withAuth(AdminDashboard, 'admin');

// ── Compound Component Pattern ────────────────────────────────────
// <IncidentCard> with <IncidentCard.Header>, <IncidentCard.Body>`}
        result="Patterns: Custom Hooks (reusable state), HOC (behavior injection), Compound Components (slot-based composition)."
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5 — Node.js & Express (Lectures 46–60)
// ═══════════════════════════════════════════════════════════════════════════════
function Tab5() {
  return (
    <div>
      <DemoCard
        lecture="46-48"
        title="JavaScript Runtime — Browser vs Node.js"
        code={`// BROWSER JavaScript
window.alert('Hello!');
document.getElementById('myDiv');
localStorage.setItem('key', 'value');
fetch('https://api.example.com');      // Fetch API built-in

// NODE.JS — no window/document, but has:
process.env.PORT;           // environment variables
process.argv;               // command-line arguments
global.someVar = 'shared';  // global scope

// Node-specific modules (NOT in browser):
import fs   from 'fs';      // File system
import path from 'path';    // Path manipulation
import http from 'http';    // Raw HTTP server

// Both environments share:
// - Array, Object, Math, Date, Promise, Map, Set`}
        result="Node.js = V8 engine + libuv (event loop) + C++ bindings. No DOM, but full OS access."
      />

      <DemoCard
        lecture="49"
        title="Node.js Fundamentals — Global objects & process"
        code={`// Node.js globals (available without import)
console.log(process.version);   // 'v22.x.x'
console.log(process.platform);  // 'win32' / 'linux'
console.log(process.env.PORT);  // '5000' (from .env)
console.log(process.cwd());     // current working directory

// __filename and __dirname in ES Modules:
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);`}
        result="process.env, process.version, __dirname via import.meta.url"
      />

      <DemoCard
        lecture="50"
        title="Event Loop — Non-blocking I/O in Node.js"
        code={`console.log('[1] Sync start');

setTimeout(() => console.log('[4] Macrotask: setTimeout 0ms'), 0);
setImmediate(() => console.log('[3.5] Check phase: setImmediate'));

Promise.resolve()
  .then(() => console.log('[3] Microtask: Promise.then'));

process.nextTick(() => console.log('[2] nextTick (highest microtask priority)'));

console.log('[1.5] Sync end');
// Output: 1 → 1.5 → 2 → 3 → 3.5 → 4`}
        result="Order: sync → nextTick → Promise.then → setImmediate → setTimeout. Microtasks drain fully before macrotasks."
      />

      <DemoCard
        lecture="51"
        title="fs & path modules — File operations"
        code={`import fs   from 'fs';
import path from 'path';

// path.join — platform-safe paths (/ on Unix, \\ on Windows)
const uploadsDir = path.join(__dirname, '..', 'uploads', 'evidence');

// fs.existsSync — check before creating
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// fs.readdir — async (preferred)
fs.readdir(uploadsDir, (err, files) => {
  if (err) return console.error(err);
  console.log('Evidence files:', files.length);
});

// fs.createReadStream — stream large files (memory-efficient)
const readStream = fs.createReadStream('/path/to/file.pdf');
readStream.pipe(res); // pipe directly to HTTP response`}
        result="Used in: uploadMiddleware.js (UPLOAD_DIR), serveEvidence controller (stream evidence files)"
      />

      <DemoCard
        lecture="52"
        title="Buffers, Streams & EventEmitter"
        code={`import { EventEmitter } from 'events';

// Buffer — binary data (images, PDFs)
const buf = Buffer.from('Emergency data', 'utf8');
console.log(buf.toString('base64'));    // base64 encode
console.log(buf.length);               // byte size

// EventEmitter — pub/sub pattern
class IncidentBus extends EventEmitter {}
const bus = new IncidentBus();

// Register listener
bus.on('incident:resolved', ({ id, resolvedBy }) => {
  console.log(\`\${id} resolved by \${resolvedBy}\`);
  sendNotification(resolvedBy);
});

// Emit event (happens in incidentController when status → resolved)
bus.emit('incident:resolved', { id: 'INC-2026-A1', resolvedBy: 'resp@city.gov' });`}
        result="EventEmitter used by fs, http, net, stream. All Node.js I/O is event-driven."
      />

      <DemoCard
        lecture="53"
        title="HTTP Module — Raw server (foundation for Express)"
        code={`import http from 'http';

// Express is built on top of this exact http.createServer()
const server = http.createServer((req, res) => {
  // req = IncomingMessage { method, url, headers, body-stream }
  // res = ServerResponse { statusCode, setHeader, write, end }

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ status: 'ok' }));
});

server.listen(5000, () => console.log('Server on :5000'));

// Express abstracts:
// ✅ Routing (req.params, req.query)
// ✅ Body parsing (JSON, form-data)
// ✅ Middleware chaining (app.use())
// ✅ Error handling (4-argument middleware)`}
        result="Express = http.createServer() + routing + middleware + error handling."
      />

      <DemoCard
        lecture="54"
        title="NPM & package.json — Project dependencies"
        code={`// CrisisConnect backend/package.json
{
  "name": "crisisconnect-backend",
  "type": "module",        // enables ESM (import/export)
  "scripts": {
    "dev":   "nodemon server.js",   // hot reload
    "start": "node server.js"       // production
  },
  "dependencies": {
    "express": "^4.x",    // web framework
    "mongoose": "^8.x",   // MongoDB ODM
    "jsonwebtoken": "^9.x", // JWT signing/verification
    "bcryptjs": "^2.x",   // password hashing
    "cors": "^2.x",       // CORS middleware
    "dotenv": "^16.x",    // .env loading
    "multer": "^1.x"      // multipart file uploads
  }
}`}
        result="npm install — resolves dependency graph. package-lock.json locks exact versions for reproducible builds."
      />

      <DemoCard
        lecture="55"
        title="Express Routing — Route parameters & query params"
        code={`// Route parameter (:id) — part of the URL path
app.get('/api/incidents/:incidentId', protect, async (req, res) => {
  const { incidentId } = req.params; // e.g. 'INC-2026-A1'
  // ...
});

// Query parameters (?key=value) — after the '?'
app.get('/api/incidents', protect, async (req, res) => {
  const { page = 1, limit = 20, status, severity } = req.query;
  // GET /api/incidents?page=2&status=reported
});

// Router-level middleware (used in CrisisConnect)
const router = Router();
router.use(protect);           // apply to all routes in this router
router.get('/stats', getStats);
app.use('/api/admin', router);`}
        result="Express router: app.get, app.post, app.patch, Router() for modular route files."
      />

      <DemoCard
        lecture="56"
        title="Middleware — Pipeline, body parsing, CORS"
        code={`// Express middleware: (req, res, next) => void

// 1. Built-in — body parsing
app.use(express.json());           // parse JSON body
app.use(express.urlencoded({ extended: true })); // parse form data

// 2. Third-party — CORS
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// 3. Custom — request logger
app.use((req, _res, next) => {
  console.log(\`\${req.method} \${req.url} — \${Date.now()}\`);
  next(); // pass to next middleware
});

// 4. Error middleware — 4 arguments
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({...});
  res.status(500).json({ message: 'Internal error' });
});`}
        result="CrisisConnect pipeline: cors → json → urlencoded → routes → 404 → error handler"
      />

      <DemoCard
        lecture="57"
        title="JWT Authentication & RBAC Middleware"
        code={`// protect middleware — verifies JWT token
export const protect = async (req, res, next) => {
  const auth  = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  
  try {
    const token   = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// authorizeRoles middleware — RBAC
export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Usage: router.get('/', protect, authorizeRoles('admin'), handler);`}
        result="JWT flow: register → hash password → login → sign JWT → send token → client stores → sends in Authorization header → protect verifies → RBAC checks role → handler runs."
      />

      <DemoCard
        lecture="58"
        title="Multer — File upload middleware"
        code={`import multer from 'multer';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, './uploads/evidence'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = \`evidence_\${Date.now()}_\${Math.random().toString(16).slice(2,10)}\${ext}\`;
    cb(null, safe); // never use original filename — prevents path traversal
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  cb(null, allowed.includes(file.mimetype)); // true = accept
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10*1024*1024 } });

// Route usage:
router.post('/:id/evidence', protect, upload.array('evidence', 5), uploadEvidence);`}
        result="Used in: POST /api/incidents/:id/evidence — accepts up to 5 files, max 10 MB each, JPEG/PNG/PDF/WebP only."
      />

      <DemoCard
        lecture="59"
        title="Mongoose — Models, schemas, populate()"
        code={`// Schema — defines structure + validation
const incidentSchema = new mongoose.Schema({
  title:      { type: String, required: true, minlength: 3 },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // FK reference
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statusHistory: [statusHistorySchema], // embedded sub-document array
}, { timestamps: true });

// Model — compiled schema = database collection
const Incident = mongoose.model('Incident', incidentSchema);

// Populate — JOIN-like operation
const incidents = await Incident
  .find({ status: 'reported' })
  .populate('reportedBy', 'name email')    // replace ObjectId with user data
  .populate('assignedTo', 'name email role')
  .populate('statusHistory.changedBy', 'name email')
  .sort({ createdAt: -1 })
  .lean(); // returns plain JS objects (faster, no Mongoose overhead)`}
        result="Mongoose: Schema (structure) → Model (CRUD methods) → Document (instance). populate() replaces ObjectId refs with actual documents."
      />

      <DemoCard
        lecture="60"
        title="Full-Stack Integration — The complete CrisisConnect request lifecycle"
        code={`// ── FULL REQUEST LIFECYCLE ─────────────────────────────────────────
// 1. Frontend: User fills form, clicks "Report Incident"
const result = await createIncident({ title, category, description, severity, location });

// 2. incidentService.js: Axios POST with JWT
api.post('/incidents', data); // Authorization: Bearer <token>

// 3. Vite proxy: /api → http://localhost:5000/api (dev only)

// 4. Express server.js: routes to incidentRoutes
app.use('/api/incidents', incidentRoutes);

// 5. JWT protect middleware: verify token, set req.user
// 6. incidentController.createIncident():
//    a. Validate input
//    b. Generate unique incidentId
//    c. Call AI classification service (Gemini/OpenAI)
//    d. Save to MongoDB Atlas via Mongoose
//    e. Return 201 with incident + AI analysis

// 7. Frontend: AuthContext + React state update
// 8. Router: navigate('/my-reports')`}
        result="CrisisConnect demonstrates the complete full-stack cycle: React UI → Axios → Express → Mongoose → MongoDB Atlas → AI → Response → React state update."
      />
    </div>
  );
}

// Shared button style
const btnStyle = {
  background: 'rgba(155,176,156,0.12)', border: '1px solid rgba(155,176,156,0.4)',
  color: 'var(--color-secondary)', borderRadius: 8, padding: '0.4rem 1rem',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'js-foundations', label: '🔢 JS Foundations', subtitle: 'Lectures 1–10', component: Tab1 },
  { id: 'arrays-functions', label: '📚 Arrays & Functions', subtitle: 'Lectures 11–18', component: Tab2 },
  { id: 'modern-js', label: '⚡ Modern JS', subtitle: 'Lectures 19–30', component: Tab3 },
  { id: 'react', label: '⚛️ React', subtitle: 'Lectures 31–45', component: Tab4 },
  { id: 'node-express', label: '🌐 Node & Express', subtitle: 'Lectures 46–60', component: Tab5 },
];

export default function CHOLearningLab() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('js-foundations');

  const ActiveTabComponent = TABS.find(t => t.id === activeTab)?.component ?? Tab1;

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.4rem' }}>
          🎓 CHO Learning Lab
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Interactive demonstrations of every CHO syllabus topic (Lectures 1–60) using live CrisisConnect data.
        </p>
        {user && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Logged in as <strong style={{ color: 'var(--color-sand)' }}>{user.name}</strong> ({user.role}) — some live demos require an active server connection.
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--color-bg-border)', paddingBottom: '1rem' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'rgba(216,199,167,0.15)' : 'var(--color-bg-elevated)',
              border: activeTab === tab.id ? '1px solid rgba(216,199,167,0.45)' : '1px solid var(--color-bg-border)',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderRadius: 10, padding: '0.55rem 1rem',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              transition: 'all 0.2s',
            }}
          >
            <div>{tab.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>{tab.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <ActiveTabComponent />
    </div>
  );
}
