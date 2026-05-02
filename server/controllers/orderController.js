import Order from "../models/orders.js";
import User from "../models/user.js";
import Canteen from "../models/Canteen.js";
import FoodItem from "../models/foodItems.js";

const STATUS_MESSAGES = {
    pending: "Your order is waiting for the canteen to accept it.",
    confirmed: "Your order has been confirmed.",
    preparing: "Your order is now being prepared.",
    ready: "Your order is ready for pickup.",
    completed: "Your order has been completed.",
    cancelled: "Your order was cancelled.",
};

async function attachItemCategories(orders) {
    const list = Array.isArray(orders) ? orders : [orders];
    const foodIds = [
        ...new Set(
            list.flatMap(order =>
                (order.items || [])
                    .filter(item => !item.category || item.category === "General")
                    .map(item => item.foodItemId)
                    .filter(Boolean)
            )
        )
    ];

    if (foodIds.length === 0) {
        return Array.isArray(orders) ? orders : orders;
    }

    const foods = await FoodItem.find({
        $or: [
            { foodItemId: { $in: foodIds } },
            { _id: { $in: foodIds.filter(id => id?.match?.(/^[0-9a-fA-F]{24}$/)) } }
        ]
    }).select("foodItemId category").lean();

    const categoryById = new Map();
    foods.forEach(food => {
        categoryById.set(String(food.foodItemId), food.category || "General");
        categoryById.set(String(food._id), food.category || "General");
    });

    const enriched = list.map(order => {
        const plainOrder = order.toObject ? order.toObject() : order;
        return {
            ...plainOrder,
            items: (plainOrder.items || []).map(item => ({
                ...item,
                category: categoryById.get(String(item.foodItemId)) || item.category || "General"
            }))
        };
    });

    return Array.isArray(orders) ? enriched : enriched[0];
}

// ─── Place a new order ───────────────────────────────────────────────
export async function placeOrder(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Please login to place an order" });
        }

        const { items, note, pickupTime, promotionId, discountAmount, canteenId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Order must contain at least one item" });
        }

        const user = await User.findById(req.user._id || req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const foodIds = [...new Set(items.map(item => item.foodItemId).filter(Boolean))];
        const foods = await FoodItem.find({
            $or: [
                { foodItemId: { $in: foodIds } },
                { _id: { $in: foodIds.filter(id => id?.match?.(/^[0-9a-fA-F]{24}$/)) } }
            ]
        }).select("foodItemId category").lean();

        const categoryById = new Map();
        foods.forEach(food => {
            categoryById.set(String(food.foodItemId), food.category || "General");
            categoryById.set(String(food._id), food.category || "General");
        });

        const orderItems = items.map(item => ({
            ...item,
            category: categoryById.get(String(item.foodItemId)) || item.category || "General"
        }));

        const totalAmount = orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity, 0
        );

        const discount = parseFloat(discountAmount) || 0;
        const finalAmount = parseFloat((totalAmount - discount).toFixed(2));
        const requestImage = req.file ? `/uploads/${req.file.filename}` : "";

        const newOrder = new Order({
            userId: user._id,
            studentName: `${user.firstName} ${user.lastName}`,
            uniId: user.uniId,
            canteenId: canteenId || null,
            items: orderItems,
            totalAmount,
            discountAmount: discount,
            finalAmount,
            promotionId: promotionId || null,
            pickupTime: pickupTime || "",
            requestImage,
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

        res.status(200).json({ orders: await attachItemCategories(orders) });
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

        res.status(200).json({ order: await attachItemCategories(order) });
    } catch (error) {
        res.status(500).json({ message: "Error fetching order", error: error.message });
    }
}

// ─── Update order status (Admin only) ────────────────────────────────
export async function updateOrderStatus(req, res) {
    try {
        if (!req.user?.isAdmin && req.user?.role !== "owner") {
            return res.status(403).json({ message: "Access required" });
        }

        const preOrder = await Order.findById(req.params.id);
        if (!preOrder) return res.status(404).json({ message: "Order not found" });

        if (req.user?.role === 'owner') {
            const canteen = await Canteen.findById(preOrder.canteenId);
            if (!canteen || canteen.createdBy?.toString() !== (req.user._id || req.user.id).toString()) {
                return res.status(403).json({ message: "You can't update queues outside your canteen" });
            }
        }

        const { status } = req.body;
        const validStatuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
            });
        }

        preOrder.status = status;
        preOrder.lastStatusMessage = STATUS_MESSAGES[status] || `Your order status changed to ${status}.`;
        preOrder.statusUpdatedAt = new Date();
        preOrder.statusHistory.push({
            status,
            message: preOrder.lastStatusMessage,
            updatedBy: req.user._id || req.user.id,
            updatedByRole: req.user.role || (req.user.isAdmin ? "admin" : ""),
        });

        const order = await preOrder.save();

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Order status updated and customer will see the latest status",
            notification: preOrder.lastStatusMessage,
            order,
        });
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
        if (!req.user?.isAdmin && req.user?.role !== "owner") {
            return res.status(403).json({ message: "Access required" });
        }

        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.user?.role === 'owner') {
            if (req.query.canteenId) {
                const canteen = await Canteen.findOne({ _id: req.query.canteenId, createdBy: req.user._id || req.user.id });
                if (canteen) filter.canteenId = canteen._id;
            } else {
                const myCanteen = await Canteen.findOne({ createdBy: req.user._id || req.user.id });
                if (myCanteen) filter.canteenId = myCanteen._id;
            }
        }

        const orders = await Order.find(filter).sort({ createdAt: -1 });

        res.status(200).json({ orders: await attachItemCategories(orders) });
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
}
