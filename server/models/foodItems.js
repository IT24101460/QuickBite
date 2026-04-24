import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
    foodItemId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, default: "General" },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 999, min: 0 },
    isAvailable: { type: Boolean, default: true },
    image: { type: String, default: "" },
    canteenId: { type: mongoose.Schema.Types.ObjectId, ref: "Canteen", default: null }
}, { timestamps: true });

const FoodItem = mongoose.model("FoodItem", foodItemSchema);
export { foodItemSchema };
export default FoodItem;