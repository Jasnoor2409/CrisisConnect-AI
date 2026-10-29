# CHO Syllabus Map — CrisisConnect AI

> Maps every CHO lecture topic to the actual file, function, and code line where it is demonstrated in this project.

---

## Lectures 1–10: JavaScript Foundations

| Lecture | Topic | File | Key Code / Notes |
|---------|-------|------|-----------------|
| 1 | Variables: var, let, const | `frontend/src/pages/CHOLearningLab.jsx` · `frontend/src/context/AuthContext.jsx` | AuthContext: `const [user, setUser] = useState(null)`, `let loading`. CHO Lab: interactive demo |
| 2 | Data Types | `backend/src/models/Incident.js` | Schema types: String, Number, Boolean, ObjectId |
| 3 | typeof, instanceof | `frontend/src/pages/CHOLearningLab.jsx` · `backend/src/controllers/incidentController.js` | `ALLOWED_CATEGORIES.includes(category)`, `instanceof Array` |
| 4 | Operators | `backend/src/controllers/incidentController.js` | Ternary for severity labels, `??` for default note, `&&` for auth check |
| 5 | Type Coercion | `backend/src/controllers/incidentController.js` | `Number(location.latitude)` — explicit coercion from string query params |
| 6 | Conditionals: if/else, switch | `backend/src/controllers/incidentController.js` | `switch` on status, `if/else` for role checks |
| 7 | Math Object | `backend/src/controllers/incidentController.js` | `Math.random()`, `Math.floor()` in `generateIncidentId()` |
| 8 | Date Object | `backend/src/models/Incident.js` | `Date.now()`, `new Date()` for timestamps, `assignedAt`, `resolvedAt` |
| 9 | String Methods | `backend/src/controllers/incidentController.js` | `.trim()`, `.toUpperCase()`, `.includes()`, `.split(' ')` |
| 10 | Regular Expressions | `backend/src/controllers/incidentController.js` | `cleanId.match(/^[0-9a-fA-F]{24}$/)` — ObjectId regex validation |

---

## Lectures 11–18: Arrays & Functions

| Lecture | Topic | File | Key Code / Notes |
|---------|-------|------|-----------------|
| 11 | Array Methods: push, pop, slice, splice | `backend/src/controllers/incidentController.js` | `incident.evidence.push(...evidenceEntries)`, `incident.statusHistory.push(...)` |
| 12 | filter, find, some, every, includes | `frontend/src/pages/ResponderDashboard.jsx` | `incidents.filter(i => i.status === statusFilter)` — live client-side filter |
| 13 | map, reduce, forEach, sort | `frontend/src/pages/AdminDashboard.jsx` | `Object.entries(data).map(...)`, `statusCounts.reduce(...)` in admin stats |
| 14 | Loops: for, while, for…of, for…in | `frontend/src/pages/ProfilePage.jsx` | `for...in` on userObj; CHO Lab interactive demo |
| 15 | Destructuring & Spread | `backend/src/controllers/incidentController.js` | `const { title, category, description, severity, location } = req.body` |
| 16 | Optional Chaining & Nullish Coalescing | `frontend/src/pages/ResponderDashboard.jsx` | `incident.assignedTo?.name ?? 'Unassigned'` throughout UI |
| 17 | Function Declarations, Expressions, Closures | `backend/src/controllers/incidentController.js` | `generateIncidentId()` closure, `makeSeverityFilter()` factory in CHO Lab |
| 18 | Arrow Functions | `frontend/src/services/incidentService.js` | All exported functions use arrow syntax; `.map(i => i.title)` everywhere |

---

## Lectures 19–30: Modern JavaScript

| Lecture | Topic | File | Key Code / Notes |
|---------|-------|------|-----------------|
| 19 | Promises | `frontend/src/context/AuthContext.jsx` | `verifySession()` — Promise-based `getMe()` call |
| 20 | async/await | `backend/src/controllers/incidentController.js` | All controller functions: `async (req, res) => { ... await Incident.create(...) }` |
| 21 | Promise.all | `backend/src/controllers/adminController.js` | `const [totalIncidents, statusCounts, ...] = await Promise.all([...])` |
| 22 | Error Handling: try/catch/finally | Every controller | `try { ... } catch (error) { ... } finally { setLoading(false); }` |
| 23 | ES Modules: import/export | All backend files | `import Incident from '../models/Incident.js'`; named + default exports |
| 24 | Template Literals | `backend/src/controllers/incidentController.js` | `` `INC-${year}-${randomStr}` `` — Incident ID generation |
| 25 | Symbols & Iterators | `frontend/src/pages/CHOLearningLab.jsx` | CHO Lab Tab 3 — custom `[Symbol.iterator]()` demo |
| 26 | Generators | `frontend/src/pages/CHOLearningLab.jsx` | CHO Lab: `function* incidentPaginator()` demo |
| 27 | Promise.all, allSettled | `backend/src/controllers/adminController.js` | Parallel stats queries with `Promise.all([...])` |
| 28 | Map & Set | `frontend/src/pages/CHOLearningLab.jsx` | CHO Lab Tab 3 — `new Set(categories)`, `new Map()` for O(1) lookup |
| 29 | localStorage / sessionStorage | `frontend/src/services/authService.js` | `localStorage.setItem('cc_token', ...)` — JWT session persistence |
| 30 | Fetch API / Axios | `frontend/src/services/api.js` | Custom Axios instance with JWT interceptor; CHO Lab: live `/api/health` fetch |

---

## Lectures 31–45: React

| Lecture | Topic | File | Key Code / Notes |
|---------|-------|------|-----------------|
| 31 | useState | `frontend/src/pages/ResponderDashboard.jsx` | `const [incidents, setIncidents] = useState([])` |
| 32 | useEffect | `frontend/src/pages/ResponderDashboard.jsx` · `AdminDashboard.jsx` | `useEffect(() => { fetchIncidents(); }, [fetchIncidents])` |
| 33 | useCallback | `frontend/src/pages/ResponderDashboard.jsx` | `const fetchIncidents = useCallback(async () => {...}, [])` |
| 34 | useMemo | `frontend/src/pages/ResponderDashboard.jsx` | `const filtered = useMemo(() => incidents.filter(...), [incidents, statusFilter])` |
| 35 | useRef | `frontend/src/pages/CHOLearningLab.jsx` | Interactive `useRef` demo with DOM focus |
| 36 | React Router | `frontend/src/App.jsx` | `<Routes>`, `<Route>`, `<Navigate>`, `RoleRoute`, `SmartRedirect` |
| 37 | Controlled Components | `frontend/src/pages/ReportIncidentPage.jsx` | Full incident report form with controlled inputs + validation |
| 38 | Context API | `frontend/src/context/AuthContext.jsx` | `createContext`, `AuthProvider`, `useAuth()` custom hook |
| 39 | Custom Hooks | `frontend/src/context/AuthContext.jsx` | `useAuth()` = `useContext(AuthContext)` |
| 40 | Component Composition | `frontend/src/pages/AdminDashboard.jsx` | `<StatCard>`, `<BarChart>` — reusable presentational components |
| 41 | Props & PropTypes | `frontend/src/pages/AdminDashboard.jsx` | `StatCard({ icon, label, value, sub, color })` |
| 42 | Event Handling | `frontend/src/pages/ResponderDashboard.jsx` | `onClick={handleSelfAssign}`, `onChange={e => setSearchTerm(...)}` |
| 43 | Conditional Rendering | `frontend/src/pages/ResponderDashboard.jsx` | `{loading ? <Spinner/> : error ? <Error/> : <List/>}` |
| 44 | Lists & Keys | `frontend/src/pages/ResponderDashboard.jsx` | `{filtered.map(incident => <div key={incident._id}>...)}` |
| 45 | Forms & Validation | `frontend/src/pages/ReportIncidentPage.jsx` | Client-side validation before API call |

---

## Lectures 46–60: Node.js & Express

| Lecture | Topic | File | Key Code / Notes |
|---------|-------|------|-----------------|
| 46 | Browser vs Node.js | `frontend/src/pages/CHOLearningLab.jsx` Tab 5 | Side-by-side comparison — DOM APIs vs. fs/path/process |
| 47 | V8 Engine, runtime | `backend/cho_node_demo.js` | `process.version`, runtime globals demo |
| 48 | Node.js module system | `backend/server.js` | `"type": "module"` in package.json; ES Module imports throughout |
| 49 | Node.js Globals: process | `backend/server.js` | `process.env.PORT`, `process.env.NODE_ENV`, `process.env.JWT_SECRET` |
| 50 | Event Loop, non-blocking I/O | `backend/cho_node_demo.js` | setTimeout, Promise.resolve, process.nextTick ordering demo |
| 51 | fs & path modules | `backend/src/middleware/uploadMiddleware.js` | `fs.existsSync(UPLOAD_DIR)`, `fs.mkdirSync(...)`, `path.join(...)` |
| 52 | Buffers, Streams, EventEmitter | `backend/src/controllers/incidentController.js` | `fs.createReadStream(filePath).pipe(res)` — streaming evidence files |
| 53 | HTTP Module | `backend/cho_node_demo.js` | Raw `http.createServer()` educational demo |
| 54 | NPM, package.json, nodemon | `backend/package.json` | `"dev": "nodemon server.js"`, dependency list |
| 55 | Express routing, req/res | `backend/src/routes/incidentRoutes.js` | `router.get('/:incidentId', ...)`, `router.patch('/:id/assign', ...)` |
| 56 | Middleware, body parsing, REST | `backend/server.js` | `app.use(express.json())`, 4-arg error middleware, HTTP status codes |
| 57 | JWT Authentication, RBAC | `backend/src/middleware/authMiddleware.js` · `roleMiddleware.js` | `protect` + `authorizeRoles('admin')` chained on every protected route |
| 58 | File Uploads with Multer | `backend/src/middleware/uploadMiddleware.js` | `multer.diskStorage`, `fileFilter`, `upload.array('evidence', 5)` |
| 59 | Mongoose, schemas, populate() | `backend/src/models/Incident.js` · `incidentController.js` | `.populate('reportedBy', 'name email')` — multiple levels |
| 60 | Full-Stack Integration | Entire codebase | React → Axios → Vite proxy → Express → Mongoose → MongoDB Atlas → AI → Response |

---

## Project Feature ↔ Feature Number Map

| Feature | Name | Status |
|---------|------|--------|
| 1 | User Registration | ✅ Existing |
| 2 | User Login + JWT | ✅ Existing |
| 3 | Logout + Session Clear | ✅ Existing |
| 4 | Protected Profile & Session | ✅ Existing |
| 5 | Incident Reporting | ✅ Existing |
| 6 | Map Location Picker | ✅ Existing |
| 7 | Citizen Incident History | ✅ Existing |
| 8 | AI Category Classification | ✅ Existing |
| 9 | AI Severity Assessment | ✅ Existing |
| 10 | AI Safety Recommendations | ✅ Existing |
| 11 | Responder Dashboard | ✅ **NEW** |
| 12 | Authorized All-Incidents API | ✅ **NEW** |
| 13 | Incident Assignment | ✅ **NEW** |
| 14 | Status & Resolution Management | ✅ **NEW** |
| 15 | Evidence File Uploads | ✅ **NEW** |
| 16 | Admin Dashboard | ✅ **NEW** |
| 17 | Incident Tracking & Notifications | ✅ **NEW** (status timeline) |
| CHO Lab | Interactive Lecture Demos 1–60 | ✅ **NEW** |
