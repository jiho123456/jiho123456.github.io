import type { RequestHandler } from "express";
import { supabase } from "../lib/supabase";

export const submitEarlyAccess: RequestHandler = async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: "Valid email is required" });
  }

  if (!supabase) {
    return res.status(200).json({ ok: true, stored: false });
  }

  try {
    const { error } = await supabase
      .from("early_access")
      .insert({ email, user_agent: req.headers["user-agent"] || null })
      .single();
    if (error) {
      return res.status(200).json({ ok: true, stored: false });
    }
    return res.status(200).json({ ok: true, stored: true });
  } catch {
    return res.status(200).json({ ok: true, stored: false });
  }
};

export const submitFeedback: RequestHandler = async (req, res) => {
  const { email, message } = req.body as { email?: string; message?: string };
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ ok: false, error: "Message is required" });
  }

  if (!supabase) {
    return res.status(200).json({ ok: true, stored: false });
  }

  try {
    const { error } = await supabase
      .from("feedback")
      .insert({ email: email || null, message })
      .single();
    if (error) {
      return res.status(200).json({ ok: true, stored: false });
    }
    return res.status(200).json({ ok: true, stored: true });
  } catch {
    return res.status(200).json({ ok: true, stored: false });
  }
};
