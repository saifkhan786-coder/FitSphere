const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");



router.post("/", async (req, res) => {
    try {
        const {
            memberId,
            memberName,
            plan,
            totalAmount,
            paidAmount,
            method,
            date
        } = req.body;

        const remaining = totalAmount - paidAmount;

        let status = "Pending";

        if (remaining <= 0) {
            status = "Paid";
        } else if (paidAmount > 0) {
            status = "Partial";
        }

        const payment = new Payment({
            memberId,
            memberName,
            plan,
            totalAmount,
            paidAmount,
            remaining,
            method,
            date,
            status
        });

        await payment.save();

        res.status(201).json({
            success: true,
            message: "Payment recorded successfully",
            payment
        });

    } catch (error) {
    console.error(error);

    res.status(500).json({
        success: false,
        message: "Failed to record payment",
        error: error.message
    });
}
});

router.get(
    "/",
    authMiddleware,
    roleMiddleware(["admin"]),
    async (req, res) => {
        try {
            const payments = await Payment.find()
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                payments
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to fetch payments",
                error: error.message
            });
        }
    }
);

router.put(
    "/:id/paid",
    authMiddleware,
    roleMiddleware(["admin"]),
    async (req, res) => {
        try {
            const payment = await Payment.findById(req.params.id);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: "Payment not found"
                });
            }

            payment.paidAmount = payment.totalAmount;
            payment.remaining = 0;
            payment.status = "Paid";

            await payment.save();

            res.json({
                success: true,
                message: "Payment marked as paid",
                payment
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to mark payment as paid",
                error: error.message
            });
        }
    }
);

module.exports = router;