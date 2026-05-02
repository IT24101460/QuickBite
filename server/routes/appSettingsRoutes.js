import express from "express";
import upload from "../middleware/upload.js";
import { getBranding, updateBranding } from "../controllers/appSettingsController.js";

const appSettingsRouter = express.Router();

appSettingsRouter.get("/branding", getBranding);
appSettingsRouter.put("/branding", upload.single("logo"), updateBranding);

export default appSettingsRouter;
