import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";

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
          <h3 className="font-semibold">Danger zone</h3>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-button">Log out</button>
        </div>
      </div>
    </AppShell>
  );
}
