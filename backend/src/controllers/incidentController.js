import Incident from '../models/Incident.js';
import { analyzeIncident } from '../services/aiClassificationService.js';

// Allowed values for validation
const ALLOWED_CATEGORIES = ['Accident', 'Fire', 'Medical Emergency', 'Crime', 'Natural Disaster', 'Other'];
const ALLOWED_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

/**
 * Helper to generate a clean unique incident reference code.
 * Format: INC-2026-X8K9L
 */
const generateIncidentId = () => {
  const year = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `INC-${year}-${randomStr}`;
};

/**
 * POST /api/incidents — Report new emergency incident
 * Protected by JWT authentication middleware
 */
export const createIncident = async (req, res) => {
  try {
    const { title, category, description, severity, location } = req.body;
    const errors = {};

    // ── 1. Validation checks ────────────────────────────────────────────────
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

    // Location validation
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
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct the errors.',
        errors,
      });
    }

    // ── 2. Create Incident Reference ID ─────────────────────────────────────
    let incidentId = generateIncidentId();
    let existing = await Incident.findOne({ incidentId });
    while (existing) {
      incidentId = generateIncidentId();
      existing = await Incident.findOne({ incidentId });
    }

    // ── 3. Perform AI Incident Analysis (Features 8, 9 & 10) ──────────────────
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
          category,
          confidence: 1.0,
          reasoning: 'AI service unavailable; defaulted to reporter category.',
          severity,
          severityConfidence: 1.0,
          severityReasoning: 'AI service unavailable; defaulted to reporter severity.',
          classifiedAt: new Date(),
        },
        aiAssessment: {
          category,
          categoryConfidence: 1.0,
          categoryReasoning: 'AI service unavailable; defaulted to reporter category.',
          severity,
          severityConfidence: 1.0,
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
      reportedBy: req.user.id, // Never trust frontend userId — extracted from verified JWT!
      status: 'reported',
      aiClassification: aiAnalysisResult.aiClassification,
      aiAssessment: aiAnalysisResult.aiAssessment,
      safetyRecommendations: aiAnalysisResult.safetyRecommendations,
    });

    // ── 4. Return clean response ────────────────────────────────────────────
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

/**
 * GET /api/incidents/my — Fetch authenticated user's reported incidents
 * Protected by JWT authentication middleware
 */
export const getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ reportedBy: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    console.error('Get My Incidents error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving incident history.',
    });
  }
};

/**
 * GET /api/incidents/:incidentId — Fetch a specific incident report
 * Protected by JWT authentication middleware
 * Checks citizen ownership (returns 403 if unauthorized citizen, 404 if not found)
 */
export const getIncidentById = async (req, res) => {
  try {
    const { incidentId } = req.params;
    if (!incidentId || !incidentId.trim()) {
      return res.status(400).json({ success: false, message: 'Incident reference ID is required.' });
    }

    const cleanId = incidentId.trim();

    // Query by custom incidentId (INC-2026-XXXXX) OR MongoDB ObjectId
    let incident = await Incident.findOne({ incidentId: cleanId.toUpperCase() });
    if (!incident && cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      incident = await Incident.findById(cleanId);
    }

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident report not found.',
      });
    }

    // RBAC Security Check: Citizen can only view their own incidents
    if (req.user.role === 'citizen' && incident.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this incident report.',
      });
    }

    return res.status(200).json({
      success: true,
      incident,
    });
  } catch (error) {
    console.error('Get Incident By ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving incident details.',
    });
  }
};
