const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    title: String,
    description: String,
    address: String,
    rent: Number,
    photo: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
