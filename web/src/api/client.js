const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'pm_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const AUTH_FAILURE_CODES = ['TOKEN_EXPIRED', 'INVALID_TOKEN', 'UNAUTHORIZED'];

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Cannot reach the server. Check your connection and try again.');
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = data?.error || {};
    // Expired or invalid login: clear it and send the user to the login page with a message.
    if (res.status === 401 && AUTH_FAILURE_CODES.includes(err.code)) {
      tokenStore.clear();
      sessionStorage.setItem(
        'authMessage',
        err.code === 'TOKEN_EXPIRED' ? 'Your session has expired. Please log in again.' : 'Please log in to continue.',
      );
      window.location.assign('/login');
    }
    throw new ApiError(res.status, err.code || 'ERROR', err.message || 'Something went wrong', err.details);
  }
  return data;
}

// Builds "?a=1&b=2", skipping empty values.
function qs(params = {}) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, v);
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
  createProject: (body) => request('/api/projects', { method: 'POST', body }),
  updateProject: (id, body) => request(`/api/projects/${id}`, { method: 'PUT', body }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: 'DELETE' }),

  getTasks: (params) => request(`/api/tasks${qs(params)}`),
  createTask: (body) => request('/api/tasks', { method: 'POST', body }),
  updateTask: (id, body) => request(`/api/tasks/${id}`, { method: 'PUT', body }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};
