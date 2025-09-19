import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AppShell({ userName, children }: { userName: string; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto pb-16">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-[Pacifico] text-primary">{t("common.appName")}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
                <i className="ri-notification-3-line text-gray-600" />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                {userName?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>
        {children}
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-lg animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="flex justify-around items-center h-16">
          <NavLink to="/app" className={({ isActive }) => `flex flex-col items-center justify-center ${isActive ? "text-primary" : "text-gray-500"}`}>
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-home-5-fill" />
            </div>
            <span className="text-xs mt-1">{t("nav.home")}</span>
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => `flex flex-col items-center justify-center ${isActive ? "text-primary" : "text-gray-500"}`}>
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-calendar-line" />
            </div>
            <span className="text-xs mt-1">{t("nav.calendar")}</span>
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `flex flex-col items-center justify-center ${isActive ? "text-primary" : "text-gray-500"}`}>
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-task-line" />
            </div>
            <span className="text-xs mt-1">{t("nav.tasks")}</span>
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `flex flex-col items-center justify-center ${isActive ? "text-primary" : "text-gray-500"}`}>
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-message-3-line" />
            </div>
            <span className="text-xs mt-1">{t("nav.chat")}</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center justify-center ${isActive ? "text-primary" : "text-gray-500"}`}>
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-user-line" />
            </div>
            <span className="text-xs mt-1">{t("nav.profile")}</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
