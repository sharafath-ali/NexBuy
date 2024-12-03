import express from "express";
import { getcoupons, validatecoupon } from "../controllers/coupon.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getcoupons);
router.post("/validate", protectRoute, validatecoupon);

export default router