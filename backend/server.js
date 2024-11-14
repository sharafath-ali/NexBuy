import express from "express"
import { configDotenv } from "dotenv";
import authRoutes from "./routes/auth.route.js"
import mongoose from 'mongoose'
import { connectDB } from "./lib/db.js"
import morgan from "morgan";


configDotenv()
const app = express();
const Port = process.env.PORT;

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(Port, () => {
  console.log(`Server is running on 'http://localhost:${Port}'`);
  connectDB()
});

app.use("/api/auth", authRoutes)
