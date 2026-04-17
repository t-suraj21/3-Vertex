import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout to surface network errors faster
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., clear token and redirect to login)
      await SecureStore.deleteItemAsync('userToken');
      // Store dispatch logic can go here if needed to clear user state
    }
    return Promise.reject(error);
  }
);

export default api;
