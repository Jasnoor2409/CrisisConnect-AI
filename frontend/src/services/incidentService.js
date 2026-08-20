import api from './api.js';

/**
 * Submit emergency incident report.
 * @param {{ title: string, category: string, description: string, severity: string, location: { address?: string, latitude: number, longitude: number } }} incidentData
 * @returns {Promise<{ success: boolean, message: string, incident: object }>}
 */
export const createIncident = async (incidentData) => {
  const response = await api.post('/incidents', incidentData);
  return response.data;
};

/**
 * Fetch all incidents reported by the authenticated citizen.
 * @returns {Promise<{ success: boolean, count: number, incidents: Array<object> }>}
 */
export const getMyIncidents = async () => {
  const response = await api.get('/incidents/my');
  return response.data;
};

/**
 * Fetch a specific incident report by ID or Reference Code.
 * @param {string} incidentId
 * @returns {Promise<{ success: boolean, incident: object }>}
 */
export const getIncidentById = async (incidentId) => {
  const response = await api.get(`/incidents/${incidentId}`);
  return response.data;
};
