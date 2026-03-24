import express from "express"
import { createStudent, getAllStudents } from "../controllers/studentController.js"

const studentRouter = express.Router()

studentRouter.get("/",getAllStudents)

studentRouter.post("/",createStudent)

export default studentRouter
