import express from "express";
import upload from "../middleware/upload.js";
import {
    placeOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getAllOrders,
    verifyPayment
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// User routes
orderRouter.post("/", upload.fields([
    { name: "requestImage", maxCount: 1 },
    { name: "bankSlip", maxCount: 1 }
]), placeOrder);  // POST   /orders
orderRouter.get("/my", getMyOrders);                               // GET    /orders/my
orderRouter.patch("/:id/cancel", cancelOrder);                     // PATCH  /orders/:id/cancel

// Admin routes
orderRouter.get("/", getAllOrders);                                // GET    /orders?status=
orderRouter.patch("/:id/status", updateOrderStatus);              // PATCH  /orders/:id/status
orderRouter.patch("/:id/verify-payment", verifyPayment);          // PATCH  /orders/:id/verify-payment
orderRouter.get("/:id", getOrderById);                            // GET    /orders/:id

export default orderRouter;