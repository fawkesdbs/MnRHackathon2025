const express = require('express');
const { poolPromise, sql } = require("../db");
const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT 1 AS result");
    if (result.recordset[0].result === 1) {
      res.status(200).json({ status: "ok", db: "connected" });
    } else {
      throw new Error("Database connection check failed.");
    }
  } catch (error) {
    console.error("Health check failed:", error);
    res
      .status(500)
      .json({ status: "error", db: "disconnected", message: error.message });
  }
});

module.exports = router;