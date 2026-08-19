import Incident from '../models/Incident.js';

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

// POST /api/incidents
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

    // ── 2. Create Incident ──────────────────────────────────────────────────
    let incidentId = generateIncidentId();
    // Guarantee uniqueness
    let existing = await Incident.findOne({ incidentId });
    while (existing) {
      incidentId = generateIncidentId();
      existing = await Incident.findOne({ incidentId });
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
    });

    // ── 3. Return clean response ────────────────────────────────────────────
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
