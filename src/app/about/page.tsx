"use client";

import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{t("about.title")}</h1>
      <p className="mt-4 text-sm leading-relaxed">{t("about.body")}</p>
    </div>
  );
}
