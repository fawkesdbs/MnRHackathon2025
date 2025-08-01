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
      .input("userId", sql.Int, req.params.userId).query(`
                SELECT d.* FROM dbo.monitored_destinations d
                JOIN dbo.user_destinations ud ON d.id = ud.destination_id
                WHERE ud.user_id = @userId
            `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching destinations:", err);
    res.status(500).send(err.message);
  }
});

router.post("/", authenticateToken, async (req, res) => {
  const { created_by, location, startLocation } = req.body;
  if (req.user.id.toString() !== created_by.toString()) {
    return res.status(403).json({
      message: "Forbidden: You can only add destinations to your own profile.",
    });
  }

  try {
    const pool = await poolPromise;
    let destinationId;
    let finalLocation = location.trim();
    let overallRisk = "Low";

    const existingDest = await pool
      .request()
      .input("location", sql.NVarChar, finalLocation)
      .query(
        "SELECT * FROM dbo.monitored_destinations WHERE location = @location"
      );

    if (existingDest.recordset.length > 0) {
      destination = existingDest.recordset[0];
    } else {
      // Create the new destination
      const result = await pool
        .request()
        .input("location", sql.NVarChar, finalLocation).query(`
                    INSERT INTO dbo.monitored_destinations (location, risk_level, last_checked, is_hotspot)
                    OUTPUT INSERTED.*
                    VALUES (@location, 0, GETDATE(), 0);
                `);
      destination = result.recordset[0];

      // Generate and save initial alerts
      const [trafficAlerts, destinationAlerts] = await Promise.all([
        getTrafficAlerts(startLocation, finalLocation, req),
        getDestinationAlerts(finalLocation, req),
      ]);
      const allAlerts = [...trafficAlerts, ...destinationAlerts];
      await saveAlerts(allAlerts, destination.id, pool);

      // Calculate and update its risk level
      let overallRisk = "Low";
      if (allAlerts.some((a) => a.severity === "Critical"))
        overallRisk = "Critical";
      else if (allAlerts.some((a) => a.severity === "High"))
        overallRisk = "High";
      else if (allAlerts.some((a) => a.severity === "Medium"))
        overallRisk = "Medium";

      const riskLevelMap = { Low: 0, Medium: 1, High: 2, Critical: 3 };
      const finalRiskLevelInt = riskLevelMap[overallRisk];

      await pool
        .request()
        .input("id", sql.Int, destination.id)
        .input("risk_level", sql.Int, finalRiskLevelInt)
        .query(
          "UPDATE dbo.monitored_destinations SET risk_level = @risk_level WHERE id = @id"
        );

      destination.risk_level = finalRiskLevelInt; // Update the object to be returned
    }

    // Link user to the destination
    await pool
      .request()
      .input("user_id", sql.Int, created_by)
      .input("destination_id", sql.Int, destination.id).query(`
                IF NOT EXISTS (SELECT 1 FROM dbo.user_destinations WHERE user_id = @user_id AND destination_id = @destination_id)
                BEGIN
                    INSERT INTO dbo.user_destinations (user_id, destination_id) VALUES (@user_id, @destination_id)
                END
            `);

    // Map numeric risk level back to string for the response
    const riskLevelString =
      { 0: "Low", 1: "Medium", 2: "High", 3: "Critical" }[
        destination.risk_level
      ] || "Low";

    res.status(201).json({
      id: destination.id,
      location: destination.location,
      risk_level: riskLevelString,
    });
  } catch (err) {
    console.error("Error creating destination link:", err);
    res.status(500).send(err.message);
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("destinationId", sql.Int, req.params.id)
      .query(
        "DELETE FROM dbo.user_destinations WHERE user_id = @userId AND destination_id = @destinationId"
      );

    res.status(200).json({ message: "Destination unlinked successfully" });
  } catch (err) {
    console.error("Error unlinking destination:", err);
    res.status(500).send(err.message);
  }
});

module.exports = router;