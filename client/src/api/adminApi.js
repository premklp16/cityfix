import api from './axios';

export const getAnalytics = () => api.get('/admin/analytics');
export const assignReport = (data) => api.post('/admin/assign-report', data);
export const getUsers = (params) => api.get('/admin/users', { params });
export const updateUserRole = (id, data) => api.put(`/admin/users/${id}/role`, data);
export const getDepartments = () => api.get('/admin/departments');
export const createDepartment = (data) => api.post('/admin/departments', data);
export const updateDepartment = (id, data) => api.put(`/admin/departments/${id}`, data);
export const deleteDepartment = (id) => api.delete(`/admin/departments/${id}`);

// Officer management
export const assignOfficerToDepartment = (data) => api.post('/admin/officers/assign-department', data);
export const getOfficersByDepartment = (departmentId) => api.get(`/admin/departments/${departmentId}/officers`);
export const removeOfficerFromDepartment = (data) => api.post('/admin/officers/remove-department', data);
