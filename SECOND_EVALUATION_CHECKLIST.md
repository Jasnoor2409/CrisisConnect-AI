# Second Evaluation Checklist — CrisisConnect AI

## ✅ Feature Checklist

### Existing Features (Preserved)
- [x] Feature 1: User Registration (POST /api/auth/register)
- [x] Feature 2: User Login + JWT (POST /api/auth/login)
- [x] Feature 3: Logout + Session Clear (AuthContext.logout())
- [x] Feature 4: Protected Profile & Session (GET /api/auth/me)
- [x] Feature 5: Incident Reporting (POST /api/incidents)
- [x] Feature 6: Map Location Picker (Leaflet + Geolocation in ReportIncidentPage)
- [x] Feature 7: Citizen Incident History (GET /api/incidents/my)
- [x] Feature 8: AI Category Classification (Gemini/OpenAI + fallback)
- [x] Feature 9: AI Severity Assessment (integrated in AI service)
- [x] Feature 10: AI Safety Recommendations (returned with every report)

### New Features (Evaluation 2)
- [x] Feature 11: Responder Dashboard (ResponderDashboard.jsx)
- [x] Feature 12: Authorized All-Incidents API (GET /api/incidents — responder/admin)
- [x] Feature 13: Incident Assignment (PATCH /api/incidents/:id/assign)
- [x] Feature 14: Status & Resolution Management (PATCH /api/incidents/:id/status)
- [x] Feature 15: Evidence File Uploads (POST /api/incidents/:id/evidence + Multer)
- [x] Feature 16: Admin Dashboard (AdminDashboard.jsx — stats, user management)
- [x] Feature 17: Incident Tracking & Status Timeline (statusHistory array)

---

## ✅ CHO Syllabus Coverage (Lectures 1–60)

### Lectures 1–10: JS Foundations
- [x] 1 — var, let, const
- [x] 2 — Data types
- [x] 3 — typeof, instanceof
- [x] 4 — Operators (ternary, &&, ??)
- [x] 5 — Type coercion (explicit + implicit)
- [x] 6 — Conditionals (if/else, switch)
- [x] 7 — Math object
- [x] 8 — Date object
- [x] 9 — String methods
- [x] 10 — Regular expressions

### Lectures 11–18: Arrays & Functions
- [x] 11 — Array: push, pop, slice
- [x] 12 — filter, find, some, every
- [x] 13 — map, reduce, forEach, sort
- [x] 14 — Loops: for, while, for…of, for…in
- [x] 15 — Destructuring, spread, rest
- [x] 16 — Optional chaining, nullish coalescing
- [x] 17 — Function declarations, closures
- [x] 18 — Arrow functions

### Lectures 19–30: Modern JS
- [x] 19 — Promises
- [x] 20 — async/await
- [x] 21 — Promise.all
- [x] 22 — Error handling (try/catch/finally, custom Error)
- [x] 23 — ES Modules (import/export)
- [x] 24 — Template literals
- [x] 25 — Symbols, iterators
- [x] 26 — Generators
- [x] 27 — Promise.all / allSettled (CHO Lab + admin controller)
- [x] 28 — Map & Set
- [x] 29 — localStorage / sessionStorage
- [x] 30 — Fetch API / Axios

### Lectures 31–45: React
- [x] 31 — useState
- [x] 32 — useEffect
- [x] 33 — useCallback
- [x] 34 — useMemo
- [x] 35 — useRef
- [x] 36 — React Router v6
- [x] 37 — Controlled components
- [x] 38 — Context API
- [x] 39 — Custom hooks (useAuth)
- [x] 40 — Component composition
- [x] 41 — Props
- [x] 42 — Event handling
- [x] 43 — Conditional rendering
- [x] 44 — Lists & keys
- [x] 45 — Form validation

### Lectures 46–60: Node.js & Express
- [x] 46–48 — Browser vs Node.js, V8, runtime
- [x] 49 — Node.js globals (process, __dirname)
- [x] 50 — Event loop, non-blocking I/O
- [x] 51 — fs & path modules
- [x] 52 — Buffers, Streams, EventEmitter
- [x] 53 — HTTP module
- [x] 54 — NPM & package.json
- [x] 55 — Express routing (params, query)
- [x] 56 — Middleware pipeline, CORS, body parsing
- [x] 57 — JWT auth, RBAC middleware
- [x] 58 — Multer file uploads
- [x] 59 — Mongoose schemas, models, populate()
- [x] 60 — Full-stack integration

---

## ✅ Documentation
- [x] CHO_SYLLABUS_MAP.md — Lecture → file/function cross-reference
- [x] API_DOCUMENTATION.md — All endpoint schemas and RBAC rules
- [x] SECOND_EVALUATION_CHECKLIST.md — this file

---

## ✅ Architecture & Quality
- [x] Deep Forest + Warm Sand theme preserved
- [x] JWT-based authentication preserved (no credential hardcoding)
- [x] MongoDB Atlas connection preserved
- [x] AI integration (Gemini/OpenAI + fallback) preserved
- [x] RBAC: citizen < responder < admin roles enforced server-side
- [x] Secrets only in .env (not committed)
- [x] Global Multer error handler in server.js
- [x] Path traversal prevention in file upload
- [x] Status transition validation (finite state machine)
- [x] Mongoose population for all reference fields

---

## 🎓 Viva Study Points

1. **How does JWT authentication work?** → Register → bcrypt hash → login → jwt.sign(id) → client stores → sends as Bearer → protect middleware verifies → req.user set → handler runs

2. **What is RBAC?** → Role-Based Access Control. `authorizeRoles('admin')` checks `req.user.role` against allowed roles. Citizens can't see all incidents; only assigned responders can update status.

3. **How does Mongoose populate() work?** → Replaces ObjectId reference with actual document from the referenced collection. E.g., `assignedTo: ObjectId('123')` becomes `assignedTo: { name: 'Bob', email: '...' }`.

4. **What is the Event Loop?** → Node.js runs JS single-threaded but handles I/O asynchronously. Call stack → microtask queue (Promises) → macrotask queue (setTimeout). Non-blocking I/O doesn't block the thread.

5. **Why Multer?** → Express doesn't parse `multipart/form-data` by default. Multer handles file uploads, validates MIME type + extension (dual-layer), limits file size, and saves to disk with safe names.

6. **What is the difference between Promise.all and Promise.allSettled?** → `Promise.all` fails fast (rejects if any promise rejects). `Promise.allSettled` waits for all and returns an array of {status, value/reason} — used in admin stats for fault tolerance.

7. **How does useCallback differ from useMemo?** → `useCallback` memoizes a function reference. `useMemo` memoizes a computed value. Both prevent unnecessary re-renders of child components.

8. **What are status transitions?** → A finite state machine: incidents flow `reported → assigned → in_progress → resolved/dismissed`. Invalid transitions are rejected server-side (e.g., can't go `resolved → in_progress` without admin).
