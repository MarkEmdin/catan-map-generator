export interface CubeCoord {
  x: number;
  y: number;
  z: number;
}

export interface Point {
  x: number;
  y: number;
}

// Same direction order used to build SPIRAL_ORDER in constants.ts, so
// walking neighbors stays consistent with the spiral traversal.
export const CUBE_DIRECTIONS: CubeCoord[] = [
  { x: 1, y: -1, z: 0 },
  { x: 1, y: 0, z: -1 },
  { x: 0, y: 1, z: -1 },
  { x: -1, y: 1, z: 0 },
  { x: -1, y: 0, z: 1 },
  { x: 0, y: -1, z: 1 },
];

export function cubeKey(cube: CubeCoord): string {
  return `${cube.x},${cube.y},${cube.z}`;
}

export function cubeEquals(a: CubeCoord, b: CubeCoord): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

export function cubeAdd(a: CubeCoord, b: CubeCoord): CubeCoord {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function neighbors(cube: CubeCoord): CubeCoord[] {
  return CUBE_DIRECTIONS.map((dir) => cubeAdd(cube, dir));
}

// Pointy-top hex layout: axial (q, r) = (cube.x, cube.z).
export function cubeToPixel(cube: CubeCoord, hexSize: number): Point {
  const q = cube.x;
  const r = cube.z;
  return {
    x: hexSize * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r),
    y: hexSize * (1.5 * r),
  };
}

// The 6 corners of a pointy-top hex, in clockwise order starting from the
// top-right corner. Corner i sits at angle (60*i - 30) degrees.
export function hexCorners(center: Point, size: number): Point[] {
  return Array.from({ length: 6 }, (_, i) => {
    const angleRad = (Math.PI / 180) * (60 * i - 30);
    return {
      x: center.x + size * Math.cos(angleRad),
      y: center.y + size * Math.sin(angleRad),
    };
  });
}
