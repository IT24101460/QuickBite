import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "card", "mobile", "wallet", "bank"],
        default: "cash"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    paymentProof: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
