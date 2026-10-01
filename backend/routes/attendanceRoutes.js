const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");
const Member = require("../models/Member");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
    "/checkin",
    authMiddleware,
    async (req, res) => {
        try {
            const {
                memberId,
                memberName
            } = req.body;

            if (!memberId || !memberName) {
                return res.status(400).json({
                    success: false,
                    message: "Member information is required"
                });
            }

            const today = new Date();

            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);

            const existingAttendance =
                await Attendance.findOne({
                    memberId,
                    date: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                });

            if (existingAttendance) {
                return res.status(400).json({
                    success: false,
                    message: "Member has already checked in today"
                });
            }

            const attendance =
                new Attendance({
                    memberId,
                    memberName,
                    date: today,
                    checkInTime: today,
                    status: "Present"
                });

            await attendance.save();

            res.status(201).json({
                success: true,
                message: "Attendance marked successfully",
                attendance
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to mark attendance",
                error: error.message
            });
        }
    }
);

router.get(
    "/today",
    authMiddleware,
    roleMiddleware(["admin"]),
    async (req, res) => {
        try {
            const today = new Date();

            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);

            const attendance = await Attendance.find({
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }).sort({ checkInTime: -1 });

            res.json({
                success: true,
                attendance
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to fetch today's attendance",
                error: error.message
            });
        }
    }
);


router.get(
    "/my",
    authMiddleware,
    async (req, res) => {
        try {
            const member = await Member.findOne({
                userId: req.user.userId
            });

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: "Member profile not found"
                });
            }

            const attendance = await Attendance.find({
                memberId: member._id
            }).sort({
                checkInTime: -1
            });

            res.json({
                success: true,
                attendance
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to fetch attendance",
                error: error.message
            });
        }
    }
);


router.get(
    "/weekly",
    authMiddleware,
    roleMiddleware(["admin"]),
    async (req, res) => {
        try {
            const today = new Date();

            const startOfWeek = new Date(today);
            startOfWeek.setHours(0, 0, 0, 0);

            startOfWeek.setDate(
                today.getDate() - today.getDay()
            );

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(
                startOfWeek.getDate() + 7
            );

            const attendance = await Attendance.find({
                date: {
                    $gte: startOfWeek,
                    $lt: endOfWeek
                }
            });

            const weekDays = [
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat"
            ];

            const weeklyAttendance = weekDays.map(
                (day, index) => {
                    const count = attendance.filter(
                        (record) => {
                            const date = new Date(
                                record.date
                            );

                            return (
                                date.getDay() === index
                            );
                        }
                    ).length;

                    return {
                        day,
                        present: count
                    };
                }
            );

            res.json({
                success: true,
                attendance: weeklyAttendance
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to fetch weekly attendance",
                error: error.message
            });
        }
    }
);


module.exports = router;