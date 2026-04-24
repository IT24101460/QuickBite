import FoodItem from "../models/foodItems.js";
import Canteen from "../models/canteen.js";

export async function createFoodItem(req, res) {
    if (!req.user?.isAdmin && req.user?.role !== "owner") {
        return res.status(403).json({ message: "Access denied." });
    }
    try {
        if (req.user?.role === 'owner') {
            const myCanteen = await Canteen.findOne({ createdBy: req.user._id || req.user.id });
            if (!myCanteen) return res.status(400).json({ message: "You don't have a canteen assigned yet!" });
            req.body.canteenId = myCanteen._id; // Lock payload explicitly
        }
        const existing = await FoodItem.findOne({ foodItemId: req.body.foodItemId });
        if (existing) {
            return res.status(400).json({ message: "Food item with this ID already exists" });
        }
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.image || "");
        const newFoodItem = new FoodItem({ ...req.body, image: imageUrl });
        await newFoodItem.save();
        res.status(201).json({ message: "Food item created successfully", foodItem: newFoodItem });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function getFoodItems(req, res) {
    try {
        const filter = {};
        if (req.query.canteenId) filter.canteenId = req.query.canteenId;
        if (req.query.category) filter.category = { $regex: req.query.category, $options: "i" };
        if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };
        const foodItems = await FoodItem.find(filter).populate("canteenId", "canteenName location");
        res.status(200).json({ foodItems });
    } catch (error) {
        res.status(500).json({ message: "Error fetching food items", error: error.message });
    }
}

export async function getFoodItemById(req, res) {
    try {
        const foodItem = await FoodItem.findOne({ foodItemId: req.params.id }).populate("canteenId", "canteenName location");
        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }
        res.status(200).json({ foodItem });
    } catch (error) {
        res.status(500).json({ message: "Error fetching food item", error: error.message });
    }
}

export async function getFoodItemByMongoId(req, res) {
    try {
        const foodItem = await FoodItem.findById(req.params.id).populate("canteenId", "canteenName location");
        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }
        res.status(200).json({ foodItem });
    } catch (error) {
        res.status(500).json({ message: "Error fetching food item", error: error.message });
    }
}

export async function updateFoodItem(req, res) {
    if (!req.user?.isAdmin && req.user?.role !== "owner") {
        return res.status(403).json({ message: "Access denied." });
    }
    try {
        const itemToEdit = await FoodItem.findOne({ foodItemId: req.params.id });
        if (!itemToEdit) return res.status(404).json({ message: "Food item not found" });

        if (req.user?.role === 'owner') {
            const myCanteen = await Canteen.findOne({ createdBy: req.user._id || req.user.id });
            if (itemToEdit.canteenId?.toString() !== myCanteen?._id.toString()) {
                return res.status(403).json({ message: "You can exclusively edit foods inside your canteen." });
            }
            req.body.canteenId = myCanteen._id;
        }
        const updateData = { ...req.body };
        if (req.file) updateData.image = `/uploads/${req.file.filename}`;
        const updated = await FoodItem.findOneAndUpdate(
            { foodItemId: req.params.id },
            updateData,
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Food item not found" });
        res.status(200).json({ message: "Food item updated successfully", foodItem: updated });
    } catch (error) {
        res.status(500).json({ message: "Error updating food item", error: error.message });
    }
}

export async function deleteFoodItem(req, res) {
    if (!req.user?.isAdmin && req.user?.role !== "owner") {
        return res.status(403).json({ message: "Access denied." });
    }
    try {
        const itemToDelete = await FoodItem.findOne({ foodItemId: req.params.id });
        if (!itemToDelete) return res.status(404).json({ message: "Food item not found" });

        if (req.user?.role === 'owner') {
            const myCanteen = await Canteen.findOne({ createdBy: req.user._id || req.user.id });
            if (itemToDelete.canteenId?.toString() !== myCanteen?._id.toString()) {
                return res.status(403).json({ message: "You can exclusively delete foods inside your canteen." });
            }
        }

        const deleted = await FoodItem.findOneAndDelete({ foodItemId: req.params.id });
        if (!deleted) return res.status(404).json({ message: "Food item not found" });
        res.status(200).json({ message: "Food item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting food item", error: error.message });
    }
}
