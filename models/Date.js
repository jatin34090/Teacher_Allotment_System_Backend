const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dateSchema = new Schema({
    date: { type: String, required: true },
    rooms: [{ type: Schema.Types.ObjectId, ref: "Room" }],
});

const DateModel = mongoose.model('Date', dateSchema);

module.exports = DateModel;