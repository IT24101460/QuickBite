import express from "express"
import mongoose from "mongoose"
import studentRouter from "./routes/studentRoutes.js"
import userRouter from "./routes/userRoutes.js"
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


// Test route
app.use("/students", studentRouter )
app.use("/users", userRouter )

// Start server
app.listen(
    3000,
     () => {
        console.log(`Server started Successfully`);
        console.log(`Listening on port 3000 `)
    }
)