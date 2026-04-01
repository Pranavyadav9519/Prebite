import axiosClient from './axiosClient';

export const menuApi = {
  getAll: (params = {}) => {
    return axiosClient.get('/menu', { params });
  },
  
  getById: (id) => {
    return axiosClient.get(`/menu/${id}`);
  },
  
  create: (data) => {
    return axiosClient.post('/menu', data);
  },
  
  update: (id, data) => {
    return axiosClient.put(`/menu/${id}`, data);
  },
  
  delete: (id) => {
    return axiosClient.delete(`/menu/${id}`);
  },
  
  getCategories: () => {
    return axiosClient.get('/menu/categories');
  },
  
  seed: () => {
    return axiosClient.post('/menu/seed');
  }
};

