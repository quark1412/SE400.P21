import { Request, Response } from "express";
import { Order } from "../database";
import { ApiError } from "../utils/apiError";

const createOrder = async (req: any, res: Response) => {
  try {
    const { total, shippingFee } = req.body;
    const userId = req.user.id;
    if (!total || shippingFee === undefined || shippingFee === null)
      throw new ApiError(404, "Missing required fields");

    const newOrder = new Order({
      userId,
      total,
      shippingFee,
    });

    await newOrder.save();
    res.status(200).json({
      status: 200,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

const getOrderByUserId = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const orders = Order.find({ userId: userId });

    if (!orders) {
      throw new ApiError(404, "Order not found");
    }

    res.status(200).json({
      status: 200,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ status: 404, message: "Order not found" });

    res.status(200).json({ status: 200, data: order });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

const updateOrderById = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

export default { createOrder, getOrderById, updateOrderById, getOrderByUserId };
