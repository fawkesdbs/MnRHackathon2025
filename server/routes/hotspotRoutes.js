// server/routes/hotspotRoutes.js

const express = require("express");
const { poolPromise, sql } = require("../db");
const { updateHotspotAlerts } = require("../services/alertServices");
const router = express.Router();

// A function to save alerts, which can be reused
const saveAlerts = async (alerts, destinationId, pool) => {
  if (!alerts || alerts.length === 0) {
    return;
  }

  for (const alert of alerts) {
    const { title, severity, type } = alert;
    const severityMap = { Low: 0, Medium: 1, High: 2, Critical: 3 };
    const severityInt = severityMap[severity] || 1;

    await pool
      .request()
      .input("destination_id", sql.Int, destinationId)
      .input("title", sql.NVarChar, title)
      .input("severity", sql.Int, severityInt)
      .input("type", sql.VarChar, type)
      .query(
        "INSERT INTO dbo.alerts (destination_id, title, severity, type, created_at) VALUES (@destination_id, @title, @severity, @type, GETDATE())"
      );
  }
};

// This endpoint simulates a cron job that updates all hotspots
router.post("/update-all", async (req, res) => {
  console.log("Starting scheduled hotspot alert update...");
  try {
    const pool = await poolPromise;
    const hotspotsResult = await pool
      .request()
      .query("SELECT * FROM dbo.monitored_destinations WHERE is_hotspot = 1");

    const hotspots = hotspotsResult.recordset;

    for (const hotspot of hotspots) {
      const newAlerts = await updateHotspotAlerts(hotspot, req);
      await saveAlerts(newAlerts, hotspot.id, pool);
    }

    console.log(`Successfully updated alerts for ${hotspots.length} hotspots.`);
    res.status(200).json({
      message: `Successfully updated alerts for ${hotspots.length} hotspots.`,
    });
  } catch (err) {
    console.error("Failed to update hotspot alerts:", err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
