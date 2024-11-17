import express from "express"
import { getallproducts, getfeaturedproducts, createproduct, deleteproduct, getRecommendedProducts } from "../controllers/product.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { adminRoute } from "../middleware/auth.middleware.js";
import { getRounds } from "bcrypt";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getallproducts)
router.get("/featured", getfeaturedproducts)
router.post("/create", protectRoute, adminRoute, createproduct)
router.post("/delete/:id", protectRoute, adminRoute, deleteproduct)
router.get("/recommend", getRecommendedProducts)
export default router