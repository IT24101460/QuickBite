import Order from "../models/orders.js";
import Feedback from "../models/feedback.js";
import Canteen from "../models/canteen.js";

export async function getOwnerStats(req, res) {
    try {
        if (req.user?.role !== 'owner') {
            return res.status(403).json({ message: "Owners only" });
        }

        const myCanteen = await Canteen.findOne({ createdBy: req.user._id || req.user.id });
        if (!myCanteen) return res.status(404).json({ message: "No canteen found" });

        const canteenId = myCanteen._id;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // 1. Orders and Revenue
        const todayOrders = await Order.find({
            canteenId: canteenId,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const ordersCount = todayOrders.length;
        const revenueToday = todayOrders.reduce((sum, order) => sum + (order.finalAmount || 0), 0);

        // 2. Average Rating
        const allFeedback = await Feedback.find({ canteenId: canteenId });
        let avgRating = 5.0; // Assume 5.0 if no ratings
        if (allFeedback.length > 0) {
            const sumRatings = allFeedback.reduce((sum, f) => sum + (f.rating || 5), 0);
            avgRating = (sumRatings / allFeedback.length).toFixed(1);
        }

        res.status(200).json({
            stats: {
                ordersToday: ordersCount,
                revenueToday: revenueToday,
                rating: avgRating
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error calculating stats", error: error.message });
    }
}
