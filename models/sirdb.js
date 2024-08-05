const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    Name: {
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
    ReservationType: {
        type: String,
        required: true,
        enum: ['temporary', 'permanent']
    },
    Email: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("User", UserSchema);
