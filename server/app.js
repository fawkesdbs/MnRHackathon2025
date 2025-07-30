// In MnRHackathon2025/server/app.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport"); // Add this
const session = require("express-session"); // Add this
const sql = require("mssql");

// Import your existing routes
const userRoutes = require("./routes/userRoutes");
const monitoredDestinationRoutes = require("./routes/monitoredDestinationRoutes");
const alertRoutes = require("./routes/alertRoutes");
const healthRoute = require("./routes/health");
const placesRoutes = require("./routes/placesRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Import the new auth routes
const authRoutes = require("./routes/auth"); // Add this
require("./passport"); // Add this to configure Passport

const app = express();

app.use(
  cors({
    origin: true,
  })
);
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
app.use("/api/auth", authRoutes); // Add this

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: { encrypt: true },
};

app.get("/api/test-db", async (req, res) => {
  try {
    console.log("Running DB table list test...");
    const pool = await sql.connect(sqlConfig);

    // The query to get all table names and their schemas
    const result = await pool
      .request()
      .query(
        "SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
      );

    console.log("Tables found:", result.recordset);
    res.json({
      message: "Successfully queried for tables. See data for results.",
      data: result.recordset,
    });
  } catch (err) {
    console.error("DB TABLE LIST TEST FAILED:", err);
    res.status(500).json({ message: "Test failed", error: err.message });
  }
});

// Existing Routes
app.use("/api/users", userRoutes);
app.use("/api/monitored-destinations", monitoredDestinationRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/ai", aiRoutes); 
app.use("/", healthRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
