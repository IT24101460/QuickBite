import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

import userRouter from "./routes/userRoutes.js"
import orderRouter from "./routes/orderRoutes.js"
import foodRouter from "./routes/foodRoutes.js"
import feedbackRouter from "./routes/feedbackRoutes.js"
import promotionsRouter from "./routes/promotionsRoutes.js"
import canteenRouter from "./routes/CanteenRoutes.js"
import paymentRouter from "./routes/paymentRoutes.js"
import reportRouter from "./routes/reportRoutes.js"
import userPaymentRouter from "./routes/userPaymentRoutes.js"
import authenticate from "./middleware/authenticate.js"

import dns from "node:dns"
dns.setServers(["1.1.1.1", "8.8.8.8"])

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MongodbURI = "mongodb+srv://admin:admin123@cluster0.jo7gf4n.mongodb.net/?appName=Cluster0"
mongoose.connect(MongodbURI).then(
    () => {
        console.log("Connected to MongoDB successfully !!! ")
    }
).catch((error) => {
    console.log("MongoDB connection error:", error.message)
})

const app = express()

// CORS configuration
app.use(cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

// Middleware
app.use(express.json())

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Public routes
app.use("/users", userRouter)

// Auth-protected routes
app.use(authenticate)
app.use("/orders", orderRouter)
app.use("/foods", foodRouter)
app.use("/feedback", feedbackRouter)
app.use("/promotions", promotionsRouter)
app.use("/canteens", canteenRouter)
app.use("/payments", paymentRouter)
app.use("/reports", reportRouter)
app.use("/user-payments", userPaymentRouter)

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is running" })
})

// Start server
app.listen(
    3000,
    () => {
        console.log(`Server started Successfully`)
        console.log(`Listening on port 3000`)
    }
)