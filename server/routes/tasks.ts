import type { RequestHandler } from "express";
import { supabase } from "../lib/supabase";
import type { TasksResponse, TaskItem } from "@shared/api";

export const getTasks: RequestHandler = async (_req, res) => {
  if (!supabase) return res.status(500).json({ tasks: [], error: "Supabase not configured" });
  const { data, error } = await supabase.from("tasks").select("*").order("due_date", { ascending: true });
  if (error) {
    const response: TasksResponse = { tasks: [] };
    return res.status(200).json(response);
  }
  const tasks = (data ?? []) as TaskItem[];
  const response: TasksResponse = { tasks };
  res.status(200).json(response);
};

export const createTask: RequestHandler = async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Supabase not configured" });
  const payload = req.body as Partial<TaskItem>;
  const { data, error } = await supabase.from("tasks").insert({
    title: payload.title,
    description: payload.description ?? null,
    due_date: payload.due_date ?? null,
    priority: payload.priority ?? null,
    duration_min: payload.duration_min ?? null,
    category: payload.category ?? null,
    status: payload.status ?? "open",
  }).select("*").single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ task: data });
};

export const updateTask: RequestHandler = async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Supabase not configured" });
  const id = req.params.id;
  const payload = req.body as Partial<TaskItem>;
  const { data, error } = await supabase.from("tasks").update({
    title: payload.title,
    description: payload.description ?? null,
    due_date: payload.due_date ?? null,
    priority: payload.priority ?? null,
    duration_min: payload.duration_min ?? null,
    category: payload.category ?? null,
    status: payload.status ?? undefined,
  }).eq("id", id).select("*").single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ task: data });
};

export const deleteTask: RequestHandler = async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "Supabase not configured" });
  const id = req.params.id;
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
};
