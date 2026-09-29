const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan.js");

router.get("/", async(req, res) => {
    try {
        const plans = await Plan.find();

        res.json({
            success: true,
            plans
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
})


router.put("/:planId", async (req, res) => {
    try {
        const { planId } = req.params;
        const { name, months, price, perks } = req.body;

        const plan = await Plan.findById(planId);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Plan not found"
            });
        }

        plan.name = name;
        plan.months = months;
        plan.price = price;
        plan.perks = perks;

        await plan.save();

        res.json({
            success: true,
            message: "Plan updated successfully",
            plan
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


module.exports = router;