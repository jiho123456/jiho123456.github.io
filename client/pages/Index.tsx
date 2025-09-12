import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";
import { useNavigate } from "react-router-dom";
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
      setToast({ message: "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.", type: "error" });
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
      setToast({ message: "Logged in successfully!", type: "success" });
      onSignedIn();
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) {
      setToast({ message: "Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.", type: "error" });
      return;
    }
    const form = new FormData(e.currentTarget);
    const full_name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password !== confirm) {
      setToast({ message: "Passwords do not match.", type: "error" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name } } });
    setLoading(false);
    if (error) setToast({ message: error.message, type: "error" });
    else {
      setToast({ message: "Account created! Please verify your email.", type: "success" });
      setTab("login");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-[Pacifico] text-primary mb-2">My Schedule Mate</h1>
          <p className="text-gray-600">Manage your family schedules smarter</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full p-1 bg-gray-100">
              <button onClick={() => setTab("login")} className={`px-4 py-2 rounded-full font-medium ${tab === "login" ? "bg-white shadow-sm text-gray-800" : "text-gray-600"}`}>Log in</button>
              <button onClick={() => setTab("signup")} className={`px-4 py-2 rounded-full font-medium ${tab === "signup" ? "bg-white shadow-sm text-gray-800" : "text-gray-600"}`}>Sign up</button>
            </div>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" className="w-full px-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required disabled={!supaAvailable || loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input name="password" type="password" className="w-full px-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required disabled={!supaAvailable || loading} />
              </div>
              <button type="submit" disabled={!supaAvailable || loading} className="w-full bg-primary text-white py-2 rounded-button font-medium disabled:opacity-50">{loading ? "Processing..." : "Log in"}</button>
              {!supaAvailable && (
                <p className="text-xs text-red-600">Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set.</p>
              )}
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input name="name" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required disabled={!supaAvailable || loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" className="w-full px-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required disabled={!supaAvailable || loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input name="password" type="password" className="w-full px-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required disabled={!supaAvailable || loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <input name="confirm" type="password" className="w-full px-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required disabled={!supaAvailable || loading} />
              </div>
              <button type="submit" disabled={!supaAvailable || loading} className="w-full bg-primary text-white py-2 rounded-button font-medium disabled:opacity-50">{loading ? "Processing..." : "Sign up"}</button>
            </form>
          )}
        </div>
        <div className="mt-4 text-center">
          <button
            className="text-primary text-sm"
            onClick={async () => {
              const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
              const email = emailInput?.value || "";
              if (!email) return alert("Please enter your email");
              if (!supabase) return alert("Supabase configuration required");
              await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
              alert("Password reset email sent.");
            }}
          >
            Forgot your password?
          </button>
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
  const navigate = useNavigate();
  const qc = useQueryClient();

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
      setChat(prev => [...prev, { from: "bot", text: data.response || "We're having trouble right now. Please try again later." }]);
    } catch (e) {
      setChat(prev => [...prev, { from: "bot", text: "We're having trouble right now. Please try again later." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell userName={userName}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                  {userName?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-xl font-bold">Hello, {userName || "User"}!</h2>
                  <p className="text-gray-600">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 mb-1">How are you feeling today?</span>
                  <div className="flex space-x-2">
                    {moods.map((m) => (
                      <button key={m} onClick={() => setMood(m)} className={`w-10 h-10 flex items-center justify-center rounded-full transition ${mood === m ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
                        <span className="text-lg">{m}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 mb-1">Energy level</span>
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
                  <h3 className="text-lg font-bold">Schedule</h3>
                  <div className="flex bg-gray-100 rounded-full p-1">
                    <button onClick={() => navigate('/calendar?view=day')} className="px-3 py-1 text-sm font-medium rounded-full bg-white shadow-sm text-gray-800 whitespace-nowrap">Day</button>
                    <button onClick={() => navigate('/calendar?view=week')} className="px-3 py-1 text-sm font-medium rounded-full text-gray-600 hover:bg-white/50 whitespace-nowrap">Week</button>
                    <button onClick={() => navigate('/calendar?view=month')} className="px-3 py-1 text-sm font-medium rounded-full text-gray-600 hover:bg-white/50 whitespace-nowrap">Month</button>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <button onClick={() => navigate('/calendar')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                      <i className="ri-arrow-left-s-line text-gray-600" />
                    </button>
                    <button onClick={() => navigate('/calendar')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                      <i className="ri-arrow-right-s-line text-gray-600" />
                    </button>
                  </div>
                  <button onClick={() => navigate('/calendar')} className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 rounded-button">Today</button>
                  <button onClick={() => navigate('/calendar?create=1')} className="flex items-center justify-center space-x-1 bg-primary text-white px-3 py-1.5 font-medium rounded-button">
                    <i className="ri-add-line" />
                    <span className="whitespace-nowrap">Add event</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {events.length === 0 && (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">No events to show. Add one!</div>
                )}
                {events.map((ev) => {
                  const start = ev.start_time ? new Date(ev.start_time) : null;
                  const end = ev.end_time ? new Date(ev.end_time) : null;
                  const timeLabel = start ? start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "";
                  return (
                    <div key={String(ev.id)} className="flex items-center py-2 px-3 border-l-4 border-primary bg-white rounded-r-lg">
                      <div className="w-24 text-sm font-medium text-gray-500">{timeLabel}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{ev.title}</h4>
                        {ev.description && <p className="text-sm text-gray-600">{ev.description}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          {ev.category && <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">{ev.category}</span>}
                          {start && end && (
                            <span className="text-xs text-gray-500">{Math.max(0, Math.round((end.getTime()-start.getTime())/60000))} min</span>
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
                <h3 className="text-lg font-bold">Upcoming tasks</h3>
                <div className="flex space-x-2">
                  <button onClick={() => navigate('/tasks')} className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-button text-sm whitespace-nowrap">
                    <i className="ri-filter-3-line mr-1" /> Filter
                  </button>
                  <button onClick={() => navigate('/tasks?create=1')} className="px-3 py-1.5 bg-primary text-white rounded-button text-sm whitespace-nowrap">
                    <i className="ri-add-line mr-1" /> New task
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {tasks.length === 0 && (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">No tasks to show. Add a new task.</div>
                )}
                {tasks.map((t) => (
                  <div key={String(t.id)} className="border border-gray-200 rounded-lg p-4 hover-lift">
                    <div className="flex items-start">
                      <label className="custom-checkbox mt-1 mr-3">
                        <input type="checkbox" checked={t.status === "done"} onChange={async (e) => { await fetch(`/api/tasks/${t.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: e.target.checked ? 'done' : 'open' }) }); qc.invalidateQueries({ queryKey: ['tasks'] }); }} />
                        <span className="checkmark" />
                      </label>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold">{t.title}</h4>
                          {t.due_date && <span className="text-sm text-gray-500">{new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                        </div>
                        {t.description && <p className="text-sm text-gray-600 mt-1">{t.description}</p>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {t.category && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{t.category}</span>}
                          {typeof t.duration_min === "number" && <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">{t.duration_min} min</span>}
                          {t.priority && <span className={`px-2 py-0.5 text-xs rounded-full ${t.priority === "high" ? "bg-red-100 text-red-800" : t.priority === "medium" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>{t.priority}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <button onClick={() => navigate('/tasks')} className="text-primary font-medium whitespace-nowrap">See all tasks</button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-lg font-bold mb-6">AI Assistant</h3>

              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">Schedule insights</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                      <i className="ri-lightbulb-line" />
                    </div>
                    <div>
                      <p className="text-sm">You focus best in the morning. Move math practice to 9 AM tomorrow.</p>
                      <div className="mt-1 flex space-x-2">
                        <button onClick={() => navigate('/calendar?create=1')} className="px-2 py-1 bg-blue-500 text-white rounded-button text-xs whitespace-nowrap">Apply</button>
                        <button className="px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded-button text-xs whitespace-nowrap">Dismiss</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 flex-shrink-0">
                      <i className="ri-error-warning-line" />
                    </div>
                    <div>
                      <p className="text-sm">Soccer practice at 4:00 PM overlaps with math academy at 4:30 PM tomorrow.</p>
                      <div className="mt-1 flex space-x-2">
                        <button onClick={() => navigate('/calendar?view=day')} className="px-2 py-1 bg-yellow-500 text-white rounded-button text-xs whitespace-nowrap">Resolve</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">Wellness check</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0">
                      <i className="ri-mental-health-line" />
                    </div>
                    <div>
                      <p className="text-sm">You've studied over 4 hours today. Take a 30-minute break.</p>
                      <div className="mt-1 flex space-x-2">
                        <button onClick={() => navigate('/calendar?create=1')} className="px-2 py-1 bg-green-500 text-white rounded-button text-xs whitespace-nowrap">Schedule a break</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
                      <i className="ri-zzz-line" />
                    </div>
                    <div>
                      <p className="text-sm">Your sleep is irregular. Try a consistent bedtime around 10 PM.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-3">Chat with assistant</h4>
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
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask the assistant..." className="flex-1 border border-gray-300 rounded-l-button py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  <button onClick={sendMessage} disabled={!chatInput.trim() || sending} className="bg-primary text-white px-4 py-2 rounded-r-button disabled:opacity-50 disabled:cursor-not-allowed">
                    <i className="ri-send-plane-fill" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </AppShell>
  );
}

export default function Index() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [userName, setUserName] = useState("User");

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
      setUserName((sess?.user?.user_metadata as any)?.full_name || sess?.user?.email?.split("@")[0] || "User");
      supabase.auth.onAuthStateChange((_e, s) => {
        setSignedIn(!!s);
        if (s?.user) {
          setUserName((s.user.user_metadata as any)?.full_name || s.user.email?.split("@")[0] || "User");
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
