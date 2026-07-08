const axios = require("axios");

const generateLyrics = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("✍️ Generating lyrics for:", prompt);

    // AI API call - OpenAI example
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Write song lyrics based on this: ${prompt}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const lyrics = response.data.choices[0].message.content;

    console.log("🎶 Lyrics generated");

    return res.json({ lyrics });

  } catch (err) {
    console.error("❌ Lyrics generation error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Lyrics generation failed",
      details: err?.response?.data || err.message,
    });
  }
};


module.exports = { generateLyrics}
