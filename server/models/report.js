import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reportType: {
        type: String,
        enum: ["sales", "inventory", "customer", "feedback", "performance"],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    dateRange: {
        startDate: Date,
        endDate: Date
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Report = mongoose.model("Report", reportSchema);

export default Report;
