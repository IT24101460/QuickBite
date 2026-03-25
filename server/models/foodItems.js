import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema({
    foodItemId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
});

const FoodItem = mongoose.model("FoodItem", foodItemSchema);
export { foodItemSchema };export default FoodItem;