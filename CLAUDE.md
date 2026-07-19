# Catan Map Generator — Project Rules

## About the project

A web application for generating a Catan board map that can be physically assembled on a table. This is **not** an implementation of gameplay — only map generation following the official setup rules.

The final result must visually resemble a real game board (hex textures, number tokens with probability pips, ports with docks), not an abstract diagram.

## Tech stack

- **Next.js** (App Router, `output: 'export'` — fully static site, no server)
- **TypeScript**
- **Tailwind CSS**
- **React** — all components are client components (`"use client"`), no backend
- Map rendering — **plain SVG** (no canvas libraries, no graph-rendering libraries)
- State — `useState`/`useReducer`, no external state managers (small project)
- Localization — a simple JSON dictionary + React Context, no next-intl (3 languages, no URL routing needed)
- Deployment — **Vercel** (free Hobby plan, auto-deploy from GitHub)

## Project structure

```
/src/app
  layout.tsx
  page.tsx                    // the app's single page
/src/components
  MapControls.tsx              // checkboxes, language selector, "generate" button
  MapCanvas.tsx                 // SVG render of the whole map
  HexTile.tsx                    // a single hex (terrain + texture + number)
  NumberToken.tsx                 // number circle + probability pips
  PortMarker.tsx                   // port icon in the water + dashed lines to the coast
  BorderSegment.tsx                 // one sea frame segment with its ports
/src/lib/generation
  terrain.ts                        // terrain hex shuffle + adjacency validation
  numbers.ts                         // official alphabetical A-R algorithm
  ports.ts                            // shuffle of the 6 border segments
  coords.ts                            // cube/axial → pixel, spiral order, neighbors
/src/lib
  constants.ts                          // TERRAIN_SET, LETTER_TO_NUMBER, SPIRAL_ORDER, BORDER_SEGMENTS_DEFAULT
  types.ts                                // HexTile, BorderSegment, GenerationConfig
/src/locales
  ru.json
  en.json
  de.json
```

All generation logic in `/src/lib/generation` consists of pure functions with no React dependencies (easy to unit test).

---

## Map generation rules

### 1. Terrain hexes (19 total, 3-4 players, board shape 3-4-5-4-3)

| Terrain key | RU | EN | DE | Count | Resource key |
|---|---|---|---|---|---|
| `hills` | Холмы | Hills | Hügelland | 3 | `brick` |
| `forest` | Лес | Forest | Wald | 4 | `wood` |
| `mountains` | Горы | Mountains | Berge | 3 | `ore` |
| `fields` | Поля | Fields | Ackerland | 4 | `wheat` |
| `pasture` | Пастбища | Pasture | Weideland | 4 | `sheep` |
| `desert` | Пустыня | Desert | Wüste | 1 | — |

Resources: `brick`/Кирпич/Brick/Ziegel, `wood`/Дерево/Wood/Holz, `ore`/Руда/Ore/Erz, `wheat`/Пшеница/Wheat/Getreide, `sheep`/Шерсть/Sheep/Wolle.

The desert never gets a number token.

### 2. Number tokens — official alphabetical algorithm

18 tokens, each with a letter A–R printed on the back. Fixed letter → number mapping:

```
A=5  B=2  C=6  D=3  E=8  F=10
G=9  H=12 I=11 J=4  K=8  L=10
M=9  N=4  O=11 P=3  Q=5  R=6
```

**Algorithm:**
1. Shuffle the 19 terrain hexes (Fisher-Yates), place them on the 3-4-5-4-3 board.
2. Walk the positions along a fixed spiral: outer ring (12) → middle ring (6) → center (1).
3. Remove the desert's position from the spiral.
4. Assign letters A, B, C... in traversal order.
5. Look up each position's number via the mapping table.

This guarantees that 6 and 8 never end up adjacent — by construction, not via post-hoc validation. Only valid for the standard 3-4-5-4-3 board shape.

### 3. "Desert in center" option

- Off (default): random position among the 19 hexes.
- On: the desert is fixed at the center (`{0,0,0}` cube coordinates), the other 18 hexes are shuffled around it. The number-token algorithm is unchanged — the desert is simply the skipped position in the spiral.

### 4. "Allow same-terrain neighbors" option

- Off (default): after placement — validate; if a hex has 2+ neighbors of the same terrain type → reshuffle/swap.
- On: validation is skipped.

### 5. Ports — "6 border segments" model

Physically, ports are not placed fully at random: the sea frame is made of 6 border segments (frame pieces), each with ports fixed at specific positions relative to that segment.

9 ports total: 4× generic (3:1) + 1× each resource (2:1).

**Two levels of randomness:**
1. Order of the 6 segments — shuffled (Fisher-Yates over 6 positions). This is the only variable by default.
2. (optional, "allow fully random ports" checkbox) — port types within slots are shuffled independently of the segments, if extra variability beyond the official mechanism is desired.

The composition of each of the 6 segments (`fixedPorts`) is a constant, set once based on the physical set (it differs between editions).

### 6. Localization

All entities are identified by internal keys (`hills`, `brick`, `3:1`, etc.); translations live in separate RU/EN/DE dictionaries.

### 7. Data structures

```ts
interface GenerationConfig {
  language: 'ru' | 'en' | 'de';
  desertInCenter: boolean;
  allowSameTerrainNeighbors: boolean;
  allowFullyRandomPorts: boolean;
}

interface HexTile {
  id: string;
  coordCube: { x: number; y: number; z: number };
  terrainType: string;
  numberToken: number | null;
  letter: string | null;
}

interface BorderSegment {
  id: number;
  position: number;
  fixedPorts: Array<{
    type: string;
    edgeOffsetInSegment: number;
  }>;
}
```

### 8. Algorithm order (summary)

1. Shuffle the 19 terrain hexes → place on the board.
2. If `desertInCenter` — fix the desert at the center.
3. If `allowSameTerrainNeighbors === false` — validate and reshuffle/swap.
4. Build the spiral, skip the desert, assign letters A-R and numbers.
5. Shuffle the order of the 6 border segments.
6. If `allowFullyRandomPorts === true` — additionally shuffle port types.
7. Assemble the final `HexTile[]` + `BorderSegment[]`, applying `language`.

### 9. Known limitations

- The exact port composition of each of the 6 border segments needs to be confirmed against a physical set and hardcoded as a constant.
- These rules cover only the standard 3-4-5-4-3 board (3-4 players). The 5-6 player expansion is out of scope for this document.

---

## Visual style

The map must visually resemble a real game board, not an abstract diagram.

**Palette (CSS variables):**
```
--terrain-hills: #C1440E
--terrain-forest: #2D5A27
--terrain-mountains: #6B7280
--terrain-fields: #D4A017
--terrain-pasture: #8BAA5C
--terrain-desert: #E8D4A0
--water: #2C6E8E
--token-cream: #F5EDD8
--number-red: #C1272D
--number-black: #1A1A1A
```

**Key visual requirements:**
- Hexes are **pointy-top** (vertex at top/bottom), rows in a 3-4-5-4-3 layout.
- Number tokens: `--token-cream` circle, number centered, probability pips below the number (2/12 → 1 dot, 3/11 → 2, 4/10 → 3, 5/9 → 4, 6/8 → 5 dots). 6 and 8 use `--number-red`, all others `--number-black`.
- Desert has no token; optionally show a robber icon.
- Ports: a dashed line from the two coastal vertices to a port icon placed in the water (3:1 or a resource icon).
- A subtle texture on hexes (`feTurbulence` noise over the fill) to mimic cardboard printing rather than a flat vector fill.
- A thin stroke between hexes (`stroke: rgba(0,0,0,0.15)`).

## Responsiveness

- SVG with `viewBox` + `width: 100%; height: auto` — the map scales down to fit the screen width automatically.
- No zoom/pan — just fit-to-screen on any device.
- Map export (PNG/PDF) is not implemented — display only.

## Deployment

- Vercel, auto-deploy from GitHub on `git push` to `main`.
- No backend, server functions, or API routes — all logic runs client-side.
