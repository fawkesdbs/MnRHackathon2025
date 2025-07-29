const express = require('express');
const { poolPromise, sql } = require("../db");
const router = express.Router();

// GET all destinations for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, req.params.userId)
      .query("SELECT * FROM monitored_destinations WHERE user_id = @userId");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// CREATE a new destination
router.post("/", async (req, res) => {
  try {
    const { user_id, location, risk_level } = req.body;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("user_id", sql.Int, user_id)
      .input("location", sql.VarChar, location)
      .input("risk_level", sql.VarChar, risk_level)
      .query(
        "INSERT INTO monitored_destinations (user_id, location, risk_level, last_checked) VALUES (@user_id, @location, @risk_level, GETDATE()); SELECT SCOPE_IDENTITY() AS id;"
      );
    res
      .status(201)
      .json({
        id: result.recordset[0].id,
        ...req.body,
        last_checked: new Date(),
      });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// UPDATE a destination
router.put("/:id", async (req, res) => {
  try {
    const { location, risk_level } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("location", sql.VarChar, location)
      .input("risk_level", sql.VarChar, risk_level)
      .query(
        "UPDATE monitored_destinations SET location = @location, risk_level = @risk_level, last_checked = GETDATE() WHERE id = @id"
      );
    res.status(200).json({ message: "Destination updated successfully" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DELETE a destination
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM monitored_destinations WHERE id = @id");
    res.status(200).json({ message: "Destination deleted successfully" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;