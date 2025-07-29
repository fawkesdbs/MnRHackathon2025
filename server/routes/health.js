const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.send('Database Connection OK');
  } catch (e) {
    res.status(500).send('Database Connection Failed');
  }
});

module.exports = router;
