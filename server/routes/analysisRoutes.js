const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authToken");
const {
  getTrafficAlerts,
  getDestinationAlerts,
} = require("../services/alertServices");

router.post("/trip", authenticateToken, async (req, res) => {
  const { startLocation, destinations } = req.body;
  if (
    !startLocation ||
    !destinations ||
    !Array.isArray(destinations) ||
    destinations.length === 0
  ) {
    return res.status(400).json({
      message: "Start location and a valid destinations array are required.",
    });
  }

  try {
    const analyzeSingleTrip = async (start, destination) => {
      const [routeAlerts, destinationAlerts] = await Promise.all([
        getTrafficAlerts(start, destination, req),
        getDestinationAlerts(destination, req),
      ]);

      const allAlerts = [...routeAlerts, ...destinationAlerts];

      let overallRisk = "Low";
      if (allAlerts.some((a) => a.severity === "Critical"))
        overallRisk = "Critical";
      else if (allAlerts.some((a) => a.severity === "High"))
        overallRisk = "High";
      else if (allAlerts.some((a) => a.severity === "Medium"))
        overallRisk = "Medium";

      return {
        id: destination,
        from: start,
        to: destination,
        overallRisk,
        routeAlerts,
        destinationAlerts,
      };
    };

    const analysisResults = await Promise.all(
      destinations.map((dest) =>
        analyzeSingleTrip(startLocation, dest.location)
      )
    );
    res.json(analysisResults);
  } catch (error) {
    console.error("Analysis failed:", error);
    res.status(500).json({ message: "Failed to perform analysis." });
  }
});

module.exports = router;
