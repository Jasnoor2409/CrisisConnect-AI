import api from './api.js';

/**
 * Register a new user account.
 * @param {{ name: string, email: string, password: string, confirmPassword: string, role?: string }} data
 * @returns {Promise<{ success: boolean, message: string, user: object }>}
 */
export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};
