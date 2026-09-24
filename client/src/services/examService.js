import api from './api';

export function login(email, password) {
  return api.post('/auth/login', { email, password });
}

export function getMe() {
  return api.get('/auth/me');
}

export function getAdminDashboard() {
  return api.get('/admin/dashboard');
}

export function getAdminExams(params) {
  return api.get('/admin/exams', { params });
}

export function getAdminExam(id) {
  return api.get(`/admin/exams/${id}`);
}

export function createExam(payload) {
  return api.post('/admin/exams', payload);
}

export function updateExam(id, payload) {
  return api.put(`/admin/exams/${id}`, payload);
}

export function cancelExam(id) {
  return api.patch(`/admin/exams/${id}/cancel`);
}

export function deleteExam(id) {
  return api.delete(`/admin/exams/${id}`);
}

export function getStudentProfile() {
  return api.get('/student/profile');
}

export function getStudentExams() {
  return api.get('/student/exams');
}
