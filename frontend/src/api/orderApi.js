import axiosClient from './axiosClient';

export const orderApi = {
  create: (data) => {
    return axiosClient.post('/orders', data);
  },

  checkout: (data) => {
    return axiosClient.post('/orders/checkout', data);
  },

  verifyPayment: (data) => {
    return axiosClient.post('/orders/verify', data);
  },
  
  getMy: () => {
    return axiosClient.get('/orders/my-orders');
  },
  
  getMyOrders: () => {
    return axiosClient.get('/orders/my-orders');
  },
  
  getById: (id) => {
    return axiosClient.get(`/orders/${id}`);
  },
  
  // Admin endpoints
  getAll: (params = {}) => {
    return axiosClient.get('/orders', { params });
  },
  
  updateStatus: (id, status) => {
    return axiosClient.patch(`/orders/${id}/status`, { status });
  },
  
  verifyQR: (qrData) => {
    return axiosClient.post('/orders/verify-qr', { qrData });
  },

  verifyToken: (tokenCode, status) => {
    return axiosClient.post('/orders/verify-token', { tokenCode, status });
  }
};

