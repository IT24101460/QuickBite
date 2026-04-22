import mongoose from "mongoose";

const promotionsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    discountType: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    applicableTo: {
        type: String,
        enum: ["all", "specific"],
        default: "all"
    },
    foodItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItem"
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Promotions = mongoose.model("Promotions", promotionsSchema);

export default Promotions;
