import api from './api';

export const leaderboardService = {
  getTop100: async () => {
    const response = await api.get('/leaderboard');
    return response.data;
  },

  getMyRank: async () => {
    const response = await api.get('/leaderboard/me');
    return response.data;
  }
};
