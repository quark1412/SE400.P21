import { Router } from "express";
import ProductController from "../controllers/ProductController";
import { authMiddleware } from "../middleware";

const productRouter = Router();

productRouter.get("/:id", ProductController.getProductById as any);
productRouter.post(
  "/",
  authMiddleware as any,
  ProductController.createProduct as any
);
productRouter.put(
  "/:id",
  authMiddleware as any,
  ProductController.updateProductById as any
);

export default productRouter;
