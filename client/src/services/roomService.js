import api from './api';

export const roomService = {
  getRooms: async (params = {}) => {
    const response = await api.get('/rooms', { params });
    return response.data;
  },

  getRoomById: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  },

  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  joinRoom: async (roomId, passcode = null) => {
    const response = await api.post(`/rooms/${roomId}/join`, { passcode });
    return response.data;
  },

  leaveRoom: async (roomId) => {
    const response = await api.post(`/rooms/${roomId}/leave`);
    return response.data;
  },

  deleteRoom: async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  },

  getRoomMembers: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}/members`);
    return response.data;
  }
};
