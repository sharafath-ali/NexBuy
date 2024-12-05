import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import { toast } from 'react-hot-toast'

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: false,
  signup: async ({ name, email, password, confirmPassword }) => {

    set({ loading: true })
    if (password !== confirmPassword) {
      set({ loading: false })
      return toast.error('Passwords do not match')
    }

    try {
      const data = { name, email, password }
      const response = await axiosInstance.post('/auth/signup', { name, email, password });

      set({ user: response.data.user, loading: false })
      toast.success('Signup successful')
      set({ loading: false })


    } catch (error) {
      set({ loading: false })
      toast.error(error.response.data.message || 'Something went wrong')
      throw error
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true })
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      set({ user: response.data.user, loading: false })
      toast.success('Login successful')
    } catch (error) {
      set({ loading: false })
      toast.error(error.response.data.message || 'Something went wrong')
      throw error
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ user: null })
      toast.success('Logout successful')
    } catch (error) {
      toast.error(error.response.data.message || 'error logging out')
      throw error
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true })
    try {
      const response = await axiosInstance.get('/auth/profile');
      set({ user: response.data.user, checkingAuth: false })
    } catch (error) {
      set({ checkingAuth: false, user: null })
      throw error
    }
  },

  refreshToken: async () => {
    // Prevent multiple simultaneous refresh attempts
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await axiosInstance.post("/auth/refreshtoken");
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },
}))


let refreshPromise = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in progress, wait for it to complete
        if (refreshPromise) {
          await refreshPromise;
          return axiosInstance(originalRequest);
        }

        // Start a new refresh process
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle as needed
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);