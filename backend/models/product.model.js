import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"]
  },
  price: {
    type: Number,
    required: [true, "price is required"],
    default: 0
  },
  image: {
    type: String,
    required: [true, "image is required"]
  },
  description: {
    type: String,
    default: "",
    required: [true, "description is required"]
  },
  category: {
    type: String,
    required: [true, "category is required"]
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // countInStock: {
  //   type: Number,
  //   // required: [true, "countInStock is required"],
  //   default: 0
  // },
  // rating: {
  //   type: Number,
  //   default: 0
  // },
  // numReviews: {
  //   type: Number,
  //   default: 0
  // }

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product