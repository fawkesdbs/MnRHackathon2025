const express = require('express');
const { poolPromise, sql } = require("../db");
const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM users");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET a single user by ID
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM users WHERE id = @id");
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// CREATE a new user (assuming you still need this alongside auth)
router.post("/", async (req, res) => {
  try {
    const { name, email, password_hash } = req.body;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("password_hash", sql.VarChar, password_hash)
      .query(
        "INSERT INTO users (name, email, password_hash) VALUES (@name, @email, @password_hash); SELECT SCOPE_IDENTITY() AS id;"
      );
    res.status(201).json({ id: result.recordset[0].id, ...req.body });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// UPDATE a user's preferences
router.put("/:id/preferences", async (req, res) => {
  try {
    const { notify_on_risk_change, min_alert_level } = req.body;
    const pool = await poolPromise;
    await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("notify", sql.Bit, notify_on_risk_change)
      .input("level", sql.VarChar, min_alert_level)
      .query(
        "UPDATE users SET notify_on_risk_change = @notify, min_alert_level = @level WHERE id = @id"
      );
    res.status(200).json({ message: "Preferences updated" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;