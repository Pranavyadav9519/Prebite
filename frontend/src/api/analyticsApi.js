import axiosClient from './axiosClient';

export const analyticsApi = {
  getDashboard: () => {
    return axiosClient.get('/analytics/dashboard');
  },
  
  getDaily: (date) => {
    return axiosClient.get('/analytics/daily', { params: { date } });
  },
  
  getWeekly: (weeks = 1) => {
    return axiosClient.get('/analytics/weekly', { params: { weeks } });
  }
};

