import { Router } from 'express';
import { registerUser, loginUser, getMe, choDemoLogin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// POST /api/auth/register (Feature 1)
router.post('/register', registerUser);

// POST /api/auth/login (Feature 2)
router.post('/login', loginUser);

// TEMPORARY CHO EVALUATION FETCH DEMO
router.post('/cho-demo-login', choDemoLogin);

// GET /api/auth/me (Feature 4 — session persistence & profile verification)
router.get('/me', protect, getMe);

// ── DEMO / TEST ENDPOINTS (Feature 3 — Role-Based Access Control) ─────────────
// Citizen scope: accessible to citizen, responder, admin
router.get(
  '/citizen-test',
  protect,
  authorizeRoles('citizen', 'responder', 'admin'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Citizen demo endpoint accessed successfully.',
      userRole: req.user.role,
      allowedFor: ['citizen', 'responder', 'admin'],
    });
  }
);

// Responder scope: accessible to responder, admin
router.get(
  '/responder-test',
  protect,
  authorizeRoles('responder', 'admin'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Responder demo endpoint accessed successfully.',
      userRole: req.user.role,
      allowedFor: ['responder', 'admin'],
    });
  }
);

// Admin scope: accessible to admin only
router.get(
  '/admin-test',
  protect,
  authorizeRoles('admin'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Admin demo endpoint accessed successfully.',
      userRole: req.user.role,
      allowedFor: ['admin'],
    });
  }
);

export default router;
