import express from "express";
import { addProductToCart, getCartProducts, updatequantity, removeAllProductFromCart } from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:id", protectRoute, addProductToCart)
router.delete("/clear", protectRoute, removeAllProductFromCart)
router.get("/", protectRoute, getCartProducts)
router.delete("/:id", protectRoute, removeAllProductFromCart)
router.put("/:id", protectRoute, updatequantity)

export default router