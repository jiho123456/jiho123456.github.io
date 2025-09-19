import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "en" | "ko";

type Dict = Record<string, any>;

const dictionaries: Record<Locale, Dict> = {
  en: {},
  ko: {},
};

async function loadDict(locale: Locale): Promise<Dict> {
  if (Object.keys(dictionaries[locale]).length > 0) return dictionaries[locale];
  switch (locale) {
    case "ko": {
      const mod = await import("@/locales/ko.json");
      dictionaries.ko = mod.default as Dict;
      return dictionaries.ko;
    }
    case "en":
    default: {
      const mod = await import("@/locales/en.json");
      dictionaries.en = mod.default as Dict;
      return dictionaries.en;
    }
  }
}

function getByPath(obj: Dict, path: string): any {
  return path.split(".").reduce((acc, key) => (acc && typeof acc === "object" ? acc[key] : undefined), obj);
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_m, k) => (vars[k] !== undefined ? String(vars[k]) : ""));
}

export interface I18nContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLocale(): Locale {
  const stored = typeof window !== "undefined" ? (window.localStorage.getItem("locale") as Locale | null) : null;
  if (stored === "en" || stored === "ko") return stored;
  const nav = typeof navigator !== "undefined" ? navigator.language : "en";
  if (nav.toLowerCase().startsWith("ko")) return "ko";
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale());
  const [dict, setDict] = useState<Dict>({});

  useEffect(() => {
    let active = true;
    loadDict(locale).then((d) => { if (active) setDict(d); });
    return () => { active = false; };
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try { window.localStorage.setItem("locale", next); } catch {}
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const raw = getByPath(dict, key);
    if (typeof raw === "string") return interpolate(raw, vars);
    return key;
  }, [dict]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}