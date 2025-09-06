import type { RequestHandler } from "express";
import { supabase } from "../lib/supabase";
import type { EventsResponse, EventItem } from "@shared/api";

export const getEvents: RequestHandler = async (_req, res) => {
  if (!supabase) return res.status(500).json({ events: [], error: "Supabase not configured" });
  const { data, error } = await supabase.from("events").select("*").order("start_time", { ascending: true });
  if (error) {
    // If table doesn't exist or any error, return empty list (non-fatal)
    const response: EventsResponse = { events: [] };
    return res.status(200).json(response);
  }
  const events = (data ?? []) as EventItem[];
  const response: EventsResponse = { events };
  res.status(200).json(response);
};
