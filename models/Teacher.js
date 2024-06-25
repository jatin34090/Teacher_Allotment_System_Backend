const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String},
    type: { type: String, default: "teacher" },
    allotedRooms:[{
        Shift:{type: Number,},
        room: { type: String},
        date: {type: String}
    }],
    leave: { type: Boolean, default: false },
    cycleCompleted: { type: Boolean, default: false },
    // shift: { type: Number, enum: [1, 2, 3], required: true },
    avalableDates:[ { date: { type: String }, shift: { type: Number } }],
    avalability: { type: Boolean, default: true },
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;

    // password: { type: String, required: true },