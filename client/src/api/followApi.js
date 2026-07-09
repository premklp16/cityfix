import api from './axios';

export const toggleFollow = (reportId) => api.post(`/reports/${reportId}/follow`);
export const getFollowedReports = () => api.get('/follows');
