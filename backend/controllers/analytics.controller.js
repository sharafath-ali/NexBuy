import { get } from "mongoose";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

export const getAnalytics = async (req, res) => {
  try {
    const analytics = await getAnalyticsData();
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dailySalesData = await getDailySalesData(startDate, endDate);
    res.status(200).json({ analytics, dailySalesData })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getAnalyticsData = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null, // its group all documents
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ])

  const totalSales = salesData[0]?.totalSales || 0;
  const totalRevenue = salesData[0]?.totalRevenue || 0;
  return { users: totalUsers, Products: totalProducts, totalSales, totalRevenue };
}

const getDailySalesData = async (startDate, endDate) => {
  const dailySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        sales: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  const dateArray = getDatesInRange(startDate, endDate);
  return dateArray.map(date => {
    const salesData = dailySales.find(sale => sale._id === date);
    return {
      date,
      sales: salesData?.sales || 0,
      revenue: salesData?.revenue || 0
    }
  })
}

function getDatesInRange(startDate, endDate) {
  const dateArray = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateArray.push(currentDate.toISOString().split('T')[0]
    );
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dateArray;
}