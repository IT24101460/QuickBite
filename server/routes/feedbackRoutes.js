import express from "express";
import upload from "../middleware/upload.js";
import {
    createFeedback,
    getAllFeedback,
    getFeedbackByFoodItem,
    getFeedbackByCanteen,
    getUserFeedback,
    updateOwnFeedback,
    deleteOwnFeedback,
    updateFeedback,
    deleteFeedback
} from "../controllers/feedbackController.js";

const feedbackRouter = express.Router();

feedbackRouter.post("/", upload.single("complaintImage"), createFeedback); // POST   /feedback
feedbackRouter.get("/", getAllFeedback);                                    // GET    /feedback (admin)
feedbackRouter.get("/food/:foodItemId", getFeedbackByFoodItem);            // GET    /feedback/food/:foodItemId
feedbackRouter.get("/canteen/:canteenId", getFeedbackByCanteen);           // GET    /feedback/canteen/:canteenId

// User endpoints
feedbackRouter.get("/user/my-feedback", getUserFeedback);                 // GET    /feedback/user/my-feedback
feedbackRouter.put("/user/:id", updateOwnFeedback);                       // PUT    /feedback/user/:id (user edits own feedback)
feedbackRouter.delete("/user/:id", deleteOwnFeedback);                    // DELETE /feedback/user/:id (user deletes own feedback)
feedbackRouter.put("/:id", updateFeedback);                                // PUT    /feedback/:id (admin reply/status)
feedbackRouter.delete("/:id", deleteFeedback);                             // DELETE /feedback/:id (admin)

export default feedbackRouter;