import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TasksResponse, TaskItem } from "@shared/api";
import { supabase } from "@/lib/supabase";

export default function Tasks() {
  const [userName, setUserName] = useState("사용자");
  useEffect(() => {
    supabase?.auth.getUser().then((u) => setUserName((u.data.user?.user_metadata as any)?.full_name || u.data.user?.email?.split("@")[0] || "사용자"));
  }, []);
  const { data } = useQuery({ queryKey: ["tasks"], queryFn: async () => (await (await fetch("/api/tasks")).json()) as TasksResponse });
  const tasks: TaskItem[] = data?.tasks ?? [];
  return (
    <AppShell userName={userName}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4">할 일</h2>
        <div className="space-y-3">
          {tasks.length === 0 && <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">등록된 할 일이 없습니다.</div>}
          {tasks.map((t) => (
            <div key={String(t.id)} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between">
                <h4 className="font-semibold">{t.title}</h4>
                {t.due_date && <span className="text-sm text-gray-500">{new Date(t.due_date).toLocaleDateString("ko-KR")}</span>}
              </div>
              {t.description && <p className="text-sm text-gray-600 mt-1">{t.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
