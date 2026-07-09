import api from './axios';

export const createReport = (formData) => api.post('/reports', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

export const getReports = (params) => api.get('/reports', { params });
export const getReportById = (id) => api.get(`/reports/${id}`);
export const updateReport = (id, data) => api.put(`/reports/${id}`, data);
export const deleteReport = (id) => api.delete(`/reports/${id}`);
export const getMyReports = (params) => api.get('/reports/my', { params });
export const getNearbyReports = (params) => api.get('/reports/nearby', { params });
