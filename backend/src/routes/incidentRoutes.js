import { Router } from 'express';
import {
  createIncident,
  getMyIncidents,
  getIncidentById,
} from '../controllers/incidentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/incidents — Report new emergency incident (Protected)
router.post('/', protect, createIncident);

// GET /api/incidents/my — Get authenticated user's reported incidents (Protected)
// Note: Must be declared before /:incidentId route
router.get('/my', protect, getMyIncidents);

// GET /api/incidents/:incidentId — Get specific incident details by ID (Protected)
router.get('/:incidentId', protect, getIncidentById);

export default router;
