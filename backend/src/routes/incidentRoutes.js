/**
 * Incident Routes — CrisisConnect AI
 *
 * CHO Lecture 55: Express routing, route parameters, query parameters
 * CHO Lecture 56: REST conventions (GET, POST, PATCH)
 * CHO Lecture 57: Protected routes with JWT middleware + RBAC
 */

import { Router } from 'express';
import {
  createIncident,
  getMyIncidents,
  getAllIncidents,
  getIncidentById,
  assignIncident,
  updateIncidentStatus,
  uploadEvidence,
  serveEvidence,
} from '../controllers/incidentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// ── Feature 5: POST /api/incidents — Report new incident (citizen+) ──────────
router.post('/', protect, createIncident);

// ── Feature 7: GET /api/incidents/my — Citizen's own reports ────────────────
// IMPORTANT: This must be declared BEFORE /:incidentId to avoid route conflict
router.get('/my', protect, getMyIncidents);

// ── Feature 12: GET /api/incidents — All incidents (responder/admin only) ────
router.get(
  '/',
  protect,
  authorizeRoles('responder', 'admin'),
  getAllIncidents
);

// ── Feature 7+: GET /api/incidents/:incidentId — Single incident detail ──────
router.get('/:incidentId', protect, getIncidentById);

// ── Feature 13: PATCH /api/incidents/:id/assign — Assign incident ────────────
router.patch(
  '/:id/assign',
  protect,
  authorizeRoles('responder', 'admin'),
  assignIncident
);

// ── Feature 14: PATCH /api/incidents/:id/status — Update status ──────────────
router.patch(
  '/:id/status',
  protect,
  authorizeRoles('responder', 'admin'),
  updateIncidentStatus
);

// ── Feature 15: POST /api/incidents/:id/evidence — Upload evidence files ─────
// Multer handles up to 5 files with the field name 'evidence'
router.post(
  '/:id/evidence',
  protect,
  upload.array('evidence', 5), // CHO Lecture 58: multer middleware
  uploadEvidence
);

// ── Feature 15: GET /api/incidents/:id/evidence/:filename — Serve file ────────
router.get('/:id/evidence/:filename', protect, serveEvidence);

export default router;
