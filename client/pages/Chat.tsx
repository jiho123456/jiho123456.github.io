import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";

interface FamilyMsg { id?: string; user_name?: string | null; user_id?: string | null; text: string; created_at?: string; channel?: string }

type Tab = "ai" | "family";

export default function Chat() {
  const [userName, setUserName] = useState("User");
  const [userId, setUserId] = useState<string | undefined>(undefined);
  useEffect(() => {
    supabase?.auth.getUser().then((u) => {
      const uu = u.data.user;
      setUserName((uu?.user_metadata as any)?.full_name || uu?.email?.split("@")[0] || "User");
      setUserId(uu?.id);
    });
  }, []);

  const [tab, setTab] = useState<Tab>("ai");

  // AI Chat
  const [aiChat, setAiChat] = useState<{ from: "user" | "bot"; text: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiSending, setAiSending] = useState(false);

  async function sendAI() {
    const message = aiInput.trim(); if (!message || aiSending) return;
    setAiChat((p) => [...p, { from: "user", text: message }]); setAiInput(""); setAiSending(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      const data = await res.json();
      setAiChat((p) => [...p, { from: "bot", text: data.response || "We're having trouble right now." }]);
    } finally { setAiSending(false); }
  }

  // Family Chat
  const [familyChat, setFamilyChat] = useState<FamilyMsg[]>([]);
  const [familyInput, setFamilyInput] = useState("");
  const familyBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) return;
    let cleanup: (() => void) | undefined;
    (async () => {
      const { data } = await supabase.from("messages").select("*").eq("channel", "family").order("created_at", { ascending: true }).limit(200);
      setFamilyChat((data as FamilyMsg[]) ?? []);
      const ch = supabase
        .channel("public:messages")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: "channel=eq.family" }, (payload) => {
          setFamilyChat((prev) => [...prev, payload.new as FamilyMsg]);
          requestAnimationFrame(()=>{ familyBoxRef.current?.scrollTo({ top: familyBoxRef.current.scrollHeight, behavior: "smooth" }); });
        })
        .subscribe();
      cleanup = () => { void supabase.removeChannel(ch); };
    })();
    return () => { if (cleanup) cleanup(); };
  }, []);

  async function sendFamily() {
    const text = familyInput.trim(); if (!text || !supabase) return;
    setFamilyInput("");
    await supabase.from("messages").insert({ text, user_name: userName, user_id: userId, channel: "family" });
  }

  return (
    <AppShell userName={userName}>
      <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
        <h2 className="text-xl font-bold mb-4">Chat</h2>
        <div className="mb-4 inline-flex rounded-full p-1 bg-gray-100">
          <button onClick={()=>setTab("ai")} className={`px-4 py-2 rounded-full font-medium ${tab==='ai'? 'bg-white shadow-sm text-gray-800':'text-gray-600'}`}>AI assistant</button>
          <button onClick={()=>setTab("family")} className={`px-4 py-2 rounded-full font-medium ${tab==='family'? 'bg-white shadow-sm text-gray-800':'text-gray-600'}`}>Family chat</button>
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
              <input className="flex-1 border rounded-l-button px-3 py-2" placeholder="Ask the assistant" value={aiInput} onChange={(e) => setAiInput(e.target.value)} />
              <button className="bg-primary text-white px-4 rounded-r-button disabled:opacity-50" onClick={sendAI} disabled={!aiInput.trim() || aiSending}>Send</button>
            </div>
          </div>
        ) : (
          <div>
            {!supabase && <div className="p-3 bg-yellow-50 border text-yellow-800 rounded-lg mb-3 text-sm">Supabase must be configured to use family chat.</div>}
            <div ref={familyBoxRef} className="bg-white rounded-lg p-4 border mb-4 max-h-96 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {familyChat.map((m) => (
                  <div key={m.id || m.created_at} className={`flex ${m.user_name === userName ? 'justify-end':'justify-start'}`}>
                    <div className={`rounded-lg p-2 max-w-xs ${m.user_name === userName ? 'bg-primary text-white':'bg-gray-200'}`}>
                      <div className="text-[10px] opacity-70 mb-0.5">{m.user_name || 'Family'}</div>
                      <div>{m.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex">
              <input className="flex-1 border rounded-l-button px-3 py-2" placeholder="Send a message to family" value={familyInput} onChange={(e) => setFamilyInput(e.target.value)} disabled={!supabase} />
              <button className="bg-primary text-white px-4 rounded-r-button disabled:opacity-50" onClick={sendFamily} disabled={!familyInput.trim() || !supabase}>Send</button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
