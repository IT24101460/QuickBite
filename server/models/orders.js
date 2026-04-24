import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    foodItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        studentName: { type: String, required: true },
        uniId: { type: String, required: true },
        canteenId: { type: mongoose.Schema.Types.ObjectId, ref: "Canteen", default: null },
        items: { type: [orderItemSchema], required: true },
        totalAmount: { type: Number, required: true },
        discountAmount: { type: Number, default: 0 },
        finalAmount: { type: Number, default: 0 },
        promotionId: { type: mongoose.Schema.Types.ObjectId, ref: "Promotions", default: null },
        pickupTime: { type: String, default: "" },
        requestImage: { type: String, default: "" },
        queueNumber: { type: Number },
        status: {
            type: String,
            enum: ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
            default: "pending"
        },
        note: { type: String, default: "" }
    },
    { timestamps: true }
);

// Auto-assign queue number before saving a new order
orderSchema.pre("save", async function () {
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

// Hotfix: Forcefully drop the aggressively cached unique index that was inherited structurally from the root Food schema.
Order.collection.dropIndex("items.foodItemId_1").catch(err => {
    // Suppress if the index has already been forcefully cleared!
});

export default Order;