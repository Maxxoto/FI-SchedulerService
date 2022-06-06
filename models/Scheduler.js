const mongoose = require('mongoose');

const { Schema } = mongoose;

const schedulerSchema = new Schema(
    {
        messages: [
            {
                type: Schema.Types.ObjectId,
                ref: 'message',
                required: true,
            },
        ],
        date_scheduled: { type: Number, required: true },
        type: { type: String, require: true },
    },
    {
        timestamps: true,
    }
);

mongoose.model('scheduler', schedulerSchema);
