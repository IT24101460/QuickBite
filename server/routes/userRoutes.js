import express from "express"
import { createUser, loginUser, uploadProfilePic, updateUserDetails, createOwner, getOwners } from "../controllers/userController.js"
import upload from "../middleware/upload.js"
import authenticate from "../middleware/authenticate.js"

const userRouter = express.Router()

userRouter.post("/", createUser)
userRouter.post("/login", loginUser)
userRouter.post("/create-owner", authenticate, createOwner)
userRouter.get("/owners", authenticate, getOwners)
userRouter.put("/:id/profile-pic", authenticate, upload.single('image'), uploadProfilePic)
userRouter.put("/:id", authenticate, updateUserDetails)

export default userRouter;
