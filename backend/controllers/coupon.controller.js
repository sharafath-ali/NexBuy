import Coupon from "../models/coupon.model.js";

export const getcoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findOne({ userId: req.user._id, isActive: true });
    res.status(200).json(coupons || null);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const validatecoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupons = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true });
    if (!coupons) {
      return res.status(400).json({ message: 'Coupon not found' });
    }
    if (coupons.expirationDate < Date.now()) {
      coupons.isActive = false;
      await coupons.save();
      return res.status(400).json({ message: 'Coupon expired' });
    }
    res.status(200).json(coupons || null);

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}