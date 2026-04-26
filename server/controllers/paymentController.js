import Payment from "../models/payment.js";
import Order from "../models/orders.js";
import UserPaymentOption from "../models/userPaymentOption.js";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";
import { recordPaymentOptionUsage } from "./userPaymentController.js";

const stripe = new Stripe("sk_test_51TPmcMQU8ZttTVtjc7VXXWPWWpcINp4LoPL57ozg7fHZHc7UJ5BbYIERo3CDuWmTN60bMbhgB0vZ7NbVsh7tWrsu00PvUKsjSb");

// Create payment for an order
export async function createPayment(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login to make a payment" });
        }

        const { orderId, paymentMethod, paymentOptionId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const userId = req.user._id || req.user.id;
        if (order.userId.toString() !== userId.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Check for existing payment
        const existing = await Payment.findOne({ orderId, paymentStatus: { $in: ["pending", "paid"] } });
        if (existing) {
            return res.status(400).json({ message: "Payment already exists for this order" });
        }

        const paymentProof = req.file ? `/uploads/${req.file.filename}` : "";

        // If paymentOptionId is provided, validate it belongs to the user
        let selectedPaymentMethod = paymentMethod || "cash";
        if (paymentOptionId) {
            const paymentOption = await UserPaymentOption.findById(paymentOptionId);
            if (!paymentOption || paymentOption.isDeleted) {
                return res.status(404).json({ message: "Payment option not found" });
            }

            if (paymentOption.userId.toString() !== userId.toString()) {
                return res.status(403).json({ message: "This payment option does not belong to you" });
            }

            if (!paymentOption.isActive) {
                return res.status(400).json({ message: "This payment option is not active" });
            }

            selectedPaymentMethod = paymentOption.paymentType;

            // Record usage of this payment option
            recordPaymentOptionUsage(paymentOptionId);
        }

        const payment = new Payment({
            orderId,
            userId,
            amount: order.finalAmount || order.totalAmount,
            paymentMethod: selectedPaymentMethod,
            paymentStatus: "pending",
            transactionId: uuidv4(),
            paymentProof,
            paymentOptionId: paymentOptionId || undefined
        });

        await payment.save();

        // Update order to confirmed once payment is initiated
        await Order.findByIdAndUpdate(orderId, { status: "confirmed" });

        res.status(201).json({ message: "Payment initiated successfully", payment });
    } catch (error) {
        res.status(500).json({ message: "Error creating payment", error: error.message });
    }
}

// Get payment by order ID
export async function getPaymentByOrder(req, res) {
    try {
        const payment = await Payment.findOne({ orderId: req.params.orderId })
            .populate("orderId", "queueNumber totalAmount status")
            .populate("userId", "firstName lastName");
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.status(200).json({ payment });
    } catch (error) {
        res.status(500).json({ message: "Error fetching payment", error: error.message });
    }
}

// Get my payments
export async function getMyPayments(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login" });
        }
        const payments = await Payment.find({ userId: req.user._id || req.user.id })
            .populate("orderId", "queueNumber totalAmount status items")
            .sort({ createdAt: -1 });
        res.status(200).json({ payments });
    } catch (error) {
        res.status(500).json({ message: "Error fetching payments", error: error.message });
    }
}

// Get all payments (Admin)
export async function getAllPayments(req, res) {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }
        const filter = {};
        if (req.query.status) filter.paymentStatus = req.query.status;
        const payments = await Payment.find(filter)
            .populate("userId", "firstName lastName uniId")
            .populate("orderId", "queueNumber totalAmount")
            .sort({ createdAt: -1 });
        res.status(200).json({ payments });
    } catch (error) {
        res.status(500).json({ message: "Error fetching payments", error: error.message });
    }
}

// Update payment status (Admin)
export async function updatePaymentStatus(req, res) {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }

        const { paymentStatus } = req.body;
        const valid = ["pending", "paid", "failed", "refunded"];
        if (!valid.includes(paymentStatus)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${valid.join(", ")}` });
        }

        const updateData = { paymentStatus };
        if (req.file) updateData.paymentProof = `/uploads/${req.file.filename}`;

        const payment = await Payment.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.status(200).json({ message: "Payment status updated", payment });
    } catch (error) {
        res.status(500).json({ message: "Error updating payment", error: error.message });
    }
}

// Delete payment record (Admin)
export async function deletePayment(req, res) {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }
        const payment = await Payment.findByIdAndDelete(req.params.id);
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        res.status(200).json({ message: "Payment deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting payment", error: error.message });
    }
}

// Generate Stripe Payment Intent for 3D Secure
export async function createPaymentIntent(req, res) {
    try {
        const { amount, currency = "lkr" } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(amount) * 100), // convert to cents
            currency: currency,
            payment_method_types: ["card"],
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(400).json({ message: "Failed to initialize Stripe", error: error.message });
    }
}
