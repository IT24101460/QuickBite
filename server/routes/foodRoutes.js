import express from "express";
import {
    createFoodItem,
    getFoodItems,
    updateFoodItem,
    deleteFoodItem,
    getFoodItemById
} from "../controllers/foodItemController.js";

const foodRouter = express.Router();

foodRouter.post("/", createFoodItem)
foodRouter.get("/", getFoodItems)
foodRouter.patch("/:id", updateFoodItem)
foodRouter.delete("/:id", deleteFoodItem) 
foodRouter.get("/:id", getFoodItemById)

export default foodRouter;