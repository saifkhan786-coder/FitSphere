const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
            required: true
        },

        memberName: {
            type: String,
            required: true
        },

        plan: {
            type: String,
            required: true
        },

        totalAmount: {
            type: Number,
            required: true
        },

        paidAmount: {
            type: Number,
            required: true,
            default: 0
        },

        remaining: {
            type: Number,
            required: true
        },

        method: {
            type: String,
            enum: ["Cash", "UPI", "Card", "Bank Transfer"],
            required: true
        },

        date: {
            type: Date,
            required: true,
            default: Date.now
        },

        status: {
            type: String,
            enum: ["Paid", "Partial", "Pending"],
            required: true,
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;