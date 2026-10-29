/**
 * Admin Routes — CrisisConnect AI
 *
 * All routes here are protected by JWT + admin role only.
 * CHO Lecture 57: Authorization middleware chaining.
 * CHO Lecture 55: Route parameters.
 */

import { Router } from 'express';
import { getAdminStats, getAllUsers, updateUserRole } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Apply JWT + admin-only authorization to all routes in this router
router.use(protect, authorizeRoles('admin'));

// GET /api/admin/stats — Dashboard statistics
router.get('/stats', getAdminStats);

// GET /api/admin/users — List all users
router.get('/users', getAllUsers);

// PATCH /api/admin/users/:userId/role — Update user role
router.patch('/users/:userId/role', updateUserRole);

export default router;
