import Promotions from "../models/promotions.js";
import Canteen from "../models/Canteen.js";
import { supabase } from "../config/supabase.js";

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

        // Required fields validation
        if (!title || !description || !discountType || discountValue == null || !startDate || !endDate) {
            return res.status(400).json({ message: "Missing required fields: title, description, discountType, discountValue, startDate, endDate" });
        }

        // Title validation
        if (title.length < 3 || title.length > 100) {
            return res.status(400).json({ message: "Title must be between 3 and 100 characters" });
        }

        // Description validation
        if (description.length < 10 || description.length > 500) {
            return res.status(400).json({ message: "Description must be between 10 and 500 characters" });
        }

        // Discount type validation
        if (!["percentage", "fixed"].includes(discountType)) {
            return res.status(400).json({ message: "Invalid discount type. Must be 'percentage' or 'fixed'" });
        }

        // Discount value validation
        if (discountType === "percentage") {
            if (discountValue <= 0 || discountValue > 100) {
                return res.status(400).json({ message: "Percentage discount must be between 1 and 100" });
            }
        } else if (discountType === "fixed") {
            if (discountValue <= 0 || discountValue > 10000) {
                return res.status(400).json({ message: "Fixed discount must be between 1 and 10000" });
            }
        }

        // Date validation
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        
        if (start >= end) {
            return res.status(400).json({ message: "End date must be after start date" });
        }
        
        if (start < now) {
            return res.status(400).json({ message: "Start date cannot be in the past" });
        }
        
        // Maximum duration validation (30 days)
        const durationMs = end - start;
        const durationDays = durationMs / (1000 * 60 * 60 * 24);
        if (durationDays > 30) {
            return res.status(400).json({ message: "Promotion duration cannot exceed 30 days" });
        }

        // ApplicableTo validation
        if (applicableTo && !["all", "specific"].includes(applicableTo)) {
            return res.status(400).json({ message: "Invalid applicableTo value. Must be 'all' or 'specific'" });
        }

        // Food items validation for specific promotions
        if (applicableTo === "specific" && (!foodItems || foodItems.length === 0)) {
            return res.status(400).json({ message: "At least one food item must be selected when applicableTo is 'specific'" });
        }

        let bannerImage = req.body.bannerImage || "";
        if (req.file) {
            const fileName = `promo_${Date.now()}`;
            const { data, error } = await supabase.storage
                .from('quickbite-images')
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
            if (error) throw error;
            const { data: publicUrlData } = supabase.storage
                .from('quickbite-images')
                .getPublicUrl(fileName);
            bannerImage = publicUrlData.publicUrl;
        }

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

        const { title, description, discountType, discountValue, startDate, endDate, applicableTo, foodItems } = req.body;

        // Title validation (if provided)
        if (title && (title.length < 3 || title.length > 100)) {
            return res.status(400).json({ message: "Title must be between 3 and 100 characters" });
        }

        // Description validation (if provided)
        if (description && (description.length < 10 || description.length > 500)) {
            return res.status(400).json({ message: "Description must be between 10 and 500 characters" });
        }

        // Discount value validation (if provided)
        if (discountType && discountValue !== undefined) {
            if (discountType === "percentage") {
                if (discountValue <= 0 || discountValue > 100) {
                    return res.status(400).json({ message: "Percentage discount must be between 1 and 100" });
                }
            } else if (discountType === "fixed") {
                if (discountValue <= 0 || discountValue > 10000) {
                    return res.status(400).json({ message: "Fixed discount must be between 1 and 10000" });
                }
            }
        }

        // Date validation (if provided)
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const now = new Date();
            
            if (start >= end) {
                return res.status(400).json({ message: "End date must be after start date" });
            }
            
            if (start < now) {
                return res.status(400).json({ message: "Start date cannot be in the past" });
            }
            
            // Maximum duration validation (30 days)
            const durationMs = end - start;
            const durationDays = durationMs / (1000 * 60 * 60 * 24);
            if (durationDays > 30) {
                return res.status(400).json({ message: "Promotion duration cannot exceed 30 days" });
            }
        }

        // ApplicableTo validation (if provided)
        if (applicableTo && !["all", "specific"].includes(applicableTo)) {
            return res.status(400).json({ message: "Invalid applicableTo value. Must be 'all' or 'specific'" });
        }

        // Food items validation for specific promotions
        if (applicableTo === "specific" && (!foodItems || foodItems.length === 0)) {
            return res.status(400).json({ message: "At least one food item must be selected when applicableTo is 'specific'" });
        }

        const updateData = { ...req.body };
        if (req.file) {
            const fileName = `promo_${req.params.id}_${Date.now()}`;
            const { data, error } = await supabase.storage
                .from('quickbite-images')
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
            if (error) throw error;
            const { data: publicUrlData } = supabase.storage
                .from('quickbite-images')
                .getPublicUrl(fileName);
            updateData.bannerImage = publicUrlData.publicUrl;
        }
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

        // Cart total validation
        if (cartTotal <= 0) {
            return res.status(400).json({ message: "Cart total must be greater than 0" });
        }

        // Cart items validation
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart must contain at least one item" });
        }

        // Validate cart items structure
        for (const item of cartItems) {
            if (!item.foodItemId) {
                return res.status(400).json({ message: "Each cart item must have a foodItemId" });
            }
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
            if (!promotion.foodItems || promotion.foodItems.length === 0) {
                return res.status(400).json({ message: "Promotion has no applicable food items configured" });
            }
            
            const applicableIds = promotion.foodItems.map(f => f._id.toString());
            const hasMatch = cartItems.some(item => applicableIds.includes(item.foodItemId?.toString()));
            if (!hasMatch) {
                return res.status(400).json({ message: "None of your cart items qualify for this promotion" });
            }
        }

        let discountAmount = 0;
        if (promotion.discountType === "percentage") {
            discountAmount = (cartTotal * promotion.discountValue) / 100;
            // Ensure discount doesn't exceed cart total
            discountAmount = Math.min(discountAmount, cartTotal);
        } else {
            discountAmount = Math.min(promotion.discountValue, cartTotal);
        }

        // Ensure final total is not negative
        const finalTotal = parseFloat((cartTotal - discountAmount).toFixed(2));
        if (finalTotal < 0) {
            return res.status(400).json({ message: "Invalid discount calculation" });
        }

        // Maximum discount validation
        if (discountAmount > cartTotal) {
            return res.status(400).json({ message: "Discount cannot exceed cart total" });
        }

        res.status(200).json({
            message: "Promotion applied successfully",
            originalTotal: cartTotal,
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            finalTotal,
            promotion: {
                _id: promotion._id,
                title: promotion.title,
                discountType: promotion.discountType,
                discountValue: promotion.discountValue
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error applying promotion", error: error.message });
    }
}
