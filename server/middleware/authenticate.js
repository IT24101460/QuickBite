import jwt from "jsonwebtoken"

export default function authenticate(req, res, next) {
        const header = req.header("authorization")

        if(header==null){
        next()
        }else{
            const token = header.replace("Bearer ", "")
            jwt.verify(token,"secretkey",(err,decoded)=>{
                if(decoded==null){
                    res.status(401).json({message: "Please login to access this resource"})
                    return;
                }else{
                    req.user = decoded
                    next()
                }
        
            }
        )
}
}
