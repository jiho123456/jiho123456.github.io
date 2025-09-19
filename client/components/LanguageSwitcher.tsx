import { useI18n } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <select
      aria-label="Language"
      className="border border-gray-300 rounded-button px-2 py-1 text-sm bg-white"
      value={locale}
      onChange={(e) => setLocale(e.target.value as any)}
    >
      <option value="en">EN</option>
      <option value="ko">KR</option>
    </select>
  );
}
