const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: "user"  
    },
    date: {
        type: Date,
        default: Date.now
    },
    resetToken: String,
    resetTokenExpiration: Date
})
const User = mongoose.model("User", userSchema);
module.exports = User;