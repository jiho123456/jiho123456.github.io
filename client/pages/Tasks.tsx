import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TasksResponse, TaskItem } from "@shared/api";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";

function TaskModal({ open, onClose, initial, onSave, onDelete }: { open: boolean; onClose: () => void; initial?: Partial<TaskItem>; onSave: (input: Partial<TaskItem>) => void; onDelete?: () => void; }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [due, setDue] = useState(initial?.due_date || "");
  const [priority, setPriority] = useState(initial?.priority || "medium");
  const [category, setCategory] = useState(initial?.category || "");
  const [duration, setDuration] = useState<number | string>(initial?.duration_min ?? "");

  useEffect(()=>{ if (open) { setTitle(initial?.title || ""); setDesc(initial?.description || ""); setDue(initial?.due_date || ""); setPriority(initial?.priority || "medium"); setCategory(initial?.category || ""); setDuration(initial?.duration_min ?? ""); } }, [open, initial]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-5 animate-slide-in">
        <h3 className="text-lg font-bold mb-3">{initial?.id ? "Edit task" : "New task"}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Title</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border rounded-button px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Due</label>
            <input type="datetime-local" value={due} onChange={(e)=>setDue(e.target.value)} className="w-full border rounded-button px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Description</label>
            <textarea value={desc} onChange={(e)=>setDesc(e.target.value)} className="w-full border rounded-button px-3 py-2" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-600">Priority</label>
              <select value={priority ?? ""} onChange={(e)=>setPriority(e.target.value)} className="w-full border rounded-button px-3 py-2">
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Category</label>
              <input value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full border rounded-button px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Duration (min)</label>
              <input type="number" value={duration as any} onChange={(e)=>setDuration(Number(e.target.value))} className="w-full border rounded-button px-3 py-2" />
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-5">
          {initial?.id ? (<button onClick={onDelete} className="px-3 py-2 bg-red-500 text-white rounded-button">Delete</button>) : <span />}
          <div className="space-x-2">
            <button onClick={onClose} className="px-3 py-2 border rounded-button">Cancel</button>
            <button onClick={()=>onSave({ id: initial?.id, title, description: desc, due_date: due, priority, category, duration_min: Number(duration) || null })} className="px-3 py-2 bg-primary text-white rounded-button">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [userName, setUserName] = useState("User");
  useEffect(() => { supabase?.auth.getUser().then((u) => setUserName((u.data.user?.user_metadata as any)?.full_name || u.data.user?.email?.split("@")[0] || "User")); }, []);

  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["tasks"], queryFn: async () => await (await import('@/lib/api')).apiGet<TasksResponse>('/api/tasks', { tasks: [] }) });
  const tasks: TaskItem[] = data?.tasks ?? [];

  const [modal, setModal] = useState<{ open: boolean; initial?: Partial<TaskItem> }>({ open: false });
  useEffect(() => { if (new URLSearchParams(window.location.search).get('create') === '1') setModal({ open: true }); }, []);

  const createMut = useMutation({ mutationFn: async (payload: Partial<TaskItem>) => (await (await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })).json()), onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }) });
  const updateMut = useMutation({ mutationFn: async (payload: Partial<TaskItem>) => (await (await fetch(`/api/tasks/${payload.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })).json()), onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }) });
  const deleteMut = useMutation({ mutationFn: async (id: string | number | undefined) => { await fetch(`/api/tasks/${id}`, { method: "DELETE" }); }, onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }) });

  const [filter, setFilter] = useState<"all"|"open"|"done">("all");
  const filtered = useMemo(()=> tasks.filter(t => filter === "all" ? true : (filter === "open" ? t.status !== "done" : t.status === "done")), [tasks, filter]);

  const [quickTitle, setQuickTitle] = useState("");
  async function quickAdd() {
    const title = quickTitle.trim(); if (!title) return; await createMut.mutateAsync({ title, status: 'open' }); setQuickTitle(""); }

  return (
    <AppShell userName={userName}>
      <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tasks</h2>
          <div className="space-x-2">
            <select className="border rounded-button px-2 py-1" value={filter} onChange={(e)=>setFilter(e.target.value as any)}>
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="done">Done</option>
            </select>
            <button className="px-3 py-1.5 bg-primary text-white rounded-button text-sm" onClick={()=>setModal({ open: true })}>New task</button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <input value={quickTitle} onChange={(e)=>setQuickTitle(e.target.value)} placeholder="Quick add a task" className="flex-1 border rounded-button px-3 py-2" />
          <button onClick={quickAdd} className="px-3 py-2 bg-gray-900 text-white rounded-button">Add</button>
        </div>

        {isLoading && <div className="p-3 text-sm text-gray-500">Loading...</div>}
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={String(t.id)} className="border border-gray-200 rounded-lg p-4 hover-lift">
              <div className="flex items-start gap-3">
                <label className="custom-checkbox mt-1">
                  <input type="checkbox" checked={t.status === 'done'} onChange={(e)=> updateMut.mutate({ id: t.id, status: e.target.checked ? 'done' : 'open' })} />
                  <span className="checkmark" />
                </label>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-semibold">{t.title}</h4>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      {t.due_date && <span>{new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                      <button className="px-2 py-1 border rounded-button text-xs" onClick={()=>setModal({ open:true, initial: t })}>Edit</button>
                      <button className="px-2 py-1 border rounded-button text-xs" onClick={()=>deleteMut.mutate(t.id as any)}>Delete</button>
                    </div>
                  </div>
                  {t.description && <p className="text-sm text-gray-600 mt-1">{t.description}</p>}
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {t.category && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">{t.category}</span>}
                    {typeof t.duration_min === 'number' && <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">{t.duration_min} min</span>}
                    {t.priority && <span className={`px-2 py-0.5 rounded-full ${t.priority === 'high' ? 'bg-red-100 text-red-800' : t.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{t.priority}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !isLoading && (
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">No tasks to show. Add a new task.</div>
          )}
        </div>
      </div>

      <TaskModal
        open={modal.open}
        initial={modal.initial}
        onClose={()=>setModal({ open:false })}
        onSave={(input)=>{ input.id ? updateMut.mutate(input) : createMut.mutate({ ...input, status: 'open' }); setModal({ open:false }); }}
        onDelete={modal.initial?.id ? ()=>{ deleteMut.mutate(modal.initial?.id as any); setModal({ open:false }); } : undefined}
      />
    </AppShell>
  );
}
