import api from './axios';

export const toggleUpvote = (reportId) => api.post(`/reports/${reportId}/upvote`);
