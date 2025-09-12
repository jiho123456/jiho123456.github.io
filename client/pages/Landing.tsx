import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [fbOpen, setFbOpen] = useState(false);
  const [fbEmail, setFbEmail] = useState("");
  const [fbMsg, setFbMsg] = useState("");
  const [fbSending, setFbSending] = useState(false);

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!fbMsg.trim()) return;
    setFbSending(true);
    try {
      await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: fbEmail || null, message: fbMsg }) });
      setFbMsg("");
      setFbEmail("");
      setFbOpen(false);
    } finally {
      setFbSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-[Pacifico] text-primary">My Schedule Mate</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">10 people already testing</span>
        </div>
        <nav className="hidden sm:flex items-center space-x-6">
          <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
          <a href="#roadmap" className="text-sm text-gray-600 hover:text-gray-900">Roadmap</a>
          <button onClick={() => setFbOpen(true)} className="text-sm text-gray-600 hover:text-gray-900">Feedback</button>
          <button onClick={() => navigate("/app")} className="px-3 py-1.5 rounded-button bg-primary text-white text-sm">Open App</button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        <section className="py-10 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">The simplest way to run your family schedule</h1>
            <p className="text-gray-600 mb-6">Plan events, assign tasks, and get smart insights — all in one place. Built for busy families who want less chaos and more calm.</p>
            <div className="flex gap-3">
              <button onClick={() => navigate("/app")} className="bg-primary text-white px-4 py-2 rounded-button">Open App</button>
              <a href="#features" className="px-4 py-2 rounded-button border border-gray-300 text-gray-800">Explore features</a>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="font-semibold mb-1">Calendar</div>
                <p className="text-gray-600">Month, week, day views and quick-add events.</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="font-semibold mb-1">Tasks</div>
                <p className="text-gray-600">Assign, track, and complete. Stay accountable.</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="font-semibold mb-1">Family chat</div>
                <p className="text-gray-600">Stay aligned with simple channels.</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="font-semibold mb-1">AI assistant</div>
                <p className="text-gray-600">Suggestions and summaries to save your time.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold mb-2">Built for families</h3>
            <p className="text-gray-600 text-sm">Fast, friendly, and practical. Designed for everyday life.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold mb-2">Clean and simple</h3>
            <p className="text-gray-600 text-sm">No clutter. Just what you need to manage the week.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold mb-2">Secure by default</h3>
            <p className="text-gray-600 text-sm">Backed by modern infra and best practices.</p>
          </div>
        </section>

        <section id="roadmap" className="py-12">
          <h3 className="text-xl font-semibold mb-4">What's next</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Product Hunt launch</li>
            <li>Founder's tier (lifetime) for early supporters</li>
            <li>Discord for early user feedback</li>
            <li>BetaList submission</li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-gray-200 mt-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">© {new Date().getFullYear()} My Schedule Mate</div>
          <div className="flex items-center gap-3 text-sm">
            <button onClick={() => setFbOpen(true)} className="text-gray-700 hover:text-gray-900">Send feedback</button>
            <a href="#" className="text-gray-700 hover:text-gray-900">Join Discord</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Follow on X</a>
          </div>
        </div>
      </footer>

      {fbOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50" onClick={() => setFbOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg font-semibold mb-4">Send feedback</h4>
            <form onSubmit={submitFeedback} className="space-y-3">
              <input value={fbEmail} onChange={(e) => setFbEmail(e.target.value)} type="email" placeholder="Email (optional)" className="w-full border border-gray-300 rounded-button py-2 px-3" />
              <textarea value={fbMsg} onChange={(e) => setFbMsg(e.target.value)} placeholder="Your message" rows={5} className="w-full border border-gray-300 rounded-button py-2 px-3" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setFbOpen(false)} className="px-3 py-1.5 rounded-button border border-gray-300">Cancel</button>
                <button type="submit" disabled={fbSending} className="px-3 py-1.5 rounded-button bg-primary text-white disabled:opacity-50">{fbSending ? "Sending..." : "Send"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
