import express from "express";
import authenticate from "../middleware/authenticate.js";
import { getOwnerStats } from "../controllers/reportController.js";

const reportRouter = express.Router();

// Get Live Dashboard Metrics specific to an Owner's Canteen
reportRouter.get("/owner-stats", authenticate, getOwnerStats);

export default reportRouter;
