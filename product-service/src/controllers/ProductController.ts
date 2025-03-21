import { Product } from "../database";
import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";

const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !price || !category) {
      throw new ApiError(400, "Missing required fields");
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
    });

    await newProduct.save();
    res.status(200).json({
      status: 200,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};
const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        status: 400,
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: 200,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};
const updateProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const updateProduct = await Product.findById(productId);

    if (!updateProduct)
      return res
        .status(404)
        .json({ status: 404, message: "Product not found" });

    const { name, category, description, price } = req.body;

    updateProduct.name = name || updateProduct.name;
    updateProduct.category = category || updateProduct.category;
    updateProduct.description = description || updateProduct.description;
    updateProduct.price = price || updateProduct.price;

    await updateProduct.save();
    res.status(200).json({
      status: 200,
      message: "Product updated successfully",
      data: updateProduct,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};
const deleteProductById = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

export default { createProduct, getProductById, updateProductById };
