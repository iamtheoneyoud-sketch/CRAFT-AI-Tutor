const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, provider } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message khali nahi ho sakta, guru!" });
    }

    // OpenAI Provider Handler
    if (provider === 'openai') {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Valid and stable OpenAI model
          messages: [{ role: "user", content: message }],
        });
        const reply = completion.choices[0].message.content;
        return res.json({ reply });
      } catch (openaiErr) {
        console.error("OpenAI API Error:", openaiErr);
        return res.status(500).json({ error: "OpenAI Qi Blocked: " + openaiErr.message });
      }
    } 
    
    // Default: Google Gemini Provider Handler
    else {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(message);
        const response = await result.response;
        const reply = response.text();
        return res.json({ reply });
      } catch (geminiErr) {
        console.error("Gemini API Error:", geminiErr);
        return res.status(500).json({ error: "Gemini Qi Blocked: " + geminiErr.message });
      }
    }

  } catch (err) {
    console.error("Server Execution Error:", err);
    res.status(500).json({ error: "Internal Server Error: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CRAFT Tutor backend is running on port ${PORT} with full Wuxia power!`);
});
