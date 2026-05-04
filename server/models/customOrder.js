import mongoose from "mongoose";

const customOrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    canteenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Canteen",
        required: true
    },
    orderType: {
        type: String,
        required: true,
        enum: ['birthday_cake', 'wedding_cake', 'custom_dessert', 'special_meal', 'party_platter', 'other']
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 1000
    },
    specialInstructions: {
        type: String,
        trim: true,
        maxlength: 500
    },
    budget: {
        type: Number,
        required: true,
        min: 500
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    pickupDate: {
        type: Date,
        required: true
    },
    referenceImages: [{
        type: String,
        required: true
    }],
    estimatedPrice: {
        type: Number,
        required: true
    },
    actualPrice: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        enum: ['pending_confirmation', 'confirmed', 'in_progress', 'ready', 'completed', 'cancelled'],
        default: 'pending_confirmation'
    },
    adminNotes: {
        type: String,
        maxlength: 500
    },
    rejectionReason: {
        type: String,
        maxlength: 500
    },
    confirmedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
customOrderSchema.index({ userId: 1, status: 1 });
customOrderSchema.index({ canteenId: 1, status: 1 });
customOrderSchema.index({ pickupDate: 1 });

const CustomOrder = mongoose.model("CustomOrder", customOrderSchema);
export default CustomOrder;
