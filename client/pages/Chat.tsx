import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Chat() {
  const [userName, setUserName] = useState("사용자");
  useEffect(() => {
    supabase?.auth.getUser().then((u) => setUserName((u.data.user?.user_metadata as any)?.full_name || u.data.user?.email?.split("@")[0] || "사용자"));
  }, []);

  const [chat, setChat] = useState<{ from: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    const message = input.trim();
    if (!message || sending) return;
    setChat((p) => [...p, { from: "user", text: message }]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      const data = await res.json();
      setChat((p) => [...p, { from: "bot", text: data.response || "지금은 연결에 문제가 있어요." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell userName={userName}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4">채팅</h2>
        <div className="bg-white rounded-lg p-4 border mb-4 max-h-80 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {chat.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`${m.from === "user" ? "bg-primary text-white" : "bg-gray-200"} rounded-lg p-2 max-w-xs`}>{m.text}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex">
          <input className="flex-1 border rounded-l-button px-3 py-2" placeholder="메시지를 입력하세요" value={input} onChange={(e) => setInput(e.target.value)} />
          <button className="bg-primary text-white px-4 rounded-r-button disabled:opacity-50" onClick={send} disabled={!input.trim() || sending}>보내기</button>
        </div>
      </div>
    </AppShell>
  );
}
