import express from "express"
import { configDotenv } from "dotenv";
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import path from "path"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentRoutes from "./routes/payment.route.js"
import analyticsRoutes from "./routes/analytics.route.js"
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js"
import morgan from "morgan";

configDotenv()
const app = express();
const Port = process.env.PORT;

const __dirname = path.resolve();
// app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/product", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/coupon", couponRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/analytics", analyticsRoutes)

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(Port, () => {
  console.log(`Server is running on 'http://localhost:${Port}'`);
  connectDB()
});