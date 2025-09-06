import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { EventsResponse, EventItem, TasksResponse, TaskItem } from "@shared/api";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed top-4 right-4 max-w-xs bg-white rounded-lg shadow-lg p-4 animate-bounce-in z-50">
      <div className="flex items-center">
        <div className="flex-shrink-0 w-6 h-6 mr-3">
          <i className={type === "success" ? "ri-checkbox-circle-fill text-green-500" : "ri-error-warning-fill text-red-500"} />
        </div>
        <div className="text-sm font-medium">{message}</div>
      </div>
    </div>
  );
}

function AuthView({ onSignedIn }: { onSignedIn: () => void }) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const supaAvailable = !!supabase;
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) {
      setToast({ message: "Supabase가 설정되지 않았습니다. 환경변수 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 설정하세요.", type: "error" });
      return;
    }
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setToast({ message: error.message, type: "error" });
    else {
      setToast({ message: "로그인에 성공했습니다!", type: "success" });
      onSignedIn();
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) {
      setToast({ message: "Supabase가 설정되지 않았습니다. 환경변수 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 설정하세요.", type: "error" });
      return;
    }
    const form = new FormData(e.currentTarget);
    const full_name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password !== confirm) {
      setToast({ message: "비밀번호가 일치하지 않습니다.", type: "error" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name } } });
    setLoading(false);
    if (error) setToast({ message: error.message, type: "error" });
    else {
      setToast({ message: "계정이 생성되었습니다! 이메일 인증을 완료해 주세요.", type: "success" });
      setTab("login");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-[Pacifico] text-primary mb-2">My Schedule Mate</h1>
          <p className="text-gray-600">가족의 일정을 똑똑하게 관리하세요</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full p-1 bg-gray-100">
              <button onClick={() => setTab("login")} className={`px-4 py-2 rounded-full font-medium ${tab === "login" ? "bg-white shadow-sm text-gray-800" : "text-gray-600"}`}>로그인</button>
              <button onClick={() => setTab("signup")} className={`px-4 py-2 rounded-full font-medium ${tab === "signup" ? "bg-white shadow-sm text-gray-800" : "text-gray-600"}`}>회원가입</button>
            </div>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input name="email" type="email" className="w-full px-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required disabled={!supaAvailable || loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input name="password" type="password" className="w-full px-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required disabled={!supaAvailable || loading} />
              </div>
              <button type="submit" disabled={!supaAvailable || loading} className="w-full bg-primary text-white py-2 rounded-button font-medium disabled:opacity-50">{loading ? "처리 중..." : "로그인"}</button>
              {!supaAvailable && (
                <p className="text-xs text-red-600">환��변수 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY가 설정되지 않았습니다.</p>
              )}
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input name="name" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required disabled={!supaAvailable || loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input name="email" type="email" className="w-full px-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required disabled={!supaAvailable || loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input name="password" type="password" className="w-full px-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required disabled={!supaAvailable || loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
                <input name="confirm" type="password" className="w-full px-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required disabled={!supaAvailable || loading} />
              </div>
              <button type="submit" disabled={!supaAvailable || loading} className="w-full bg-primary text-white py-2 rounded-button font-medium disabled:opacity-50">{loading ? "처리 중..." : "회원가입"}</button>
            </form>
          )}
        </div>
        <div className="mt-4 text-center">
          <a className="text-primary text-sm" href="#">비밀번호를 잊으셨나요?</a>
        </div>
      </div>
    </div>
  );
}

function energyGradient(value: number) {
  let color = "#10b981";
  if (value < 30) color = "#ef4444";
  else if (value < 70) color = "#f59e0b";
  return `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`;
}

function DashboardView({ userName }: { userName: string }) {
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState(35);
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState<{ from: "user" | "bot"; text: string }[]>([]);
  const [sending, setSending] = useState(false);

  const { data: eventsData } = useQuery({ queryKey: ["events"], queryFn: async () => (await (await fetch("/api/events")).json()) as EventsResponse });
  const { data: tasksData } = useQuery({ queryKey: ["tasks"], queryFn: async () => (await (await fetch("/api/tasks")).json()) as TasksResponse });
  const events = (eventsData?.events ?? []) as EventItem[];
  const tasks = (tasksData?.tasks ?? []) as TaskItem[];

  const moods = useMemo(() => ["😊", "😐", "😴", "😫"], []);

  async function sendMessage() {
    const message = chatInput.trim();
    if (!message || sending) return;
    setChat(prev => [...prev, { from: "user", text: message }]);
    setChatInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context: { date: new Date().toISOString() } }),
      });
      const data = await res.json();
      setChat(prev => [...prev, { from: "bot", text: data.response || "지금은 연결에 문제가 있어요. 잠�� 후 다시 시도해 주세요." }]);
    } catch (e) {
      setChat(prev => [...prev, { from: "bot", text: "지금은 연결에 문제가 있어요. 잠시 후 다시 시도해 주세요." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto pb-16">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-[Pacifico] text-primary">My Schedule Mate</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
                <i className="ri-notification-3-line text-gray-600" />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                {userName?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                  {userName?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-xl font-bold">안녕하세요, {userName || "사용자"}님!</h2>
                  <p className="text-gray-600">{new Date().toLocaleDateString("ko-KR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 mb-1">오늘 기분은 어떤가요?</span>
                  <div className="flex space-x-2">
                    {moods.map((m) => (
                      <button key={m} onClick={() => setMood(m)} className={`w-10 h-10 flex items-center justify-center rounded-full transition ${mood === m ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
                        <span className="text-lg">{m}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 mb-1">에너지 레벨</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <i className="ri-battery-low-line text-red-500 text-xl" />
                    </div>
                    <input type="range" min={0} max={100} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-32 appearance-none h-2 rounded-full" style={{ background: energyGradient(energy) }} />
                    <div className="w-8 h-8 flex items-center justify-center">
                      <i className="ri-battery-charge-line text-green-500 text-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-bold">일정</h3>
                  <div className="flex bg-gray-100 rounded-full p-1">
                    <button className="px-3 py-1 text-sm font-medium rounded-full bg-white shadow-sm text-gray-800 whitespace-nowrap">일</button>
                    <button className="px-3 py-1 text-sm font-medium rounded-full text-gray-600 hover:bg-white/50 whitespace-nowrap">주</button>
                    <button className="px-3 py-1 text-sm font-medium rounded-full text-gray-600 hover:bg-white/50 whitespace-nowrap">월</button>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                      <i className="ri-arrow-left-s-line text-gray-600" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                      <i className="ri-arrow-right-s-line text-gray-600" />
                    </button>
                  </div>
                  <button className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 rounded-button">오늘</button>
                  <button className="flex items-center justify-center space-x-1 bg-primary text-white px-3 py-1.5 font-medium rounded-button">
                    <i className="ri-add-line" />
                    <span className="whitespace-nowrap">일정 추가</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {events.length === 0 && (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">표시할 일정이 없습니다. 일정을 추가해 보세요.</div>
                )}
                {events.map((ev) => {
                  const start = ev.start_time ? new Date(ev.start_time) : null;
                  const end = ev.end_time ? new Date(ev.end_time) : null;
                  const timeLabel = start ? start.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" }) : "";
                  return (
                    <div key={String(ev.id)} className="flex items-center py-2 px-3 border-l-4 border-primary bg-white rounded-r-lg">
                      <div className="w-24 text-sm font-medium text-gray-500">{timeLabel}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{ev.title}</h4>
                        {ev.description && <p className="text-sm text-gray-600">{ev.description}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          {ev.category && <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">{ev.category}</span>}
                          {start && end && (
                            <span className="text-xs text-gray-500">{Math.max(0, Math.round((end.getTime()-start.getTime())/60000))}분</span>
                          )}
                        </div>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">
                        <i className="ri-more-2-fill text-gray-600" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">다가오는 할 일</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-button text-sm whitespace-nowrap">
                    <i className="ri-filter-3-line mr-1" /> 필터
                  </button>
                  <button className="px-3 py-1.5 bg-primary text-white rounded-button text-sm whitespace-nowrap">
                    <i className="ri-add-line mr-1" /> 새 할 일
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {tasks.length === 0 && (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">표시할 할 일이 없습니다. 새로운 작업을 추가해 보세요.</div>
                )}
                {tasks.map((t) => (
                  <div key={String(t.id)} className="border border-gray-200 rounded-lg p-4 hover-lift">
                    <div className="flex items-start">
                      <label className="custom-checkbox mt-1 mr-3">
                        <input type="checkbox" defaultChecked={t.status === "done"} />
                        <span className="checkmark" />
                      </label>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold">{t.title}</h4>
                          {t.due_date && <span className="text-sm text-gray-500">{new Date(t.due_date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</span>}
                        </div>
                        {t.description && <p className="text-sm text-gray-600 mt-1">{t.description}</p>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {t.category && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{t.category}</span>}
                          {typeof t.duration_min === "number" && <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">{t.duration_min} 분</span>}
                          {t.priority && <span className={`px-2 py-0.5 text-xs rounded-full ${t.priority === "high" ? "bg-red-100 text-red-800" : t.priority === "medium" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>{t.priority}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <button className="text-primary font-medium whitespace-nowrap">모든 할 일 보기</button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-lg font-bold mb-6">AI 도우미</h3>

              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">일정 인사이트</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                      <i className="ri-lightbulb-line" />
                    </div>
                    <div>
                      <p className="text-sm">오전 시간대에 집중력이 가장 높습니다. 내일 오전 9시에 수학 연습을 옮겨보세요.</p>
                      <div className="mt-1 flex space-x-2">
                        <button className="px-2 py-1 bg-blue-500 text-white rounded-button text-xs whitespace-nowrap">적용</button>
                        <button className="px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded-button text-xs whitespace-nowrap">무시</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 flex-shrink-0">
                      <i className="ri-error-warning-line" />
                    </div>
                    <div>
                      <p className="text-sm">내일 16:00 축구 연습과 16:30 수학 학원 일정이 겹칩니다.</p>
                      <div className="mt-1 flex space-x-2">
                        <button className="px-2 py-1 bg-yellow-500 text-white rounded-button text-xs whitespace-nowrap">해결</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">웰빙 체크</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0">
                      <i className="ri-mental-health-line" />
                    </div>
                    <div>
                      <p className="text-sm">오늘 4시간 이상 공부했어요. 30분 휴식을 권장합니다.</p>
                      <div className="mt-1 flex space-x-2">
                        <button className="px-2 py-1 bg-green-500 text-white rounded-button text-xs whitespace-nowrap">휴식 예약</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
                      <i className="ri-zzz-line" />
                    </div>
                    <div>
                      <p className="text-sm">수면 패턴이 불규칙합니다. 밤 10시 전후로 일정한 취침 시간을 유지해 보세요.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-3">도우미와 채팅</h4>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto" style={{ scrollBehavior: "smooth" }}>
                  <div className="flex flex-col space-y-3">
                    {chat.map((m, i) => (
                      <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`${m.from === "user" ? "bg-primary text-white rounded-tr-none" : "bg-gray-200 rounded-tl-none"} rounded-lg p-3 max-w-xs`}>
                          <p className="text-sm">{m.text}</p>
                        </div>
                      </div>
                    ))}
                    {sending && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-lg rounded-tl-none p-3 max-w-xs flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="도우미에게 물어보세요..." className="flex-1 border border-gray-300 rounded-l-button py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  <button onClick={sendMessage} disabled={!chatInput.trim() || sending} className="bg-primary text-white px-4 py-2 rounded-r-button disabled:opacity-50 disabled:cursor-not-allowed">
                    <i className="ri-send-plane-fill" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-lg animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="flex justify-around items-center h-16">
          <a href="#" className="flex flex-col items-center justify-center text-primary">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-home-5-fill" />
            </div>
            <span className="text-xs mt-1">홈</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center text-gray-500">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-calendar-line" />
            </div>
            <span className="text-xs mt-1">캘린더</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center text-gray-500">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-task-line" />
            </div>
            <span className="text-xs mt-1">할 일</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center text-gray-500">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-message-3-line" />
            </div>
            <span className="text-xs mt-1">채팅</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center text-gray-500">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-line" />
            </div>
            <span className="text-xs mt-1">프로필</span>
          </a>
        </div>
      </nav>
    </div>
  );
}

export default function Index() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [userName, setUserName] = useState("���용자");

  useEffect(() => {
    let mounted = true;
    async function init() {
      if (!supabase) {
        setSessionChecked(true);
        setSignedIn(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const sess = data.session;
      setSignedIn(!!sess);
      setUserName((sess?.user?.user_metadata as any)?.full_name || sess?.user?.email?.split("@")[0] || "사용자");
      supabase.auth.onAuthStateChange((_e, s) => {
        setSignedIn(!!s);
        if (s?.user) {
          setUserName((s.user.user_metadata as any)?.full_name || s.user.email?.split("@")[0] || "사용자");
        }
      });
      setSessionChecked(true);
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  if (!sessionChecked) return null;
  return signedIn ? <DashboardView userName={userName} /> : <AuthView onSignedIn={() => setSignedIn(true)} />;
}
