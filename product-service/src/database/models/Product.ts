import mongoose, { Schema, Document } from "mongoose";
import validator from "validator";

export interface IProduct extends Document {
  name: string;
  category: string;
  description: string;
  price: Number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      require: [true, "Product name must be provided"],
      minlength: 3,
    },
    category: {
      type: String,
      require: [true, "Product category must be provided"],
    },
    description: {
      type: String,
      trim: true,
      require: false,
      default: null,
    },
    price: {
      type: Number,
      require: [true, "Product price must be provided"],
      min: 10000,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
