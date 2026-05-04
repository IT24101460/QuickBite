import jwt from "jsonwebtoken"

export default function authenticate(req, res, next) {
    const header = req.header("authorization")

    // If no token is provided, continue as a guest (req.user will be undefined)
    if (!header) {
        return next();
    }

    const token = header.replace("Bearer ", "")
    
    jwt.verify(token, "secretkey", (err, decoded) => {
        if (err) {
            // If the request is a GET (reading data), allow it even if the token is expired/invalid
            if (req.method === 'GET') {
                return next();
            }
            // For POST/PUT/DELETE, require a valid login
            return res.status(401).json({ message: "Your session has expired. Please login again to perform this action." });
        }

        // Token is valid
        req.user = decoded;
        next();
    });
}
