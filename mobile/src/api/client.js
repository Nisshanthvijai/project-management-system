import { API_URL } from '../config';

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// The token lives in memory here for fast access; AuthContext persists it in secure storage.
let currentToken = null;
export const setToken = (token) => {
  currentToken = token;
};

// AuthContext registers a function that logs the user out when the server rejects the token.
let onAuthFailure = null;
export const setAuthFailureHandler = (fn) => {
  onAuthFailure = fn;
};

const AUTH_FAILURE_CODES = ['TOKEN_EXPIRED', 'INVALID_TOKEN', 'UNAUTHORIZED'];
const TIMEOUT_MS = 45000; // generous: the free backend can take ~30-60s to wake up

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (currentToken) headers.Authorization = `Bearer ${currentToken}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new ApiError(0, 'TIMEOUT', 'The server is taking too long to respond. It may be waking up, so please try again.');
    }
    throw new ApiError(0, 'NETWORK', 'No internet connection, or the server cannot be reached. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = data?.error || {};
    if (res.status === 401 && AUTH_FAILURE_CODES.includes(err.code) && onAuthFailure) {
      await onAuthFailure(
        err.code === 'TOKEN_EXPIRED' ? 'Your session has expired. Please log in again.' : 'Please log in to continue.',
      );
    }
    throw new ApiError(res.status, err.code || 'ERROR', err.message || 'Something went wrong', err.details);
  }
  return data;
}

function qs(params = {}) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),

  getDashboard: () => request('/api/dashboard'),

  getProjects: (params) => request(`/api/projects${qs(params)}`),
  getProject: (id) => request(`/api/projects/${id}`),

  getTasks: (params) => request(`/api/tasks${qs(params)}`),
  createTask: (body) => request('/api/tasks', { method: 'POST', body }),
  updateTask: (id, body) => request(`/api/tasks/${id}`, { method: 'PUT', body }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};
