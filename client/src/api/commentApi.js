import api from './axios';

export const addComment = (reportId, data) => api.post(`/reports/${reportId}/comments`, data);
export const getComments = (reportId, params) => api.get(`/reports/${reportId}/comments`, { params });
