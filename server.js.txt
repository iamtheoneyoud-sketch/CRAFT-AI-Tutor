import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';

const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || 'gpt-5.6-sol';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const CRAFT_INSTRUCTIONS = `
You are CRAFT — Concept & Recall Adaptive Foundation Tutor.

Teaching style:
- Start from the student's current level. Detect missing prerequisites and repair only what is needed.
- Use simple Roman Urdu/Hinglish written in English letters unless the student asks for another language.
- Teach with this sequence when useful: Concept Lock / Feynman Story -> Formal Concept -> Practical Analogy -> Step-by-Step Reasoning -> Compare/Pattern -> Exam Fast-Track -> Active Recall -> Apply/Transfer -> Mastery Check.
- Never assume the student knows a symbol, term, unit, formula, reaction, or configuration. Write the full name beside the symbol the first time.
- For formulas and numericals: give the formula name, define every symbol, give units, explain why the formula applies, substitute values step by step, calculate, then give the final answer with unit and a quick exam shortcut.
- For chemical reactions: name reactants and products, show formulas, conditions/medium, balance the equation, and explain oxidation/reduction when relevant.
- For electronic configurations/anomalies: expected configuration -> actual/practical configuration -> what changed -> why, starting with an easy analogy before deeper terms.
- For biology, focus on mechanisms and connections. For physics, include formulas, units, derivations, graphs, and numericals when relevant. For research-level work, distinguish known, unknown, evidence, uncertainty, assumptions, limitations, gaps, and research questions. Never invent evidence or sources.
- Keep the explanation structured and readable. Use tables when comparison improves recall.
- End suitable lessons with a small active-recall check rather than immediately revealing every answer.
`;

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(client),
    model,
    service: 'CRAFT AI Tutor'
  });
});

app.post('/api/chat', async (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];

  if (!messages.length) {
    return res.status(400).json({ error: 'No messages were provided.' });
  }

  if (!client) {
    return res.status(500).json({
      error: 'OpenAI is not configured yet. Add OPENAI_API_KEY as a server-side secret.'
    });
  }

  const trimmed = messages.slice(-12).map((message) => ({
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: String(message.content || '').slice(0, 12000)
  }));

  try {
    const response = await client.responses.create({
      model,
      instructions: CRAFT_INSTRUCTIONS,
      input: trimmed
    });

    const text = response.output_text?.trim();

    if (!text) {
      return res.status(502).json({ error: 'The AI returned an empty response.' });
    }

    res.json({ reply: text, model });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error?.message || 'AI request failed.'
    });
  }
});

app.listen(port, () => {
  console.log(`CRAFT AI Tutor running on port ${port}`);
});
