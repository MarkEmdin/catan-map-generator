"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

const LANGUAGES: Array<"ru" | "en" | "de"> = ["ru", "en", "de"];

export function Header() {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 px-4 py-3 dark:border-white/10">
      <nav className="flex items-center gap-4 text-sm font-medium">
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className={pathname === "/" ? "underline" : ""}
        >
          {t("nav.home")}
        </Link>
        <Link
          href="/about"
          aria-current={pathname === "/about" ? "page" : undefined}
          className={pathname === "/about" ? "underline" : ""}
        >
          {t("nav.about")}
        </Link>
      </nav>
      <div className="flex items-center gap-1" aria-label={t("ui.language")}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => i18n.changeLanguage(lang)}
            aria-pressed={i18n.resolvedLanguage === lang}
            className={`min-w-10 rounded px-2 py-1 text-sm font-semibold ${
              i18n.resolvedLanguage === lang
                ? "bg-[var(--water)] text-white"
                : "text-current"
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
}
