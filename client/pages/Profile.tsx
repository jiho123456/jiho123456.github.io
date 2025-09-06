import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const [userName, setUserName] = useState("사용자");
  const [email, setEmail] = useState<string | undefined>(undefined);
  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUserName((u?.user_metadata as any)?.full_name || u?.email?.split("@")[0] || "사용자");
      setEmail(u?.email);
    });
  }, []);

  async function logout() {
    await supabase?.auth.signOut();
    window.location.href = "/";
  }

  return (
    <AppShell userName={userName}>
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <h2 className="text-xl font-bold">프로필</h2>
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-sm text-gray-500">이름</div>
          <div className="font-medium">{userName}</div>
          <div className="text-sm text-gray-500 mt-3">이메일</div>
          <div className="font-medium">{email}</div>
        </div>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-button">로그아웃</button>
      </div>
    </AppShell>
  );
}
