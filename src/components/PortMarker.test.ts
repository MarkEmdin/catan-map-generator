import { describe, expect, it } from "vitest";
import { getPortDisplay } from "./PortMarker";

describe("getPortDisplay", () => {
  it("labels generic ports 3:1 in a neutral color", () => {
    expect(getPortDisplay("3:1")).toEqual({ label: "3:1", color: "var(--number-black)" });
  });

  it("labels resource ports 2:1 in their terrain color", () => {
    expect(getPortDisplay("brick").label).toBe("2:1");
    expect(getPortDisplay("brick").color).toBe("var(--terrain-hills)");
    expect(getPortDisplay("wood").color).toBe("var(--terrain-forest)");
    expect(getPortDisplay("ore").color).toBe("var(--terrain-mountains)");
    expect(getPortDisplay("wheat").color).toBe("var(--terrain-fields)");
    expect(getPortDisplay("sheep").color).toBe("var(--terrain-pasture)");
  });
});
