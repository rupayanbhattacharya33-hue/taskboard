import api from './axios';

export const getComments = (taskId) => api.get(`/tasks/${taskId}/comments`);
export const createComment = (taskId, text) => api.post(`/tasks/${taskId}/comments`, { text });
export const deleteComment = (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`);