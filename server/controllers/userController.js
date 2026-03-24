import User from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export async function createUser(req,res){

    try{
        const user = await User.findOne({email:req.body.email})
        if(user!=null){
            res.status(400).json({message: "User already exists"})
            return;
        }
// Hash the password
        const passwordHash = await bcrypt.hashSync(req.body.password, 10)

//new create user
        const newUser = new User({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            uniId: req.body.uniId,
            phoneNumber: req.body.phoneNumber,
            password: passwordHash
        })
        await newUser.save()
        res.status(201).json({message: "User created successfully", user: newUser})
    }catch(error){
        res.status(500).json({message: "Error creating user", error: error.message})
    }
}

//Login authentication for email and password
export async function loginUser(req,res){
    try{
        const email = req.body.email;
        const password = req.body.password;
        
        if(!email || !password){
            res.status(400).json({message: "Email and password are required"})
            return;
        }

        const user = await User.findOne({email: email})
        if(!user){
            res.status(404).json({message: "User not found"})
            return;
        }

        const ispasswordValid =bcrypt.compareSync(password, user.password)
        if(ispasswordValid===true){
            const token = jwt.sign({
                isAdmin: user.isAdmin,
                isBlocked: user.isBlocked,
                isEmailVerified: user.isEmailVerified,
                image: user.image
            }, "secretkey"
        )
            res.status(200).json({message: "Login successful", token:token})
        }else{
            res.status(401).json({message: "Invalid password"})
        }

    }catch(error){
        res.status(500).json({message: "Error logging in"})
    }
}