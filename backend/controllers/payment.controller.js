import Coupon from "../models/coupon.model.js";
import { stripe } from "../lib/stripe.js";
import Order from "../models/order.model.js";


export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products is required' });
    }
    let totalAmount = 0;
    const line_items = products.map((product) => {
      const amount = Math.round(product.price * 100);
      totalAmount += amount * product.quantity;
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1
      };
    });

    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode, isActive: true, UserId: req.user._id });
      if (coupon) {
        const discount = (coupon.discountPercentage / 100) * totalAmount;
        totalAmount -= discount;
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discount: coupon ? [
        {
          coupon: createStripeCoupon(coupon.discountPercentage)
        }
      ] : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || null,
        products: JSON.stringify(products.map((product) => ({ id: product._id, quantity: product.quantity, price: product.price })))
      }
    });

    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }

    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function createStripeCoupon(discountPercentage) {
  const stripeCoupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: 'once'
  })
  return stripeCoupon.id;
}


async function createNewCoupon(userId) {
  const coupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Add 30 days to the current date
    isActive: true,
    userId: userId
  });
  await coupon.save();

  return coupon;
}

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate({ code: session.metadata.couponCode, userId: session.metadata.userId }, { isActive: false });
      }

      const products = JSON.parse(session.metadata.products)
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({ product: product.id, quantity: product.quantity, price: product.price })),
        totalAmount: session.amount_total / 100,
        stripeSessionId: sessionId,
      });
      await newOrder.save();

      res.status(200).json({
        success: true,
        message: "Payment successful, order created, and coupon deactivated if used.",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    console.error("Error processing successful checkout:", error);
    res.status(500).json({ message: "Error processing successful checkout", error: error.message });
  }
};