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
    deleteFeedback,
} from "../controllers/feedbackController.js";

const feedbackRouter = express.Router();

feedbackRouter.post("/", upload.single("complaintImage"), createFeedback); // POST   /feedback
feedbackRouter.get("/", getAllFeedback); // GET /feedback (admin)

// Must be registered before `/:id` so `user` is not captured as `:id`
feedbackRouter.get("/user/my-feedback", getUserFeedback); // GET /feedback/user/my-feedback
feedbackRouter.put("/user/:id", updateOwnFeedback); // PUT /feedback/user/:id
feedbackRouter.delete("/user/:id", deleteOwnFeedback); // DELETE /feedback/user/:id

feedbackRouter.get("/food/:foodItemId", getFeedbackByFoodItem);
feedbackRouter.get("/canteen/:canteenId", getFeedbackByCanteen);
feedbackRouter.put("/:id", updateFeedback); // PUT /feedback/:id (admin / owner reply)
feedbackRouter.delete("/:id", deleteFeedback); // DELETE /feedback/:id (admin)

export default feedbackRouter;
