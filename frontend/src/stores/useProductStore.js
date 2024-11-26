import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import { toast } from 'react-hot-toast'

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  setProducts: (products) => set({ products }),
  createProduct: async (formData) => {
    try {
      set({ loading: true });
      console.log(formData)
      const response = await axiosInstance.post('/product/create', formData);
      set((prevState) => ({
        products: [...prevState.products, response.data.product],
        loading: false
      }))
      toast.success('Product created successfully');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || 'Something went wrong');
    }
  },
}))