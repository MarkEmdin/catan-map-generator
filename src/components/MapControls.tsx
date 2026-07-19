"use client";

import { useTranslation } from "react-i18next";
import { GenerationConfig } from "@/lib/types";

export type GenerationOptions = Omit<GenerationConfig, "language">;

interface MapControlsProps {
  options: GenerationOptions;
  onOptionsChange: (options: GenerationOptions) => void;
  onGenerate: () => void;
}

export function MapControls({ options, onOptionsChange, onGenerate }: MapControlsProps) {
  const { t } = useTranslation();

  function toggle(key: keyof GenerationOptions) {
    onOptionsChange({ ...options, [key]: !options[key] });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={options.desertInCenter}
          onChange={() => toggle("desertInCenter")}
        />
        {t("ui.desertInCenter")}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="h-5 w-5"
          checked={options.allowSameTerrainNeighbors}
          onChange={() => toggle("allowSameTerrainNeighbors")}
        />
        {t("ui.allowSameTerrainNeighbors")}
      </label>
      <button
        type="button"
        onClick={onGenerate}
        className="rounded-md bg-[var(--water)] px-4 py-2 text-sm font-semibold text-white"
      >
        {t("ui.generate")}
      </button>
    </div>
  );
}
