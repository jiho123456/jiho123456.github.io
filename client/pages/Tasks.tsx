import AppShell from "@/components/AppShell";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TasksResponse, TaskItem } from "@shared/api";
import { supabase } from "@/lib/supabase";

function TaskModal({ open, onClose, initial, onSave, onDelete }: { open: boolean; onClose: () => void; initial?: Partial<TaskItem>; onSave: (input: Partial<TaskItem>) => void; onDelete?: () => void; }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [due, setDue] = useState(initial?.due_date || "");
  const [priority, setPriority] = useState(initial?.priority || "medium");
  const [category, setCategory] = useState(initial?.category || "");
  const [duration, setDuration] = useState<number | string>(initial?.duration_min ?? "");

  useEffect(()=>{
    if (open) {
      setTitle(initial?.title || "");
      setDesc(initial?.description || "");
      setDue(initial?.due_date || "");
      setPriority(initial?.priority || "medium");
      setCategory(initial?.category || "");
      setDuration(initial?.duration_min ?? "");
    }
  }, [open, initial]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-5">
        <h3 className="text-lg font-bold mb-3">할 일 {initial?.id ? "수정" : "추가"}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">제목</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border rounded-button px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-600">마감일</label>
            <input type="datetime-local" value={due} onChange={(e)=>setDue(e.target.value)} className="w-full border rounded-button px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-600">설명</label>
            <textarea value={desc} onChange={(e)=>setDesc(e.target.value)} className="w-full border rounded-button px-3 py-2" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-600">우선순위</label>
              <select value={priority ?? ""} onChange={(e)=>setPriority(e.target.value)} className="w-full border rounded-button px-3 py-2">
                <option value="low">낮음</option>
                <option value="medium">보통</option>
                <option value="high">높음</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">카테고리</label>
              <input value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full border rounded-button px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">예상 시간(분)</label>
              <input type="number" value={duration as any} onChange={(e)=>setDuration(Number(e.target.value))} className="w-full border rounded-button px-3 py-2" />
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-5">
          {initial?.id ? (
            <button onClick={onDelete} className="px-3 py-2 bg-red-500 text-white rounded-button">삭제</button>
          ) : <span />}
          <div className="space-x-2">
            <button onClick={onClose} className="px-3 py-2 border rounded-button">취소</button>
            <button onClick={()=>onSave({ id: initial?.id, title, description: desc, due_date: due, priority, category, duration_min: Number(duration) || null })} className="px-3 py-2 bg-primary text-white rounded-button">저장</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [userName, setUserName] = useState("사용자");
  useEffect(() => {
    supabase?.auth.getUser().then((u) => setUserName((u.data.user?.user_metadata as any)?.full_name || u.data.user?.email?.split("@")[0] || "사용자"));
  }, []);

  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["tasks"], queryFn: async () => (await (await fetch("/api/tasks")).json()) as TasksResponse });
  const tasks: TaskItem[] = data?.tasks ?? [];

  const [modal, setModal] = useState<{ open: boolean; initial?: Partial<TaskItem> }>({ open: false });

  const createMut = useMutation({
    mutationFn: async (payload: Partial<TaskItem>) => (await (await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })).json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const updateMut = useMutation({
    mutationFn: async (payload: Partial<TaskItem>) => (await (await fetch(`/api/tasks/${payload.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })).json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const deleteMut = useMutation({
    mutationFn: async (id: string | number | undefined) => { await fetch(`/api/tasks/${id}`, { method: "DELETE" }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const [filter, setFilter] = useState<"all"|"open"|"done">("all");
  const filtered = useMemo(()=> tasks.filter(t => filter === "all" ? true : (filter === "open" ? t.status !== "done" : t.status === "done")), [tasks, filter]);

  return (
    <AppShell userName={userName}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">할 일</h2>
          <div className="space-x-2">
            <select className="border rounded-button px-2 py-1" value={filter} onChange={(e)=>setFilter(e.target.value as any)}>
              <option value="all">전체</option>
              <option value="open">진행중</option>
              <option value="done">완료</option>
            </select>
            <button className="px-3 py-1.5 bg-primary text-white rounded-button text-sm" onClick={()=>setModal({ open: true })}>새 할 일</button>
          </div>
        </div>

        {isLoading && <div className="p-3 text-sm text-gray-500">불러오는 중...</div>}
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={String(t.id)} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <label className="custom-checkbox mt-1">
                  <input type="checkbox" checked={t.status === 'done'} onChange={(e)=> updateMut.mutate({ id: t.id, status: e.target.checked ? 'done' : 'open' })} />
                  <span className="checkmark" />
                </label>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-semibold">{t.title}</h4>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      {t.due_date && <span>{new Date(t.due_date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</span>}
                      <button className="px-2 py-1 border rounded-button text-xs" onClick={()=>setModal({ open:true, initial: t })}>수정</button>
                      <button className="px-2 py-1 border rounded-button text-xs" onClick={()=>deleteMut.mutate(t.id as any)}>삭제</button>
                    </div>
                  </div>
                  {t.description && <p className="text-sm text-gray-600 mt-1">{t.description}</p>}
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {t.category && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">{t.category}</span>}
                    {typeof t.duration_min === 'number' && <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">{t.duration_min} 분</span>}
                    {t.priority && <span className={`px-2 py-0.5 rounded-full ${t.priority === 'high' ? 'bg-red-100 text-red-800' : t.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{t.priority}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !isLoading && (
            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">표시할 할 일이 없습니다. 새 작업을 추가해 보세요.</div>
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
