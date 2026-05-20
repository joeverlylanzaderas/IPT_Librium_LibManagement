import client from './client';

export const adminAPI = {
  // GET /api/dashboard/stats/
  getDashboardStats: () => client.get('/dashboard/stats/'),
};

