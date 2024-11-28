
import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });

    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
      return { ...product.toJSON(), quantity: item.quantity };
    });

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const addProductToCart = async (req, res) => {
  try {
    const { id } = req.params;
    const User = req.user;
    const existingitem = await User.cartItems.find(item => item.id === id);
    if (existingitem) {
      existingitem.quantity += 1;
    } else {
      User.cartItems.push(id);
    }
    const cart = await User.save();
    res.status(200).json({ cart })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const removeAllProductFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const User = req.user;
    if (!id) {
      User.cartItems = [];
    } else {
      User.cartItems = User.cartItems.filter(item => item.id !== id);
    }
    const cart = await User.save();
    res.status(200).json({ cart })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updatequantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const User = req.user;
    const existingitem = await User.cartItems.find(item => item.id === id);
    if (existingitem) {
      if (quantity === 0) {
        User.cartItems = User.cartItems.filter(item => item.id !== id);
        await User.save();
        return res.status(200).json({ cart: User.cartItems })
      }
      existingitem.quantity = quantity;
      await User.save();
      return res.status(200).json({ cart: User.cartItems })
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}