require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

const apiKey = process.env.GEOAPIFY_API_KEY;

router.get("/autocomplete", async (req, res) => {
  const text = req.query.text;
  if (!text) {
    return res.status(400).json({ message: "Text query is required." });
  }

  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
    text
  )}&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    // We only want to send back the formatted address suggestions
    const suggestions = data.features.map(
      (feature) => feature.properties.formatted
    );
    res.json(suggestions);
  } catch (error) {
    console.error("Geoapify API error:", error);
    res.status(500).json({ message: "Failed to fetch place suggestions." });
  }
});

router.get("/reverse-geocode", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res
      .status(400)
      .json({ message: "Latitude and longitude are required." });
  }

  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Extract the formatted address from the first result
    if (data.features && data.features.length > 0) {
      const properties = data.features[0].properties;
      // Construct a "City, Country" string for stability
      const city = properties.city;
      const province = properties.state_code;
      const country = properties.country;

      if (city && country) {
        res.json({ location: `${city}, ${province}, ${country}` });
      } else {
        // Fallback to the original formatted address if city/country are not available
        res.json({ location: properties.formatted });
      }
    } else {
      res.status(404).json({ message: "Address not found." });
    }
  } catch (error) {
    console.error("Geoapify reverse geocoding error:", error);
    res.status(500).json({ message: "Failed to fetch address." });
  }
});

module.exports = router;
