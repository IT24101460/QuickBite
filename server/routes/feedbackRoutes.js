import express from "express";
import upload from "../middleware/upload.js";
import {
    createFeedback,
    getAllFeedback,
    getFeedbackByFoodItem,
    getFeedbackByCanteen,
    updateFeedback,
    deleteFeedback
} from "../controllers/feedbackController.js";

const feedbackRouter = express.Router();

feedbackRouter.post("/", upload.single("complaintImage"), createFeedback); // POST   /feedback
feedbackRouter.get("/", getAllFeedback);                                    // GET    /feedback (admin)
feedbackRouter.get("/food/:foodItemId", getFeedbackByFoodItem);            // GET    /feedback/food/:foodItemId
feedbackRouter.get("/canteen/:canteenId", getFeedbackByCanteen);           // GET    /feedback/canteen/:canteenId
feedbackRouter.put("/:id", updateFeedback);                                // PUT    /feedback/:id (admin reply/status)
feedbackRouter.delete("/:id", deleteFeedback);                             // DELETE /feedback/:id (admin)

export default feedbackRouter;
