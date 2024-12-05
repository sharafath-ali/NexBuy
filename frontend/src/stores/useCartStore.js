import { axiosInstance } from '../lib/axios'
import { create } from "zustand";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  isCouponApplied: false,
  total: 0,
  subtotal: 0,
  loading: false,
  addToCart: async (product) => {
    try {
      const productId = product._id;
      await axiosInstance.post(`/cart/${productId}`);
      toast.success("Product added to cart");

      set((prevState) => {
        const existingItem = prevState.cart.find((item) => item._id === product._id);
        const newCart = existingItem
          ? prevState.cart.map((item) =>
            item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
          )
          : [...prevState.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred");
    }
  },

  getCartItems: async () => {
    try {
      set({ loading: true });
      const response = await axiosInstance.get("/cart");
      set({ cart: response.data });
      console.log(response.data);
      get().calculateTotals();
      set({ loading: false });
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast.error(error.message || "An error occurred");
    }
  },
  calculateTotals: () => {
    const { cart, coupon } = get();
    const subtotal = cart?.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let total = subtotal;

    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }

    set({ subtotal, total });
  },

  removeFromCart: async (productId) => {
    try {
      await axiosInstance.delete(`/cart/${productId}`);
      toast.success("Product removed from cart");
      set((prevState) => ({
        cart: prevState.cart.filter((item) => item._id !== productId),
      }));
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred");
    }
  },

  updateQuantity: async (productId, quantity) => {
    try {
      if (quantity === 0) {
        return get().removeFromCart(productId);
      }
      await axiosInstance.put(`/cart/${productId}`, { quantity });

      set((prevState) => ({
        cart: prevState.cart.map((item) =>
          item._id === productId ? { ...item, quantity } : item
        ),
      }))
      toast.success("Quantity updated successfully", { duration: 500 });
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred");
    }
  },

  clearCart: async () => {
    try{
      await axiosInstance.delete("/cart");
      set({ cart: [], coupon: null, total: 0, subtotal: 0 });
      toast.success("Cart cleared successfully");
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred");
    }
  },

  getMyCoupon: async () => {
    try {
      const response = await axiosInstance.get("/coupon");
      set({ coupon: response.data });
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast.error(error.message || "An error occurred");
    }
  },

  applyCoupon: async (code) => {
    try {
      const response = await axiosInstance.post("/coupon/validate", { code });
      set({ coupon: response.data, isCouponApplied: true });
      get().calculateTotals();
      toast.success("Coupon applied successfully");
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast.error(error.message || "An error occurred");
    }
  },

  removeCoupon: async () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed successfully");
  },
}));