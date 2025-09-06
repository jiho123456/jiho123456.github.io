import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EventsResponse, EventItem } from "@shared/api";
import { supabase } from "@/lib/supabase";

export default function Calendar() {
  const [userName, setUserName] = useState("사용자");
  useEffect(() => {
    supabase?.auth.getUser().then((u) => setUserName((u.data.user?.user_metadata as any)?.full_name || u.data.user?.email?.split("@")[0] || "사용자"));
  }, []);
  const { data } = useQuery({ queryKey: ["events"], queryFn: async () => (await (await fetch("/api/events")).json()) as EventsResponse });
  const events: EventItem[] = data?.events ?? [];
  return (
    <AppShell userName={userName}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4">캘린더</h2>
        <div className="space-y-2">
          {events.length === 0 && <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">등록된 일정이 없습니다.</div>}
          {events.map((ev) => (
            <div key={String(ev.id)} className="flex items-center py-2 px-3 border-l-4 border-primary bg-white rounded-r-lg">
              <div className="w-28 text-sm text-gray-500">{ev.start_time ? new Date(ev.start_time).toLocaleString("ko-KR") : ""}</div>
              <div className="flex-1">
                <h4 className="font-medium">{ev.title}</h4>
                {ev.description && <p className="text-sm text-gray-600">{ev.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
