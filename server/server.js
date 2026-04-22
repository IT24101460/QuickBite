import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import userRouter from "./routes/userRoutes.js"
import orderRouter from "./routes/orderRoutes.js"
import foodRouter from "./routes/foodRoutes.js"
import feedbackRouter from "./routes/feedbackRoutes.js"
import authenticate from "./middleware/authenticate.js"

import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

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
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

// Middleware
app.use(express.json())

// Routes (login and signup don't need authentication)
app.use("/users", userRouter)

// Apply authentication middleware for protected routes
app.use(authenticate)
app.use("/orders", orderRouter)
app.use("/foods", foodRouter)
app.use("/feedback", feedbackRouter)

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is running" })
})

// Start server
app.listen(
    3000,
     () => {
        console.log(`Server started Successfully`);
        console.log(`Listening on port 3000 `)
    }
)