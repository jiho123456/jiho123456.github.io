import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const [userName, setUserName] = useState("사용자");
  const [email, setEmail] = useState<string>("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUserName((u?.user_metadata as any)?.full_name || u?.email?.split("@")[0] || "사용자");
      setEmail(u?.email || "");
    });
  }, []);

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    await supabase.auth.updateUser({ data: { full_name: userName } });
    setSaving(false);
    alert("프로필이 업데이트되었습니다.");
  }
  async function updateEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.auth.updateUser({ email });
    if (error) alert(error.message); else alert("이메일 변경 확인 메일을 보냈습니다.");
  }
  async function resetPassword() {
    if (!supabase) return;
    const redirectTo = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) alert(error.message); else alert("비밀번호 재설정 메일을 보냈습니다.");
  }
  async function logout() { await supabase?.auth.signOut(); window.location.href = "/"; }

  return (
    <AppShell userName={userName}>
      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        <h2 className="text-xl font-bold">프로필</h2>

        <form onSubmit={updateProfile} className="bg-white rounded-lg p-4 border space-y-3">
          <div>
            <label className="text-sm text-gray-500">이름</label>
            <input value={userName} onChange={(e)=>setUserName(e.target.value)} className="w-full border rounded-button px-3 py-2" />
          </div>
          <button disabled={saving} className="bg-primary text-white px-4 py-2 rounded-button disabled:opacity-50">{saving?"저장 중...":"���름 저장"}</button>
        </form>

        <form onSubmit={updateEmail} className="bg-white rounded-lg p-4 border space-y-3">
          <div>
            <label className="text-sm text-gray-500">이메일</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" className="w-full border rounded-button px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button className="border px-4 py-2 rounded-button">이메일 변경</button>
            <button type="button" onClick={resetPassword} className="border px-4 py-2 rounded-button">비밀번호 재설정 메일</button>
          </div>
        </form>

        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-button">로그아웃</button>
      </div>
    </AppShell>
  );
}
