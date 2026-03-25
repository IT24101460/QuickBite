import Order from "../models/orders.js";
import User from "../models/user.js";

// ─── Place a new order ───────────────────────────────────────────────
export async function placeOrder(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login to place an order" });
        }

        const { items, note } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Order must contain at least one item" });
        }

        const user = await User.findById(req.user._id || req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const totalAmount = items.reduce(
            (sum, item) => sum + item.price * item.quantity, 0
        );

        const newOrder = new Order({
            userId: user._id,
            studentName: `${user.firstName} ${user.lastName}`,
            uniId: user.uniId,
            items,
            totalAmount,
            note: note || ""
        });

        await newOrder.save();

        res.status(201).json({
            message: "Order placed successfully",
            order: newOrder
        });
    } catch (error) {
        res.status(500).json({ message: "Error placing order", error: error.message });
    }
}

// ─── Get orders for the logged-in student ────────────────────────────
export async function getMyOrders(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login to view orders" });
        }

        const orders = await Order.find({ userId: req.user._id || req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
}

// ─── Get a single order by ID ─────────────────────────────────────────
export async function getOrderById(req, res) {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const userId = req.user?._id || req.user?.id;
        if (!req.user?.isAdmin && order.userId.toString() !== userId?.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json({ order });
    } catch (error) {
        res.status(500).json({ message: "Error fetching order", error: error.message });
    }
}

// ─── Update order status (Admin only) ────────────────────────────────
export async function updateOrderStatus(req, res) {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }

        const { status } = req.body;
        const validStatuses = ["pending", "preparing", "ready", "completed", "cancelled"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order status updated", order });
    } catch (error) {
        res.status(500).json({ message: "Error updating order status", error: error.message });
    }
}

// ─── Cancel an order (student cancels own pending order) ──────────────
export async function cancelOrder(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login to cancel an order" });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const userId = req.user._id || req.user.id;
        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only cancel your own orders" });
        }

        if (order.status !== "pending") {
            return res.status(400).json({
                message: "Only pending orders can be cancelled"
            });
        }

        order.status = "cancelled";
        await order.save();

        res.status(200).json({ message: "Order cancelled successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Error cancelling order", error: error.message });
    }
}

// ─── Get ALL orders (Admin queue dashboard) ───────────────────────────
export async function getAllOrders(req, res) {
    try {
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Admin access required" });
        }

        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const orders = await Order.find(filter).sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
}