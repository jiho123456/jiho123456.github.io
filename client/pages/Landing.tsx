import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [fbOpen, setFbOpen] = useState(false);
  const [fbEmail, setFbEmail] = useState("");
  const [fbMsg, setFbMsg] = useState("");
  const [fbSending, setFbSending] = useState(false);
  const testersCount = 10;

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
          <span className="text-2xl font-[Pacifico] text-primary">{t("common.appName")}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{t("common.peopleTesting", { count: testersCount })}</span>
        </div>
        <nav className="hidden sm:flex items-center space-x-6">
          <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">{t("common.features")}</a>
          <a href="#roadmap" className="text-sm text-gray-600 hover:text-gray-900">{t("common.roadmap")}</a>
          <button onClick={() => setFbOpen(true)} className="text-sm text-gray-600 hover:text-gray-900">{t("common.feedback")}</button>
          <button onClick={() => navigate("/app")} className="px-3 py-1.5 rounded-button bg-primary text-white text-sm">{t("common.openApp")}</button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        <section className="py-10 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">{t("landing.heroTitle")}</h1>
            <p className="text-gray-600 mb-6">{t("landing.heroSubtitle")}</p>
            <div className="flex gap-3">
              <button onClick={() => navigate("/app")} className="bg-primary text-white px-4 py-2 rounded-button">{t("common.openApp")}</button>
              <a href="#features" className="px-4 py-2 rounded-button border border-gray-300 text-gray-800">{t("common.exploreFeatures")}</a>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="font-semibold mb-1">{t("landing.cardCalendarTitle")}</div>
                <p className="text-gray-600">{t("landing.cardCalendarDesc")}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="font-semibold mb-1">{t("landing.cardTasksTitle")}</div>
                <p className="text-gray-600">{t("landing.cardTasksDesc")}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="font-semibold mb-1">{t("landing.cardChatTitle")}</div>
                <p className="text-gray-600">{t("landing.cardChatDesc")}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="font-semibold mb-1">{t("landing.cardAiTitle")}</div>
                <p className="text-gray-600">{t("landing.cardAiDesc")}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold mb-2">{t("landing.featuresTitle1")}</h3>
            <p className="text-gray-600 text-sm">{t("landing.featuresDesc1")}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold mb-2">{t("landing.featuresTitle2")}</h3>
            <p className="text-gray-600 text-sm">{t("landing.featuresDesc2")}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold mb-2">{t("landing.featuresTitle3")}</h3>
            <p className="text-gray-600 text-sm">{t("landing.featuresDesc3")}</p>
          </div>
        </section>

        <section id="pricing" className="py-12">
          <h3 className="text-xl font-semibold mb-6">{t("landing.plansTitle")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 animate-fade-in" style={{animationDelay:'0.02s'}}>
              <div className="text-sm font-semibold text-primary mb-1">{t("landing.free")}</div>
              <div className="text-2xl font-bold mb-2">{t("landing.priceFree")}<span className="text-sm font-normal text-gray-500">{t("landing.perMonth")}</span></div>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>{t("landing.freeFeatures1")}</li>
                <li>{t("landing.freeFeatures2")}</li>
                <li>{t("landing.freeFeatures3")}</li>
              </ul>
              <button onClick={()=>navigate('/app')} className="w-full bg-gray-900 text-white rounded-button py-2">{t("landing.startFree")}</button>
            </div>
            <div className="bg-white border-2 border-primary rounded-xl p-6 shadow-sm animate-fade-in" style={{animationDelay:'0.06s'}}>
              <div className="text-sm font-semibold text-primary mb-1">{t("landing.pro")}</div>
              <div className="text-2xl font-bold mb-2">{t("landing.proPrice")}<span className="text-sm font-normal text-gray-500">{t("landing.perMonth")}</span></div>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>{t("landing.proFeatures1")}</li>
                <li>{t("landing.proFeatures2")}</li>
                <li>{t("landing.proFeatures3")}</li>
              </ul>
              <button onClick={()=>navigate('/profile?plan=pro')} className="w-full bg-primary text-white rounded-button py-2">{t("landing.choosePro")}</button>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 animate-fade-in" style={{animationDelay:'0.1s'}}>
              <div className="text-sm font-semibold text-primary mb-1">{t("landing.founder")}</div>
              <div className="text-2xl font-bold mb-2">{t("landing.founderPrice")}<span className="text-sm font-normal text-gray-500">{t("landing.founderOneTime")}</span></div>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>{t("landing.founderFeatures1")}</li>
                <li>{t("landing.founderFeatures2")}</li>
                <li>{t("landing.founderFeatures3")}</li>
              </ul>
              <button onClick={()=>navigate('/profile?plan=founder')} className="w-full border border-primary text-primary rounded-button py-2">{t("landing.getFounder")}</button>
            </div>
          </div>
        </section>

        <section id="roadmap" className="py-12">
          <h3 className="text-xl font-semibold mb-4">{t("landing.roadmapTitle")}</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>{t("landing.roadmap1")}</li>
            <li>{t("landing.roadmap2")}</li>
            <li>{t("landing.roadmap3")}</li>
            <li>{t("landing.roadmap4")}</li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-gray-200 mt-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">{t("common.copyright", { year: new Date().getFullYear() })}</div>
          <div className="flex items-center gap-3 text-sm">
            <button onClick={() => setFbOpen(true)} className="text-gray-700 hover:text-gray-900">{t("common.sendFeedback")}</button>
            <a href="#" className="text-gray-700 hover:text-gray-900">{t("common.joinDiscord")}</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">{t("common.followX")}</a>
          </div>
        </div>
      </footer>

      {fbOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50" onClick={() => setFbOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg font-semibold mb-4">{t("common.sendFeedback")}</h4>
            <form onSubmit={submitFeedback} className="space-y-3">
              <input value={fbEmail} onChange={(e) => setFbEmail(e.target.value)} type="email" placeholder={t("common.emailOptional")}
                className="w-full border border-gray-300 rounded-button py-2 px-3" />
              <textarea value={fbMsg} onChange={(e) => setFbMsg(e.target.value)} placeholder={t("common.yourMessage")} rows={5}
                className="w-full border border-gray-300 rounded-button py-2 px-3" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setFbOpen(false)} className="px-3 py-1.5 rounded-button border border-gray-300">{t("common.cancel")}</button>
                <button type="submit" disabled={fbSending} className="px-3 py-1.5 rounded-button bg-primary text-white disabled:opacity-50">{fbSending ? t("common.sending") : t("common.send")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
