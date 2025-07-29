// controllers/monitoredDestinationController.js

const pool = require("../db");

exports.listDestinations = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM monitored_destinations");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDestination = async (req, res) => {
  try {
    const { user_id, location, risk_level, last_checked } = req.body;
    const [result] = await pool.query(
      "INSERT INTO monitored_destinations (user_id, location, risk_level, last_checked) VALUES (?, ?, ?, ?)",
      [user_id, location, risk_level, last_checked]
    );
    res.status(201).json({
      id: result.insertId,
      user_id,
      location,
      risk_level,
      last_checked,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, location, risk_level, last_checked } = req.body;
    await pool.query(
      "UPDATE monitored_destinations SET user_id = ?, location = ?, risk_level = ?, last_checked = ? WHERE id = ?",
      [user_id, location, risk_level, last_checked, id]
    );
    res.json({ id, user_id, location, risk_level, last_checked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM monitored_destinations WHERE id = ?", [id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
