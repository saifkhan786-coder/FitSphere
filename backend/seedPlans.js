require("dotenv").config();

const mongoose = require("mongoose");
const Plan = require("./models/Plan");

const plans = [
    {
        name: "Basic",
        months: 1,
        price: 1000,
        perks: [
            "Gym floor access",
            "Locker",
            "1 trainer session"
        ]
    },

    {
        name: "Standard",
        months: 3,
        price: 2700,
        perks: [
            "Everything in Basic",
            "Group classes",
            "Diet chart"
        ]
    },

    {
        name: "Premium",
        months: 6,
        price: 5000,
        perks: [
            "Everything in Standard",
            "Personal trainer",
            "Body composition scan"
        ]
    },

    {
        name: "Annual",
        months: 12,
        price: 9000,
        perks: [
            "Everything in Premium",
            "Free supplements kit",
            "Guest passes"
        ]
    }
];

const seedPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");

        await Plan.deleteMany();

        await Plan.insertMany(plans);

        console.log("Plans inserted successfully");

        await mongoose.connection.close();

        console.log("MongoDB connection closed");

    } catch (error) {
        console.error("Error seeding plans:", error);
    }
};

seedPlans();