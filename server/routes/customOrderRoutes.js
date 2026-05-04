import express from "express";
import upload from "../middleware/upload.js";
import {
    createCustomOrder,
    getUserCustomOrders,
    getCanteenCustomOrders,
    updateCustomOrderStatus,
    deleteCustomOrder,
    getAllCustomOrders
} from "../controllers/customOrderController.js";

const router = express.Router();

// User routes
router.post("/", upload.array("referenceImages", 3), createCustomOrder); // Create custom order
router.get("/user", getUserCustomOrders); // Get user's custom orders
router.delete("/:orderId", deleteCustomOrder); // Delete custom order

// Canteen owner routes
router.get("/canteen", getCanteenCustomOrders); // Get canteen's custom orders
router.patch("/:orderId/status", updateCustomOrderStatus); // Update custom order status

// Admin routes
router.get("/", getAllCustomOrders); // Get all custom orders (admin)

export default router;
