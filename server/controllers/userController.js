const pool = require('../db');

exports.listUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, notify_on_risk_change, min_alert_level, created_at FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password_hash, notify_on_risk_change, min_alert_level } = req.body;
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, notify_on_risk_change, min_alert_level) VALUES (?, ?, ?, ?, ?)',
      [name, email, password_hash, notify_on_risk_change, min_alert_level]
    );
    res.status(201).json({ id: result.insertId, name, email, notify_on_risk_change, min_alert_level });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password_hash, notify_on_risk_change, min_alert_level } = req.body;
    await pool.query(
      'UPDATE users SET name = ?, email = ?, password_hash = ?, notify_on_risk_change = ?, min_alert_level = ? WHERE id = ?',
      [name, email, password_hash, notify_on_risk_change, min_alert_level, id]
    );
    res.json({ id, name, email, notify_on_risk_change, min_alert_level });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
