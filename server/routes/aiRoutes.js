const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();
const authenticateToken = require("../middleware/authToken");

const GENAI_API_KEY = process.env.GENAI_API_KEY;
const GENAI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GENAI_API_KEY}`;

router.post("/summarize-alerts", authenticateToken, async (req, res) => {
  const { articles, alertType } = req.body;

  if (!articles || articles.length === 0) {
    return res.json([]);
  }

  const systemPrompt = `
    You are a Travel Risk Analyst. Your task is to analyze a list of news articles and identify unique real-world events that could impact a traveler.
    - Consolidate duplicate or related articles into a single, concise alert.
    - Generate a brief, clear title for each unique event.
    - Determine a severity level: "Medium", "High", or "Critical".
    - Ignore articles that are not relevant to immediate travel risks (e.g., financial news, general politics).
    - If there are no relevant risks, return an empty array.
    - Respond ONLY with a valid JSON array of objects matching this schema: [{ "title": "Concise alert title", "severity": "Medium" }].
  `;

  const modelRequest = {
    contents: [
      {
        parts: [
          { text: systemPrompt },
          { text: "Here are the articles to analyze:" },
          {
            text: JSON.stringify(
              articles.map((a) => ({ title: a.title, content: a.content }))
            ),
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  try {
    const aiResponse = await fetch(GENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modelRequest),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error("AI API Error:", errorBody);
      throw new Error(`AI API request failed with status ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const alertText = aiData.candidates[0].content.parts[0].text;

    const generatedAlerts = JSON.parse(alertText);

    const finalAlerts = generatedAlerts.map((alert) => ({
      id: `ai_${new Date().getTime()}_${Math.random()}`,
      title: alert.title,
      severity: alert.severity,
      type: alertType,
      timestamp: new Date(),
    }));

    res.json(finalAlerts);
  } catch (error) {
    console.error("AI processing error:", error);
    res.status(500).json([]);
  }
});

module.exports = router;
