import CustomOrder from "../models/customOrder.js";
import Canteen from "../models/Canteen.js";
import { supabase } from "../config/supabase.js";

// Create custom order
export async function createCustomOrder(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login to create a custom order" });
        }

        const {
            orderType,
            description,
            specialInstructions,
            budget,
            quantity,
            pickupDate,
            referenceImages,
            estimatedPrice,
            canteenId
        } = req.body;

        // Validation
        if (!orderType || !description || !budget || !pickupDate || !referenceImages) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!Array.isArray(referenceImages) || referenceImages.length === 0) {
            return res.status(400).json({ message: "At least one reference image is required" });
        }

        // Validate pickup date (minimum 3 days from now)
        const minPickupDate = new Date();
        minPickupDate.setDate(minPickupDate.getDate() + 3);
        const pickupDateObj = new Date(pickupDate);

        if (pickupDateObj < minPickupDate) {
            return res.status(400).json({ message: "Pickup date must be at least 3 days from now" });
        }

        // Validate canteen exists
        const canteen = await Canteen.findById(canteenId);
        if (!canteen) {
            return res.status(400).json({ message: "Invalid canteen" });
        }

        const customOrder = new CustomOrder({
            userId: req.user._id || req.user.id,
            orderType,
            description,
            specialInstructions,
            budget: Number(budget),
            quantity: Number(quantity) || 1,
            pickupDate: pickupDateObj,
            referenceImages,
            estimatedPrice: Number(estimatedPrice),
            canteenId
        });

        await customOrder.save();

        res.status(201).json({
            message: "Custom order created successfully",
            customOrder
        });
    } catch (error) {
        console.error("Custom order creation error:", error);
        res.status(500).json({ 
            message: "Error creating custom order", 
            error: error.message 
        });
    }
}

// Get custom orders for user
export async function getUserCustomOrders(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login to view your custom orders" });
        }

        const customOrders = await CustomOrder.find({ 
            userId: req.user._id || req.user.id 
        })
        .populate("canteenId", "canteenName location")
        .sort({ createdAt: -1 });

        res.status(200).json({ customOrders });
    } catch (error) {
        console.error("Error fetching user custom orders:", error);
        res.status(500).json({ 
            message: "Error fetching custom orders", 
            error: error.message 
        });
    }
}

// Get custom orders for canteen owner
export async function getCanteenCustomOrders(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login" });
        }

        // Find canteen owned by this user
        const canteen = await Canteen.findOne({ 
            createdBy: req.user._id || req.user.id 
        });

        if (!canteen) {
            return res.status(403).json({ message: "No canteen found for this owner" });
        }

        const customOrders = await CustomOrder.find({ 
            canteenId: canteen._id 
        })
        .populate("userId", "firstName lastName email")
        .sort({ createdAt: -1 });

        res.status(200).json({ customOrders });
    } catch (error) {
        console.error("Error fetching canteen custom orders:", error);
        res.status(500).json({ 
            message: "Error fetching custom orders", 
            error: error.message 
        });
    }
}

// Update custom order status (canteen owner)
export async function updateCustomOrderStatus(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login" });
        }

        const { status, actualPrice, adminNotes } = req.body;
        const { orderId } = req.params;

        if (!['confirmed', 'in_progress', 'ready', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Find canteen owned by this user
        const canteen = await Canteen.findOne({ 
            createdBy: req.user._id || req.user.id 
        });

        if (!canteen) {
            return res.status(403).json({ message: "No canteen found for this owner" });
        }

        const customOrder = await CustomOrder.findOne({ 
            _id: orderId,
            canteenId: canteen._id 
        });

        if (!customOrder) {
            return res.status(404).json({ message: "Custom order not found" });
        }

        // Update fields
        customOrder.status = status;
        if (adminNotes) customOrder.adminNotes = adminNotes;
        if (actualPrice) customOrder.actualPrice = Number(actualPrice);

        if (status === 'confirmed') {
            customOrder.confirmedAt = new Date();
        } else if (status === 'completed') {
            customOrder.completedAt = new Date();
        }

        await customOrder.save();

        res.status(200).json({
            message: "Custom order status updated successfully",
            customOrder
        });
    } catch (error) {
        console.error("Error updating custom order status:", error);
        res.status(500).json({ 
            message: "Error updating custom order status", 
            error: error.message 
        });
    }
}

// Delete custom order (user)
export async function deleteCustomOrder(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login" });
        }

        const { orderId } = req.params;

        const customOrder = await CustomOrder.findOne({ 
            _id: orderId,
            userId: req.user._id || req.user.id 
        });

        if (!customOrder) {
            return res.status(404).json({ message: "Custom order not found" });
        }

        // Can only delete if status is pending_confirmation
        if (customOrder.status !== 'pending_confirmation') {
            return res.status(400).json({ 
                message: "Cannot delete order that has been confirmed" 
            });
        }

        await CustomOrder.findByIdAndDelete(orderId);

        res.status(200).json({ 
            message: "Custom order deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting custom order:", error);
        res.status(500).json({ 
            message: "Error deleting custom order", 
            error: error.message 
        });
    }
}

// Get all custom orders (admin)
export async function getAllCustomOrders(req, res) {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }

        const customOrders = await CustomOrder.find({})
            .populate("userId", "firstName lastName email")
            .populate("canteenId", "canteenName location")
            .sort({ createdAt: -1 });

        res.status(200).json({ customOrders });
    } catch (error) {
        console.error("Error fetching all custom orders:", error);
        res.status(500).json({ 
            message: "Error fetching custom orders", 
            error: error.message 
        });
    }
}
