import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      require: true,
      minlength: 3,
    },
    category: {
      type: String,
      require: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      require: true,
      min: 10000,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", userSchema);

export default Product;
