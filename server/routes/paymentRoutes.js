import express from "express";
import upload from "../middleware/upload.js";
import {
    createPayment,
    getPaymentByOrder,
    getMyPayments,
    getAllPayments,
    updatePaymentStatus,
    deletePayment,
    createPaymentIntent
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-intent", createPaymentIntent);                      // POST   /payments/create-intent (Stripe 3DS)
paymentRouter.post("/", upload.single("paymentProof"), createPayment);           // POST   /payments  (with optional proof image)
paymentRouter.get("/my", getMyPayments);                                          // GET    /payments/my
paymentRouter.get("/order/:orderId", getPaymentByOrder);                          // GET    /payments/order/:orderId
paymentRouter.get("/", getAllPayments);                                            // GET    /payments (admin)
paymentRouter.patch("/:id/status", upload.single("paymentProof"), updatePaymentStatus); // PATCH  /payments/:id/status
paymentRouter.delete("/:id", deletePayment);                                      // DELETE /payments/:id (admin)

export default paymentRouter;
