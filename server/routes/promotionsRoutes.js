import express from "express";
import upload from "../middleware/upload.js";
import {
    createPromotion,
    getAllPromotions,
    getPromotionById,
    updatePromotion,
    togglePromotionStatus,
    deletePromotion,
    applyPromotion
} from "../controllers/promotionsController.js";

const promotionsRouter = express.Router();

promotionsRouter.get("/", getAllPromotions);                                                   // GET    /promotions
promotionsRouter.get("/:id", getPromotionById);                                               // GET    /promotions/:id
promotionsRouter.post("/apply", applyPromotion);                                              // POST   /promotions/apply
promotionsRouter.post("/", upload.single("bannerImage"), createPromotion);                    // POST   /promotions
promotionsRouter.put("/:id", upload.single("bannerImage"), updatePromotion);                  // PUT    /promotions/:id
promotionsRouter.patch("/:id/toggle", togglePromotionStatus);                                 // PATCH  /promotions/:id/toggle
promotionsRouter.delete("/:id", deletePromotion);                                             // DELETE /promotions/:id

export default promotionsRouter;
