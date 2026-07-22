"use client";

import { useTranslation } from "react-i18next";
import { MapSelection } from "./MapCanvas";
import { rollProbabilityPercent } from "./NumberToken";
import { getPortDisplay } from "./PortMarker";

interface InfoSheetProps {
  selection: MapSelection | null;
  onClose: () => void;
}

export function InfoSheet({ selection, onClose }: InfoSheetProps) {
  const { t } = useTranslation();

  if (!selection) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border border-black/10 bg-[var(--background)] px-4 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
        <div className="text-sm">
          {selection.kind === "hex" ? (
            <>
              <span className="font-semibold">{t(`terrain.${selection.terrainType}`)}</span>
              {selection.numberToken !== null && (
                <span className="ml-2 opacity-70">
                  {selection.numberToken} (
                  {rollProbabilityPercent(selection.numberToken).toFixed(1)}%)
                </span>
              )}
            </>
          ) : (
            <span className="font-semibold">
              {getPortDisplay(selection.type).label}
              {selection.type !== "3:1" ? ` ${t(`resource.${selection.type}`)}` : ""}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("ui.close")}
          className="shrink-0 rounded-full text-lg leading-none font-bold opacity-60"
        >
          ×
        </button>
      </div>
    </div>
  );
}
