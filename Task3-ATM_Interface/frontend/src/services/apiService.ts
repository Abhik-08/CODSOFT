import axios from 'axios';
import { auth, isMockMode } from '../firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Firebase ID Token
api.interceptors.request.use(
  async (config) => {
    if (isMockMode) {
      config.headers.Authorization = 'Bearer mock-session-token';
      return config;
    }

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to retrieve Firebase ID Token:', error);
      }
    } else {
      const activeMockUser = localStorage.getItem('apex_mock_logged_in_user');
      if (activeMockUser) {
        try {
          const userObj = JSON.parse(activeMockUser);
          if (userObj.uid) {
            config.headers.Authorization = `Bearer mock-${userObj.uid}`;
          }
        } catch (error) {
          console.error('Failed to parse mock logged in user:', error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
