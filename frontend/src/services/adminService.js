/**
 * Admin Service — CrisisConnect AI Frontend
 *
 * All HTTP calls to /api/admin/* live here.
 * CHO Lecture 30: Axios abstraction, async/await.
 */

import api from './api.js';

// GET /api/admin/stats — Platform-wide statistics
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// GET /api/admin/users — Paginated user list
export const getAllUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

// PATCH /api/admin/users/:userId/role — Change user role
export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};
