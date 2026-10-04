const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },

        date: {
            type: String,
            required: true
        },

        weight: {
            type: Number,
            required: true
        },

        chest: {
            type: Number
        },

        waist: {
            type: Number
        },

        arms: {
            type: Number
        },

        thighs: {
            type: Number
        }
    },
    {
        timestamps: true
    }
);

const Progress = mongoose.model(
    "Progress",
    progressSchema
);

module.exports = Progress;