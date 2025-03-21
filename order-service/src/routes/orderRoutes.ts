import { Router } from "express";
import OrderController from "../controllers/OrderController";
import { authMiddleware } from "../middleware";

const orderRouter = Router();

orderRouter.get(
  "/:id",
  authMiddleware as any,
  OrderController.getOrderById as any
);
orderRouter.get(
  "/userId",
  authMiddleware as any,
  OrderController.getOrderByUserId as any
);
orderRouter.post("/", authMiddleware as any, OrderController.createOrder);

export default orderRouter;
