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
    // ── 1. Extract token from Authorization header OR query string ─────────
    // Query-string token is accepted ONLY for evidence file serving
    // (browser <img src> and direct download links cannot send custom headers)
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]; // "Bearer <token>" → "<token>"
    } else if (req.query.token && typeof req.query.token === 'string') {
      // Allow token via ?token= query param for file serving endpoints
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

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
