/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

export interface DemoResponse {
  message: string;
}

export interface EventItem {
  id: string | number;
  title: string;
  description?: string | null;
  category?: string | null;
  start_time?: string | null; // ISO string
  end_time?: string | null;   // ISO string
  status?: string | null;     // e.g., completed, planned
  location?: string | null;
}

export interface TaskItem {
  id: string | number;
  title: string;
  description?: string | null;
  due_date?: string | null; // ISO
  priority?: string | null; // low/medium/high
  duration_min?: number | null;
  category?: string | null;
  status?: string | null; // open/done
}

export interface EventsResponse { events: EventItem[] }
export interface TasksResponse { tasks: TaskItem[] }
