import client from './client';

export const authAPI = {
  // POST /api/auth/users/
  register: (data) =>
    client.post('/auth/users/', {
      email: data.email,
      password: data.password,
      password2: data.confirmPassword,
      full_name: `${data.firstName} ${data.lastName}`.trim(),
      username: data.email.split('@')[0],
    }),

  // POST /api/auth/jwt/create/
  login: (email, password) =>
    client.post('/auth/jwt/create/', { email, password }),

  // POST /api/auth/jwt/refresh/
  refreshToken: (refresh) =>
    client.post('/auth/jwt/refresh/', { refresh }),

  // GET /api/auth/users/me/  — returns: { id, email, username, full_name, role, ... }
  getMe: () => client.get('/auth/users/me/'),

  // POST /api/auth/users/activation/
  activateAccount: (uid, token) =>
    client.post('/auth/users/activation/', { uid, token }),

  // POST /api/auth/users/resend_activation/
  resendActivation: (email) =>
    client.post('/auth/users/resend_activation/', { email }),

  // POST /api/auth/users/reset_password/
  requestPasswordReset: (email) =>
    client.post('/auth/users/reset_password/', { email }),

  // POST /api/auth/users/reset_password_confirm/
  confirmPasswordReset: (uid, token, newPassword) =>
    client.post('/auth/users/reset_password_confirm/', {
      uid,
      token,
      new_password: newPassword,
      re_new_password: newPassword,
    }),
};