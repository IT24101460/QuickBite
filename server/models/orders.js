import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    foodItemId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        studentName: { type: String, required: true },
        uniId: { type: String, required: true },
        items: { type: [orderItemSchema], required: true },
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
orderSchema.pre("save", async function (next) {
    if (this.isNew) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await mongoose.model("Order").countDocuments({
            createdAt: { $gte: today },
            status: { $ne: "cancelled" }
        });
        this.queueNumber = count + 1;
    }
    next();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;