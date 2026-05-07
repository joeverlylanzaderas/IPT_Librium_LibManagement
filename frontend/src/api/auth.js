import client from './client';

export const authAPI = {
  register: (data) =>
    client.post('/user/register/', {
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
    }),

  login: (email, password) =>
    client.post('/user/token/', { email, password }),

  refreshToken: (refresh) =>
    client.post('/user/token/refresh/', { refresh }),

  getMe: () => client.get('/user/me/'),
};