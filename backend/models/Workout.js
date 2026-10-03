const mongoose = require("mongoose");

const workoutSetSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true
        },

        reps: {
            type: Number,
            required: true
        },

        weight: {
            type: Number,
            required: true
        },

        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        _id: false
    }
);

const workoutExerciseSchema = new mongoose.Schema(
    {
        exerciseId: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        rest: {
            type: Number,
            default: 60
        },

        sets: {
            type: [workoutSetSchema],
            required: true
        }
    },
    {
        _id: false
    }
);

const workoutSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },

        date: {
            type: String,
            required: true
        },

        exercises: {
            type: [workoutExerciseSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Workout = mongoose.model("Workout", workoutSchema);

module.exports = Workout;