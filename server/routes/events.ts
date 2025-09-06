import type { RequestHandler } from "express";
import { supabase } from "../lib/supabase";
import type { EventsResponse, EventItem } from "@shared/api";

export const getEvents: RequestHandler = async (req, res) => {
  if (!supabase) return res.status(500).json({ events: [], error: "Supabase not configured" });
  const { from, to } = req.query as { from?: string; to?: string };
  let query = supabase.from("events").select("*");
  if (from) query = query.gte("start_time", from);
  if (to) query = query.lte("end_time", to);
  const { data, error } = await query.order("start_time", { ascending: true });
  if (error) {
    const response: EventsResponse = { events: [] };
    return res.status(200).json(response);
  }
  const events = (data ?? []) as EventItem[];
  const response: EventsResponse = { events };
  res.status(200).json(response);
};

export const createEvent: RequestHandler = async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Supabase not configured" });
  const payload = req.body as Partial<EventItem>;
  const { data, error } = await supabase.from("events").insert({
    title: payload.title,
    description: payload.description ?? null,
    category: payload.category ?? null,
    start_time: payload.start_time ?? null,
    end_time: payload.end_time ?? null,
    status: payload.status ?? null,
    location: payload.location ?? null,
  }).select("*").single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ event: data });
};

export const updateEvent: RequestHandler = async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Supabase not configured" });
  const id = req.params.id;
  const payload = req.body as Partial<EventItem>;
  const { data, error } = await supabase.from("events").update({
    title: payload.title,
    description: payload.description ?? null,
    category: payload.category ?? null,
    start_time: payload.start_time ?? null,
    end_time: payload.end_time ?? null,
    status: payload.status ?? null,
    location: payload.location ?? null,
  }).eq("id", id).select("*").single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ event: data });
};

export const deleteEvent: RequestHandler = async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Supabase not configured" });
  const id = req.params.id;
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
};
