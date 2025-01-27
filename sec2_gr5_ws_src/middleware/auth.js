const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        console.log(`Request Path: ${req.originalUrl}, Method: ${req.method}`);

        if (!req.headers.authorization) {
            console.error("Authorization header is missing");
            return res.redirect('/login'); 
        }

        const token = req.headers.authorization.split(" ")[1];  
        const decoded = jwt.verify(token, process.env.SECRET);  

        req.decoded = decoded;  
        next();  
    } catch (error) {
        console.error("Authorization error:", error.message);  
        return res.redirect('/login');  
    }
};
