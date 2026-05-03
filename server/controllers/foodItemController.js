import FoodItem from "../models/foodItems.js";
import Canteen from "../models/Canteen.js";
import { supabase } from "../config/supabase.js";

export async function createFoodItem(req, res) {
    if (!req.user?.isAdmin && req.user?.role !== "owner") {
        return res.status(403).json({ message: "Access denied." });
    }
    try {
        if (req.user?.role === 'owner') {
            if (req.body.canteenId) {
                const canteen = await Canteen.findOne({ _id: req.body.canteenId, createdBy: req.user._id || req.user.id });
                if (!canteen) return res.status(403).json({ message: "You don't own this canteen!" });
            } else {
                const myCanteen = await Canteen.findOne({ createdBy: req.user._id || req.user.id });
                if (!myCanteen) return res.status(400).json({ message: "You don't have a canteen assigned yet!" });
                req.body.canteenId = myCanteen._id; // Lock payload explicitly
            }
        }
        const existing = await FoodItem.findOne({ foodItemId: req.body.foodItemId });
        if (existing) {
            return res.status(400).json({ message: "Food item with this ID already exists" });
        }
        let imageUrl = req.body.image || "";
        if (req.file) {
            const fileName = `food_${req.body.foodItemId}_${Date.now()}`;
            const { data, error } = await supabase.storage
                .from('quickbite-images')
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
            if (error) throw error;
            const { data: publicUrlData } = supabase.storage
                .from('quickbite-images')
                .getPublicUrl(fileName);
            imageUrl = publicUrlData.publicUrl;
        }
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
            const canteen = await Canteen.findById(itemToEdit.canteenId);
            if (!canteen || canteen.createdBy?.toString() !== (req.user._id || req.user.id).toString()) {
                return res.status(403).json({ message: "You can exclusively edit foods inside your canteen." });
            }
        }
        const updateData = { ...req.body };
        if (req.file) {
            const fileName = `food_${req.params.id}_${Date.now()}`;
            const { data, error } = await supabase.storage
                .from('quickbite-images')
                .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
            if (error) throw error;
            const { data: publicUrlData } = supabase.storage
                .from('quickbite-images')
                .getPublicUrl(fileName);
            updateData.image = publicUrlData.publicUrl;
        }
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
            const canteen = await Canteen.findById(itemToDelete.canteenId);
            if (!canteen || canteen.createdBy?.toString() !== (req.user._id || req.user.id).toString()) {
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
