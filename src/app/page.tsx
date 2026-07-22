"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapControls, GenerationOptions } from "@/components/MapControls";
import { MapCanvas } from "@/components/MapCanvas";
import { placeTerrain } from "@/lib/generation/terrain";
import { assignNumbers } from "@/lib/generation/numbers";
import { generatePorts } from "@/lib/generation/ports";
import { HexTile, PortSpec } from "@/lib/types";

const DEFAULT_OPTIONS: GenerationOptions = {
  desertInCenter: false,
  allowSameTerrainNeighbors: true,
};

interface Board {
  hexes: HexTile[];
  ports: PortSpec[];
}

function generateBoard(options: GenerationOptions): Board {
  return {
    hexes: assignNumbers(placeTerrain(options)),
    ports: generatePorts(),
  };
}

export default function Home() {
  const { t } = useTranslation();
  const [options, setOptions] = useState<GenerationOptions>(DEFAULT_OPTIONS);
  const [board, setBoard] = useState<Board | null>(null);

  // Generated only after mount so the server-prerendered HTML and the
  // client's first render match - a random board would otherwise differ
  // between the two and trigger a hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBoard(generateBoard(DEFAULT_OPTIONS));
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <h1 className="text-2xl font-semibold">{t("ui.appTitle")}</h1>
      <MapControls
        options={options}
        onOptionsChange={setOptions}
        onGenerate={() => setBoard(generateBoard(options))}
      />
      {board && <MapCanvas hexes={board.hexes} ports={board.ports} />}
    </div>
  );
}
