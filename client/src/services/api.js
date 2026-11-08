const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.error?.message || 'Something went wrong. Please try again.');
    error.status = response.status;
    error.code = payload?.error?.code;
    throw error;
  }
  return payload;
}

export const api = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  getReadings: (params = '') => request(`/readings${params ? `?${params}` : ''}`),
  createReading: (data) => request('/readings', { method: 'POST', body: JSON.stringify(data) }),
  updateReading: (id, data) => request(`/readings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReading: (id) => request(`/readings/${id}`, { method: 'DELETE' }),
  getReports: (date) => request(`/reports?date=${encodeURIComponent(date)}`)
};
