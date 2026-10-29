/**
 * CrisisConnect AI — Main Express Server
 *
 * CHO Lecture 55: Express fundamentals, routing, middleware
 * CHO Lecture 56: Middleware pipeline, body parsing, REST conventions
 * CHO Lecture 60: Full-stack integration, CORS, JWT, production flow
 * CHO Lecture 54: NPM scripts, environment variables, nodemon
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import incidentRoutes from './src/routes/incidentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

// ── Resolve __dirname for ES Modules (CHO Lecture 51) ────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Connect to MongoDB Atlas (CHO Lecture 59) ────────────────────────────────
connectDB();

const app = express();

// ── Middleware: CORS (CHO Lecture 60: CORS configuration) ────────────────────
// Only allow requests from the Vite dev server in development
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? false
      // Allow both default Vite port and fallback port (when 5173 is taken)
      : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);

// ── Middleware: Body Parsing (CHO Lecture 56) ─────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static File Serving: Uploaded Evidence (Feature 15) ──────────────────────
// Files in /uploads/evidence are only accessible via authenticated API endpoints
// This line is intentionally NOT used to expose files publicly — they go through
// the authenticated serveEvidence controller instead.
// (Kept as reference for deployment documentation)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes (CHO Lecture 55: Express routing) ─────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/admin',     adminRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'CrisisConnect API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Global Error Handler (CHO Lecture 56: error middleware) ──────────────────
// Catches Multer errors (file too large, wrong type) and other unhandled errors
app.use((err, _req, res, _next) => {
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum upload size is 10 MB.',
    });
  }
  // Multer invalid file type (thrown by fileFilter)
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  // Generic server error
  console.error('Unhandled server error:', err);
  return res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nCrisisConnect AI Server`);
  console.log(`  Environment : ${process.env.NODE_ENV}`);
  console.log(`  Port        : ${PORT}`);
  console.log(`  Health      : http://localhost:${PORT}/api/health`);
});
