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
