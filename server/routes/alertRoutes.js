const express = require('express');
const { poolPromise, sql } = require("../db");
const router = express.Router();

// GET all alerts for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, req.params.userId)
      .query(
        "SELECT * FROM alerts WHERE user_id = @userId ORDER BY created_at DESC"
      );
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// CREATE a new alert
router.post("/", async (req, res) => {
  try {
    const { user_id, title, status } = req.body;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("user_id", sql.Int, user_id)
      .input("title", sql.VarChar, title)
      .input("status", sql.VarChar, status)
      .query(
        "INSERT INTO alerts (user_id, title, status) VALUES (@user_id, @title, @status); SELECT SCOPE_IDENTITY() AS id;"
      );
    res.status(201).json({ id: result.recordset[0].id, ...req.body });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;