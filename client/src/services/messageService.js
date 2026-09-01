import api from './api';

export const messageService = {
  getRoomMessages: async (roomId, page = 1, limit = 50) => {
    const response = await api.get(`/rooms/${roomId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  }
};
