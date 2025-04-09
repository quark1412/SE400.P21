import Product from "../models/product.js";
import logger from "../utils/logger.js";

const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalProducts = await Product.countDocuments();
    res.status(200).json({
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts: totalProducts,
    });
    logger.info("Products fetched successfully", products);
  } catch (error) {
    console.log(error.message)
    logger.error("Error fetching products", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
    });
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json(product);
    logger.info("Product fetched successfully", product);
  } catch (error) {
    logger.error("Error fetching Product by ID", error);
    res.status(500).json({
      success: false,
      message: "Error fetching Product by ID",
    });
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
    logger.info("Product created successfully", product);
  } catch (error) {
    logger.error("Error creating product", error);
    res.status(500).json({
      success: false,
      message: "Error creating product",
    });
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json(updatedProduct);
    logger.info("Product updated successfully", updatedProduct);
  } catch (error) {
    logger.error("Error updating product", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
    });
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({ success: true, message: "Product deleted successfully" });
    logger.info("Product deleted successfully", deletedProduct);
  } catch (error) {
    logger.error("Error deleting product", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
    });
  }
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
