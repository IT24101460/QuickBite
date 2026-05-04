import Feedback from "../models/feedback.js";
import Canteen from "../models/Canteen.js";
import { supabase } from "../config/supabase.js";

function getAuthenticatedUserId(user) {
    if (!user) return null;
    const rawId = user._id || user.id || user.userId;
    if (!rawId) return null;
    return rawId.toString();
}

// Submit feedback (authenticated users)
export async function createFeedback(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login to submit feedback" });
        }
        const currentUserId = getAuthenticatedUserId(req.user);
        if (!currentUserId) {
            return res.status(401).json({ message: "Invalid user session. Please login again." });
        }

        const { rating, comment, canteenId, foodItemId, orderId, complaintType } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ message: "Rating and comment are required" });
        }

        let complaintImage = "";
        if (req.file) {
            // Uploading to Supabase bucket 'quickbite-images'
            const fileName = `feedback_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const { data, error } = await supabase.storage
                .from('quickbite-images')
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

            if (error) {
                console.error("Supabase feedback upload error:", error);
                throw error;
            }

            const { data: publicUrlData } = supabase.storage
                .from('quickbite-images')
                .getPublicUrl(fileName);

            complaintImage = publicUrlData.publicUrl;
        }

        const feedback = new Feedback({
            userId: currentUserId,
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
        console.error("Feedback creation error:", error);
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

// Get current user's feedback
export async function getUserFeedback(req, res) {
    try {
        if (!req.user) return res.status(401).json({ message: "Please login to view your feedback" });
        const currentUserId = getAuthenticatedUserId(req.user);
        if (!currentUserId) {
            return res.status(401).json({ message: "Invalid user session. Please login again." });
        }
        const feedback = await Feedback.find({ userId: currentUserId })
            .populate("canteenId", "canteenName")
            .populate("foodItemId", "name")
            .sort({ createdAt: -1 });
        res.status(200).json({ feedback });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving feedback", error: error.message });
    }
}

// Update own feedback (user)
export async function updateOwnFeedback(req, res) {
    try {
        if (!req.user) return res.status(401).json({ message: "Please login to update feedback" });
        const currentUserId = getAuthenticatedUserId(req.user);
        if (!currentUserId) {
            return res.status(401).json({ message: "Invalid user session. Please login again." });
        }
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: "Feedback not found" });
        if (feedback.userId?.toString() !== currentUserId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const { rating, comment, complaintType } = req.body;
        if (rating !== undefined) feedback.rating = rating;
        if (comment !== undefined) feedback.comment = comment;
        if (complaintType) feedback.complaintType = complaintType;

        await feedback.save();
        res.status(200).json({ message: "Feedback updated", feedback });
    } catch (error) {
        res.status(500).json({ message: "Error updating feedback", error: error.message });
    }
}

// Delete own feedback (user)
export async function deleteOwnFeedback(req, res) {
    try {
        if (!req.user) return res.status(401).json({ message: "Please login to delete feedback" });
        const currentUserId = getAuthenticatedUserId(req.user);
        if (!currentUserId) {
            return res.status(401).json({ message: "Invalid user session. Please login again." });
        }
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: "Feedback not found" });
        if (feedback.userId?.toString() !== currentUserId) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        await Feedback.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Feedback deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting feedback", error: error.message });
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
            const currentUserId = getAuthenticatedUserId(req.user);
            const myCanteen = await Canteen.findOne({ createdBy: currentUserId });
            if (!myCanteen || myCanteen._id.toString() !== feedback.canteenId?.toString()) {
                return res.status(403).json({ message: "Unauthorized access" });
            }
        }

        const { response, status } = req.body;
        if (response !== undefined) feedback.response = response;
        if (status) feedback.status = status;

        await feedback.save();
        res.status(200).json({ message: "Feedback updated successfully", feedback });
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