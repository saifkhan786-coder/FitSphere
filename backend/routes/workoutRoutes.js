const express = require("express");
const Workout = require("../models/Workout");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    try {
        const workouts = await Workout.find({
            userId: req.user.userId
        });

        res.json({
            success: true,
            workouts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch workouts"
        });
    }
});

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { date, exercises } = req.body;

        const workout = await Workout.findOneAndUpdate(
            {
                userId: req.user.userId,
                date
            },
            {
                userId: req.user.userId,
                date,
                exercises
            },
            {
                returnDocument: "after",
                upsert: true
            }
        );

        res.json({
            success: true,
            message: "Workout saved successfully",
            workout
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to save workout"
        });
    }
});

module.exports = router;