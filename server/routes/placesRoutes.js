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

module.exports = router;
