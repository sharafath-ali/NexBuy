import express from "express"
import { configDotenv } from "dotenv";
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js"
import morgan from "morgan";


configDotenv()
const app = express();
const Port = process.env.PORT;

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.listen(Port, () => {
  console.log(`Server is running on 'http://localhost:${Port}'`);
  connectDB()
});

app.use("/api/auth", authRoutes)
app.use("/api/product", productRoutes)
app.use("/api/cart", cartRoutes)