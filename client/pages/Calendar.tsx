import AppShell from "@/components/AppShell";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EventsResponse, EventItem } from "@shared/api";
import { supabase } from "@/lib/supabase";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ko } from "date-fns/locale";

function useUserName() {
  const [userName, setUserName] = useState("사용자");
  useEffect(() => {
    supabase?.auth.getUser().then((u) => setUserName((u.data.user?.user_metadata as any)?.full_name || u.data.user?.email?.split("@")[0] || "사용자"));
  }, []);
  return userName;
}

function EventModal({ open, onClose, initial, onSave, onDelete }: { open: boolean; onClose: () => void; initial?: Partial<EventItem>; onSave: (input: Partial<EventItem>) => void; onDelete?: () => void; }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [start, setStart] = useState(initial?.start_time || "");
  const [end, setEnd] = useState(initial?.end_time || "");
  useEffect(() => {
    if (open) {
      setTitle(initial?.title || "");
      setDescription(initial?.description || "");
      setCategory(initial?.category || "");
      setLocation(initial?.location || "");
      setStart(initial?.start_time || "");
      setEnd(initial?.end_time || "");
    }
  }, [open, initial]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-5">
        <h3 className="text-lg font-bold mb-3">일정 {initial?.id ? "수정" : "추가"}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">제목</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border rounded-button px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">시작</label>
              <input type="datetime-local" value={start} onChange={(e)=>setStart(e.target.value)} className="w-full border rounded-button px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">종료</label>
              <input type="datetime-local" value={end} onChange={(e)=>setEnd(e.target.value)} className="w-full border rounded-button px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">설명</label>
            <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full border rounded-button px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">카테고리</label>
              <input value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full border rounded-button px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">장소</label>
              <input value={location} onChange={(e)=>setLocation(e.target.value)} className="w-full border rounded-button px-3 py-2" />
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-5">
          {initial?.id ? (
            <button onClick={onDelete} className="px-3 py-2 bg-red-500 text-white rounded-button">삭제</button>
          ) : <span />}
          <div className="space-x-2">
            <button onClick={onClose} className="px-3 py-2 border rounded-button">취소</button>
            <button onClick={()=>onSave({ id: initial?.id, title, description, category, location, start_time: start, end_time: end })} className="px-3 py-2 bg-primary text-white rounded-button">저장</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Calendar() {
  const userName = useUserName();
  const [view, setView] = useState<"month"|"week"|"day">("month");
  const [cursor, setCursor] = useState(new Date());
  const [modal, setModal] = useState<{ open: boolean; initial?: Partial<EventItem> }>({ open: false });
  const qc = useQueryClient();

  const range = useMemo(() => {
    if (view === "month") {
      return { from: startOfWeek(startOfMonth(cursor)), to: endOfWeek(endOfMonth(cursor)) };
    } else if (view === "week") {
      return { from: startOfWeek(cursor), to: endOfWeek(cursor) };
    } else {
      return { from: startOfWeek(cursor), to: endOfWeek(cursor) }; // load week for day view for context
    }
  }, [view, cursor]);

  const { data } = useQuery({
    queryKey: ["events", view, range.from.toISOString(), range.to.toISOString()],
    queryFn: async () => (await (await fetch(`/api/events?from=${range.from.toISOString()}&to=${range.to.toISOString()}`)).json()) as EventsResponse,
  });
  const events: EventItem[] = (data?.events ?? []).map((e) => ({ ...e, start_time: e.start_time ?? undefined, end_time: e.end_time ?? undefined }));

  const createMut = useMutation({
    mutationFn: async (payload: Partial<EventItem>) => (await (await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })).json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
  const updateMut = useMutation({
    mutationFn: async (payload: Partial<EventItem>) => (await (await fetch(`/api/events/${payload.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })).json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
  const deleteMut = useMutation({
    mutationFn: async (id: string | number | undefined) => { await fetch(`/api/events/${id}`, { method: "DELETE" }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

  function openCreate(date?: Date) {
    const startISO = date ? new Date(date.setHours(9,0,0,0)).toISOString().slice(0,16) : "";
    const endISO = date ? new Date(date.setHours(10,0,0,0)).toISOString().slice(0,16) : "";
    setModal({ open: true, initial: { start_time: startISO, end_time: endISO } });
  }

  function openEdit(ev: EventItem) {
    setModal({ open: true, initial: { ...ev, start_time: ev.start_time?.slice(0,16), end_time: ev.end_time?.slice(0,16) } });
  }

  function renderMonth() {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    const days: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
    return (
      <div>
        <div className="flex justify-between mb-4">
          <div className="text-xl font-semibold">{format(cursor, "yyyy년 M월", { locale: ko })}</div>
          <div className="space-x-2">
            <button className="px-2 py-1 border rounded-button" onClick={()=>setCursor(new Date())}>오늘</button>
            <button className="px-2 py-1 border rounded-button" onClick={()=>setCursor(subMonths(cursor,1))}>이전</button>
            <button className="px-2 py-1 border rounded-button" onClick={()=>setCursor(addMonths(cursor,1))}>다음</button>
            <button className="px-3 py-1 bg-primary text-white rounded-button" onClick={()=>openCreate(new Date(cursor))}>일정 추가</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {["일","월","화","수","목","금","토"].map((d)=> (
            <div key={d} className="bg-white p-2 text-center text-xs font-medium sticky top-0 z-10">{d}</div>
          ))}
          {days.map((date) => (
            <div key={date.toISOString()} className="bg-white h-36 p-2 align-top">
              <div className={`text-xs mb-1 ${isSameMonth(date, cursor) ? "text-gray-800" : "text-gray-400"}`}>{format(date, "d")}</div>
              <div className="space-y-1">
                {events.filter((e)=> e.start_time && isSameDay(parseISO(e.start_time), date)).slice(0,3).map((e)=> (
                  <button key={String(e.id)} onClick={()=>openEdit(e)} className="block w-full text-left text-xs px-2 py-1 rounded-button bg-primary/10 text-primary truncate">{e.title}</button>
                ))}
                {events.filter((e)=> e.start_time && isSameDay(parseISO(e.start_time), date)).length > 3 && (
                  <div className="text-[10px] text-gray-500">더보기...</div>
                )}
              </div>
              <button onClick={()=>openCreate(date)} className="mt-2 text-[10px] text-gray-400 hover:text-primary">+ 추가</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderWeek() {
    const start = startOfWeek(cursor);
    const days: Date[] = [];
    for (let d = start; d <= endOfWeek(cursor); d = addDays(d, 1)) days.push(d);
    return (
      <div>
        <div className="flex justify-between mb-4">
          <div className="text-xl font-semibold">{format(start, "yyyy년 M월 d일", { locale: ko })} - {format(endOfWeek(cursor), "M월 d일", { locale: ko })}</div>
          <div className="space-x-2">
            <button className="px-2 py-1 border rounded-button" onClick={()=>setCursor(new Date())}>오늘</button>
            <button className="px-2 py-1 border rounded-button" onClick={()=>setCursor(subWeeks(cursor,1))}>이전</button>
            <button className="px-2 py-1 border rounded-button" onClick={()=>setCursor(addWeeks(cursor,1))}>다음</button>
            <button className="px-3 py-1 bg-primary text-white rounded-button" onClick={()=>openCreate(new Date(cursor))}>일정 추가</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-3">
          {days.map((date) => (
            <div key={date.toISOString()} className="bg-white rounded-lg border p-2 min-h-48">
              <div className="text-sm font-medium mb-2">{format(date, "EEE d", { locale: ko })}</div>
              <div className="space-y-2">
                {events.filter((e)=> e.start_time && isSameDay(parseISO(e.start_time), date)).map((e)=> (
                  <button key={String(e.id)} onClick={()=>openEdit(e)} className="block w-full text-left px-2 py-1 rounded-button bg-primary/10 text-primary">
                    <div className="text-xs">{e.start_time ? format(parseISO(e.start_time), "HH:mm") : ""} - {e.end_time ? format(parseISO(e.end_time), "HH:mm") : ""}</div>
                    <div className="text-sm font-medium truncate">{e.title}</div>
                  </button>
                ))}
                <button onClick={()=>openCreate(date)} className="text-xs text-gray-400 hover:text-primary">+ 추가</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderDay() {
    const date = cursor;
    const dayEvents = events.filter((e)=> e.start_time && isSameDay(parseISO(e.start_time), date));
    return (
      <div>
        <div className="flex justify-between mb-4">
          <div className="text-xl font-semibold">{format(date, "yyyy년 M월 d일 EEEE", { locale: ko })}</div>
          <div className="space-x-2">
            <button className="px-2 py-1 border rounded-button" onClick={()=>setCursor(new Date())}>오늘</button>
            <button className="px-2 py-1 border rounded-button" onClick={()=>setCursor(addDays(cursor,-1))}>이전</button>
            <button className="px-2 py-1 border rounded-button" onClick={()=>setCursor(addDays(cursor,1))}>다음</button>
            <button className="px-3 py-1 bg-primary text-white rounded-button" onClick={()=>openCreate(new Date(cursor))}>일정 추가</button>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          {dayEvents.length === 0 && <div className="text-sm text-gray-500">일정이 없습니다.</div>}
          <div className="space-y-2">
            {dayEvents.map((e)=> (
              <button key={String(e.id)} onClick={()=>openEdit(e)} className="w-full text-left px-3 py-2 rounded-button bg-primary/10 text-primary">
                <div className="text-xs">{e.start_time ? format(parseISO(e.start_time), "HH:mm") : ""} - {e.end_time ? format(parseISO(e.end_time), "HH:mm") : ""}</div>
                <div className="text-sm font-medium">{e.title}</div>
                {e.location && <div className="text-xs text-gray-600">{e.location}</div>}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell userName={userName}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex bg-gray-100 rounded-full p-1">
            {(["month","week","day"] as const).map(v => (
              <button key={v} onClick={()=>setView(v)} className={`px-3 py-1 text-sm font-medium rounded-full ${view===v? "bg-white shadow-sm text-gray-800":"text-gray-600"}`}>{v === "month"?"월": v === "week"?"주":"일"}</button>
            ))}
          </div>
        </div>
        {view === "month" && renderMonth()}
        {view === "week" && renderWeek()}
        {view === "day" && renderDay()}
      </div>

      <EventModal
        open={modal.open}
        initial={modal.initial}
        onClose={()=>setModal({ open:false })}
        onSave={(input)=>{
          if (input.id) updateMut.mutate(input); else createMut.mutate(input);
          setModal({ open:false });
        }}
        onDelete={modal.initial?.id ? ()=>{ deleteMut.mutate(modal.initial?.id as any); setModal({ open:false }); } : undefined}
      />
    </AppShell>
  );
}
