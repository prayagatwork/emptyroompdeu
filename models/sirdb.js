const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    BlockId: {
        type: String,
        required: true
    },
    RoomNo: {
        type: String,
        required: true
    },
    Date: {
        type: Date,
        required: true
    },
    Details: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    isAccepted: {  // New field to track accepted requests
        type: Boolean,
        default: false  // Default value is false (pending)
    }
});

module.exports = mongoose.model("User", UserSchema);
