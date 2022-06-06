const mongoose = require('mongoose');

const { Schema } = mongoose;

const messageSchema = new Schema(
    {
        externalMessageId: { type: String },
        recipients: { type: [String], required: true },
        message: { type: String, required: true },
        status: {
            type: String,
            required: true,
            enum: ['SCHEDLD', 'ACCEPTD', 'DELIVRD', 'UNDELIV', 'UNKNOWN'],
            default: 'SCHEDLD',
        },
        date_sent: { type: Number },
    },
    {
        timestamps: true,
    }
);

mongoose.model('message', messageSchema);
