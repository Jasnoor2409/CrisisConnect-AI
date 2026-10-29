import mongoose from 'mongoose';

/**
 * Incident Model — CrisisConnect AI
 *
 * Stores emergency incident reports submitted by citizens.
 * Extended in Evaluation 2 to support:
 *   - Incident assignment (Feature 13)
 *   - Status history/timeline (Feature 14)
 *   - Evidence/file attachments (Feature 15)
 *   - Mongoose populate() references (CHO Lecture 59)
 */

// ── Status History Sub-Schema ─────────────────────────────────────────────────
// Records each status change with who made it and when (audit trail)
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['reported', 'assigned', 'in_progress', 'resolved', 'dismissed'],
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note must not exceed 500 characters'],
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // No separate _id for sub-documents
);

// ── Evidence Sub-Schema ───────────────────────────────────────────────────────
// Stores metadata about uploaded evidence files (Feature 15, CHO Lecture 58)
const evidenceSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true, trim: true },
    filename:     { type: String, required: true, trim: true }, // disk filename (hashed)
    mimetype:     { type: String, required: true },
    size:         { type: Number, required: true }, // in bytes
    uploadedAt:   { type: Date, default: Date.now },
    uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: true }
);

// ── Main Incident Schema ──────────────────────────────────────────────────────
const incidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: [true, 'Incident reference ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title must not exceed 100 characters'],
    },

    category: {
      type: String,
      required: [true, 'Incident category is required'],
      enum: {
        values: ['Accident', 'Fire', 'Medical Emergency', 'Crime', 'Natural Disaster', 'Other'],
        message: 'Invalid incident category',
      },
    },

    description: {
      type: String,
      required: [true, 'Incident description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description must not exceed 2000 characters'],
    },

    severity: {
      type: String,
      required: [true, 'Incident severity level is required'],
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: 'Invalid severity level',
      },
    },

    location: {
      address: {
        type: String,
        trim: true,
        default: 'Location details provided via coordinates',
      },
      latitude: {
        type: Number,
        required: [true, 'Latitude coordinate is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude coordinate is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },

    // ── Citizen who filed this report (from JWT — never from frontend body) ──
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter user identity is required'],
    },

    status: {
      type: String,
      enum: {
        values: ['reported', 'assigned', 'in_progress', 'resolved', 'dismissed'],
        message: 'Invalid incident status',
      },
      default: 'reported',
    },

    // ── Feature 13: Incident Assignment ──────────────────────────────────────
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── Feature 14: Status History/Timeline ──────────────────────────────────
    // CHO Lecture 59: Array of sub-documents with population
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    // Resolution info — set when status becomes 'resolved'
    resolutionNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution note must not exceed 1000 characters'],
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },

    // ── Feature 15: Evidence Attachments ─────────────────────────────────────
    evidence: {
      type: [evidenceSchema],
      default: [],
    },

    // ── Feature 8: AI Category Classification ────────────────────────────────
    aiClassification: {
      category: {
        type: String,
        enum: ['Accident', 'Fire', 'Medical Emergency', 'Crime', 'Natural Disaster', 'Other'],
      },
      confidence: { type: Number, min: 0, max: 1 },
      reasoning:  { type: String, trim: true },
      severity:   { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
      severityConfidence: { type: Number, min: 0, max: 1 },
      severityReasoning:  { type: String, trim: true },
      classifiedAt: { type: Date, default: Date.now },
    },

    // ── Feature 9: AI Assessment ──────────────────────────────────────────────
    aiAssessment: {
      category:           String,
      categoryConfidence: Number,
      categoryReasoning:  String,
      severity:           String,
      severityConfidence: Number,
      severityReasoning:  String,
      assessedAt: { type: Date, default: Date.now },
    },

    // ── Feature 10: AI Safety Recommendations ────────────────────────────────
    safetyRecommendations: {
      recommendations: [{ type: String, trim: true }],
      warning:    { type: String, trim: true },
      isFallback: { type: Boolean, default: false },
      generatedAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// ── Indexes for efficient querying ────────────────────────────────────────────
incidentSchema.index({ reportedBy: 1, createdAt: -1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ assignedTo: 1 });
incidentSchema.index({ category: 1 });
incidentSchema.index({ severity: 1 });

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;
