import client from './client';

export const usersAPI = {
  // GET /api/users/  (admin/librarian only via backend)
  listAll: (params = {}) => client.get('/users/', { params }),

  // (optional) You can extend with CRUD endpoints if needed
  // Example: getUser(id), updateUser(id), deleteUser(id)
};

