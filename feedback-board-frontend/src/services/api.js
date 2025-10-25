import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getFeedbacks = (status) => {
  const url = status ? `/feedbacks?status=${status}` : '/feedbacks';
  return api.get(url);
};
export const createFeedback = (data) => api.post('/feedbacks', data);
export const voteFeedback = (id) => api.post(`/feedbacks/${id}/vote`);
export const updateFeedbackStatus = (id, status) => api.put(`/feedbacks/${id}`, { status });

export default api;