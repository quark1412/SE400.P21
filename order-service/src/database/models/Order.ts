import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  total: number;
  shippingFee: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      require: true,
    },
    total: {
      type: Number,
      require: true,
    },
    shippingFee: {
      type: Number,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
