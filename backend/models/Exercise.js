const mongoose = require("mongoose")

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    difficulty: {
        type: String,
        required: true
    },

    instructions: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;