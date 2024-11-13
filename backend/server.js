import express from "express"
import { configDotenv } from "dotenv";
import authRoutes from "./routes/auth.route.js"
import mongoose from 'mongoose'
import {connectDB} from "./lib/db.js"


configDotenv()
const app = express();
const Port = process.env.PORT;

  app.listen(Port, () => {
    console.log(`Server is running on 'http://localhost:${Port}'`);
    connectDB()
  });




app.use("/api/auth",authRoutes)
