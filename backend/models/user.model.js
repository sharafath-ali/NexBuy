import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"]
  },
  email: {
    type: email,
    required: [true, "email is required"]
  }
})