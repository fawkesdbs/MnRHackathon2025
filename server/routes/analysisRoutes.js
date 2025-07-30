const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const authenticateToken = require("../middleware/authToken");

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY;

router.post("/trip", authenticateToken, async (req, res) => {
  const { startLocation, destinations } = req.body;
  if (!startLocation || !destinations || destinations.length === 0) {
    return res
      .status(400)
      .json({ message: "Start location and destinations are required." });
  }

  try {
    const analysisResults = await Promise.all(
      destinations.map((dest) => analyzeSingleTrip(startLocation, dest))
    );
    res.json(analysisResults);
  } catch (error) {
    console.error("Analysis failed:", error);
    res.status(500).json({ message: "Failed to perform analysis." });
  }
});
const analyzeSingleTrip = async (start, destination) => {
  const [routeAlerts, destinationAlerts] = await Promise.all([
    getTrafficAlerts(start, destination),
    getDestinationAlerts(destination),
  ]);

  const allAlerts = [...routeAlerts, ...destinationAlerts];

  let overallRisk = "Low";
  if (allAlerts.some((a) => a.severity === "Critical"))
    overallRisk = "Critical";
  else if (allAlerts.some((a) => a.severity === "High")) overallRisk = "High";
  else if (allAlerts.some((a) => a.severity === "Medium"))
    overallRisk = "Medium";

  return {
    id: destination,
    from: start,
    to: destination,
    overallRisk: overallRisk,
    routeAlerts,
    destinationAlerts,
  };
};

const getTrafficAlerts = async (start, destination) => {
  const query = `"${start}" AND "${destination}" AND (traffic OR crash OR closure OR delay)`;
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    query
  )}&lang=en&token=${GNEWS_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.articles.map((article) => ({
      id: article.url,
      title: article.title,
      type: "Route",
      severity: "Medium",
      timestamp: new Date(article.publishedAt),
    }));
  } catch (error) {
    console.error("GNews traffic error:", error);
    return [];
  }
};

const getDestinationAlerts = async (destination) => {
  const [weatherAlerts, newsAlerts] = await Promise.all([
    getWeatherAlerts(destination),
    getNewsAlerts(destination),
  ]);
  return [...weatherAlerts, ...newsAlerts];
};

const getWeatherAlerts = async (location) => {
  const url = `http://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${encodeURIComponent(
    location
  )}&alerts=yes`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.alerts && data.alerts.alert.length > 0) {
      return data.alerts.alert.map((alert) => ({
        id: alert.msgtype + alert.note,
        title: alert.headline,
        type: "Destination",
        severity: "High",
        timestamp: new Date(),
      }));
    }
    return [];
  } catch (error) {
    console.error("WeatherAPI error:", error);
    return [];
  }
};

const getNewsAlerts = async (location) => {
  const query = `"${location}" AND (protest OR strike OR unrest OR warning OR security alert)`;
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
    query
  )}&lang=en&token=${GNEWS_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.articles.map((article) => ({
      id: article.url,
      title: article.title,
      type: "Destination",
      severity: "High",
      timestamp: new Date(article.publishedAt),
    }));
  } catch (error) {
    console.error("GNews destination error:", error);
    return [];
  }
};

module.exports = router;
