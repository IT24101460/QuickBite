import mongoose from "mongoose";
import { foodItemSchema } from "./foodItems.js";



const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        studentName: { type: String, required: true },
        uniId: { type: String, required: true },
        items: { type: [foodItemSchema], required: true },
        totalAmount: { type: Number, required: true },
        queueNumber: { type: Number },
        status: {
            type: String,
            enum: ["pending", "preparing", "ready", "completed", "cancelled"],
            default: "pending"
        },
        note: { type: String, default: "" }
    },
    { timestamps: true }
);

// Auto-assign queue number before saving a new order
orderSchema.pre("save", async function() {
    if (this.isNew) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await mongoose.model("Order").countDocuments({
            createdAt: { $gte: today },
            status: { $ne: "cancelled" }
        });
        this.queueNumber = count + 1;
    }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;