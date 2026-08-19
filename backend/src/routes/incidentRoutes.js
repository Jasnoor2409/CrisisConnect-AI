import { Router } from 'express';
import { createIncident } from '../controllers/incidentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/incidents — Report new emergency incident (Protected by JWT)
router.post('/', protect, createIncident);

export default router;
