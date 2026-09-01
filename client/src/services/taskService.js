import api from './api';

export const taskService = {
  getRoomTasks: async (roomId, params = {}) => {
    const response = await api.get(`/rooms/${roomId}/tasks`, { params });
    return response.data;
  },

  createTask: async (roomId, taskData) => {
    const response = await api.post(`/rooms/${roomId}/tasks`, taskData);
    return response.data;
  },

  updateTask: async (taskId, updateData) => {
    const response = await api.patch(`/tasks/${taskId}`, updateData);
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  }
};
