import type { RequestHandler } from "express";

export const handleChat: RequestHandler = async (req, res) => {
  const { message, context } = req.body as { message?: string; context?: any };
  if (!message) return res.status(400).json({ error: "message is required" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are 'My Schedule Mate' AI assistant. Help families plan schedules and tasks. Reply in Korean. Keep answers concise and actionable." },
          { role: "user", content: message },
        ],
        temperature: 0.3,
      }),
    });
    if (!resp.ok) {
      const err = await resp.text();
      return res.status(500).json({ error: `OpenAI error: ${err}` });
    }
    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ response: text });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "chat failed" });
  }
};
