const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const roomSchema = new Schema({
    roomNo: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    avalability: { type: Boolean, default: true },
    teachers: [{
        date: { type: String, required: true },
        allotedShift: [{
            shift: { type: Number, required: true },
            teacherList: [{ type: String, required: true }]
        }],
    }],

})
const Room = mongoose.model("Room", roomSchema);
module.exports = Room;