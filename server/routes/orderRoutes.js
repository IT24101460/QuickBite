import express from "express";
import {
    placeOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getAllOrders
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// Student routes
orderRouter.post("/", placeOrder);                        // POST   /orders        — place order
orderRouter.get("/my", getMyOrders);                      // GET    /orders/my     — my order history
orderRouter.get("/:id", getOrderById);                    // GET    /orders/:id    — single order (queue screen)
orderRouter.patch("/:id/cancel", cancelOrder);            // PATCH  /orders/:id/cancel

// Admin routes
orderRouter.get("/", getAllOrders);                       // GET    /orders?status=preparing
orderRouter.patch("/:id/status", updateOrderStatus);      // PATCH  /orders/:id/status

export default orderRouter;