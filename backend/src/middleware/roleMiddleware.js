/**
 * Role Authorization Middleware
 *
 * Checks if the authenticated user (attached to req.user by protect middleware)
 * possesses one of the allowed roles.
 *
 * Usage:
 *   router.get('/admin-only', protect, authorizeRoles('admin'), handler)
 *   router.get('/responder-or-admin', protect, authorizeRoles('responder', 'admin'), handler)
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Ensure user is authenticated first
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in first.',
      });
    }

    // 2. Check if user role is included in allowedRoles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};
