import FoodItem from "../models/foodItems.js";

export async function createFoodItem(req, res) {
    // Implementation for creating a new food item
    if (req.user==null) {
        return res.status(401).json({ message: "Unauthorized" })
        
    }

    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied , Only admins can create food items" });
    }

    try {
        const existingItem = await FoodItem.findOne({ foodItemId: req.body.foodItemId })

        if (existingItem !=null) {
            return res.status(400).json({ message: "Food item with this ID already exists" });
        }
        const newFoodItem = new FoodItem(req.body);
        await newFoodItem.save();
        res.status(201).json({ message: "Food item created successfully", foodItem: newFoodItem });
    } catch (error) {
        res.status(500).json({ message:error.message });
    }
}

export async function getFoodItems(req, res) {
    try {
        const foodItems = await FoodItem.find();
        res.status(200).json({ foodItems });
    } catch (error) {
        res.status(500).json({ message: "Error fetching food items", error: error.message });
    }
}

export async function updateFoodItem(req, res) {
    if (req.user==null) {
        return res.status(401).json({ message: "Unauthorized" })
        
    }

    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied , Only admins can update food items" });
    }

    try {
        const updatedFoodItem = await FoodItem.findOneAndUpdate({ foodItemId: req.params.id }, req.body, { new: true });
        if (!updatedFoodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }
        res.status(200).json({ message: "Food item updated successfully", foodItem: updatedFoodItem });
    } catch (error) {
        res.status(500).json({ message: "Error updating food item", error: error.message });
    }
}

export async function deleteFoodItem(req, res) {
    if (req.user==null) {
        return res.status(401).json({ message: "Unauthorized" })
        
    }

    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied , Only admins can delete food items" });
    }

    try {
        const deletedFoodItem = await FoodItem.findOneAndDelete({ foodItemId: req.params.id });
        if (!deletedFoodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }
        res.status(200).json({ message: "Food item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting food item", error: error.message });
    }
}

export async function getFoodItemById(req, res) {
    try {
        const foodItem = await FoodItem.findOne({ foodItemId: req.params.id });
        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }
        res.status(200).json({ foodItem });
    } catch (error) {
        res.status(500).json({ message: "Error fetching food item", error: error.message });
    }
}

