const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Gemini with API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize OpenAI with API Key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, provider } = req.body; // provider can be 'gemini' or 'openai'

    if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ error: "Spiritual qi flow is currently blocked: Gemini API key missing." });
      }
      // Gemini 2.0 Flash model
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(message);
      const response = await result.response;
      const text = response.text();
      return res.json({ reply: text });
      
    } else {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ error: "Spiritual qi flow is currently blocked: OpenAI API key missing." });
      }
      // OpenAI o4-mini model
      const completion = await openai.chat.completions.create({
        model: "o4-mini-2025-04-16",
        messages: [{ role: "user", content: message }],
      });
      const text = completion.choices[0].message.content;
      return res.json({ reply: text });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Spiritual qi flow is currently blocked: " + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
