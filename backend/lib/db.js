import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODBURL)
    console.log('Connected to MongoDB Atlas', connection.connection.host)
  } catch (error) {
    console.log('Failed to connect to MongoDB Atlas', error.message)
    process.exit()
  }
}