const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require('express-validator');
const Teacher = require("../models/Teacher");

router.post('/api/signup', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 }),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: `${errors.array()[0].msg}` });
    }
    try {
        let teacher = await Teacher.findOne({email: req.body.email });
        if (teacher) {
            if (teacher.password !== null) {
                return res.status(400).json({ error: "Sorry a user with this email already exists" })
            }
            // return res.status(400).json({ email })
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);
            teacher.name = req.body.name;
            teacher.password = secPass;
            await teacher.save();
            const authToken = jwt.sign({ _id: teacher._id }, process.env.JWT_SECRET);
            const { _id, name, email, type } = teacher;
            return res.json({ authToken, teacher: { _id, name, email, type } });
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        teacher = await Teacher.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            type: req.body.type,
        });
        const authToken = jwt.sign({ _id: teacher._id }, process.env.JWT_SECRET);
        const { _id, name, email, type } = teacher;
        return res.json({ authToken, teacher: { _id, name, email, type } });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}
)

router.post("/api/signin", async (req, res) => {
    const { email, password, type } = req.body;
    if (!email || !password || !type) {
        return res.status(400).json({ error: "Please enter email and password" });
    }
    const user = await Teacher.findOne({ email: email });

    if (!user) {
        console.log(user)
        return res.status(400).json({ error: "Please try to  with correct credentials" });
    }
    console.log(user)
    if(user.password === null){
        return res.status(400).json({ error: "YOu need to signup first" });
    }

    const passwordCompare = bcrypt.compare(password, user.password);
    if (passwordCompare) {
        const authToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        const { _id, name, email, type } = user;
        res.json({ authToken, teacher: { _id, name, email, type } });
    } else {
        return res.status(400).json({ error: "Please try to  with correct credentials" });
    }

})


module.exports = router;