import Feedback from "../models/feedback.js";
import Canteen from "../models/canteen.js";

// Submit feedback (authenticated users)
export async function createFeedback(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login to submit feedback" });
        }

        const { rating, comment, canteenId, foodItemId, orderId, complaintType } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ message: "Rating and comment are required" });
        }

        const complaintImage = req.file ? `/uploads/${req.file.filename}` : "";

        const feedback = new Feedback({
            userId: req.user._id || req.user.id,
            rating,
            comment,
            canteenId: canteenId || null,
            foodItemId: foodItemId || null,
            orderId: orderId || null,
            complaintType: complaintType || "general",
            complaintImage
        });

        await feedback.save();
        res.status(201).json({ message: "Feedback submitted successfully", feedback });
    } catch (error) {
        res.status(500).json({ message: "Error creating feedback", error: error.message });
    }
}

// Get all feedback (Admin)
export async function getAllFeedback(req, res) {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }
        const feedback = await Feedback.find()
            .populate("userId", "firstName lastName email")
            .populate("canteenId", "canteenName")
            .populate("foodItemId", "name")
            .populate("orderId", "queueNumber")
            .sort({ createdAt: -1 });
        res.status(200).json({ feedback });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving feedback", error: error.message });
    }
}

// Get feedback by food item ID (public - shown under food item)
export async function getFeedbackByFoodItem(req, res) {
    try {
        const feedback = await Feedback.find({ foodItemId: req.params.foodItemId })
            .populate("userId", "firstName lastName")
            .sort({ createdAt: -1 });
        res.status(200).json({ feedback });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving feedback", error: error.message });
    }
}

// Get feedback by canteen ID
export async function getFeedbackByCanteen(req, res) {
    try {
        const feedback = await Feedback.find({ canteenId: req.params.canteenId })
            .populate("userId", "firstName lastName")
            .populate("foodItemId", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ feedback });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving feedback", error: error.message });
    }
}

// Update feedback status / reply (Admin / Owner)
export async function updateFeedback(req, res) {
    try {
        if (!req.user?.isAdmin && req.user?.role !== 'owner') {
            return res.status(403).json({ message: "Elevated access required" });
        }

        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: "Feedback not found" });

        if (req.user?.role === 'owner') {
            // Retrieve the Canteen Schema to dynamically construct the security constraint check
            const myCanteen = await Canteen.findOne({ createdBy: req.user._id || req.user.id });
            if (!myCanteen || myCanteen._id.toString() !== feedback.canteenId?.toString()) {
                return res.status(403).json({ message: "Unauthorized cross-canteen feedback manipulation detected!" });
            }
        }

        const { response, status } = req.body;
        feedback.response = response;
        if (status) feedback.status = status;

        await feedback.save();
        res.status(200).json({ message: "Feedback replied successfully", feedback });
    } catch (error) {
        res.status(500).json({ message: "Error updating feedback", error: error.message });
    }
}

// Delete feedback (Admin)
export async function deleteFeedback(req, res) {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!feedback) return res.status(404).json({ message: "Feedback not found" });
        res.status(200).json({ message: "Feedback deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting feedback", error: error.message });
    }
}
