const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require('express-validator');

router.post('/api/signup', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0].msg });
    }
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry a user with this email already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });
        const authToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        const { _id, name, email } = user;
        res.json({authToken,user: { _id, name, email }});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}
)

router.post("/api/signin",(req, res)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({error: "Please enter email and password"});
    }
    User.findOne({email: email}).then((user)=>{
        if(!user){
            console.log(user)
            return res.status(400).json({error: "Please try to  with correct credentials"});
        }
        const passwordCompare = bcrypt.compare(password, user.password);
        if(passwordCompare){
            const authToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
            const { _id, name, email } = user;
            res.json({authToken,user: { _id, name, email }});
        }else{
            return res.status(400).json({error: "Please try to  with correct credentials"});
        }
    }).catch(err => console.log(err))
})

module.exports = router;