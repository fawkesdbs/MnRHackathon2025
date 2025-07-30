const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const authenticateToken = require("../middleware/authToken");

// const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY;
const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;

const getAiSummarizedAlerts = async (articles, alertType, req) => {
  if (!articles || articles.length === 0) {
    return [];
  }

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await fetch("http://localhost:5000/api/ai/summarize-alerts", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization,
        },
        body: JSON.stringify({ articles, alertType }),
      });

      // If the request was successful, process and return the data
      if (response.ok) {
        return response.json();
      }

      // If the error is 503 (Overloaded), wait and retry
      if (response.status === 503) {
        attempt++;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff (2s, 4s)
          console.log(`AI model overloaded. Retrying in ${delay / 1000} seconds...`);
          await new Promise(res => setTimeout(res, delay));
          continue; // Try the request again
        }
      }
      
      // For other errors (like 400, 404), don't retry, just fail
      console.error("AI summarization failed with status:", response.status);
      return [];

    } catch (error) {
      console.error(`AI summarization failed for ${alertType}:`, error);
      return []; // Return empty on a network or other unrecoverable error
    }
  }

  // If all retries fail, return an empty array
  console.error("AI summarization failed after all retries.");
  return [];
};

const getTrafficAlerts = async (start, destination, req) => {
  const startCity = start;
  const destCity = destination;
  const query = `(${startCity} OR ${destCity}) AND (road closure OR traffic OR crash OR highway delay)`;
  
  const url = `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_API_KEY}&q=${encodeURIComponent(query)}&language=en`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && Array.isArray(data.results)) {
      const formattedArticles = data.results.map(article => ({
          title: article.title,
          content: article.description || article.content || ""
      }));
      console.log(`Traffic from ${startCity} to ${destCity}`)
      console.log(formattedArticles);
      return await getAiSummarizedAlerts(formattedArticles, "Route", req);
    }
    return [];
  } catch (error) {
    console.error("NewsData.io traffic error:", error);
    return [];
  }
};

const getNewsAlerts = async (location, req) => {
  const city = location;
  const query = `${city} AND (protest OR strike OR unrest OR security alert)`;

  const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&q=${encodeURIComponent(query)}&language=en`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && Array.isArray(data.results)) {
      const formattedArticles = data.results.map(article => ({
          title: article.title,
          content: article.description || article.content || ""
      }));
      console.log(`News alerts for ${city}`);
      console.log(formattedArticles);
      return await getAiSummarizedAlerts(formattedArticles, "Destination", req);
    }
    return [];
  } catch (error) {
    console.error("NewsData.io destination error:", error);
    return [];
  }
};


const getWeatherAlerts = async (location, req) => {
  const url = `http://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${encodeURIComponent(
    location
  )}&alerts=yes`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (
      data.alerts &&
      Array.isArray(data.alerts.alert) &&
      data.alerts.alert.length > 0
    ) {
      const formattedAlerts = data.alerts.alert.map((alert) => ({
        title: alert.headline,
        content: alert.desc,
      }));
      console.log(`Weather alerts for ${location}`);
      console.log(formattedAlerts);
      return await getAiSummarizedAlerts(formattedAlerts, "Destination", req);
    }
    return [];
  } catch (error) {
    console.error("WeatherAPI error:", error);
    return [];
  }
};

const getDestinationAlerts = async (destination, req) => {
  const [weatherAlerts, newsAlerts] = await Promise.all([
    getWeatherAlerts(destination, req),
    getNewsAlerts(destination, req),
  ]);
  return [...weatherAlerts, ...newsAlerts];
};

router.post("/trip", authenticateToken, async (req, res) => {
  const { startLocation, destinations } = req.body;
  if (
    !startLocation ||
    !destinations ||
    !Array.isArray(destinations) ||
    destinations.length === 0
  ) {
    return res
      .status(400)
      .json({
        message: "Start location and a valid destinations array are required.",
      });
  }

  try {
    // This inner function is scoped to the request, so it has access to `req`
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