const express = require('express');
const { poolPromise, sql } = require("../db");
const authenticateToken = require("../middleware/authToken");
const router = express.Router();

// GET only CRITICAL alerts for the logged-in user (for the dashboard)
router.get("/user/:userId/critical", authenticateToken, async (req, res) => {
  if (req.user.id.toString() !== req.params.userId) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only access your own alerts." });
  }

  try {
    const pool = await poolPromise;
    const criticalSeverityInt = 3;

    const result = await pool
      .request()
      .input("userId", sql.Int, req.params.userId)
      .input("severityLevel", sql.Int, criticalSeverityInt).query(`
                SELECT 
                    a.id, 
                    a.title, 
                    a.message, 
                    a.status, 
                    a.severity, 
                    a.type, 
                    a.created_at as timestamp 
                FROM dbo.alerts a
                JOIN dbo.monitored_destinations d ON a.destination_id = d.id
                WHERE d.created_by = @userId AND a.severity = @severityLevel
                ORDER BY a.created_at DESC;
            `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching critical alerts:", err);
    res.status(500).send(err.message);
  }
});

// GET all alerts, grouped into "trips" for the alerts page
router.get("/user/:userId/trips", authenticateToken, async (req, res) => {
  if (req.user.id.toString() !== req.params.userId) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only access your own trip data." });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("userId", sql.Int, req.params.userId).query(`
            SELECT 
                d.id as destination_id,
                d.location,
                d.risk_level,
                a.id as alert_id,
                a.title,
                a.message,
                a.status,
                a.severity,
                a.type,
                a.created_at
            FROM dbo.monitored_destinations d
            LEFT JOIN dbo.alerts a ON d.id = a.destination_id
            WHERE d.created_by = @userId
            ORDER BY d.id, a.created_at DESC;
        `);

    // Process the flat SQL result into the nested structure the frontend expects
    const severityMap = {
      0: "Low",
      1: "Medium",
      2: "High",
      3: "Critical",
    };
    const trips = {};
    result.recordset.forEach((row) => {
      if (!trips[row.destination_id]) {
        trips[row.destination_id] = {
          id: row.destination_id.toString(),
          from: "Pretoria, South Africa", // This can be made dynamic later
          to: row.location,
          overallRisk: row.risk_level,
          routeAlerts: [],
          destinationAlerts: [],
        };
      }
      if (row.alert_id) {
        const alert = {
          id: row.alert_id.toString(),
          title: row.title,
          message: row.message,
          type: row.type,
          severity: severityMap[row.severity] || "Unknown",
          timestamp: row.created_at,
          associated_destination: row.destination_id.toString(),
        };
        if (row.type === "Route") {
          trips[row.destination_id].routeAlerts.push(alert);
        } else {
          trips[row.destination_id].destinationAlerts.push(alert);
        }
      }
    });

    res.json(Object.values(trips));
  } catch (err) {
    console.error("Error fetching trip alerts:", err);
    res.status(500).send(err.message);
  }
});


module.exports = router;