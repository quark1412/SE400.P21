import express from "express";
import productController from "../controllers/productController.js";
import authenticateRequest from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateRequest, productController.createProduct);
router.delete("/:id", authenticateRequest, productController.deleteProduct);
router.get("/public/", productController.getAllProducts);
router.get("/public/:id", productController.getProductById);
router.put("/:id", authenticateRequest, productController.updateProduct);

export default router;
