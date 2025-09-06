import AppShell from "@/components/AppShell";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface FamilyMsg { id?: string; user_name?: string | null; user_id?: string | null; text: string; created_at?: string; channel?: string }

type Tab = "ai" | "family";

export default function Chat() {
  const [userName, setUserName] = useState("사용자");
  const [userId, setUserId] = useState<string | undefined>(undefined);
  useEffect(() => {
    supabase?.auth.getUser().then((u) => {
      const uu = u.data.user;
      setUserName((uu?.user_metadata as any)?.full_name || uu?.email?.split("@")[0] || "사용자");
      setUserId(uu?.id);
    });
  }, []);

  const [tab, setTab] = useState<Tab>("ai");

  // AI Chat
  const [aiChat, setAiChat] = useState<{ from: "user" | "bot"; text: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiSending, setAiSending] = useState(false);

  async function sendAI() {
    const message = aiInput.trim();
    if (!message || aiSending) return;
    setAiChat((p) => [...p, { from: "user", text: message }]);
    setAiInput("");
    setAiSending(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      const data = await res.json();
      setAiChat((p) => [...p, { from: "bot", text: data.response || "지금은 연결에 문제가 있어요." }]);
    } finally {
      setAiSending(false);
    }
  }

  // Family Chat
  const [familyChat, setFamilyChat] = useState<FamilyMsg[]>([]);
  const [familyInput, setFamilyInput] = useState("");
  const familyBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) return;
    async function load() {
      const { data } = await supabase.from("messages").select("*").eq("channel", "family").order("created_at", { ascending: true }).limit(200);
      setFamilyChat((data as FamilyMsg[]) ?? []);
      const ch = supabase
        .channel("public:messages")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: "channel=eq.family" }, (payload) => {
          setFamilyChat((prev) => [...prev, payload.new as FamilyMsg]);
          requestAnimationFrame(()=>{ familyBoxRef.current?.scrollTo({ top: familyBoxRef.current.scrollHeight, behavior: "smooth" }); });
        })
        .subscribe();
      return () => { void supabase.removeChannel(ch); };
    }
    const unsubPromise = load();
    return () => { void unsubPromise; };
  }, []);

  async function sendFamily() {
    const text = familyInput.trim();
    if (!text || !supabase) return;
    setFamilyInput("");
    await supabase.from("messages").insert({ text, user_name: userName, user_id: userId, channel: "family" });
  }

  return (
    <AppShell userName={userName}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4">채팅</h2>
        <div className="mb-4 inline-flex rounded-full p-1 bg-gray-100">
          <button onClick={()=>setTab("ai")} className={`px-4 py-2 rounded-full font-medium ${tab==='ai'? 'bg-white shadow-sm text-gray-800':'text-gray-600'}`}>AI 도우미</button>
          <button onClick={()=>setTab("family")} className={`px-4 py-2 rounded-full font-medium ${tab==='family'? 'bg-white shadow-sm text-gray-800':'text-gray-600'}`}>가족 채팅</button>
        </div>

        {tab === 'ai' ? (
          <div>
            <div className="bg-white rounded-lg p-4 border mb-4 max-h-96 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {aiChat.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`${m.from === "user" ? "bg-primary text-white" : "bg-gray-200"} rounded-lg p-2 max-w-xs`}>{m.text}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex">
              <input className="flex-1 border rounded-l-button px-3 py-2" placeholder="도우미에게 물어보세요" value={aiInput} onChange={(e) => setAiInput(e.target.value)} />
              <button className="bg-primary text-white px-4 rounded-r-button disabled:opacity-50" onClick={sendAI} disabled={!aiInput.trim() || aiSending}>보내기</button>
            </div>
          </div>
        ) : (
          <div>
            {!supabase && <div className="p-3 bg-yellow-50 border text-yellow-800 rounded-lg mb-3 text-sm">Supabase가 설정되어야 가족 채팅을 사용할 수 있습니다.</div>}
            <div ref={familyBoxRef} className="bg-white rounded-lg p-4 border mb-4 max-h-96 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {familyChat.map((m) => (
                  <div key={m.id || m.created_at} className={`flex ${m.user_name === userName ? 'justify-end':'justify-start'}`}>
                    <div className={`rounded-lg p-2 max-w-xs ${m.user_name === userName ? 'bg-primary text-white':'bg-gray-200'}`}>
                      <div className="text-[10px] opacity-70 mb-0.5">{m.user_name || '가족'}</div>
                      <div>{m.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex">
              <input className="flex-1 border rounded-l-button px-3 py-2" placeholder="가족에게 메시지 보내기" value={familyInput} onChange={(e) => setFamilyInput(e.target.value)} disabled={!supabase} />
              <button className="bg-primary text-white px-4 rounded-r-button disabled:opacity-50" onClick={sendFamily} disabled={!familyInput.trim() || !supabase}>보내기</button>
            </div>
            <p className="text-xs text-gray-500 mt-2">테이블: messages (columns: id uuid default gen_random_uuid(), text text, user_name text, user_id text, channel text, created_at timestamptz default now())</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
