# API Documentation — CrisisConnect AI

Base URL (development): `http://localhost:5000/api`

All protected endpoints require the `Authorization: Bearer <token>` header.

---

## Authentication

### POST /api/auth/register
Register a new citizen user.

**Auth:** None  
**Body:**
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "SecurePass123!"
}
```
**Response 201:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "<jwt>",
  "user": { "id": "...", "name": "Alice Smith", "email": "alice@example.com", "role": "citizen" }
}
```

---

### POST /api/auth/login
Login with credentials.

**Auth:** None  
**Body:**
```json
{ "email": "alice@example.com", "password": "SecurePass123!" }
```
**Response 200:**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "...", "name": "Alice Smith", "email": "...", "role": "citizen" }
}
```

---

### GET /api/auth/me
Get current user profile from JWT.

**Auth:** Bearer Token  
**Response 200:**
```json
{ "success": true, "user": { "id": "...", "name": "...", "email": "...", "role": "...", "createdAt": "..." } }
```

---

## Incidents

### POST /api/incidents
Submit a new emergency incident report.

**Auth:** Bearer Token (any role)  
**Body:**
```json
{
  "title": "Highway 9 Fire",
  "category": "Fire",
  "description": "Large grass fire spreading near highway, multiple vehicles affected.",
  "severity": "High",
  "location": {
    "address": "Highway 9, Mumbai",
    "latitude": 19.076,
    "longitude": 72.8777
  }
}
```
**Response 201:**
```json
{
  "success": true,
  "message": "Emergency incident reported successfully",
  "incident": {
    "id": "...",
    "incidentId": "INC-2026-X1A2B",
    "status": "reported",
    "aiClassification": { "category": "Fire", "confidence": 0.97, ... },
    "safetyRecommendations": { "recommendations": [...], ... }
  }
}
```

---

### GET /api/incidents/my
Fetch all incidents reported by the authenticated citizen.

**Auth:** Bearer Token  
**Response 200:**
```json
{ "success": true, "count": 3, "incidents": [...] }
```

---

### GET /api/incidents
Fetch all incidents (responder/admin only). Supports pagination + filters.

**Auth:** Bearer Token (responder, admin)  
**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 50) |
| `status` | string | Filter: `reported`, `assigned`, `in_progress`, `resolved`, `dismissed` |
| `category` | string | Filter: `Fire`, `Accident`, `Medical Emergency`, etc. |
| `severity` | string | Filter: `Low`, `Medium`, `High`, `Critical` |
| `search` | string | Text search on title, description, incidentId |

**Response 200:**
```json
{
  "success": true,
  "count": 20,
  "total": 87,
  "page": 1,
  "totalPages": 5,
  "incidents": [{ ... }]
}
```

---

### GET /api/incidents/:incidentId
Get a single incident by reference code (`INC-2026-XXXXX`) or MongoDB ObjectId.

**Auth:** Bearer Token  
**RBAC:** Citizens can only view their own incidents.  
**Response 200:**
```json
{
  "success": true,
  "incident": {
    "incidentId": "INC-2026-X1A2B",
    "status": "assigned",
    "assignedTo": { "name": "Bob", "email": "bob@fire.gov", "role": "responder" },
    "statusHistory": [...],
    "evidence": [...]
  }
}
```

---

### PATCH /api/incidents/:id/assign
Assign incident to a responder.

**Auth:** Bearer Token (responder, admin)  
**RBAC:**
- Responder: self-assigns (no body needed)
- Admin: must send `responderId` to assign to another user

**Body (admin only):**
```json
{ "responderId": "<mongodb-user-id>" }
```
**Response 200:**
```json
{
  "success": true,
  "message": "Incident assigned successfully.",
  "incident": { "id": "...", "status": "assigned", "assignedTo": {...}, "assignedAt": "..." }
}
```

---

### PATCH /api/incidents/:id/status
Update incident status.

**Auth:** Bearer Token (responder, admin)  
**RBAC:** Responders must be assigned to the incident and follow valid transitions.

Valid transitions:
- `reported` → `assigned`, `in_progress`, `dismissed`
- `assigned` → `in_progress`, `dismissed`
- `in_progress` → `resolved`, `dismissed`
- `resolved` / `dismissed` → (admin-only override)

**Body:**
```json
{ "status": "resolved", "note": "Fire extinguished, scene cleared." }
```
**Response 200:**
```json
{ "success": true, "message": "Incident status updated to 'resolved'.", "incident": {...} }
```

---

### POST /api/incidents/:id/evidence
Upload evidence files (photos, PDFs).

**Auth:** Bearer Token  
**RBAC:** Citizens can only upload to their own incidents.  
**Content-Type:** `multipart/form-data`  
**Form field:** `evidence` (up to 5 files, max 10 MB each, JPEG/PNG/WebP/GIF/PDF)

**Response 200:**
```json
{
  "success": true,
  "message": "2 evidence file(s) uploaded successfully.",
  "evidence": [
    { "originalName": "fire.jpg", "filename": "evidence_1234_abcd.jpg", "size": 204800 }
  ]
}
```

---

### GET /api/incidents/:id/evidence/:filename
Stream/serve an evidence file (authenticated only).

**Auth:** Bearer Token  
**RBAC:** Citizens can only access their own incident evidence.  
**Response:** Binary file stream with correct `Content-Type` header.

---

## Admin

> All `/api/admin/*` routes require `admin` role.

### GET /api/admin/stats
Platform-wide statistics.

**Response 200:**
```json
{
  "success": true,
  "stats": {
    "incidents": {
      "total": 142,
      "byStatus": { "reported": 23, "assigned": 18, "in_progress": 12, "resolved": 85, "dismissed": 4 },
      "bySeverity": { "Critical": 31, "High": 49, "Medium": 38, "Low": 24 },
      "byCategory": { "Fire": 28, "Accident": 42, ... },
      "resolvedToday": 7
    },
    "users": { "total": 89, "byRole": { "citizen": 72, "responder": 15, "admin": 2 } },
    "recentIncidents": [...]
  }
}
```

---

### GET /api/admin/users
List all users (paginated).

**Query Params:** `page`, `limit`, `role`  
**Response 200:**
```json
{ "success": true, "count": 20, "total": 89, "page": 1, "totalPages": 5, "users": [...] }
```

---

### PATCH /api/admin/users/:userId/role
Change a user's role.

**Body:**
```json
{ "role": "responder" }
```
**Valid roles:** `citizen`, `responder`, `admin`  
**Response 200:**
```json
{ "success": true, "message": "User role updated to 'responder'.", "user": {...} }
```

---

## Health Check

### GET /api/health
Server health status.

**Auth:** None  
**Response 200:**
```json
{ "success": true, "message": "CrisisConnect API is running", "environment": "development", "timestamp": "..." }
```

---

## Error Format

All error responses follow this structure:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": { "field": "Validation error message" }   // only on 400 validation errors
}
```

## HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request / Validation error |
| 401 | Unauthorized — no/invalid token |
| 403 | Forbidden — authenticated but wrong role |
| 404 | Resource not found |
| 409 | Conflict (e.g. incident already assigned) |
| 500 | Internal server error |
