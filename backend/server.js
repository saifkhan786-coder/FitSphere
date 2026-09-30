require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const planRoutes = require("../backend/routes/planRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes");
app.use(cors());

const connectDB = require("./config/db.js");
const healthRoutes = require("./routes/healthRoutes.js");
const authRoutes = require("./routes/authRoutes.js");

connectDB();

app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes)
app.use("/api/payments", paymentRoutes);


app.listen(process.env.PORT, () => {
    console.log(`server running on port ${process.env.PORT}`);
});