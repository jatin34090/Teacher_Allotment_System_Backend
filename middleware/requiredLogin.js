const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher");
module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: "You must be logged in" });
    }
    // const token = authorization.split(" ")[1];
    const token = authorization.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(401).json({ error: "You must be logged in" });
        }
        const { _id } = payload;
        Teacher.findById(_id).then(userdata => {
            req.user = userdata;
            next();
        })
    })
}