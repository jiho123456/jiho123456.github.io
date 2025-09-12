import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";

function PlanSection() {
  const [userId, setUserId] = useState<string | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      const u = data.user; setUserId(u?.id || null);
      if (!u) return;
      supabase?.from("user_plans").select("plan").eq("user_id", u.id).single().then(({ data }) => { setCurrent((data as any)?.plan || null); setSelected((data as any)?.plan || null); }).catch(()=>{});
    });
    const sp = new URLSearchParams(window.location.search);
    const p = sp.get('plan');
    if (p && (p === 'free' || p === 'pro' || p === 'founder')) setSelected(p);
  }, []);

  async function save() {
    if (!supabase || !userId || !selected) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("user_plans").select("user_id").eq("user_id", userId).single();
      if (error || !data) {
        await supabase.from("user_plans").insert({ user_id: userId, plan: selected, updated_at: new Date().toISOString() });
      } else {
        await supabase.from("user_plans").update({ plan: selected, updated_at: new Date().toISOString() }).eq("user_id", userId);
      }
      setCurrent(selected);
      alert("Plan updated.");
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">Current plan: <span className="font-medium">{current || 'none'}</span></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button onClick={()=>setSelected('free')} className={`text-left p-4 rounded-lg border ${selected==='free' ? 'border-primary ring-2 ring-primary/20':'border-gray-200'}`}>
          <div className="text-xs font-semibold text-primary">Free</div>
          <div className="text-lg font-bold">$0<span className="text-sm font-normal text-gray-500">/mo</span></div>
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            <li>• Calendar and tasks</li>
            <li>• Family chat</li>
            <li>• Basic AI assistant</li>
          </ul>
        </button>
        <button onClick={()=>setSelected('pro')} className={`text-left p-4 rounded-lg border ${selected==='pro' ? 'border-primary ring-2 ring-primary/20':'border-gray-200'}`}>
          <div className="text-xs font-semibold text-primary">Pro</div>
          <div className="text-lg font-bold">$7<span className="text-sm font-normal text-gray-500">/mo</span></div>
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            <li>• Everything in Free</li>
            <li>• Advanced AI summaries</li>
            <li>• Priority support</li>
          </ul>
        </button>
        <button onClick={()=>setSelected('founder')} className={`text-left p-4 rounded-lg border ${selected==='founder' ? 'border-primary ring-2 ring-primary/20':'border-gray-200'}`}>
          <div className="text-xs font-semibold text-primary">Founder (lifetime)</div>
          <div className="text-lg font-bold">$49<span className="text-sm font-normal text-gray-500"> one-time</span></div>
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            <li>• All Pro features</li>
            <li>• Founder badge</li>
            <li>• Private roadmap access</li>
          </ul>
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={save} disabled={!selected || saving} className="px-4 py-2 bg-primary text-white rounded-button disabled:opacity-50">{saving? 'Saving...':'Update plan'}</button>
      </div>
    </div>
  );
}

export default function Profile() {
  const [userName, setUserName] = useState("User");
  const [email, setEmail] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUserName((u?.user_metadata as any)?.full_name || u?.email?.split("@")[0] || "User");
      setEmail(u?.email || "");
    });
  }, []);

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault(); if (!supabase) return;
    setSaving(true);
    await supabase.auth.updateUser({ data: { full_name: userName } });
    setSaving(false);
    alert("Profile updated.");
  }

  async function updateEmail(e: React.FormEvent) {
    e.preventDefault(); if (!supabase) return;
    const { error } = await supabase.auth.updateUser({ email });
    if (error) alert(error.message); else alert("Verification email sent to update address.");
  }

  async function resetPassword() {
    if (!supabase || !email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) alert(error.message); else alert("Password reset email sent.");
  }

  async function logout() { await supabase?.auth.signOut(); window.location.href = "/"; }

  return (
    <AppShell userName={userName}>
      <div className="max-w-xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        <h2 className="text-xl font-bold">Profile</h2>

        <form onSubmit={updateProfile} className="bg-white rounded-lg p-4 border space-y-3">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <input value={userName} onChange={(e)=>setUserName(e.target.value)} className="w-full border rounded-button px-3 py-2" />
          </div>
          <button disabled={saving} className="bg-primary text-white px-4 py-2 rounded-button disabled:opacity-50">{saving?"Saving...":"Save name"}</button>
        </form>

        <form onSubmit={updateEmail} className="bg-white rounded-lg p-4 border space-y-3">
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="w-full border rounded-button px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button className="border px-4 py-2 rounded-button">Change email</button>
            <button type="button" onClick={resetPassword} className="border px-4 py-2 rounded-button">Send reset password email</button>
          </div>
        </form>

        <div className="bg-white rounded-lg p-4 border space-y-3">
          <h3 className="font-semibold">Subscription</h3>
          <PlanSection />
        </div>

        <div className="bg-white rounded-lg p-4 border space-y-3">
          <h3 className="font-semibold">Danger zone</h3>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-button">Log out</button>
        </div>
      </div>
    </AppShell>
  );
}
