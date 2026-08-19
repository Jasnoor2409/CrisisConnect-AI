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
