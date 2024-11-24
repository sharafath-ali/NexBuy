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
      set({ user: response.data.user , loading: false })
      toast.success('Login successful')
    } catch (error) {
      set({ loading: false })
      toast.error(error.response.data.message || 'Something went wrong')
      throw error
    }
  },

  logout : async () => {
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
}))