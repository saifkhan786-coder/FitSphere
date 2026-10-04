const express = require("express");

const Progress = require("../models/Progress");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


/* -------------------------------------------------------------------------- */
/* Get logged-in member's progress                                            */
/* -------------------------------------------------------------------------- */

router.get(
    "/",
    authMiddleware,
    async (req, res) => {
        try {
            const progress = await Progress.find({
                userId: req.user.userId
            }).sort({
                date: 1
            });

            res.json({
                success: true,
                progress
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to fetch progress"
            });
        }
    }
);


/* -------------------------------------------------------------------------- */
/* Add progress record                                                        */
/* -------------------------------------------------------------------------- */

router.post(
    "/",
    authMiddleware,
    async (req, res) => {
        try {
            const {
                date,
                weight,
                chest,
                waist,
                arms,
                thighs
            } = req.body;


            if (!date || weight === undefined) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Date and weight are required"
                });
            }


            const progress = new Progress({
                userId: req.user.userId,

                date,

                weight,

                chest,

                waist,

                arms,

                thighs
            });


            await progress.save();


            res.status(201).json({
                success: true,
                message:
                    "Progress record saved successfully",

                progress
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to save progress"
            });
        }
    }
);


module.exports = router;