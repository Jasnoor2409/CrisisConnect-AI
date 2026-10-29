/**
 * Incident Controller — CrisisConnect AI
 *
 * Handles all incident CRUD operations.
 * Features 5–15 backend logic lives here.
 *
 * CHO Lectures covered:
 *   - 55: Express routing and request/response
 *   - 56: Middleware, REST, CRUD, HTTP status codes
 *   - 57: Validation, JWT authorization
 *   - 59: Mongoose populate()
 */

import path from 'path';
import fs from 'fs';
import Incident from '../models/Incident.js';
import { analyzeIncident } from '../services/aiClassificationService.js';
import { UPLOAD_DIR } from '../middleware/uploadMiddleware.js';

// Allowed values (CHO Lecture 3: constants as named identifiers)
const ALLOWED_CATEGORIES = ['Accident', 'Fire', 'Medical Emergency', 'Crime', 'Natural Disaster', 'Other'];
const ALLOWED_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const ALLOWED_STATUSES   = ['reported', 'assigned', 'in_progress', 'resolved', 'dismissed'];

/**
 * Valid status transitions per role.
 * CHO Lecture 3: switch/conditionals + objects for lookup.
 * Responders can move through most transitions; admins can do all.
 */
const VALID_TRANSITIONS = {
  reported:    ['assigned', 'in_progress', 'dismissed'],
  assigned:    ['in_progress', 'dismissed'],
  in_progress: ['resolved', 'dismissed'],
  resolved:    [],       // terminal — only admin can reopen
  dismissed:   [],       // terminal — only admin can reopen
};

/**
 * Generate a clean unique incident reference code.
 * Format: INC-2026-X8K9L
 * CHO Lecture 24: Template literals.
 */
const generateIncidentId = () => {
  const year = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `INC-${year}-${randomStr}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 5: POST /api/incidents — Report new emergency incident
// Protected by JWT. reportedBy is always from the verified token.
// ─────────────────────────────────────────────────────────────────────────────
export const createIncident = async (req, res) => {
  try {
    const { title, category, description, severity, location } = req.body;
    const errors = {};

    // ── 1. Validation (CHO Lecture 57) ──────────────────────────────────────
    if (!title || !title.trim()) {
      errors.title = 'Incident title is required';
    } else if (title.trim().length < 3 || title.trim().length > 100) {
      errors.title = 'Title must be between 3 and 100 characters';
    }

    if (!category) {
      errors.category = 'Incident category is required';
    } else if (!ALLOWED_CATEGORIES.includes(category)) {
      errors.category = `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`;
    }

    if (!description || !description.trim()) {
      errors.description = 'Incident description is required';
    } else if (description.trim().length < 10 || description.trim().length > 2000) {
      errors.description = 'Description must be between 10 and 2000 characters';
    }

    if (!severity) {
      errors.severity = 'Severity level is required';
    } else if (!ALLOWED_SEVERITIES.includes(severity)) {
      errors.severity = `Severity must be one of: ${ALLOWED_SEVERITIES.join(', ')}`;
    }

    if (!location) {
      errors.location = 'Incident location is required';
    } else {
      const lat = Number(location.latitude);
      const lng = Number(location.longitude);
      if (location.latitude === undefined || location.latitude === null || isNaN(lat)) {
        errors.latitude = 'Valid latitude coordinate is required';
      } else if (lat < -90 || lat > 90) {
        errors.latitude = 'Latitude must be between -90 and 90';
      }
      if (location.longitude === undefined || location.longitude === null || isNaN(lng)) {
        errors.longitude = 'Valid longitude coordinate is required';
      } else if (lng < -180 || lng > 180) {
        errors.longitude = 'Longitude must be between -180 and 180';
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    // ── 2. Unique Incident Reference ID ────────────────────────────────────
    let incidentId = generateIncidentId();
    let existing = await Incident.findOne({ incidentId });
    while (existing) {
      incidentId = generateIncidentId();
      existing = await Incident.findOne({ incidentId });
    }

    // ── 3. AI Analysis (Features 8, 9, 10) ────────────────────────────────
    let aiAnalysisResult;
    try {
      aiAnalysisResult = await analyzeIncident({
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        location,
      });
    } catch (aiErr) {
      console.warn('AI analysis error (non-fatal, using fallback):', aiErr.message);
      aiAnalysisResult = {
        aiClassification: {
          category, confidence: 1.0,
          reasoning: 'AI service unavailable; defaulted to reporter category.',
          severity, severityConfidence: 1.0,
          severityReasoning: 'AI service unavailable; defaulted to reporter severity.',
          classifiedAt: new Date(),
        },
        aiAssessment: {
          category, categoryConfidence: 1.0,
          categoryReasoning: 'AI service unavailable; defaulted to reporter category.',
          severity, severityConfidence: 1.0,
          severityReasoning: 'AI service unavailable; defaulted to reporter severity.',
          assessedAt: new Date(),
        },
        safetyRecommendations: {
          recommendations: [
            'Maintain a safe distance from the emergency scene.',
            'Follow instructions provided by arriving emergency responders.',
            'Keep emergency phone lines open for critical communications.',
          ],
          warning: 'Informational safety guidance. Follow official instructions from emergency authorities.',
          isFallback: true,
          generatedAt: new Date(),
        },
      };
    }

    // ── 4. Create Incident with initial status history entry ────────────────
    const newIncident = await Incident.create({
      incidentId,
      title: title.trim(),
      category,
      description: description.trim(),
      severity,
      location: {
        address: location.address ? location.address.trim() : 'Location specified via map coordinates',
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      },
      reportedBy: req.user.id, // Always from verified JWT
      status: 'reported',
      statusHistory: [
        {
          status: 'reported',
          changedBy: req.user.id,
          note: 'Incident reported by citizen.',
          changedAt: new Date(),
        },
      ],
      aiClassification: aiAnalysisResult.aiClassification,
      aiAssessment: aiAnalysisResult.aiAssessment,
      safetyRecommendations: aiAnalysisResult.safetyRecommendations,
    });

    return res.status(201).json({
      success: true,
      message: 'Emergency incident reported successfully',
      incident: {
        id: newIncident._id,
        incidentId: newIncident.incidentId,
        title: newIncident.title,
        category: newIncident.category,
        description: newIncident.description,
        severity: newIncident.severity,
        location: newIncident.location,
        status: newIncident.status,
        createdAt: newIncident.createdAt,
        updatedAt: newIncident.updatedAt,
        aiClassification: newIncident.aiClassification,
        aiAssessment: newIncident.aiAssessment,
        safetyRecommendations: newIncident.safetyRecommendations,
      },
    });
  } catch (error) {
    console.error('Create Incident error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating incident report. Please try again later.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 7: GET /api/incidents/my — Citizen's own incidents
// ─────────────────────────────────────────────────────────────────────────────
export const getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ reportedBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email role') // CHO Lecture 59: populate()
      .lean();

    return res.status(200).json({ success: true, count: incidents.length, incidents });
  } catch (error) {
    console.error('Get My Incidents error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving incident history.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 12: GET /api/incidents — All incidents (responder/admin only)
// Supports pagination + filters. Citizens are blocked.
// CHO Lecture 56: REST, CRUD, query parameters (Lecture 55)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllIncidents = async (req, res) => {
  try {
    // ── 1. Role guard (belt-and-suspenders — middleware also guards) ────────
    if (req.user.role === 'citizen') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Citizens cannot access the full incident list.',
      });
    }

    // ── 2. Query parameters (CHO Lecture 55: query params) ──────────────────
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const limit    = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip     = (page - 1) * limit;

    // Build filter object (CHO Lecture 15: objects + destructuring)
    const filter = {};
    if (req.query.status   && ALLOWED_STATUSES.includes(req.query.status))     filter.status   = req.query.status;
    if (req.query.category && ALLOWED_CATEGORIES.includes(req.query.category)) filter.category = req.query.category;
    if (req.query.severity && ALLOWED_SEVERITIES.includes(req.query.severity)) filter.severity = req.query.severity;

    // Responders only see unresolved / their assigned incidents (unless admin)
    if (req.user.role === 'responder') {
      // Responders see all non-dismissed incidents + their own
      // (simple approach: see everything except resolved/dismissed in a different org)
      // For this project: responders see all incidents they can act on
    }

    // Text search on title/description
    if (req.query.search && req.query.search.trim()) {
      const term = req.query.search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { incidentId: { $regex: term, $options: 'i' } },
      ];
    }

    // ── 3. Database query with population (CHO Lecture 59) ──────────────────
    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reportedBy', 'name email') // populate reporter info
        .populate('assignedTo', 'name email role')
        .lean(),
      Incident.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: incidents.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      incidents,
    });
  } catch (error) {
    console.error('Get All Incidents error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving incidents.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 7+: GET /api/incidents/:incidentId — Single incident detail
// Citizens: only their own. Responders/Admins: any.
// ─────────────────────────────────────────────────────────────────────────────
export const getIncidentById = async (req, res) => {
  try {
    const { incidentId } = req.params;
    if (!incidentId || !incidentId.trim()) {
      return res.status(400).json({ success: false, message: 'Incident reference ID is required.' });
    }

    const cleanId = incidentId.trim();

    // Query by custom ID or MongoDB ObjectId (CHO Lecture 59: Mongoose query)
    let incident = await Incident.findOne({ incidentId: cleanId.toUpperCase() })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .populate('statusHistory.changedBy', 'name email role');

    if (!incident && cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      incident = await Incident.findById(cleanId)
        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'name email role')
        .populate('assignedBy', 'name email role')
        .populate('statusHistory.changedBy', 'name email role');
    }

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident report not found.' });
    }

    // RBAC: Citizens can only view their own incidents
    if (req.user.role === 'citizen' && incident.reportedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this incident report.',
      });
    }

    return res.status(200).json({ success: true, incident });
  } catch (error) {
    console.error('Get Incident By ID error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving incident details.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 13: PATCH /api/incidents/:id/assign — Assign incident to responder
// Responders can self-assign; Admins can assign to anyone.
// ─────────────────────────────────────────────────────────────────────────────
export const assignIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { responderId } = req.body;

    // Find the incident
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    // Cannot assign already resolved/dismissed incidents
    if (['resolved', 'dismissed'].includes(incident.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot assign an incident with status '${incident.status}'.`,
      });
    }

    // Determine who we are assigning to
    let targetResponderId;
    if (req.user.role === 'responder') {
      // Responders can only self-assign
      targetResponderId = req.user.id;
    } else if (req.user.role === 'admin') {
      // Admins can assign to any user (responderId required)
      if (!responderId) {
        return res.status(400).json({ success: false, message: 'responderId is required for admin assignment.' });
      }
      targetResponderId = responderId;
    } else {
      return res.status(403).json({ success: false, message: 'Only responders and admins can assign incidents.' });
    }

    // If already assigned to someone else, only admin can reassign
    if (incident.assignedTo && incident.assignedTo.toString() !== targetResponderId) {
      if (req.user.role !== 'admin') {
        return res.status(409).json({
          success: false,
          message: 'Incident is already assigned to another responder. Only an admin can reassign.',
        });
      }
    }

    // ── Update assignment and status ────────────────────────────────────────
    const now = new Date();
    incident.assignedTo = targetResponderId;
    incident.assignedAt = now;
    incident.assignedBy = req.user.id;
    incident.status     = 'assigned';

    // Add to status history timeline (CHO Lecture 14)
    incident.statusHistory.push({
      status: 'assigned',
      changedBy: req.user.id,
      note: `Incident assigned by ${req.user.role} (${req.user.id}).`,
      changedAt: now,
    });

    await incident.save();

    // Populate for response
    await incident.populate('assignedTo', 'name email role');
    await incident.populate('assignedBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: 'Incident assigned successfully.',
      incident: {
        id: incident._id,
        incidentId: incident.incidentId,
        status: incident.status,
        assignedTo: incident.assignedTo,
        assignedAt: incident.assignedAt,
        assignedBy: incident.assignedBy,
      },
    });
  } catch (error) {
    console.error('Assign Incident error:', error);
    return res.status(500).json({ success: false, message: 'Server error assigning incident.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 14: PATCH /api/incidents/:id/status — Update incident status
// Responders: follow VALID_TRANSITIONS. Admins: can set any status.
// ─────────────────────────────────────────────────────────────────────────────
export const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    // Validate the requested status
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    // Responder authorization: must be assigned to this incident (or admin)
    if (req.user.role === 'responder') {
      if (!incident.assignedTo || incident.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update status for incidents assigned to you.',
        });
      }
      // Validate transition (CHO Lecture 3: conditionals)
      const allowed = VALID_TRANSITIONS[incident.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid transition from '${incident.status}' to '${status}'. Allowed: ${allowed.join(', ') || 'none'}.`,
        });
      }
    } else if (req.user.role === 'citizen') {
      return res.status(403).json({ success: false, message: 'Citizens cannot update incident status.' });
    }
    // Admins can set any status freely

    const now = new Date();
    const previousStatus = incident.status;
    incident.status = status;

    // Record resolution details if status is resolved
    if (status === 'resolved') {
      incident.resolvedAt = now;
      if (note) incident.resolutionNote = note.trim();
    }

    // Append to status history timeline (CHO Lecture 14)
    incident.statusHistory.push({
      status,
      changedBy: req.user.id,
      note: note ? note.trim() : `Status changed from '${previousStatus}' to '${status}'.`,
      changedAt: now,
    });

    await incident.save();

    return res.status(200).json({
      success: true,
      message: `Incident status updated to '${status}'.`,
      incident: {
        id: incident._id,
        incidentId: incident.incidentId,
        status: incident.status,
        resolvedAt: incident.resolvedAt,
        resolutionNote: incident.resolutionNote,
        updatedAt: incident.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update Status error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating incident status.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 15: POST /api/incidents/:id/evidence — Upload evidence files
// Citizens (own incident) or Responders/Admins (any incident)
// CHO Lecture 58: Multer, file validation
// ─────────────────────────────────────────────────────────────────────────────
export const uploadEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);

    if (!incident) {
      // Clean up uploaded file if incident doesn't exist
      if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    // Citizens can only upload to their own incidents
    if (req.user.role === 'citizen' && incident.reportedBy.toString() !== req.user.id) {
      if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
      return res.status(403).json({
        success: false,
        message: 'You can only upload evidence to your own incidents.',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files were uploaded.' });
    }

    // Build evidence metadata array (CHO Lecture 13: map())
    const evidenceEntries = req.files.map(file => ({
      originalName: file.originalname,
      filename:     file.filename,
      mimetype:     file.mimetype,
      size:         file.size,
      uploadedBy:   req.user.id,
      uploadedAt:   new Date(),
    }));

    // Push to incident's evidence array (CHO Lecture 11: push())
    incident.evidence.push(...evidenceEntries);
    await incident.save();

    return res.status(200).json({
      success: true,
      message: `${req.files.length} evidence file(s) uploaded successfully.`,
      evidence: evidenceEntries,
    });
  } catch (error) {
    // Clean up files on error
    if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
    console.error('Upload Evidence error:', error);
    return res.status(500).json({ success: false, message: 'Server error uploading evidence.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 15: GET /api/incidents/:id/evidence/:filename — Serve evidence file
// Authenticated + authorized only
// ─────────────────────────────────────────────────────────────────────────────
export const serveEvidence = async (req, res) => {
  try {
    const { id, filename } = req.params;
    const incident = await Incident.findById(id);

    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found.' });

    // Citizens can only access their own incident evidence
    if (req.user.role === 'citizen' && incident.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Verify the filename belongs to this incident (prevents path traversal)
    const evidenceEntry = incident.evidence.find(e => e.filename === filename);
    if (!evidenceEntry) {
      return res.status(404).json({ success: false, message: 'Evidence file not found.' });
    }

    // Prevent path traversal: only allow simple filename (no ../ etc.)
    const safeFilename = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Evidence file missing from storage.' });
    }

    res.setHeader('Content-Type', evidenceEntry.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${evidenceEntry.originalName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Serve Evidence error:', error);
    return res.status(500).json({ success: false, message: 'Server error serving evidence.' });
  }
};
