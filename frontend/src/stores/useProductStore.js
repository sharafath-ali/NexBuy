import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import { toast } from 'react-hot-toast'

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
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

  deleteProduct: async (productId) => {
    try {
      set({ loading: true });
      await axiosInstance.delete(`/product/delete/${productId}`);
      set((prevState) => ({
        products: prevState.products.filter((product) => product._id !== productId),
        loading: false
      }));
      toast.success('Product deleted successfully');
    } catch (error) {
      set({ loading: false });
      console.log(error)
      toast.error(error.response.data.message || 'Something went wrong');
    }
  },

  fetchProducts: async () => {
    try {
      set({ loading: true });
      const response = await axiosInstance.get('/product');
      set({ products: response.data.products, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || 'Something went wrong');
    }
  },

  toggleFeaturedProduct: async (productId) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.patch(`/product/${productId}`);
      set((prevState) => ({
        products: prevState.products.map((product) => {
          if (product._id === productId) {
            return { ...product, isFeatured: !product.isFeatured };
          }
          return product;
        }),
        loading: false
      }));
      toast.success('Product updated successfully');
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || 'Something went wrong');
    }
  },
}))