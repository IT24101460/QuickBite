import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    canteenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Canteen",
        default: null
    },
    foodItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItem",
        default: null
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    complaintType: {
        type: String,
        enum: ["general", "food_quality", "service", "hygiene", "other"],
        default: "general"
    },
    complaintImage: {
        type: String,
        default: ""
    },
    response: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["open", "reviewed", "resolved"],
        default: "open"
    }
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
