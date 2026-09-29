const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
     name: {
        type: String,
        required: true,
        unique: true
    },

    months: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    perks: {
        type: [String],
        default: []
    }
})

const Plan = mongoose.model("Plan", planSchema);

module.exports = Plan;