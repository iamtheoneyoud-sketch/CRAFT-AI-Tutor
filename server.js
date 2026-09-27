import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.use(express.json());
app.use(express.static(__dirname));

// AI Chat Endpoint with Fail-safe Fallback
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    const aiModel = req.body.model || "grandmaster";

    let systemPrompt = "You are a wise Wuxia Grandmaster. Answer with deep wisdom, using martial arts metaphors. Keep your answers concise.";
    if (aiModel === "scholar") {
        systemPrompt = "You are a brilliant Wuxia Scholar. Answer logically with historical context. Keep it concise.";
    } else if (aiModel === "warrior") {
        systemPrompt = "You are a fierce Wuxia Warrior. Answer directly and boldly. Keep it concise.";
    }

    // Attempt 1: Gemini Engine Primary
    try {
        if (process.env.GEMINI_API_KEY) {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(`${systemPrompt}\n\nUser Question: ${userMessage}`);
            const responseText = result.response.text();
            
            if (responseText) {
                return res.json({ reply: responseText, engine: "gemini" });
            }
        }
    } catch (geminiError) {
        console.warn("Gemini Engine failed, switching to OpenAI fallback:", geminiError.message);
    }

    // Attempt 2: OpenAI Engine Fallback
    try {
        if (process.env.OPENAI_API_KEY) {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
            });
            return res.json({ reply: completion.choices[0].message.content, engine: "openai" });
        }
    } catch (openAiError) {
        console.error("OpenAI Engine failed:", openAiError.message);
    }

    // Ultimate Fallback Response
    res.status(500).json({ 
        reply: "The spiritual qi flow is currently blocked. Please check your API keys in Render." 
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
        
