const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const express = require("express");
const router = express.Router();

const Exercise = require("../models/Exercise");

router.get("/", async (req, res) => {
    try {
        const exercises = await Exercise.find().sort({
            createdAt: -1
        });

        res.json({
            success: true,
            exercises
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch exercises",
            error: error.message
        });
    }
});


router.post(
    "/",
    authMiddleware,
    roleMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { name, category, difficulty, instructions } = req.body;

            const exercise = await Exercise.create({
                name,
                category,
                difficulty,
                instructions
            });

            res.status(201).json({
                success: true,
                message: "Exercise added successfully",
                exercise
            });
        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to add exercise",
                error: error.message
            });
        }
    }
);


router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;

            const exercise = await Exercise.findByIdAndDelete(id);

            if (!exercise) {
                return res.status(404).json({
                    success: false,
                    message: "Exercise not found"
                });
            }

            res.json({
                success: true,
                message: "Exercise deleted successfully"
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to delete exercise",
                error: error.message
            });
        }
    }
);

module.exports = router;