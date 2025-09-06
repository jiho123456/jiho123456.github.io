import type { RequestHandler } from "express";

export const handleChat: RequestHandler = async (req, res) => {
  const { message } = req.body as { message?: string };
  const reply = generateAssistantReply(message ?? "");
  res.status(200).json({ response: reply });
};

function generateAssistantReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("study") || lower.includes("when")) {
    return "Based on your routine, tomorrow morning between 9–11 AM looks clear and aligns with your peak focus window.";
  }
  if (lower.includes("add") || lower.includes("schedule")) {
    return "Done! I've added it to your schedule. Want a reminder 10 minutes before?";
  }
  return "Got it! I'll keep that in mind. Would you like me to suggest an optimal time based on your energy levels?";
}
