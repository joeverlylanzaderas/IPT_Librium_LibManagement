import axios from 'axios';

// Render URL
export const BASE_URL = 'https://ipt-librium-libmanagement.onrender.com/api';

// ── In-memory token cache ─────────────────────────────────────────────────────
// SecureStore is native-only and CANNOT be awaited inside request interceptors.
// We keep tokens in memory after login/restoreSession and read them synchronously.
let _accessToken = null;
let _refreshToken = null;

export const setTokens = (access, refresh) => {
  _accessToken = access;
  _refreshToken = refresh;
};

export const clearTokens = () => {
  _accessToken = null;
  _refreshToken = null;
};

// ── Platform-safe persistent storage ─────────────────────────────────────────
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

let _nativeStore = null;
if (!isWeb) {
  import('expo-secure-store').then((m) => { _nativeStore = m.default; });
}

export const persistTokens = async (access, refresh) => {
  setTokens(access, refresh);
  if (isWeb) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  } else if (_nativeStore) {
    await _nativeStore.setItemAsync('access_token', access);
    await _nativeStore.setItemAsync('refresh_token', refresh);
  }
};

export const loadPersistedTokens = async () => {
  if (isWeb) {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (access && refresh) setTokens(access, refresh);
    return { access, refresh };
  } else if (_nativeStore) {
    const access = await _nativeStore.getItemAsync('access_token');
    const refresh = await _nativeStore.getItemAsync('refresh_token');
    if (access && refresh) setTokens(access, refresh);
    return { access, refresh };
  }
  return { access: null, refresh: null };
};

export const removePersistedTokens = async () => {
  clearTokens();
  if (isWeb) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } else if (_nativeStore) {
    await _nativeStore.deleteItemAsync('access_token');
    await _nativeStore.deleteItemAsync('refresh_token');
  }
};

// ── Axios client ──────────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Synchronous — reads from memory, no async/await needed
client.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token)
  );
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        if (!_refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/auth/jwt/refresh/`, {
          refresh: _refreshToken,
        });

        await persistTokens(data.access, _refreshToken);
        processQueue(null, data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return client(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await removePersistedTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;