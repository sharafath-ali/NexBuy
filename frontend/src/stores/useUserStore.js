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

      if (response.status === 201) {
        set({ user: response.data.user, loading: false })
        toast.success('Signup successful')
        set({ loading: false })
      }

    } catch (error) {
      set({ loading: false })
      toast.error(error.response.data.message || 'Something went wrong')
      throw error
    }
  }
}))