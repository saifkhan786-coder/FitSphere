const User = require("../models/User.js");
const Member = require("../models/Member.js");
const Progress = require("../models/Progress.js");

const roleMiddleware = require("../middleware/roleMiddleware.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");

const router = express.Router();

const JWT_SECRET =
    process.env.JWT_SECRET || "smartgym-demo-secret";


// ======================================================
// DEMO USERS
// ======================================================

const DEMO_USERS = {
    admin: {
        id: "demo-admin",
        name: "Ravi Deshmukh",
        email: "admin@smartgym.in",
        password: "demo1234",
        role: "admin"
    },

    member: {
        id: "demo-member",
        name: "Rahul Sharma",
        email: "rahul@smartgym.in",
        password: "demo1234",
        role: "member"
    }
};


// ======================================================
// ISSUE JWT TOKEN
// ======================================================

const issueToken = (user) =>
    jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );


// ======================================================
// MEMBER WEIGHT PROGRESS SUMMARY
// ======================================================
//
// startingWeight = weight when member was created.
//
// currentWeight = latest weight from Progress.
//
// weightChange = currentWeight - startingWeight.
//
// Example:
//
// Starting = 58
// Current  = 60
// Change   = +2
//
// Starting = 58
// Current  = 56
// Change   = -2
// ======================================================

async function getMemberWeightSummary(member) {

    // Use dedicated startingWeight field.
    // For old members that don't have startingWeight,
    // fall back to their existing weight.

    const startingWeight =
        Number(
            member.startingWeight ??
            member.weight ??
            0
        );


    // --------------------------------------------------
    // No starting weight
    // --------------------------------------------------

    if (startingWeight <= 0) {

        return {
            startingWeight: 0,
            currentWeight: 0,
            weightChange: 0,
            weightStatus: "No record"
        };
    }


    // --------------------------------------------------
    // Find progress records
    // --------------------------------------------------

    const progressRecords =
        await Progress.find({
            userId: member.userId.toString()
        })
            .sort({
                date: 1
            })
            .lean();


    // --------------------------------------------------
    // No progress record yet
    // --------------------------------------------------

    if (progressRecords.length === 0) {

        return {
            startingWeight,
            currentWeight: startingWeight,
            weightChange: 0,
            weightStatus: "No change"
        };
    }


    // --------------------------------------------------
    // Get latest progress record
    // --------------------------------------------------

    const latestProgress =
        progressRecords[
            progressRecords.length - 1
        ];


    const currentWeight =
        Number(
            latestProgress.weight ??
            startingWeight
        );


    const weightChange =
        currentWeight -
        startingWeight;


    // --------------------------------------------------
    // Weight status
    // --------------------------------------------------

    let weightStatus = "No change";


    if (weightChange > 0) {

        weightStatus = "Gained";

    } else if (weightChange < 0) {

        weightStatus = "Lost";
    }


    return {
        startingWeight,
        currentWeight,
        weightChange,
        weightStatus
    };
}


// ======================================================
// REGISTER
// ======================================================

router.post(
    "/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            // ------------------------------------------------
            // Normalize email
            // ------------------------------------------------

            const normalizedEmail =
                String(email || "")
                    .trim()
                    .toLowerCase();


            // ------------------------------------------------
            // Required fields
            // ------------------------------------------------

            if (
                !name ||
                !normalizedEmail ||
                !password
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Name, email and password are required"
                });
            }


            // ------------------------------------------------
            // Check existing user
            // ------------------------------------------------

            const existingUser =
                await User.findOne({
                    email: normalizedEmail
                });


            if (existingUser) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Email already registered"
                });
            }


            // ------------------------------------------------
            // Hash password
            // ------------------------------------------------

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            // ------------------------------------------------
            // Create user
            // ------------------------------------------------

            const newUser =
                new User({
                    name,
                    email: normalizedEmail,
                    password: hashedPassword
                });


            await newUser.save();


            // ------------------------------------------------
            // Response
            // ------------------------------------------------

            res.status(201).json({

                success: true,

                message:
                    "User registered successfully"
            });

        } catch (error) {

            console.error(
                "Register error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"
            });
        }
    }
);


// ======================================================
// LOGIN
// ======================================================

router.post(
    "/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            // ------------------------------------------------
            // Normalize email
            // ------------------------------------------------

            const normalizedEmail =
                String(email || "")
                    .trim()
                    .toLowerCase();


            // ------------------------------------------------
            // Demo users
            // ------------------------------------------------

            const demoUser =
                Object.values(
                    DEMO_USERS
                ).find(
                    (user) =>
                        user.email.toLowerCase() ===
                        normalizedEmail
                );


            if (
                demoUser &&
                demoUser.password === password
            ) {

                const token =
                    issueToken(
                        demoUser
                    );


                return res.json({

                    success: true,

                    message:
                        "Login successful",

                    token,

                    user: {

                        id:
                            demoUser.id,

                        name:
                            demoUser.name,

                        email:
                            demoUser.email,

                        role:
                            demoUser.role.toUpperCase()
                    }
                });
            }


            // ------------------------------------------------
            // Real MongoDB user
            // ------------------------------------------------

            const user =
                await User.findOne({
                    email: normalizedEmail
                });


            if (!user) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid email or password"
                });
            }


            // ------------------------------------------------
            // Check password
            // ------------------------------------------------

            const isPasswordCorrect =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!isPasswordCorrect) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid email or password"
                });
            }


            // ------------------------------------------------
            // Find member profile
            // ------------------------------------------------

            const memberProfile =
                user.role === "member"
                    ? await Member.findOne({
                        userId:
                            user._id
                    }).lean()
                    : null;


            // ------------------------------------------------
            // Create JWT
            // ------------------------------------------------

            const token =
                issueToken({

                    id:
                        user._id.toString(),

                    role:
                        user.role
                });


            // ------------------------------------------------
            // Login response
            // ------------------------------------------------

            res.json({

                success: true,

                message:
                    "Login successful",

                token,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role.toUpperCase(),

                    member:
                        memberProfile
                            ? {

                                id:
                                    memberProfile._id,

                                membershipPlan:
                                    memberProfile.membershipPlan,

                                membershipStartDate:
                                    memberProfile.membershipStartDate,

                                membershipExpiryDate:
                                    memberProfile.membershipExpiryDate,

                                paymentMethod:
                                    memberProfile.paymentMethod,

                                amountPaid:
                                    memberProfile.amountPaid,

                                phone:
                                    memberProfile.phone,

                                address:
                                    memberProfile.address,

                                height:
                                    memberProfile.height,

                                weight:
                                    memberProfile.weight,

                                startingWeight:
                                    memberProfile.startingWeight,

                                primaryGoal:
                                    memberProfile.primaryGoal,

                                experienceLevel:
                                    memberProfile.experienceLevel

                            }
                            : null
                }
            });

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"
            });
        }
    }
);


// ======================================================
// ADMIN CREATE MEMBER
// ======================================================

router.post(
    "/admin/create-member",
    authMiddleware,
    roleMiddleware(["admin"]),
    async (req, res) => {

        try {

            const {
                name,
                email,
                password,
                phone,
                gender,
                dateOfBirth,
                emergencyContact,
                address,
                height,
                weight,
                primaryGoal,
                experienceLevel,
                trainingDaysPerWeek,
                medicalNotes,
                membershipPlan,
                membershipStartDate,
                paymentMethod,
                amountPaid
            } = req.body;


            // ------------------------------------------------
            // Normalize email
            // ------------------------------------------------

            const normalizedEmail =
                String(email || "")
                    .trim()
                    .toLowerCase();


            // ------------------------------------------------
            // Required fields
            // ------------------------------------------------

            if (
                !name ||
                !normalizedEmail ||
                !password ||
                !membershipPlan ||
                !membershipStartDate
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, email, password, membership plan and start date are required"
                });
            }


            // ------------------------------------------------
            // Validate membership plan
            // ------------------------------------------------

            const planDurations = {

                Basic: 1,

                Standard: 3,

                Premium: 6,

                Annual: 12
            };


            const months =
                planDurations[
                    membershipPlan
                ];


            if (!months) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid membership plan"
                });
            }


            // ------------------------------------------------
            // Validate start date
            // ------------------------------------------------

            const startDate =
                new Date(
                    membershipStartDate
                );


            if (
                isNaN(
                    startDate.getTime()
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid membership start date"
                });
            }


            // ------------------------------------------------
            // Check existing user
            // ------------------------------------------------

            const existingUser =
                await User.findOne({

                    email:
                        normalizedEmail
                });


            if (existingUser) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email already registered"
                });
            }


            // ------------------------------------------------
            // Hash password
            // ------------------------------------------------

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );


            // ------------------------------------------------
            // Create User
            // ------------------------------------------------

            const newUser =
                new User({

                    name,

                    email:
                        normalizedEmail,

                    password:
                        hashedPassword,

                    role:
                        "member"
                });


            await newUser.save();


            // ------------------------------------------------
            // Calculate membership expiry
            // ------------------------------------------------

            const expiryDate =
                new Date(
                    startDate
                );


            expiryDate.setMonth(
                expiryDate.getMonth() +
                months
            );


            // ------------------------------------------------
            // Create Member profile
            // ------------------------------------------------

            const newMember =
                new Member({

                    userId:
                        newUser._id,

                    name,

                    phone:
                        phone || "",

                    gender:
                        gender || "Other",

                    dateOfBirth:
                        dateOfBirth ||
                        undefined,

                    emergencyContact:
                        emergencyContact ||
                        "",

                    address:
                        address || "",

                    height:
                        height ||
                        undefined,

                    // Current weight
                    weight:
                        weight ||
                        undefined,

                    // Permanent starting weight
                    startingWeight:
                        weight ||
                        undefined,

                    primaryGoal:
                        primaryGoal ||
                        "",

                    experienceLevel:
                        experienceLevel ||
                        "Beginner",

                    trainingDaysPerWeek:
                        trainingDaysPerWeek ||
                        0,

                    medicalNotes:
                        medicalNotes ||
                        "",

                    membershipPlan,

                    membershipStartDate:
                        startDate,

                    membershipExpiryDate:
                        expiryDate,

                    paymentMethod:
                        paymentMethod ||
                        "Cash",

                    amountPaid:
                        amountPaid ||
                        0
                });


            await newMember.save();


            // ------------------------------------------------
            // Response
            // ------------------------------------------------

            res.status(201).json({

                success: true,

                message:
                    "Member created successfully",

                member: {

                    id:
                        newMember._id,

                    userId:
                        newUser._id,

                    name,

                    email:
                        newUser.email,

                    membershipPlan,

                    startingWeight:
                        newMember.startingWeight ||
                        0
                }
            });

        } catch (error) {

            console.error(
                "Create member error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"
            });
        }
    }
);


// ======================================================
// ADMIN GET ALL MEMBERS
// ======================================================

router.get(
    "/admin/members",
    authMiddleware,
    roleMiddleware(["admin"]),
    async (req, res) => {

        try {

            // ------------------------------------------------
            // Get all member profiles
            // ------------------------------------------------

            const members =
                await Member.find()
                    .lean();


            // ------------------------------------------------
            // Add user email + weight progress
            // ------------------------------------------------

            const membersWithProgress =
                await Promise.all(

                    members.map(
                        async (member) => {

                            // --------------------------------
                            // Find User connected to Member
                            // --------------------------------

                            const user =
                                await User.findById(
                                    member.userId
                                )
                                    .select(
                                        "email"
                                    )
                                    .lean();


                            // --------------------------------
                            // Calculate weight progress
                            // --------------------------------

                            const weightSummary =
                                await getMemberWeightSummary(
                                    member
                                );


                            // --------------------------------
                            // Payment status
                            // --------------------------------

                            const paymentStatus =
                                Number(
                                    member.amountPaid ||
                                    0
                                ) > 0
                                    ? "Paid"
                                    : "Pending";


                            // --------------------------------
                            // Membership status
                            // --------------------------------

                            const now =
                                new Date();


                            const expiryDate =
                                new Date(
                                    member.membershipExpiryDate
                                );


                            let membershipStatus =
                                "Active";


                            if (
                                isNaN(
                                    expiryDate.getTime()
                                )
                            ) {

                                membershipStatus =
                                    "Expired";

                            } else if (
                                expiryDate <
                                now
                            ) {

                                membershipStatus =
                                    "Expired";

                            } else if (
                                expiryDate <=
                                new Date(
                                    Date.now() +
                                    7 *
                                    24 *
                                    60 *
                                    60 *
                                    1000
                                )
                            ) {

                                membershipStatus =
                                    "Expiring Soon";
                            }


                            // --------------------------------
                            // Return complete member
                            // --------------------------------

                            return {

                                ...member,

                                email:
                                    user?.email ||
                                    "—",

                                paymentStatus,

                                membershipStatus,

                                startingWeight:
                                    weightSummary.startingWeight,

                                currentWeight:
                                    weightSummary.currentWeight,

                                weightChange:
                                    weightSummary.weightChange,

                                weightStatus:
                                    weightSummary.weightStatus
                            };
                        }
                    )
                );


            // ------------------------------------------------
            // Response
            // ------------------------------------------------

            res.json({

                success: true,

                members:
                    membersWithProgress
            });

        } catch (error) {

            console.error(
                "Admin members error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch members"
            });
        }
    }
);


// ======================================================
// GET CURRENT USER PROFILE
// ======================================================

router.get(
    "/profile",
    authMiddleware,
    async (req, res) => {

        try {

            const userId =
                req.user.userId;


            // ------------------------------------------------
            // Find user
            // ------------------------------------------------

            const user =
                await User.findById(
                    userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"
                });
            }


            // ------------------------------------------------
            // Find member profile
            // ------------------------------------------------

            const memberProfile =
                await Member.findOne({

                    userId:
                        user._id

                }).lean();


            // ------------------------------------------------
            // Response
            // ------------------------------------------------

            res.json({

                success: true,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role.toUpperCase(),

                    member:
                        memberProfile
                            ? {

                                id:
                                    memberProfile._id,

                                membershipPlan:
                                    memberProfile.membershipPlan,

                                membershipStartDate:
                                    memberProfile.membershipStartDate,

                                membershipExpiryDate:
                                    memberProfile.membershipExpiryDate,

                                paymentMethod:
                                    memberProfile.paymentMethod,

                                amountPaid:
                                    memberProfile.amountPaid,

                                phone:
                                    memberProfile.phone,

                                gender:
                                    memberProfile.gender,

                                address:
                                    memberProfile.address,

                                height:
                                    memberProfile.height,

                                weight:
                                    memberProfile.weight,

                                startingWeight:
                                    memberProfile.startingWeight ??
                                    memberProfile.weight,

                                primaryGoal:
                                    memberProfile.primaryGoal,

                                experienceLevel:
                                    memberProfile.experienceLevel,

                                trainingDaysPerWeek:
                                    memberProfile.trainingDaysPerWeek

                            }
                            : null
                }
            });

        } catch (error) {

            console.error(
                "Profile error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"
            });
        }
    }
);


// ======================================================
// UPDATE CURRENT USER PROFILE
// ======================================================

router.put(
    "/profile",
    authMiddleware,
    async (req, res) => {

        try {

            const userId =
                req.user.userId;


            const {
                phone,
                dateOfBirth,
                address,
                height,
                weight,
                primaryGoal,
                experienceLevel,
                trainingDaysPerWeek
            } = req.body;


            // ------------------------------------------------
            // Find member
            // ------------------------------------------------

            const member =
                await Member.findOne({
                    userId
                });


            if (!member) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Member profile not found"
                });
            }


            // ------------------------------------------------
            // Update profile
            // ------------------------------------------------

            member.phone =
                phone;

            member.dateOfBirth =
                dateOfBirth;

            member.address =
                address;

            member.height =
                height;

            // Update current weight only.
            // Do NOT change startingWeight.

            member.weight =
                weight;

            member.primaryGoal =
                primaryGoal;

            member.experienceLevel =
                experienceLevel;

            member.trainingDaysPerWeek =
                trainingDaysPerWeek;


            await member.save();


            res.json({

                success: true,

                message:
                    "Profile updated successfully"
            });

        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"
            });
        }
    }
);


// ======================================================
// CHANGE PASSWORD
// ======================================================

router.put(
    "/change-password",
    authMiddleware,
    async (req, res) => {

        try {

            const userId =
                req.user.userId;


            const {
                currentPassword,
                newPassword
            } = req.body;


            // ------------------------------------------------
            // Validate input
            // ------------------------------------------------

            if (
                !currentPassword ||
                !newPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Current password and new password are required"
                });
            }


            // ------------------------------------------------
            // Find user
            // ------------------------------------------------

            const user =
                await User.findById(
                    userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"
                });
            }


            // ------------------------------------------------
            // Check current password
            // ------------------------------------------------

            const isPasswordCorrect =
                await bcrypt.compare(
                    currentPassword,
                    user.password
                );


            if (!isPasswordCorrect) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Current password is incorrect"
                });
            }


            // ------------------------------------------------
            // Hash new password
            // ------------------------------------------------

            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );


            user.password =
                hashedPassword;


            await user.save();


            res.json({

                success: true,

                message:
                    "Password updated successfully"
            });

        } catch (error) {

            console.error(
                "Change password error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"
            });
        }
    }
);


// ======================================================
// ADMIN TEST
// ======================================================

router.get(
    "/admin-test",
    authMiddleware,
    roleMiddleware(["admin"]),
    (req, res) => {

        res.json({

            success: true,

            message:
                "Admin access granted"
        });
    }
);


// ======================================================
// ADMIN UPDATE MEMBER MEMBERSHIP
// ======================================================

router.put(
    "/admin/members/:memberId/membership",
    authMiddleware,
    roleMiddleware(["admin"]),
    async (req, res) => {

        try {

            const {
                memberId
            } = req.params;


            const {
                membershipPlan,
                membershipStartDate
            } = req.body;


            // ------------------------------------------------
            // Validate input
            // ------------------------------------------------

            if (
                !membershipPlan ||
                !membershipStartDate
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Membership plan and start date are required"
                });
            }


            // ------------------------------------------------
            // Find member
            // ------------------------------------------------

            const member =
                await Member.findById(
                    memberId
                );


            if (!member) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Member not found"
                });
            }


            // ------------------------------------------------
            // Plan durations
            // ------------------------------------------------

            const planDurations = {

                Basic: 1,

                Standard: 3,

                Premium: 6,

                Annual: 12
            };


            const months =
                planDurations[
                    membershipPlan
                ];


            if (!months) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid membership plan"
                });
            }


            // ------------------------------------------------
            // Validate start date
            // ------------------------------------------------

            const startDate =
                new Date(
                    membershipStartDate
                );


            if (
                isNaN(
                    startDate.getTime()
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid membership start date"
                });
            }


            // ------------------------------------------------
            // Calculate expiry date
            // ------------------------------------------------

            const expiryDate =
                new Date(
                    startDate
                );


            expiryDate.setMonth(
                expiryDate.getMonth() +
                months
            );


            // ------------------------------------------------
            // Update membership
            // ------------------------------------------------

            member.membershipPlan =
                membershipPlan;

            member.membershipStartDate =
                startDate;

            member.membershipExpiryDate =
                expiryDate;


            await member.save();


            // ------------------------------------------------
            // Response
            // ------------------------------------------------

            res.json({

                success: true,

                message:
                    "Membership updated successfully",

                member
            });

        } catch (error) {

            console.error(
                "Membership update error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Server error"
            });
        }
    }
);


module.exports = router;