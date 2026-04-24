import Promotions from "../models/promotions.js";
import Canteen from "../models/canteen.js";

// ─── Create a new promotion (Admin only) ──────────────────────────────
export async function createPromotion(req, res) {
    try {
        if (!req.user?.isAdmin && req.user?.role !== "owner") {
            return res.status(403).json({ message: "Access required" });
        }

        if (req.user?.role === 'owner') {
            const myCanteen = await Canteen.findOne({ createdBy: req.user._id || req.user.id });
            if (!myCanteen) return res.status(400).json({ message: "No assigned canteen found" });
            req.body.canteenId = myCanteen._id;
        }

        const { title, description, discountType, discountValue, applicableTo, foodItems, canteenId, startDate, endDate } = req.body;

        if (!title || !description || !discountType || discountValue == null || !startDate || !endDate) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (discountType === "percentage" && (discountValue <= 0 || discountValue > 100)) {
            return res.status(400).json({ message: "Percentage discount must be between 1 and 100" });
        }

        if (discountType === "fixed" && discountValue <= 0) {
            return res.status(400).json({ message: "Fixed discount value must be greater than 0" });
        }

        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: "End date must be after start date" });
        }

        const bannerImage = req.file ? `/uploads/${req.file.filename}` : (req.body.bannerImage || "");

        const promotion = new Promotions({
            title,
            description,
            bannerImage,
            discountType,
            discountValue,
            applicableTo: applicableTo || "all",
            foodItems: applicableTo === "specific" ? (foodItems || []) : [],
            canteenId: canteenId || null,
            startDate,
            endDate
        });

        await promotion.save();
        res.status(201).json({ message: "Promotion created successfully", promotion });
    } catch (error) {
        res.status(500).json({ message: "Error creating promotion", error: error.message });
    }
}

// ─── Get all promotions ────────────────────────────────────────────────
export async function getAllPromotions(req, res) {
    try {
        let filter = {};
        if (!req.user?.isAdmin && req.user?.role !== "owner") {
            const now = new Date();
            filter = { isActive: true, startDate: { $lte: now }, endDate: { $gte: now } };
        } else if (req.user?.role === 'owner') {
            const myCanteen = await Canteen.findOne({ createdBy: req.user._id || req.user.id });
            if (myCanteen) filter.canteenId = myCanteen._id;
        }
        const promotions = await Promotions.find(filter)
            .populate("foodItems", "name price category image")
            .populate("canteenId", "canteenName")
            .sort({ createdAt: -1 });
        res.status(200).json({ promotions });
    } catch (error) {
        res.status(500).json({ message: "Error fetching promotions", error: error.message });
    }
}

// ─── Get single promotion by ID ────────────────────────────────────────
export async function getPromotionById(req, res) {
    try {
        const promotion = await Promotions.findById(req.params.id)
            .populate("foodItems", "name price category image")
            .populate("canteenId", "canteenName");
        if (!promotion) return res.status(404).json({ message: "Promotion not found" });
        res.status(200).json({ promotion });
    } catch (error) {
        res.status(500).json({ message: "Error fetching promotion", error: error.message });
    }
}

// ─── Update a promotion (Admin only) ──────────────────────────────────
export async function updatePromotion(req, res) {
    try {
        if (!req.user?.isAdmin && req.user?.role !== "owner") {
            return res.status(403).json({ message: "Access required" });
        }

        const promotionToVerify = await Promotions.findById(req.params.id);
        if (!promotionToVerify) return res.status(404).json({ message: "Not found" });

        if (req.user?.role === 'owner') {
            const myCanteen = await Canteen.findOne({ createdBy: req.user._id || req.user.id });
            if (promotionToVerify.canteenId?.toString() !== myCanteen?._id.toString()) {
                return res.status(403).json({ message: "You can exclusively edit your own canteen promotions" });
            }
            req.body.canteenId = myCanteen._id;
        }

        const { startDate, endDate, applicableTo, foodItems } = req.body;

        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: "End date must be after start date" });
        }

        const updateData = { ...req.body };
        if (req.file) updateData.bannerImage = `/uploads/${req.file.filename}`;
        if (applicableTo === "all") updateData.foodItems = [];
        else if (applicableTo === "specific") updateData.foodItems = foodItems || [];

        const promotion = await Promotions.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        }).populate("foodItems", "name price category");

        if (!promotion) return res.status(404).json({ message: "Promotion not found" });
        res.status(200).json({ message: "Promotion updated successfully", promotion });
    } catch (error) {
        res.status(500).json({ message: "Error updating promotion", error: error.message });
    }
}

// ─── Toggle promotion active status (Admin only) ───────────────────────
export async function togglePromotionStatus(req, res) {
    try {
        if (!req.user?.isAdmin && req.user?.role !== "owner") {
            return res.status(403).json({ message: "Access required" });
        }
        const promotion = await Promotions.findById(req.params.id);
        if (!promotion) return res.status(404).json({ message: "Promotion not found" });

        if (req.user?.role === 'owner') {
            const myCanteen = await Canteen.findOne({ createdBy: req.user._id || req.user.id });
            if (promotion.canteenId?.toString() !== myCanteen?._id.toString()) {
                return res.status(403).json({ message: "You can exclusively edit your own canteen promotions" });
            }
        }
        promotion.isActive = !promotion.isActive;
        await promotion.save();
        res.status(200).json({
            message: `Promotion ${promotion.isActive ? "activated" : "deactivated"} successfully`,
            promotion
        });
    } catch (error) {
        res.status(500).json({ message: "Error toggling promotion status", error: error.message });
    }
}

// ─── Delete a promotion (Admin only) ──────────────────────────────────
export async function deletePromotion(req, res) {
    try {
        if (!req.user?.isAdmin && req.user?.role !== "owner") {
            return res.status(403).json({ message: "Access required" });
        }
        const promotionVerify = await Promotions.findById(req.params.id);
        if (!promotionVerify) return res.status(404).json({ message: "Not found" });

        if (req.user?.role === 'owner') {
            const myCanteen = await Canteen.findOne({ createdBy: req.user._id || req.user.id });
            if (promotionVerify.canteenId?.toString() !== myCanteen?._id.toString()) {
                return res.status(403).json({ message: "You can exclusively delete your own canteen promotions" });
            }
        }
        const promotion = await Promotions.findByIdAndDelete(req.params.id);
        if (!promotion) return res.status(404).json({ message: "Promotion not found" });
        res.status(200).json({ message: "Promotion deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting promotion", error: error.message });
    }
}

// ─── Apply a promotion to a cart ──────────────────────────────────────
export async function applyPromotion(req, res) {
    try {
        const { promotionId, cartItems, cartTotal } = req.body;

        if (!promotionId || cartTotal == null) {
            return res.status(400).json({ message: "promotionId and cartTotal are required" });
        }

        const now = new Date();
        const promotion = await Promotions.findOne({
            _id: promotionId,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).populate("foodItems", "_id");

        if (!promotion) {
            return res.status(404).json({ message: "Promotion not found or has expired" });
        }

        if (promotion.applicableTo === "specific" && cartItems?.length > 0) {
            const applicableIds = promotion.foodItems.map(f => f._id.toString());
            const hasMatch = cartItems.some(item => applicableIds.includes(item.foodItemId?.toString()));
            if (!hasMatch) {
                return res.status(400).json({ message: "None of your cart items qualify for this promotion" });
            }
        }

        let discountAmount = 0;
        if (promotion.discountType === "percentage") {
            discountAmount = (cartTotal * promotion.discountValue) / 100;
        } else {
            discountAmount = Math.min(promotion.discountValue, cartTotal);
        }

        const finalTotal = parseFloat((cartTotal - discountAmount).toFixed(2));

        res.status(200).json({
            message: "Promotion applied successfully",
            originalTotal: cartTotal,
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            finalTotal,
            promotion: { title: promotion.title, discountType: promotion.discountType, discountValue: promotion.discountValue }
        });
    } catch (error) {
        res.status(500).json({ message: "Error applying promotion", error: error.message });
    }
}
