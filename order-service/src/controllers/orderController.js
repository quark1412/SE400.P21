import logger from "../utils/logger.js";
import Order from "../models/order.js";

const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalOrders = await Order.countDocuments();
    res.status(200).json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders: totalOrders,
    });
    logger.info("Orders fetched successfully", products);
  } catch (error) {
    logger.error("Error fetching orders", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(200).json(order);
    logger.info("Order fetched successfully", order);
  } catch (error) {
    logger.error("Error fetching order by ID", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order by ID",
    });
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { shippingFee, orderItems } = req.body;
    const userId = req.user.userId;

    let total = 0;
    for (let index = 0; index < orderItems.length; index++) {
      total += orderItems[index].price;
    }

    const order = new Order(userId, total, shippingFee, orderItems);
    await order.save();
    res.status(201).json(order);
    logger.info("Order created successfully", order);
  } catch (error) {
    logger.error("Error creating order", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
    });
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const status = req.body.status;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    order.status = status;

    await order.save();
    res.status(200).json(order);
    logger.info("Order updated successfully", order);
  } catch (error) {
    logger.error("Error updating order", error);
    res.status(500).json({
      success: false,
      message: "Error updating order",
    });
  }
};

export default {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
};
