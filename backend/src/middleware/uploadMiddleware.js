/**
 * Multer Upload Middleware — CrisisConnect AI
 *
 * CHO Lecture 58: Multer file uploads, file validation, safe naming.
 *
 * Handles evidence file attachments for emergency incidents.
 * Files are stored in the local /uploads/evidence directory.
 * The storage layer is abstracted so it can be swapped for S3/GCS later.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ── Resolve __dirname for ES Modules (CHO Lecture 51) ─────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Ensure upload directory exists (CHO Lecture 51: fs module) ───────────────
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'evidence');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ── Allowed MIME types and extensions ────────────────────────────────────────
// Dual-layer validation: check both mimetype and extension (never trust MIME alone)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'];

// Maximum file size: 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// ── Disk Storage Configuration ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  /**
   * Generate a safe filename: timestamp + random hex to prevent collisions.
   * Never use the original filename directly — prevents path traversal attacks.
   * CHO Lecture 58: Safe file naming.
   */
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `evidence_${Date.now()}_${Math.random().toString(16).slice(2, 10)}${ext}`;
    cb(null, safeName);
  },
});

// ── File Filter: Validate type and extension ──────────────────────────────────
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Check both MIME type AND extension (dual-layer)
  const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.includes(ext);

  if (mimeOk && extOk) {
    cb(null, true); // accept file
  } else {
    cb(
      new Error(`Invalid file type. Allowed types: JPEG, PNG, WebP, GIF, PDF.`),
      false // reject file
    );
  }
};

// ── Multer Instance ───────────────────────────────────────────────────────────
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5, // max 5 files per upload
  },
});

// ── Export constants for use in controller ────────────────────────────────────
export { UPLOAD_DIR, MAX_FILE_SIZE };
