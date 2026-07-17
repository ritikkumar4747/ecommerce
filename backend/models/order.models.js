import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
      {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
        }
    ],
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled", "shipped", "delivered"],
        default: "pending"
    },
    paymentInfo: {
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
},

isPaid: {
  type: Boolean,
  default: false,
},

paidAt: Date,
    shippingAddress: {
      recipientName: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
      addressLabel: String // optional label like 'Home' or 'Office'
    },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;