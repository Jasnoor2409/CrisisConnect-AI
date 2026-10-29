/**
 * Incident Service — CrisisConnect AI Frontend
 *
 * All HTTP calls to /api/incidents/* live here.
 * Uses the shared Axios instance (src/services/api.js) which automatically
 * attaches the JWT Bearer token and handles 401 session expiry.
 *
 * CHO Lecture 30: Fetch API / Axios (using abstracted axios wrapper)
 * CHO Lecture 27: async/await, Promise.all
 */

import api from './api.js';

// ── Feature 5: Submit new emergency incident report ───────────────────────────
/**
 * @param {{ title, category, description, severity, location: { address?, latitude, longitude } }} incidentData
 */
export const createIncident = async (incidentData) => {
  const response = await api.post('/incidents', incidentData);
  return response.data;
};

// ── Feature 7: Citizen's own incident history ─────────────────────────────────
export const getMyIncidents = async () => {
  const response = await api.get('/incidents/my');
  return response.data;
};

// ── Feature 7+: Single incident detail by reference ID or MongoDB ID ──────────
export const getIncidentById = async (incidentId) => {
  const response = await api.get(`/incidents/${incidentId}`);
  return response.data;
};

// ── Feature 12: All incidents — Responder/Admin only ─────────────────────────
/**
 * @param {{ page?, limit?, status?, category?, severity?, search? }} params
 */
export const getAllIncidents = async (params = {}) => {
  const response = await api.get('/incidents', { params });
  return response.data;
};

// ── Feature 13: Assign incident to a responder ────────────────────────────────
/**
 * Responders: pass no responderId (self-assign).
 * Admins: pass responderId to assign to specific user.
 * @param {string} incidentMongoId  MongoDB ObjectId (_id) of the incident
 * @param {string|null} responderId MongoDB ObjectId of target responder (admin only)
 */
export const assignIncident = async (incidentMongoId, responderId = null) => {
  const body = responderId ? { responderId } : {};
  const response = await api.patch(`/incidents/${incidentMongoId}/assign`, body);
  return response.data;
};

// ── Feature 14: Update incident status ───────────────────────────────────────
/**
 * @param {string} incidentMongoId MongoDB ObjectId (_id) of the incident
 * @param {'reported'|'assigned'|'in_progress'|'resolved'|'dismissed'} status
 * @param {string} [note] Optional note to record in the status history
 */
export const updateIncidentStatus = async (incidentMongoId, status, note = '') => {
  const response = await api.patch(`/incidents/${incidentMongoId}/status`, { status, note });
  return response.data;
};

// ── Feature 15: Upload evidence files ────────────────────────────────────────
/**
 * @param {string} incidentMongoId
 * @param {FileList|File[]} files — browser File objects
 * @param {(progress: number) => void} [onProgress] — optional upload progress cb
 */
export const uploadEvidence = async (incidentMongoId, files, onProgress) => {
  const formData = new FormData();
  // CHO Lecture 30: FormData API for multipart/form-data uploads
  Array.from(files).forEach((file) => {
    formData.append('evidence', file);
  });

  const response = await api.post(`/incidents/${incidentMongoId}/evidence`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(pct);
        }
      : undefined,
  });
  return response.data;
};

// ── Feature 15: Get evidence file URL (served through authenticated endpoint) ─
// Token is appended as a query param so <img src> and <a href> can load files
// without a separate XHR call, while still going through the auth middleware.
export const getEvidenceUrl = (incidentMongoId, filename) => {
  const token = localStorage.getItem('cc_token') ?? '';
  const params = token ? `?token=${encodeURIComponent(token)}` : '';
  return `/api/incidents/${incidentMongoId}/evidence/${filename}${params}`;
};
