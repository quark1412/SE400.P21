import express from "express";
import orderController from "../controllers/orderController.js";
import authenticateRequest from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateRequest, orderController.createOrder);
router.put("/:id", authenticateRequest, orderController.updateOrder);
router.get("/", authenticateRequest, orderController.getAllOrders);
router.get("/:id", authenticateRequest, orderController.getOrderById);

export default router;
