const mongoose = require("mongoose");
const Schema = mongoose.Schema; 
const allotmentSchema = new Schema({
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }],
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    date: {
        type: Date,
        default: Date.now
    },
    status: { 
        type: String,
         enum: ['active', 'expired'],
          default: 'active'
    }

})
const Allotment = mongoose.model("Allotment", allotmentSchema);
module.exports = Allotment;