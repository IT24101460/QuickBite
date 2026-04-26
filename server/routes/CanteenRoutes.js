import express from "express";
import upload from "../middleware/upload.js";
import {
  createCanteen,
  getAllCanteens,
  getCanteenById,
  getMyCanteen,
  getAllMyCanteens,
  updateCanteen,
  deleteCanteen
} from "../controllers/CanteenController.js";

const canteenRouter = express.Router();

canteenRouter.get("/", getAllCanteens);                                    // GET    /canteens
canteenRouter.get("/my", getMyCanteen);                                    // GET    /canteens/my
canteenRouter.get("/my-all", getAllMyCanteens);                            // GET    /canteens/my-all
canteenRouter.get("/:id", getCanteenById);                                // GET    /canteens/:id
canteenRouter.post("/", upload.single("canteenImage"), createCanteen);    // POST   /canteens  (multipart/form-data)
canteenRouter.put("/:id", upload.single("canteenImage"), updateCanteen);  // PUT    /canteens/:id
canteenRouter.delete("/:id", deleteCanteen);                              // DELETE /canteens/:id

export default canteenRouter;