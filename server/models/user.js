import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        uniId: { type: String, sparse: true },
        phoneNumber: { type: String, required: true },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, required: true, default: false },
        role: { type: String, default: 'student', enum: ['student', 'owner', 'admin', 'lecturer', 'staff'] },
        isBlocked: { type: Boolean, required: true, default: false },
        isEmailVerified: { type: Boolean, required: true, default: false },
        image: { type: String, required: true, default: "https://example.com/default-image.jpg" },
    }
)
const User = mongoose.model("User", userSchema)

export default User;