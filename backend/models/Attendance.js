const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
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

        date: {
            type: Date,
            required: true
        },

        checkInTime: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["Present", "Absent"],
            default: "Present"
        }
    },
    {
        timestamps: true
    }
);

const Attendance = mongoose.model(
    "Attendance",
    attendanceSchema
);

module.exports = Attendance;