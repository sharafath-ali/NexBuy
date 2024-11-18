
import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });

    // if (!products) {
    //   return res.status(404).json({ message: 'No products found' })
    // } else {
    const cart = products.map(product => {
      const items = req.user.cartItems.find(item => item.id === product._id);
      return {
        ...product.toJSON(),
        quantity: items.quantity
      }
    }
    )
    res.status(200).json({ cart })
    // }
  } catch (error) {
    res.status(500).json({ message: error.message })
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