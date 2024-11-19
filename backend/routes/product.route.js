import express from "express"
import { getallproducts, getfeaturedproducts, createproduct, deleteproduct, getRecommendedProducts, getproductsbycategory, toggleFeaturedproduct } from "../controllers/product.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { adminRoute } from "../middleware/auth.middleware.js";
import { getRounds } from "bcrypt";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getallproducts)
router.get("/featured", getfeaturedproducts)
router.post("/create", protectRoute, adminRoute, createproduct)
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedproduct)
router.post("/delete/:id", protectRoute, adminRoute, deleteproduct)
router.get("/recommend", getRecommendedProducts)
router.get("/category/:category", getproductsbycategory)
export default router