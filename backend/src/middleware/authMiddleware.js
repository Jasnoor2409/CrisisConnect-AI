import jwt from 'jsonwebtoken';

/**
 * JWT Authentication Middleware
 *
 * Reads:  Authorization: Bearer <token>
 * Sets:   req.user = { id, role }
 * Rejects: missing / invalid / expired tokens with 401
 *
 * Attach to any route that requires authentication:
 *   router.get('/protected', protect, handler)
 */
export const protect = (req, res, next) => {
  try {
    // ── 1. Extract token from Authorization header ─────────────────────────
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>" → "<token>"

    // ── 2. Verify token signature and expiry ──────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── 3. Attach minimal user identity to request ────────────────────────
    // Only id and role — never the full user document
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // jwt.verify throws specific error types we can inspect
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    // JsonWebTokenError covers: invalid signature, malformed token, etc.
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token. Please log in again.',
    });
  }
};
