import express from "express"
import mongoose from "mongoose"
import userRouter from "./routes/userRoutes.js"
import orderRouter from "./routes/orderRoutes.js"
import authenticate from "./middleware/authenticate.js"

import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const MongodbURI = "mongodb+srv://admin:admin123@cluster0.jo7gf4n.mongodb.net/?appName=Cluster0"
mongoose.connect(MongodbURI).then(
    () => {
        console.log("Connected to MongoDB successfully !!! ")
    }
)


const app = express()

// call functions of Middleware
app.use(express.json()  )
app.use(authenticate)


// Routes
app.use("/users", userRouter)
app.use("/orders", orderRouter)

// Start server
app.listen(
    3000,
     () => {
        console.log(`Server started Successfully`);
        console.log(`Listening on port 3000 `)
    }
)