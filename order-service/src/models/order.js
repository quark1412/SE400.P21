import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
    orderItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending",
    }
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", userSchema);

export default Order;
