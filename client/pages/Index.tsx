import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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
      setToast({ message: "Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in settings.", type: "error" });
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
      setToast({ message: "Login successful!", type: "success" });
      onSignedIn();
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) {
      setToast({ message: "Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in settings.", type: "error" });
      return;
    }
    const form = new FormData(e.currentTarget);
    const full_name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password !== confirm) {
      setToast({ message: "Passwords do not match", type: "error" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });
    setLoading(false);
    if (error) setToast({ message: error.message, type: "error" });
    else {
      setToast({ message: "Account created! Verify your email.", type: "success" });
      setTab("login");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-[\'Pacifico\'] text-primary mb-2">FamilySync</h1>
          <p className="text-gray-600">Smart Family Schedule Manager</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full p-1 bg-gray-100">
              <button onClick={() => setTab("login")} className={`px-4 py-2 rounded-full font-medium ${tab === "login" ? "bg-white shadow-sm text-gray-800" : "text-gray-600"}`}>Login</button>
              <button onClick={() => setTab("signup")} className={`px-4 py-2 rounded-full font-medium ${tab === "signup" ? "bg-white shadow-sm text-gray-800" : "text-gray-600"}`}>Sign Up</button>
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
              <button type="submit" disabled={!supaAvailable || loading} className="w-full bg-primary text-white py-2 rounded-button font-medium disabled:opacity-50">{loading ? "Processing..." : "Login"}</button>
              {!supaAvailable && (
                <p className="text-xs text-red-600">Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set.</p>
              )}
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input name="confirm" type="password" className="w-full px-4 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" required disabled={!supaAvailable || loading} />
              </div>
              <button type="submit" disabled={!supaAvailable || loading} className="w-full bg-primary text-white py-2 rounded-button font-medium disabled:opacity-50">{loading ? "Processing..." : "Create Account"}</button>
            </form>
          )}
        </div>
        <div className="mt-4 text-center">
          <a className="text-primary text-sm" href="#">Forgot your password?</a>
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
  const [chat, setChat] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "user", text: "When should I study for my science test?" },
    { from: "bot", text: "Based on your energy patterns, tomorrow morning between 9-11 AM would be ideal. You have no conflicts then and your focus tends to be best in the morning." },
    { from: "user", text: "Can you add it to my schedule?" },
    { from: "bot", text: "Sure! I've added \"Science Test Prep\" to your schedule tomorrow from 9:00-11:00 AM. Would you like me to set a reminder?" },
  ]);
  const [sending, setSending] = useState(false);

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
      setChat(prev => [...prev, { from: "bot", text: data.response || "I'm having trouble connecting right now. Please try again in a moment." }]);
    } catch (e) {
      setChat(prev => [...prev, { from: "bot", text: "I'm having trouble connecting right now. Please try again in a moment." }]);
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
              <h1 className="text-2xl font-[\'Pacifico\'] text-primary">FamilySync</h1>
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
                  <h2 className="text-xl font-bold">Good afternoon, {userName || "there"}!</h2>
                  <p className="text-gray-600">{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600 mb-1">How are you feeling?</span>
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
                    <button className="px-3 py-1 text-sm font-medium rounded-full bg-white shadow-sm text-gray-800 whitespace-nowrap">Day</button>
                    <button className="px-3 py-1 text-sm font-medium rounded-full text-gray-600 hover:bg-white/50 whitespace-nowrap">Week</button>
                    <button className="px-3 py-1 text-sm font-medium rounded-full text-gray-600 hover:bg-white/50 whitespace-nowrap">Month</button>
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
                  <button className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 rounded-button">Today</button>
                  <button className="flex items-center justify-center space-x-1 bg-primary text-white px-3 py-1.5 font-medium rounded-button">
                    <i className="ri-add-line" />
                    <span className="whitespace-nowrap">Add Event</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {/* Example entries from prototype */}
                <div className="flex items-center py-2 px-3 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                  <div className="w-20 text-sm font-medium text-gray-500">8:00 AM</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Math Homework</h4>
                    <p className="text-sm text-gray-600">Algebra equations, pages 45-48</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">School</span>
                      <span className="text-xs text-gray-500">90 min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>
                    <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">
                      <i className="ri-more-2-fill text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center py-2 px-3 border-l-4 border-primary bg-white rounded-r-lg">
                  <div className="w-20 text-sm font-medium text-gray-500">10:00 AM</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Science Project Research</h4>
                    <p className="text-sm text-gray-600">Collect data for ecosystem project</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">School</span>
                      <span className="text-xs text-gray-500">90 min</span>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <i className="ri-time-line" />
                        <span>45 min remaining</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-primary text-white text-sm rounded-button whitespace-nowrap">
                      <i className="ri-play-line mr-1" /> Focus
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">
                      <i className="ri-more-2-fill text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center py-2 px-3 border-l-4 border-green-500 bg-white rounded-r-lg">
                  <div className="w-20 text-sm font-medium text-gray-500">12:00 PM</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Lunch Break</h4>
                    <p className="text-sm text-gray-600">Don't forget to eat!</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Break</span>
                      <span className="text-xs text-gray-500">60 min</span>
                    </div>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">
                    <i className="ri-more-2-fill text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center py-2 px-3 border-l-4 border-yellow-500 bg-white rounded-r-lg">
                  <div className="w-20 text-sm font-medium text-gray-500">2:00 PM</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Piano Practice</h4>
                    <p className="text-sm text-gray-600">Prepare for weekend recital</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">Music</span>
                      <span className="text-xs text-gray-500">90 min</span>
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">Conflict</span>
                    </div>
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                      <div className="flex items-start gap-2">
                        <i className="ri-error-warning-line mt-0.5 text-yellow-600" />
                        <div>
                          <p className="text-yellow-800">Overlaps with Math Academy (2:30 - 4:00 PM)</p>
                          <button className="mt-1 px-3 py-1 bg-white border border-yellow-300 text-yellow-700 text-xs rounded-button whitespace-nowrap">Resolve Conflict</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">
                    <i className="ri-more-2-fill text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center py-2 px-3 border-l-4 border-orange-500 bg-white rounded-r-lg">
                  <div className="w-20 text-sm font-medium text-gray-500">4:30 PM</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Soccer Practice</h4>
                    <p className="text-sm text-gray-600">At Central Park Field</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">Sports</span>
                      <span className="text-xs text-gray-500">90 min</span>
                    </div>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">
                    <i className="ri-more-2-fill text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center py-2 px-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                  <div className="w-20 text-sm font-medium text-gray-500">7:00 PM</div>
                  <div className="flex-1">
                    <h4 className="font-medium">English Essay Writing</h4>
                    <p className="text-sm text-gray-600">Based on your energy patterns, this is the optimal time</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">School</span>
                      <span className="text-xs text-gray-500">60 min</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">AI Suggested</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded-button whitespace-nowrap">Accept</button>
                    <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">
                      <i className="ri-more-2-fill text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4">Your Progress</h3>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Level 7: Focus Master</span>
                    <span className="text-sm font-medium">750/1000 XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "75%" }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">250 XP until next level</p>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary">12</div>
                    <div className="text-xs text-gray-600">Day Streak</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary">8</div>
                    <div className="text-xs text-gray-600">Tasks Today</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary">85%</div>
                    <div className="text-xs text-gray-600">Completion</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Recent Achievements</h4>
                  <a href="#" className="text-sm text-primary">View All</a>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                      <i className="ri-fire-line" />
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">10-Day Streak</h5>
                      <p className="text-xs text-gray-600">Completed tasks for 10 days in a row</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                      <i className="ri-timer-line" />
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">Focus Champion</h5>
                      <p className="text-xs text-gray-600">Completed 5 focus sessions without breaks</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Active Quests</h3>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">3 Active</span>
                </div>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">Study Streak</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Daily</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Complete 3 study sessions today</p>
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">Progress</span>
                        <span className="text-xs font-medium">1/3</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "33%" }} />
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 flex items-center">
                      <i className="ri-award-line mr-1" />
                      <span>Reward: 150 XP + Focus Boost</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">Balance Master</h4>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Weekly</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Maintain study-rest balance for 5 days</p>
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">Progress</span>
                        <span className="text-xs font-medium">3/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "60%" }} />
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 flex items-center">
                      <i className="ri-award-line mr-1" />
                      <span>Reward: 300 XP + New Avatar Item</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">Family Challenge</h4>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Family</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Everyone completes their tasks before dinner</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                          <i className="ri-check-line" />
                        </div>
                        <span className="text-xs">{userName} (You)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                          <i className="ri-time-line" />
                        </div>
                        <span className="text-xs">Emma</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                          <i className="ri-check-line" />
                        </div>
                        <span className="text-xs">Mom</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                          <i className="ri-time-line" />
                        </div>
                        <span className="text-xs">Dad</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 flex items-center">
                      <i className="ri-award-line mr-1" />
                      <span>Reward: Family Movie Night</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Upcoming Tasks</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-button text-sm whitespace-nowrap">
                    <i className="ri-filter-3-line mr-1" /> Filter
                  </button>
                  <button className="px-3 py-1.5 bg-primary text-white rounded-button text-sm whitespace-nowrap">
                    <i className="ri-add-line mr-1" /> New Task
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {[{
                  title: "History Essay",
                  due: "Due Tomorrow",
                  desc: "Write 1000 words on World War II impacts",
                  tags: [
                    { label: "School", color: "bg-blue-100 text-blue-800" },
                    { label: "High Priority", color: "bg-red-100 text-red-800" },
                    { label: "120 min", color: "bg-gray-100 text-gray-800" },
                  ],
                }, {
                  title: "Math Test Preparation",
                  due: "Friday",
                  desc: "Review chapters 5-7, practice equations",
                  tags: [
                    { label: "Academy", color: "bg-blue-100 text-blue-800" },
                    { label: "Medium Priority", color: "bg-yellow-100 text-yellow-800" },
                    { label: "90 min", color: "bg-gray-100 text-gray-800" },
                  ],
                }, {
                  title: "Piano Recital Preparation",
                  due: "Saturday",
                  desc: "Practice Mozart Sonata K.545, all movements",
                  tags: [
                    { label: "Music", color: "bg-purple-100 text-purple-800" },
                    { label: "High Priority", color: "bg-red-100 text-red-800" },
                    { label: "60 min", color: "bg-gray-100 text-gray-800" },
                    { label: "Parent Approval", color: "bg-pink-100 text-pink-800" },
                  ],
                }, {
                  title: "Science Project",
                  due: "Next Monday",
                  desc: "Finish ecosystem model and prepare presentation",
                  tags: [
                    { label: "School", color: "bg-blue-100 text-blue-800" },
                    { label: "Medium Priority", color: "bg-yellow-100 text-yellow-800" },
                    { label: "180 min", color: "bg-gray-100 text-gray-800" },
                  ],
                }].map((t, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover-lift">
                    <div className="flex items-start">
                      <label className="custom-checkbox mt-1 mr-3">
                        <input type="checkbox" />
                        <span className="checkmark" />
                      </label>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-semibold">{t.title}</h4>
                          <span className="text-sm text-gray-500">{t.due}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{t.desc}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {t.tags.map(tag => (
                            <span key={tag.label} className={`px-2 py-0.5 text-xs rounded-full ${tag.color}`}>{tag.label}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <button className="text-primary font-medium whitespace-nowrap">View All Tasks</button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-lg font-bold mb-6">AI Assistant</h3>

              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">SCHEDULE INSIGHTS</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                      <i className="ri-lightbulb-line" />
                    </div>
                    <div>
                      <p className="text-sm">Your energy levels are highest in the morning. Consider moving your Math practice to 9:00 AM tomorrow.</p>
                      <div className="mt-1 flex space-x-2">
                        <button className="px-2 py-1 bg-blue-500 text-white rounded-button text-xs whitespace-nowrap">Apply</button>
                        <button className="px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded-button text-xs whitespace-nowrap">Dismiss</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 flex-shrink-0">
                      <i className="ri-error-warning-line" />
                    </div>
                    <div>
                      <p className="text-sm">You have a scheduling conflict tomorrow between Math Academy (4:30 PM) and Soccer Practice (4:00 PM).</p>
                      <div className="mt-1 flex space-x-2">
                        <button className="px-2 py-1 bg-yellow-500 text-white rounded-button text-xs whitespace-nowrap">Resolve</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-3">WELL-BEING CHECK</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0">
                      <i className="ri-mental-health-line" />
                    </div>
                    <div>
                      <p className="text-sm">You've been studying for 4 hours today. Consider taking a 30-minute break to recharge.</p>
                      <div className="mt-1 flex space-x-2">
                        <button className="px-2 py-1 bg-green-500 text-white rounded-button text-xs whitespace-nowrap">Schedule Break</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
                      <i className="ri-zzz-line" />
                    </div>
                    <div>
                      <p className="text-sm">Your sleep pattern has been irregular. Try to maintain a consistent bedtime around 10:00 PM.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-3">CHAT WITH ASSISTANT</h4>
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
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask your assistant..." className="flex-1 border border-gray-300 rounded-l-button py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
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
            <span className="text-xs mt-1">Home</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center text-gray-500">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-calendar-line" />
            </div>
            <span className="text-xs mt-1">Calendar</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center text-gray-500">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-task-line" />
            </div>
            <span className="text-xs mt-1">Tasks</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center text-gray-500">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-message-3-line" />
            </div>
            <span className="text-xs mt-1">Chat</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center text-gray-500">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-line" />
            </div>
            <span className="text-xs mt-1">Profile</span>
          </a>
        </div>
      </nav>
    </div>
  );
}

export default function Index() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [userName, setUserName] = useState("Jake");

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
      setUserName((sess?.user?.user_metadata as any)?.full_name || sess?.user?.email?.split("@")[0] || "Jake");
      supabase.auth.onAuthStateChange((_e, s) => {
        setSignedIn(!!s);
        if (s?.user) {
          setUserName((s.user.user_metadata as any)?.full_name || s.user.email?.split("@")[0] || "Jake");
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
