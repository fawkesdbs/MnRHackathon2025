const pool = require('../db');

exports.listAlerts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM alerts');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAlert = async (req, res) => {
  try {
    const { user_id, title, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO alerts (user_id, title, status) VALUES (?, ?, ?)',
      [user_id, title, status || 'Unread']
    );
    res.status(201).json({ id: result.insertId, user_id, title, status: status || 'Unread' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, title, status } = req.body;
    await pool.query(
      'UPDATE alerts SET user_id = ?, title = ?, status = ? WHERE id = ?',
      [user_id, title, status, id]
    );
    res.json({ id, user_id, title, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM alerts WHERE id = ?', [id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
