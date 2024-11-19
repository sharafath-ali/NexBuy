import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "code is required"],
    unique: true
  },
  discountPercentage: {
    type: Number,
    required: [true, "discount is required"],
    min: 0,
    max: 100,
  },
  expirationDate: {
    type: Date,
    required: [true, "expiration date is required"]
  },
  isActive: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "user id is required"],
    unique: true
  },
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);
