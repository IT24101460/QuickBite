import Student from "../models/student.js"

export function getAllStudents(req, res) {
    Student.find().then(
        (students) => {
            res.json(students)
        }
    )
}
export function createStudent(req, res) {

    console.log(req.user)

    const newStudent = new Student(req.body) 
    newStudent.save().then( 
        ()=> {
            res.json({"message": "Student created successfully", "student": newStudent})
        }
    )
}
