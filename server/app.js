// In MnRHackathon2025/server/app.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport"); // Add this
const session = require("express-session"); // Add this

// Import your existing routes
const userRoutes = require("./routes/userRoutes");
const monitoredDestinationRoutes = require("./routes/monitoredDestinationRoutes");
const alertRoutes = require("./routes/alertRoutes");
const healthRoute = require("./routes/health");

// Import the new auth routes
const authRoutes = require("./routes/auth"); // Add this
require("./passport"); // Add this to configure Passport

const app = express();

app.use(cors());
app.use(express.json());

// Add session and passport middleware
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Use the new auth routes
app.use("/api", authRoutes); // Add this

// Existing Routes
app.use("/api/users", userRoutes);
app.use("/api/monitored-destinations", monitoredDestinationRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/", healthRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
