const express = require('express');
const { poolPromise, sql } = require("../db");
const authenticateToken = require("../middleware/authToken");
const {
  getTrafficAlerts,
  getDestinationAlerts,
} = require("../services/alertServices");
const router = express.Router();

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

router.get("/user/:userId", authenticateToken, async (req, res) => {
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

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { created_by, location, startLocation } = req.body;
    if (req.user.id.toString() !== created_by.toString()) {
      return res.status(403).json({
        message:
          "Forbidden: You can only add destinations to your own profile.",
      });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("created_by", sql.Int, created_by)
      .input("location", sql.NVarChar, location)
      .input("risk_level", sql.Int, 0).query(`
        INSERT INTO dbo.monitored_destinations (location, risk_level, last_checked, created_by, created_at, updated_at) 
        OUTPUT INSERTED.id
        VALUES (@location, @risk_level, GETDATE(), @created_by, GETDATE(), GETDATE());
      `);

    const newDestinationId = result.recordset[0].id;

    const [trafficAlerts, destinationAlerts] = await Promise.all([
      getTrafficAlerts(startLocation, location, req),
      getDestinationAlerts(location, req),
    ]);

    await saveAlerts(trafficAlerts, newDestinationId, pool);
    await saveAlerts(destinationAlerts, newDestinationId, pool);

    const allAlerts = [...trafficAlerts, ...destinationAlerts];
    let overallRisk = "Low";
    if (allAlerts.some((a) => a.severity === "Critical")) {
      overallRisk = "Critical";
    } else if (allAlerts.some((a) => a.severity === "High")) {
      overallRisk = "High";
    } else if (allAlerts.some((a) => a.severity === "Medium")) {
      overallRisk = "Medium";
    }

    const riskLevelMap = { Low: 0, Medium: 1, High: 2, Critical: 3 };
    const finalRiskLevelInt = riskLevelMap[overallRisk];

    await pool
      .request()
      .input("id", sql.Int, newDestinationId)
      .input("risk_level", sql.Int, finalRiskLevelInt)
      .query(
        "UPDATE dbo.monitored_destinations SET risk_level = @risk_level WHERE id = @id"
      );

    res.status(201).json({
      id: newDestinationId,
      created_by,
      location,
      risk_level: overallRisk,
    });
  } catch (err) {
    console.error("Error creating destination:", err);
    res.status(500).send(err.message);
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
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