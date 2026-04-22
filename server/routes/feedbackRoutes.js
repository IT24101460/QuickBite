import express from "express"
import { createFeedback, getAllFeedback } from "../controllers/feedbackController.js"

const feedbackRouter = express.Router()

feedbackRouter.post("/", createFeedback)
feedbackRouter.get("/", getAllFeedback)

export default feedbackRouter;
