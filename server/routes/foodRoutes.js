import express from "express";
import upload from "../middleware/upload.js";
import {
    createFoodItem,
    getFoodItems,
    getFoodItemById,
    getFoodItemByMongoId,
    updateFoodItem,
    deleteFoodItem
} from "../controllers/foodItemController.js";

const foodRouter = express.Router();

foodRouter.get("/", getFoodItems);                                          // GET  /foods?canteenId=&category=&search=
foodRouter.get("/id/:id", getFoodItemByMongoId);                           // GET  /foods/id/:mongoId
foodRouter.get("/:id", getFoodItemById);                                   // GET  /foods/:foodItemId
foodRouter.post("/", upload.single("image"), createFoodItem);              // POST /foods  (multipart/form-data)
foodRouter.patch("/:id", upload.single("image"), updateFoodItem);          // PATCH /foods/:foodItemId
foodRouter.delete("/:id", deleteFoodItem);                                 // DELETE /foods/:foodItemId

export default foodRouter;