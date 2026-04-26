import express from "express";
import {
    addPaymentOption,
    getUserPaymentOptions,
    getPaymentOption,
    updatePaymentOption,
    setDefaultPaymentOption,
    deletePaymentOption,
    getDefaultPaymentOption,
    getUserPaymentOptionsAdmin,
    verifyPaymentOption
} from "../controllers/userPaymentController.js";

const userPaymentRouter = express.Router();

// User routes (require authentication)
userPaymentRouter.post("/", addPaymentOption);                      // POST   /user-payments - Add new payment option
userPaymentRouter.get("/", getUserPaymentOptions);                  // GET    /user-payments - Get all user payment options
userPaymentRouter.get("/default", getDefaultPaymentOption);         // GET    /user-payments/default - Get default payment option
userPaymentRouter.get("/:id", getPaymentOption);                    // GET    /user-payments/:id - Get specific payment option
userPaymentRouter.patch("/:id", updatePaymentOption);               // PATCH  /user-payments/:id - Update payment option
userPaymentRouter.patch("/:id/set-default", setDefaultPaymentOption); // PATCH /user-payments/:id/set-default - Set as default
userPaymentRouter.post("/:id/verify", verifyPaymentOption);         // POST   /user-payments/:id/verify - Verify payment option
userPaymentRouter.delete("/:id", deletePaymentOption);              // DELETE /user-payments/:id - Delete payment option

// Admin routes
userPaymentRouter.get("/admin/:userId/payment-options", getUserPaymentOptionsAdmin); // GET /user-payments/admin/:userId/payment-options - Admin get user payment options

export default userPaymentRouter;
