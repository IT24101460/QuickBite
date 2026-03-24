import mongoose  from "mongoose";

const studentSchema = new mongoose.Schema(
    {
        name: String,
        uniId: String,
        batch: String,
        age: Number,
        phoneNumber: Number,
        email: String
    }
)

const Student = mongoose.model("Student", studentSchema)

export default Student;