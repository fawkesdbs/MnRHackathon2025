const express = require('express');
const { poolPromise, sql } = require("../db");
const authenticateToken = require("../middleware/authToken");
const router = express.Router();

// GET all destinations for the logged-in user
router.get("/user/:userId", authenticateToken, async (req, res) => {
  // Check if the requesting user is the one they're asking for data about
  if (req.user.id.toString() !== req.params.userId.toString()) {
    return res.status(403).json({
      message: "Forbidden: You can only access your own destinations.",
    });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, req.params.userId)
      .query(
        "SELECT * FROM dbo.monitored_destinations WHERE created_by = @userId"
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching destinations:", err);
    res.status(500).send(err.message);
  }
});

// CREATE a new destination
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { created_by, location, risk_level } = req.body;
    if (req.user.id.toString() !== created_by.toString()) {
      return res.status(403).json({
        message:
          "Forbidden: You can only add destinations to your own profile.",
      });
    }

    riskLevelMap = { Low: 0, Medium: 1, High: 2, Critical: 3 };
    riskLevelInt = riskLevelMap[risk_level] || 1;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("created_by", sql.Int, created_by)
      .input("location", sql.NVarChar, location)
      .input("risk_level", sql.Int, riskLevelInt).query(`
        INSERT INTO dbo.monitored_destinations (location, risk_level, last_checked, created_by, created_at, updated_at) 
        VALUES (@location, @risk_level, GETDATE(), @created_by, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() AS id;
      `);
    res.status(201).json({ id: result.recordset[0].id, ...req.body });
  } catch (err) {
    console.error("Error creating destination:", err);
    res.status(500).send(err.message);
  }
});

// DELETE a destination by its ID
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    // Optional: Add a check to ensure the user owns this destination before deleting
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM dbo.monitored_destinations WHERE id = @id");
    res.status(200).json({ message: "Destination deleted successfully" });
  } catch (err) {
    console.error("Error deleting destination:", err);
    res.status(500).send(err.message);
  }
});

module.exports = router;